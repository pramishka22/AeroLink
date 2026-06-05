const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    ScanCommand,
    UpdateCommand
  } = require("@aws-sdk/lib-dynamodb");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const client = new DynamoDBClient({ region: "us-east-1" });
const dynamoDB = DynamoDBDocumentClient.from(client);

const USERS_TABLE = "AeroLinkUsers";
const JWT_SECRET = "aerolink_secret_key";

function getUserFromToken(event) {
    try {
      const authHeader =
        event.headers?.authorization ||
        event.headers?.Authorization;
  
      if (!authHeader) return null;
  
      const token = authHeader.replace("Bearer ", "");
      if (!token || token.split(".").length < 2) return null;
  
      return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    } catch {
      return null;
    }
  }
  
  function isAdmin(userData) {
    return userData?.role === "admin";
  }

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  try {
    console.log("EVENT:", JSON.stringify(event));

    const path = event.rawPath || event.path || "";
    const method = event.requestContext?.http?.method || event.httpMethod || "";

    if (method === "OPTIONS") {
      return response(200, { message: "CORS OK" });
    }

    const body = event.body ? JSON.parse(event.body) : {};

    const userData = getUserFromToken(event);
    const cleanPath = path.replace("/prod", "");

    if (path.endsWith("/auth/register") && method === "POST") {
      const { name, email, password, role } = body;

      if (!name || !email || !password || !role) {
        return response(400, { message: "All fields are required" });
      }

      const existingUser = await dynamoDB.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: { email }
        })
      );

      if (existingUser.Item) {
        return response(409, { message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await dynamoDB.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: {
            email,
            name,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString()
          }
        })
      );

      return response(201, {
        message: "User registered successfully",
        user: { name, email, role }
      });
    }

    if (path.endsWith("/auth/login") && method === "POST") {
      const { email, password } = body;

      const result = await dynamoDB.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: { email }
        })
      );

      if (!result.Item) {
        return response(401, { message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, result.Item.password);

      if (!isPasswordValid) {
        return response(401, { message: "Invalid email or password" });
      }

      const token = jwt.sign(
        {
          email: result.Item.email,
          role: result.Item.role
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return response(200, {
        message: "Login successful",
        token
      });
    }
    if (cleanPath === "/users" && method === "GET") {
        if (!isAdmin(userData)) {
          return response(403, { message: "Access denied. Admin only." });
        }
      
        const result = await dynamoDB.send(
          new ScanCommand({ TableName: USERS_TABLE })
        );
      
        const users = (result.Items || []).map((user) => ({
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }));
      
        return response(200, users);
      }
      
      if (cleanPath.includes("/users/") && cleanPath.endsWith("/role") && method === "PUT") {
        if (!isAdmin(userData)) {
          return response(403, { message: "Access denied. Admin only." });
        }
      
        const email = decodeURIComponent(cleanPath.split("/")[2]);
        const { role } = body;
      
        if (!["admin", "staff", "passenger", "user"].includes(role)) {
          return response(400, { message: "Invalid role" });
        }
      
        const result = await dynamoDB.send(
          new UpdateCommand({
            TableName: USERS_TABLE,
            Key: { email },
            UpdateExpression: "SET #role = :role",
            ExpressionAttributeNames: {
              "#role": "role"
            },
            ExpressionAttributeValues: {
              ":role": role
            },
            ReturnValues: "ALL_NEW"
          })
        );
      
        return response(200, {
          message: "User role updated successfully",
          user: {
            name: result.Attributes.name,
            email: result.Attributes.email,
            role: result.Attributes.role
          }
        });
      }

      if (cleanPath === "/auth/oauth/callback" && method === "POST") {
        const { code } = body;
      
        if (!code) {
          return response(400, { message: "Authorization code is required" });
        }
      
        const COGNITO_DOMAIN = "https://us-east-1x3w8w0nui.auth.us-east-1.amazoncognito.com";
        const CLIENT_ID = "11158ktkrel6q88oo5pa5a6lhu";
        const REDIRECT_URI = "https://d1golwq2x99wr4.cloudfront.net/oauth-callback";
      
        const tokenParams = new URLSearchParams();
        tokenParams.append("grant_type", "authorization_code");
        tokenParams.append("client_id", CLIENT_ID);
        tokenParams.append("code", code);
        tokenParams.append("redirect_uri", REDIRECT_URI);
      
        const tokenResponse = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: tokenParams.toString()
        });
      
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          return response(401, {
            message: "OAuth token exchange failed",
            error: errorText
          });
        }
      
        const tokens = await tokenResponse.json();
      
        const userInfoResponse = await fetch(`${COGNITO_DOMAIN}/oauth2/userInfo`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokens.access_token}`
          }
        });
      
        if (!userInfoResponse.ok) {
          return response(401, { message: "Failed to retrieve OAuth user information" });
        }
      
        const cognitoUser = await userInfoResponse.json();
      
        const email = cognitoUser.email;
        const name = cognitoUser.name || cognitoUser.email;
        const role = "passenger";
      
        if (!email) {
          return response(400, { message: "OAuth user email not found" });
        }
      
        const existingUser = await dynamoDB.send(
          new GetCommand({
            TableName: USERS_TABLE,
            Key: { email }
          })
        );
      
        if (!existingUser.Item) {
          await dynamoDB.send(
            new PutCommand({
              TableName: USERS_TABLE,
              Item: {
                email,
                name,
                password: "COGNITO_OAUTH_USER",
                role,
                authProvider: "COGNITO_OAUTH2",
                consentAccepted: true,
                consentTimestamp: new Date().toISOString(),
                createdAt: new Date().toISOString()
              }
            })
          );
        }
      
        const token = jwt.sign(
          {
            email,
            role: existingUser.Item?.role || role,
            authProvider: "COGNITO_OAUTH2"
          },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
      
        return response(200, {
          message: "OAuth login successful",
          token,
          user: {
            email,
            name,
            role: existingUser.Item?.role || role
          }
        });
      }


    return response(404, {
      message: "Route not found",
      path,
      method
    });

  } catch (error) {
    console.error(error);
    return response(500, {
      message: "Internal server error",
      error: error.message
    });
  }
};