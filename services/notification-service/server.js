const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let notifications = [];

app.get("/", (req, res) => {
  res.send("Notification Service Running");
});

app.post("/notifications", (req, res) => {
  const notification = {
    id: notifications.length + 1,
    type: req.body.type,
    message: req.body.message,
    createdAt: new Date()
  };

  notifications.push(notification);

  res.status(201).json({
    message: "Notification created successfully",
    notification
  });
});

app.get("/notifications", (req, res) => {
  res.json(notifications);
});

const PORT = 3005;

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});