import express from "express";
import dotenv from "dotenv";
import identifyRoute from "./routes/identifyRoute.js";
import sequelize from "./config/db.js";

dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Welcome to Bitespeed Identity Reconciliation Backend!");
});

// Identify route
app.use("/identify", identifyRoute);

// Connect to database
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ Database connected and synced");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });

// Export app
export { app };
