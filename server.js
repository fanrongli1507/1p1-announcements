const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const MONGO_URL = "mongodb+srv://fanrongli1507:ryu19UWlJkgt14rV@cluster0.a4fcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "announcementsDb";
const COLLECTION_NAME = "announcements";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let db;
MongoClient.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    db = client.db(DB_NAME);
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
    process.exit(1);
  });
  async function replaceCollection(newData) {
    try {
        const collection = db.collection(COLLECTION_NAME);

        await collection.deleteMany({});

        await collection.insertMany(newData);

        console.log("Collection replaced successfully!");
    } catch (error) {
        console.error("Error replacing collection:", error);
    }
}

async function deleteExpiredAnnouncements() {
  try {
    const client = await MongoClient.connect(MONGO_URL, { useUnifiedTopology: true });
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteMany({
      deadline: { $lt: new Date() },
    });

    console.log(`Deleted ${result.deletedCount} expired announcements.`);
    client.close();
  } catch (error) {
    console.error("Error deleting expired announcements:", error);
  }
}


app.get("/announcements", async (req, res) => {
  try {
    deleteExpiredAnnouncements();
    const announcements = await db.collection(COLLECTION_NAME).find().toArray();
    res.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).send("Error fetching announcements");
  }
});

app.post("/announcements", async (req, res) => {
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

  try {
    const result = await db.collection(COLLECTION_NAME).insertOne(newAnnouncement);
    res.status(201).json({ message: "Announcement added", newAnnouncement });
  } catch (error) {
    console.error("Error adding announcement:", error);
    res.status(500).send("Error adding announcement");
  }
});

app.post("/delete-announcements", async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    await replaceCollection(content);
    res.status(200).json({ message: "Announcements replaced successfully" });
  } catch (error) {
    console.error("Error replacing announcements:", error);
    res.status(500).json({ error: "Error replacing announcements" });
  }
});

function keepServerAlive() {
  const serverUrl = "https://onep1-announcements.onrender.com/announcements"; 
  setInterval(async () => {
    try {
      const response = await fetch(`${serverUrl}/announcements`);
      if (response.ok) {
        console.log("Self-ping successful! Server is active.");
      } else {
        console.error("Self-ping failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error pinging server:", error);
    }
  }, 600000);
}
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  keepServerAlive();
});

