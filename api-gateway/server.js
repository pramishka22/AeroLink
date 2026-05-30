const express = require("express");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = "aerolink_secret_key";

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token." });
  }
}

function handleError(error, res) {
  console.log(error.message);

  if (error.response) {
    return res.status(error.response.status).json(error.response.data);
  }

  return res.status(500).json({
    message: "Service unavailable or internal gateway error"
  });
}

app.get("/", (req, res) => {
  res.send("AeroLink API Gateway Running");
});

// AUTH
app.post("/auth/register", async (req, res) => {
  try {
    const response = await axios.post("http://auth-service:3001/auth/register", req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const response = await axios.post("http://auth-service:3001/auth/login", req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

// FLIGHTS
app.get("/flights", async (req, res) => {
  try {
    const response = await axios.get("http://flight-service:3002/flights");
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

// BOOKINGS
app.get("/bookings", verifyToken, async (req, res) => {
  try {
    const response = await axios.get("http://booking-service:3003/bookings");
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.post("/bookings", verifyToken, async (req, res) => {
  try {
    const response = await axios.post("http://booking-service:3003/bookings", req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

// BAGGAGE
app.get("/baggage", verifyToken, async (req, res) => {
  try {
    const response = await axios.get("http://baggage-service:3004/baggage");
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.post("/baggage", verifyToken, async (req, res) => {
  try {
    const response = await axios.post("http://baggage-service:3004/baggage", req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.put("/baggage/:id/status", verifyToken, async (req, res) => {
  try {
    const response = await axios.put(
      `http://baggage-service:3004/baggage/${req.params.id}/status`,
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

// NOTIFICATIONS
app.get("/notifications", verifyToken, async (req, res) => {
  try {
    const response = await axios.get("http://notification-service:3005/notifications");
    res.json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

app.post("/notifications", verifyToken, async (req, res) => {
  try {
    const response = await axios.post("http://notification-service:3005/notifications", req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleError(error, res);
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});