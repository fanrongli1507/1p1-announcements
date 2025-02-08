const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// 
app.use(cors());
app.use(express.json());

let announcements = [
  {
    "name": "Announcement One",
    "content": "Read your IEMB",
    "date-created": new Date("2025-01-10"),
    "deadline": new Date("2025-02-10"),
  },
];

app.get("/announcements", (req, res) => {
  res.json(announcements);
});

app.post("/announcements", (req, res) => {
  const { name, content, deadline } = req.body;

  if (!name || !content || !deadline) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newAnnouncement = {
    name,
    content,
    "date-created": new Date(),
    deadline: new Date(deadline),
  };

  announcements.push(newAnnouncement);
  res.status(201).json({ message: "Announcement added", newAnnouncement });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
