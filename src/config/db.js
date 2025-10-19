
// src/config/db.js
import { Sequelize } from "sequelize";

const sequelize = new Sequelize("contact", "root", "admin", {
  host: "localhost",
  dialect: "mysql",
  // logging: false, // optional: disable SQL logs in console
});

export default sequelize;