import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Create connection using DATABASE_URL if available (for production like Render/Railway)
// Otherwise fallback to individual env variables or local defaults
const db = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Nagesia@123",
      database: process.env.DB_NAME || "expenseflow"
    });

export default db;