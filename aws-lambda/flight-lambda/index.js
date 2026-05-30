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
  } catch {
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

    // Public: view flights
    if (cleanPath === "/flights" && method === "GET") {
      const result = await dynamoDB.send(
        new ScanCommand({ TableName: FLIGHTS_TABLE })
      );

      return response(200, result.Items || []);
    }

    // Admin/staff only: create flights
    if (cleanPath === "/flights" && method === "POST") {
      if (!isAdminOrStaff(userData)) {
        return response(403, {
          message: "Access denied. Only admin or staff can create flights."
        });
      }

      const requiredFields = [
        "flightNumber",
        "from",
        "to",
        "departureTime",
        "arrivalTime",
        "price",
        "totalSeats"
      ];

      for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === "") {
          return response(400, { message: `${field} is required` });
        }
      }

      const totalSeats = Number(body.totalSeats);

      const flight = {
        id: body.id || Date.now().toString(),
        flightNumber: body.flightNumber,
        airline: body.airline || "AeroLink",
        from: body.from,
        to: body.to,
        departureTime: body.departureTime,
        arrivalTime: body.arrivalTime,
        price: Number(body.price),
        totalSeats,
        availableSeats: body.availableSeats !== undefined
          ? Number(body.availableSeats)
          : totalSeats,
        status: body.status || "Scheduled",
        createdBy: userData.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dynamoDB.send(
        new PutCommand({
          TableName: FLIGHTS_TABLE,
          Item: flight,
          ConditionExpression: "attribute_not_exists(id)"
        })
      );

      return response(201, {
        message: "Flight created successfully",
        flight
      });
    }

    // Admin/staff only: update flight schedule, price, status
    if (
      cleanPath.includes("/flights/") &&
      !cleanPath.endsWith("/seats") &&
      method === "PUT"
    ) {
      if (!isAdminOrStaff(userData)) {
        return response(403, {
          message: "Access denied. Only admin or staff can update flights."
        });
      }

      const flightId = cleanPath.split("/")[2];

      const existingFlight = await dynamoDB.send(
        new GetCommand({
          TableName: FLIGHTS_TABLE,
          Key: { id: flightId }
        })
      );

      if (!existingFlight.Item) {
        return response(404, { message: "Flight not found" });
      }

      const updateFields = {};
      const allowedFields = [
        "flightNumber",
        "airline",
        "from",
        "to",
        "departureTime",
        "arrivalTime",
        "price",
        "totalSeats",
        "availableSeats",
        "status"
      ];

      allowedFields.forEach((field) => {
        if (body[field] !== undefined && body[field] !== "") {
          if (field === "price" || field === "totalSeats" || field === "availableSeats") {
            updateFields[field] = Number(body[field]);
          } else {
            updateFields[field] = body[field];
          }
        }
      });

      if (Object.keys(updateFields).length === 0) {
        return response(400, { message: "No valid fields provided for update" });
      }

      updateFields.updatedBy = userData.email;
      updateFields.updatedAt = new Date().toISOString();

      const expressionNames = {};
      const expressionValues = {};
      const setExpressions = [];

      Object.keys(updateFields).forEach((field) => {
        expressionNames[`#${field}`] = field;
        expressionValues[`:${field}`] = updateFields[field];
        setExpressions.push(`#${field} = :${field}`);
      });

      const updateResult = await dynamoDB.send(
        new UpdateCommand({
          TableName: FLIGHTS_TABLE,
          Key: { id: flightId },
          UpdateExpression: `SET ${setExpressions.join(", ")}`,
          ExpressionAttributeNames: expressionNames,
          ExpressionAttributeValues: expressionValues,
          ReturnValues: "ALL_NEW"
        })
      );

      return response(200, {
        message: "Flight schedule/pricing/status updated successfully",
        flight: updateResult.Attributes
      });
    }

    // Internal/booking use: update seats
    if (
      cleanPath.includes("/flights/") &&
      cleanPath.endsWith("/seats") &&
      method === "PUT"
    ) {
      const flightId = cleanPath.split("/")[2];
      const seatsBooked = Number(body.seatsBooked);

      if (!seatsBooked || seatsBooked <= 0) {
        return response(400, { message: "Valid seatsBooked is required" });
      }

      const updateResult = await dynamoDB.send(
        new UpdateCommand({
          TableName: FLIGHTS_TABLE,
          Key: { id: flightId },
          UpdateExpression: "SET availableSeats = availableSeats - :seats, updatedAt = :updatedAt",
          ConditionExpression: "availableSeats >= :seats",
          ExpressionAttributeValues: {
            ":seats": seatsBooked,
            ":updatedAt": new Date().toISOString()
          },
          ReturnValues: "ALL_NEW"
        })
      );

      return response(200, {
        message: "Seat availability updated",
        flight: updateResult.Attributes
      });
    }

    return response(404, { message: "Route not found", path, cleanPath, method });

  } catch (error) {
    console.error(error);

    if (error.name === "ConditionalCheckFailedException") {
      return response(409, {
        message: "Operation failed. Flight may already exist or seats are unavailable."
      });
    }

    return response(500, {
      message: "Internal server error",
      error: error.message
    });
  }
};