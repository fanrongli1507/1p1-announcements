const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;
const DATA_FILE = "./announcements.json";

// Middleware
app.use(cors()); // Allow frontend requests
app.use(express.json()); // Parse JSON request bodies

// Function to read data from JSON file
const readAnnouncements = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
};

// Function to write data to JSON file
const writeAnnouncements = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing file:", error);
  }
};

// Get all announcements
app.get("/announcements", (req, res) => {
  const announcements = readAnnouncements();
  res.json(announcements);
});

// Add a new announcement
app.post("/announcements", (req, res) => {
  const { name, content, deadline } = req.body;

  if (!name || !content || !deadline) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newAnnouncement = {
    name,
    content,
    "date-created": new Date().toISOString(),
    deadline: new Date(deadline).toISOString(),
  };

  const announcements = readAnnouncements();
  announcements.push(newAnnouncement);
  writeAnnouncements(announcements);

  res.status(201).json({ message: "Announcement added", newAnnouncement });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
