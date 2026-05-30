const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

let baggageRecords = [];

app.get("/", (req, res) => {
  res.send("Baggage Service Running");
});

// CREATE BAGGAGE
app.post("/baggage", (req, res) => {
  const { bookingId, passengerName, tagNumber } = req.body;

  const baggage = {
    id: baggageRecords.length + 1,
    bookingId,
    passengerName,
    tagNumber,
    status: "Checked-In",
    lastUpdated: new Date()
  };

  baggageRecords.push(baggage);

  res.status(201).json({
    message: "Baggage record created successfully",
    baggage
  });
});

// GET ALL BAGGAGE
app.get("/baggage", (req, res) => {
  res.json(baggageRecords);
});

// GET BAGGAGE BY BOOKING ID
app.get("/baggage/:bookingId", (req, res) => {

  const records = baggageRecords.filter(
    (b) => b.bookingId === Number(req.params.bookingId)
  );

  res.json(records);
});

// UPDATE BAGGAGE STATUS
app.put("/baggage/:id/status", async (req, res) => {

  try {

    const baggage = baggageRecords.find(
      (b) => b.id === Number(req.params.id)
    );

    if (!baggage) {
      return res.status(404).json({
        message: "Baggage record not found"
      });
    }

    baggage.status = req.body.status;
    baggage.lastUpdated = new Date();

    // CREATE AUTOMATIC NOTIFICATION
    await axios.post("http://notification-service:3005/notifications", {
      type: "BAGGAGE_UPDATED",
      message: `Baggage ${baggage.tagNumber} status changed to ${baggage.status}`
    });

    res.json({
      message: "Baggage status updated successfully",
      baggage
    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Internal server error"
    });
  }
});

const PORT = 3004;

app.listen(PORT, () => {
  console.log(`Baggage service running on port ${PORT}`);
});