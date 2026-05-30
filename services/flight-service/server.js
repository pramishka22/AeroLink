const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let flights = [
  {
    id: 1,
    flightNumber: "AL100",
    airline: "AeroLink",
    from: "Colombo",
    to: "Dubai",
    departureTime: "2026-06-10T08:00:00",
    arrivalTime: "2026-06-10T12:00:00",
    price: 450,
    totalSeats: 100,
    availableSeats: 100,
    status: "Scheduled"
  }
];

app.get("/", (req, res) => {
  res.send("Flight Service Running");
});

app.get("/flights", (req, res) => {
  res.json(flights);
});

app.post("/flights", (req, res) => {
  const flight = {
    id: flights.length + 1,
    ...req.body
  };

  flights.push(flight);

  res.status(201).json({
    message: "Flight created successfully",
    flight
  });
});

app.put("/flights/:id/seats", (req, res) => {
  const flight = flights.find((f) => f.id === Number(req.params.id));

  if (!flight) {
    return res.status(404).json({ message: "Flight not found" });
  }

  const { seatsBooked } = req.body;

  flight.availableSeats -= seatsBooked;

  res.json({
    message: "Seat availability updated",
    flight
  });
});

const PORT = 3002;

app.listen(PORT, () => {
  console.log(`Flight service running on port ${PORT}`);
});