const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

let bookings = [];

app.get("/", (req, res) => {
  res.send("Booking Service Running");
});

app.get("/bookings", (req, res) => {
  res.json(bookings);
});

app.post("/bookings", async (req, res) => {
  try {

    const { user, flightId, seatsBooked } = req.body;

    // Get flight details
    const flightResponse = await axios.get(
      `http://flight-service:3002/flights`
    );

    const flights = flightResponse.data;

    const flight = flights.find(
      (f) => f.id === Number(flightId)
    );

    if (!flight) {
      return res.status(404).json({
        message: "Flight not found"
      });
    }

    if (flight.availableSeats < seatsBooked) {
      return res.status(400).json({
        message: "Not enough seats available"
      });
    }

    // Update seat availability
    await axios.put(
      `http://flight-service:3002/flights/${flightId}/seats`,
      {
        seatsBooked
      }
    );

    // Create booking
    const booking = {
      id: bookings.length + 1,
      user,
      flightId,
      seatsBooked,
      bookingDate: new Date(),
      status: "Confirmed"
    };

    bookings.push(booking);

    res.status(201).json({
      message: "Booking created successfully",
      booking
    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Internal server error"
    });
  }
});

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`Booking service running on port ${PORT}`);
});