import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;

// Create connection using the live connection string if available (for production like Railway)
// Otherwise fallback to individual env variables or local defaults
const db = connectionString
  ? mysql.createPool(connectionString)
  : mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Nagesia@123",
      database: process.env.DB_NAME || "expenseflow"
    });

export default db;