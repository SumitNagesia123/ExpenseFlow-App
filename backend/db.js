/**
 * ============================================================
 *  ExpenseFlow — Database Connection + Auto-Healing Bootstrap
 * ============================================================
 *  On every server start:
 *  1. Establishes a MySQL connection pool
 *  2. Delegates schema management to selfHealer (adds tables/columns automatically)
 *  3. Never crashes on schema errors — only logs and continues
 * ============================================================
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { runSelfHealer } from "./utils/selfHealer.js";

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;

const db = connectionString
  ? mysql.createPool(connectionString)
  : mysql.createPool({
      host:     process.env.DB_HOST     || "localhost",
      user:     process.env.DB_USER     || "root",
      password: process.env.DB_PASSWORD || "Nagesia@123",
      database: process.env.DB_NAME     || "expenseflow"
    });

// Run self-healer on startup (non-blocking — server starts regardless)
runSelfHealer(db).catch(err => {
  console.error("❌ [SelfHealer] Critical startup error:", err.message);
});

export default db;