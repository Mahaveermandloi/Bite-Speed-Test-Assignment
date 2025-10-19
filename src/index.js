// src/index.js
import { app } from "./app.js";
import sequelize from "./config/db.js";

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database connected successfully");

    await sequelize.sync({ alter: true });
    console.log("✅ Models synchronized successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
})();
