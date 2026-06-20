/**
 * ============================================================
 *  ExpenseFlow — Self-Healing Database Schema Manager
 * ============================================================
 *  On every server start this module:
 *  1. Ensures every required table exists (CREATE TABLE IF NOT EXISTS)
 *  2. Detects missing columns and adds them automatically (ALTER TABLE)
 *  3. Seeds required default data that must always be present
 *  4. Never drops or modifies existing data — purely additive
 * ============================================================
 */

// ─── Desired Schema Definition ───────────────────────────────────────────────
// Add any new table or column here and it will be auto-applied on next deploy.
const SCHEMA = {
  users: {
    createSQL: `
      CREATE TABLE IF NOT EXISTS users (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        name         VARCHAR(255)  NOT NULL,
        email        VARCHAR(255)  UNIQUE NOT NULL,
        password_hash VARCHAR(255)
      )
    `,
    requiredColumns: [
      { name: "id",            definition: "INT AUTO_INCREMENT PRIMARY KEY" },
      { name: "name",          definition: "VARCHAR(255) NOT NULL" },
      { name: "email",         definition: "VARCHAR(255) UNIQUE NOT NULL" },
      { name: "password_hash", definition: "VARCHAR(255)" }
    ]
  },

  expenses: {
    createSQL: `
      CREATE TABLE IF NOT EXISTS expenses (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    VARCHAR(255)   NOT NULL,
        title      VARCHAR(255)   NOT NULL,
        category   VARCHAR(255)   NOT NULL,
        amount     DECIMAL(10,2)  NOT NULL,
        date       DATE           NOT NULL,
        source     VARCHAR(255)   DEFAULT 'manual',
        created_at TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
      )
    `,
    requiredColumns: [
      { name: "id",         definition: "INT AUTO_INCREMENT PRIMARY KEY" },
      { name: "user_id",    definition: "VARCHAR(255) NOT NULL" },
      { name: "title",      definition: "VARCHAR(255) NOT NULL" },
      { name: "category",   definition: "VARCHAR(255) NOT NULL" },
      { name: "amount",     definition: "DECIMAL(10,2) NOT NULL" },
      { name: "date",       definition: "DATE NOT NULL" },
      { name: "source",     definition: "VARCHAR(255) DEFAULT 'manual'" },
      { name: "created_at", definition: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" }
    ]
  },

  budget: {
    createSQL: `
      CREATE TABLE IF NOT EXISTS budget (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    VARCHAR(255)   NOT NULL,
        amount     DECIMAL(10,2)  NOT NULL,
        month_year VARCHAR(7)     NOT NULL
      )
    `,
    requiredColumns: [
      { name: "id",         definition: "INT AUTO_INCREMENT PRIMARY KEY" },
      { name: "user_id",    definition: "VARCHAR(255) NOT NULL" },
      { name: "amount",     definition: "DECIMAL(10,2) NOT NULL" },
      { name: "month_year", definition: "VARCHAR(7) NOT NULL" }
    ]
  },

  gmail_tokens: {
    createSQL: `
      CREATE TABLE IF NOT EXISTS gmail_tokens (
        user_id        VARCHAR(255)  PRIMARY KEY,
        access_token   TEXT,
        refresh_token  TEXT,
        connected_email VARCHAR(255),
        last_synced_at DATETIME
      )
    `,
    requiredColumns: [
      { name: "user_id",         definition: "VARCHAR(255) PRIMARY KEY" },
      { name: "access_token",    definition: "TEXT" },
      { name: "refresh_token",   definition: "TEXT" },
      { name: "connected_email", definition: "VARCHAR(255)" },
      { name: "last_synced_at",  definition: "DATETIME" }
    ]
  },

  sms_logs: {
    createSQL: `
      CREATE TABLE IF NOT EXISTS sms_logs (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        message    TEXT          NOT NULL,
        hash       VARCHAR(255)  UNIQUE NOT NULL,
        created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
      )
    `,
    requiredColumns: [
      { name: "id",         definition: "INT AUTO_INCREMENT PRIMARY KEY" },
      { name: "message",    definition: "TEXT NOT NULL" },
      { name: "hash",       definition: "VARCHAR(255) UNIQUE NOT NULL" },
      { name: "created_at", definition: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" }
    ]
  },

  category_budgets: {
    createSQL: `
      CREATE TABLE IF NOT EXISTS category_budgets (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        category     VARCHAR(255)  UNIQUE NOT NULL,
        budget_limit DECIMAL(10,2) NOT NULL
      )
    `,
    requiredColumns: [
      { name: "id",           definition: "INT AUTO_INCREMENT PRIMARY KEY" },
      { name: "category",     definition: "VARCHAR(255) UNIQUE NOT NULL" },
      { name: "budget_limit", definition: "DECIMAL(10,2) NOT NULL" }
    ]
  },

  goals: {
    createSQL: `
      CREATE TABLE IF NOT EXISTS goals (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        user_id        VARCHAR(255)   NOT NULL,
        name           VARCHAR(255)   NOT NULL,
        target_amount  DECIMAL(10,2)  NOT NULL,
        current_amount DECIMAL(10,2)  DEFAULT 0,
        deadline       DATE,
        created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
      )
    `,
    requiredColumns: [
      { name: "id",             definition: "INT AUTO_INCREMENT PRIMARY KEY" },
      { name: "user_id",        definition: "VARCHAR(255) NOT NULL" },
      { name: "name",           definition: "VARCHAR(255) NOT NULL" },
      { name: "target_amount",  definition: "DECIMAL(10,2) NOT NULL" },
      { name: "current_amount", definition: "DECIMAL(10,2) DEFAULT 0" },
      { name: "deadline",       definition: "DATE" },
      { name: "created_at",     definition: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" }
    ]
  }
};

// ─── Seed Data (inserted only if table is empty or row is missing) ────────────
const SEEDS = {
  category_budgets: {
    checkSQL: "SELECT COUNT(*) AS cnt FROM category_budgets",
    insertSQL: `
      INSERT IGNORE INTO category_budgets (category, budget_limit) VALUES
        ('Food', 5000.00),
        ('Travel', 2000.00),
        ('Bills', 10000.00),
        ('Shopping', 4000.00),
        ('Fuel', 3000.00),
        ('Medical', 1500.00),
        ('Entertainment', 2000.00),
        ('Miscellaneous', 1000.00)
    `
  }
};

// ─── Core Self-Healer ─────────────────────────────────────────────────────────
export async function runSelfHealer(db) {
  console.log("\n🔧 [SelfHealer] Starting schema health check...");
  let fixes = 0;

  for (const [tableName, tableConfig] of Object.entries(SCHEMA)) {
    // 1. Ensure table exists
    try {
      await db.query(tableConfig.createSQL);
    } catch (err) {
      console.error(`[SelfHealer] ❌ Failed to create table '${tableName}':`, err.message);
      continue;
    }

    // 2. Check existing columns via INFORMATION_SCHEMA
    let existingColumns = [];
    try {
      const [rows] = await db.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [tableName]
      );
      existingColumns = rows.map(r => r.COLUMN_NAME.toLowerCase());
    } catch (err) {
      console.warn(`[SelfHealer] ⚠️  Could not read columns for '${tableName}':`, err.message);
      continue;
    }

    // 3. Add any missing columns
    for (const col of tableConfig.requiredColumns) {
      if (existingColumns.includes(col.name.toLowerCase())) continue;

      // Skip PRIMARY KEY columns (can't ALTER ADD a PK column safely)
      if (col.definition.toUpperCase().includes("PRIMARY KEY")) {
        console.warn(`[SelfHealer] ⚠️  Skipping PK column '${col.name}' for '${tableName}' — table likely needs rebuild.`);
        continue;
      }

      try {
        await db.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${col.name}\` ${col.definition}`);
        console.log(`[SelfHealer] ✅ Added missing column '${col.name}' to '${tableName}'`);
        fixes++;
      } catch (err) {
        // Duplicate column race condition — harmless
        if (err.code === "ER_DUP_FIELDNAME") continue;
        console.error(`[SelfHealer] ❌ Failed to add column '${col.name}' to '${tableName}':`, err.message);
      }
    }
  }

  // 4. Seed required default data
  for (const [tableName, seed] of Object.entries(SEEDS)) {
    try {
      await db.query(seed.insertSQL);
    } catch (err) {
      console.warn(`[SelfHealer] ⚠️  Seed failed for '${tableName}':`, err.message);
    }
  }

  if (fixes === 0) {
    console.log("✅ [SelfHealer] Schema is healthy — no repairs needed.\n");
  } else {
    console.log(`✅ [SelfHealer] Schema repaired — ${fixes} fix(es) applied.\n`);
  }
}
