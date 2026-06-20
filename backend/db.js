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

// Automatically initialize database tables if they don't exist
const initializeDB = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        source VARCHAR(255) DEFAULT 'manual',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
      await db.query(`ALTER TABLE expenses ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    } catch (err) {
      // Column already exists, ignore
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS budget (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        month_year VARCHAR(7) NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS gmail_tokens (
        user_id VARCHAR(255) PRIMARY KEY,
        access_token TEXT,
        refresh_token TEXT,
        connected_email VARCHAR(255),
        last_synced_at DATETIME
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS sms_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message TEXT NOT NULL,
        hash VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create category_budgets table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS category_budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(255) UNIQUE NOT NULL,
        budget_limit DECIMAL(10,2) NOT NULL
      )
    `);

    // Seed default category budgets
    await db.query(`
      INSERT IGNORE INTO category_budgets (category, budget_limit) VALUES
      ('Food', 5000.00),
      ('Travel', 2000.00),
      ('Bills', 10000.00),
      ('Shopping', 4000.00),
      ('Fuel', 3000.00),
      ('Medical', 1500.00),
      ('Entertainment', 2000.00),
      ('Miscellaneous', 1000.00)
    `);

    console.log("✅ Database tables verified/initialized successfully.");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
  }
};

initializeDB();

export default db;