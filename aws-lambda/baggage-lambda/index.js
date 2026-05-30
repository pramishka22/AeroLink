const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");

const { EventBridgeClient, PutEventsCommand } = require("@aws-sdk/client-eventbridge");

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

const eventBridge = new EventBridgeClient({ region: "us-east-1" });

const BAGGAGE_TABLE = "AeroLinkBaggage";

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
    const body = event.body ? JSON.parse(event.body) : {};
    const cleanPath = path.replace("/prod", "");
    const userData = getUserFromToken(event);

    if (method === "OPTIONS") {
      return response(200, { message: "CORS OK" });
    }

    if (cleanPath === "/baggage" && method === "GET") {
      const result = await dynamoDB.send(
        new ScanCommand({ TableName: BAGGAGE_TABLE })
      );

      let baggage = result.Items || [];

      if (!isAdminOrStaff(userData)) {
        baggage = baggage.filter((b) => b.userEmail === userData?.email);
      }
      
      return response(200, baggage);
    }

    if (cleanPath === "/baggage" && method === "POST") {
        const baggage = {
            id: Date.now().toString(),
            bookingId: String(body.bookingId),
            passengerName: body.passengerName,
            tagNumber: body.tagNumber,
            userEmail: userData?.email || "unknown",
            status: "Checked-In",
            lastUpdated: new Date().toISOString()
          };

      await dynamoDB.send(
        new PutCommand({
          TableName: BAGGAGE_TABLE,
          Item: baggage
        })
      );

      return response(201, {
        message: "Baggage record created successfully",
        baggage
      });
    }

    if (cleanPath.includes("/baggage/") && cleanPath.endsWith("/status") && method === "PUT") {
      const baggageId = cleanPath.split("/")[2];
      const newStatus = body.status;

      const result = await dynamoDB.send(
        new GetCommand({
          TableName: BAGGAGE_TABLE,
          Key: { id: baggageId }
        })
      );

      if (!result.Item) {
        return response(404, { message: "Baggage record not found" });
      }

      const updateResult = await dynamoDB.send(
        new UpdateCommand({
          TableName: BAGGAGE_TABLE,
          Key: { id: baggageId },
          UpdateExpression: "SET #status = :status, lastUpdated = :lastUpdated",
          ExpressionAttributeNames: {
            "#status": "status"
          },
          ExpressionAttributeValues: {
            ":status": newStatus,
            ":lastUpdated": new Date().toISOString()
          },
          ReturnValues: "ALL_NEW"
        })
      );

      const updatedBaggage = updateResult.Attributes;

      await eventBridge.send(
        new PutEventsCommand({
          Entries: [
            {
              Source: "aerolink.baggage",
              DetailType: "BAGGAGE_UPDATED",
              Detail: JSON.stringify({
                userEmail: updatedBaggage.userEmail,
                bookingId: updatedBaggage.bookingId,
                baggageId: updatedBaggage.id,
                tagNumber: updatedBaggage.tagNumber,
                status: updatedBaggage.status,
                message: `Baggage ${updatedBaggage.tagNumber} for Booking #${updatedBaggage.bookingId} status changed to ${updatedBaggage.status}`
              }),
              EventBusName: "default"
            }
          ]
        })
      );

      return response(200, {
        message: "Baggage status updated and EventBridge event published",
        baggage: updatedBaggage
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