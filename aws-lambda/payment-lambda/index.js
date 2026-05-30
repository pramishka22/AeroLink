const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const dynamoDB = DynamoDBDocumentClient.from(client);

const PAYMENTS_TABLE = "AeroLinkPayments";

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

    if (path.endsWith("/payments") && method === "GET") {
      const result = await dynamoDB.send(
        new ScanCommand({ TableName: PAYMENTS_TABLE })
      );

      return response(200, result.Items || []);
    }

    if (path.endsWith("/payments/simulate") && method === "POST") {
      const { bookingId, amount, cardNumber, provider } = body;

      if (!bookingId || !amount || !cardNumber) {
        return response(400, {
          message: "bookingId, amount, and cardNumber are required"
        });
      }

      const cleanCard = String(cardNumber).replace(/\s/g, "");

      if (!/^\d{16}$/.test(cleanCard)) {
        return response(400, {
          message: "Invalid simulated card number. Use 16 digits."
        });
      }

      const payment = {
        id: Date.now().toString(),
        bookingId: String(bookingId),
        amount: Number(amount),
        provider: provider || "Simulated Payment Provider",
        status: "PAYMENT_APPROVED",
        last4: cleanCard.slice(-4),
        transactionRef: `TXN-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      await dynamoDB.send(
        new PutCommand({
          TableName: PAYMENTS_TABLE,
          Item: payment
        })
      );

      return response(201, {
        message: "Payment provider simulation completed successfully",
        payment
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