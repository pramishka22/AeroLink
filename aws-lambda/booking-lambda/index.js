const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const dynamoDB = DynamoDBDocumentClient.from(client);

const BOOKINGS_TABLE = "AeroLinkBookings";
const FLIGHTS_TABLE = "AeroLinkFlights";

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
  } catch (error) {
    console.error("JWT decode error:", error.message);
    return null;
  }
}

function isAdminOrStaff(userData) {
  return userData?.role === "admin" || userData?.role === "staff";
}

exports.handler = async (event) => {
  try {
    const path = event.rawPath || event.path || "";
    const cleanPath = path.replace("/prod", "");
    const method = event.requestContext?.http?.method || event.httpMethod || "";
    const body = event.body ? JSON.parse(event.body) : {};
    const userData = getUserFromToken(event);

    if (method === "OPTIONS") {
      return response(200, { message: "CORS OK" });
    }

    if (!userData) {
      return response(401, {
        message: "Access denied. Valid JWT token required."
      });
    }

    // GET BOOKINGS
    if (cleanPath === "/bookings" && method === "GET") {
      const result = await dynamoDB.send(
        new ScanCommand({ TableName: BOOKINGS_TABLE })
      );

      let bookings = result.Items || [];

      if (!isAdminOrStaff(userData)) {
        bookings = bookings.filter((b) => b.userEmail === userData.email);
      }

      return response(200, bookings);
    }

    // CREATE BOOKING
    if (cleanPath === "/bookings" && method === "POST") {
      const { flightId, seatsBooked } = body;

      if (!flightId || !seatsBooked) {
        return response(400, {
          message: "flightId and seatsBooked are required"
        });
      }

      const flightResult = await dynamoDB.send(
        new GetCommand({
          TableName: FLIGHTS_TABLE,
          Key: { id: String(flightId) }
        })
      );

      if (!flightResult.Item) {
        return response(404, { message: "Flight not found" });
      }

      const flight = flightResult.Item;

      if (Number(flight.availableSeats) < Number(seatsBooked)) {
        return response(400, { message: "Not enough seats available" });
      }

      // Consistency control: conditional update prevents overbooking
      await dynamoDB.send(
        new UpdateCommand({
          TableName: FLIGHTS_TABLE,
          Key: { id: String(flightId) },
          UpdateExpression: "SET availableSeats = availableSeats - :seats",
          ConditionExpression: "availableSeats >= :seats",
          ExpressionAttributeValues: {
            ":seats": Number(seatsBooked)
          }
        })
      );

      const booking = {
        id: Date.now().toString(),
        user: userData.email,
        userEmail: userData.email,
        userRole: userData.role,
        flightId: String(flightId),
        seatsBooked: Number(seatsBooked),
        bookingDate: new Date().toISOString(),
        status: "Confirmed"
      };

      await dynamoDB.send(
        new PutCommand({
          TableName: BOOKINGS_TABLE,
          Item: booking
        })
      );

      return response(201, {
        message: "Booking created successfully",
        booking
      });
    }

    return response(404, {
      message: "Route not found",
      path,
      cleanPath,
      method
    });

  } catch (error) {
    console.error(error);

    if (error.name === "ConditionalCheckFailedException") {
      return response(409, {
        message: "Booking failed because seats are no longer available"
      });
    }

    return response(500, {
      message: "Internal server error",
      error: error.message
    });
  }
};