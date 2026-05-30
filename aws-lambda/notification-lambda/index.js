const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const dynamoDB = DynamoDBDocumentClient.from(client);

const NOTIFICATIONS_TABLE = "AeroLinkNotifications";

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

function isAdminOrStaff(userData) {
    return userData?.role === "admin" || userData?.role === "staff";
  }

exports.handler = async (event) => {
  try {
    console.log("EVENT:", JSON.stringify(event));

    // EVENTBRIDGE EVENT
    if (event.source === "aerolink.baggage") {
        const notification = {
            id: Date.now().toString(),
            type: event["detail-type"] || "BAGGAGE_UPDATED",
            message: event.detail.message,
            userEmail: event.detail.userEmail || "unknown",
            bookingId: event.detail.bookingId || "N/A",
            createdAt: new Date().toISOString()
          };

      await dynamoDB.send(
        new PutCommand({
          TableName: NOTIFICATIONS_TABLE,
          Item: notification
        })
      );

      return { message: "EventBridge notification saved", notification };
    }

    const path = event.rawPath || event.path || "";
    const method = event.requestContext?.http?.method || event.httpMethod || "";
    const body = event.body ? JSON.parse(event.body) : {};
    const userData = getUserFromToken(event);

    if (method === "OPTIONS") {
      return response(200, { message: "CORS OK" });
    }

    if (path.endsWith("/notifications") && method === "GET") {
      const result = await dynamoDB.send(
        new ScanCommand({ TableName: NOTIFICATIONS_TABLE })
      );

      let notifications = result.Items || [];

      if (!isAdminOrStaff(userData)) {
        notifications = notifications.filter(
          (n) => n.userEmail === userData?.email
        );
      }

      return response(200, notifications);
    }

    if (path.endsWith("/notifications") && method === "POST") {
        const notification = {
            id: Date.now().toString(),
            type: event["detail-type"] || "BAGGAGE_UPDATED",
            message: event.detail.message,
            userEmail: event.detail.userEmail || "unknown",
            bookingId: event.detail.bookingId || "N/A",
            createdAt: new Date().toISOString()
          };

      await dynamoDB.send(
        new PutCommand({
          TableName: NOTIFICATIONS_TABLE,
          Item: notification
        })
      );

      return response(201, {
        message: "Notification created successfully",
        notification
      });
    }

    return response(404, { message: "Route not found", path, method });

  } catch (error) {
    console.error(error);

    return response(500, {
      message: "Internal server error",
      error: error.message
    });
  }
};