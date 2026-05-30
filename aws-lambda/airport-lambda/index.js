const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const dynamoDB = DynamoDBDocumentClient.from(client);

const AIRPORT_TABLE = "AeroLinkAirportEvents";

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
    const path = event.rawPath || event.path || "";
    const method = event.requestContext?.http?.method || event.httpMethod || "";
    const body = event.body ? JSON.parse(event.body) : {};

    if (method === "OPTIONS") {
      return response(200, { message: "CORS OK" });
    }

    if (path.endsWith("/airport/events") && method === "GET") {
      const result = await dynamoDB.send(
        new ScanCommand({ TableName: AIRPORT_TABLE })
      );

      return response(200, result.Items || []);
    }

    if (path.endsWith("/airport/events") && method === "POST") {
      const { flightId, airportCode, gate, status, message } = body;

      if (!flightId || !airportCode || !status) {
        return response(400, {
          message: "flightId, airportCode, and status are required"
        });
      }

      const airportEvent = {
        id: Date.now().toString(),
        flightId: String(flightId),
        airportCode,
        gate: gate || "TBA",
        status,
        message: message || `Airport operational update for flight ${flightId}`,
        sourceSystem: "Simulated Airport Operations System",
        createdAt: new Date().toISOString()
      };

      await dynamoDB.send(
        new PutCommand({
          TableName: AIRPORT_TABLE,
          Item: airportEvent
        })
      );

      return response(201, {
        message: "Airport system integration event received successfully",
        airportEvent
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