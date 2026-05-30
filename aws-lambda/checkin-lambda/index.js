const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const dynamoDB = DynamoDBDocumentClient.from(client);

const CHECKINS_TABLE = "AeroLinkCheckIns";

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

function getUserFromToken(event) {
  try {
    const authHeader =
      event.headers?.authorization ||
      event.headers?.Authorization;

    if (!authHeader) return null;

    const token = authHeader.replace("Bearer ", "");

    if (!token || token.split(".").length < 2) return null;

    return JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  try {
    const path = event.rawPath || event.path || "";
    const method = event.requestContext?.http?.method || event.httpMethod || "";
    const body = event.body ? JSON.parse(event.body) : {};
    const userData = getUserFromToken(event);

    if (method === "OPTIONS") {
      return response(200, { message: "CORS OK" });
    }

    if (path.endsWith("/checkins") && method === "GET") {
      const result = await dynamoDB.send(
        new ScanCommand({ TableName: CHECKINS_TABLE })
      );

      let checkins = result.Items || [];

      if (userData?.role !== "admin" && userData?.role !== "staff") {
        checkins = checkins.filter((c) => c.userEmail === userData?.email);
      }

      return response(200, checkins);
    }

    if (path.endsWith("/checkins") && method === "POST") {
      const { bookingId, passengerName, flightId } = body;

      if (!bookingId || !passengerName || !flightId) {
        return response(400, {
          message: "bookingId, passengerName, and flightId are required"
        });
      }

      const checkin = {
        id: Date.now().toString(),
        bookingId: String(bookingId),
        flightId: String(flightId),
        passengerName,
        userEmail: userData?.email || body.userEmail || "unknown",
        checkInStatus: "CHECKED_IN",
        boardingPassNumber: `BP-${Date.now()}`,
        seatNumber: body.seatNumber || `A${Math.floor(Math.random() * 30) + 1}`,
        gate: body.gate || "G12",
        createdAt: new Date().toISOString()
      };

      await dynamoDB.send(
        new PutCommand({
          TableName: CHECKINS_TABLE,
          Item: checkin
        })
      );

      return response(201, {
        message: "Passenger check-in completed successfully",
        checkin
      });
    }

    return response(404, { message: "Route not found", path, method });
  } catch (error) {
    return response(500, {
      message: "Internal server error",
      error: error.message
    });
  }
};