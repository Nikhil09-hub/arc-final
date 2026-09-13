const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");
const eventRoutes = require("./src/routes/eventRoutes");
const galleryRoutes = require("./src/routes/galleryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/events", eventRoutes);
app.use("/api/gallery", galleryRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "VJ ARC API is running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();