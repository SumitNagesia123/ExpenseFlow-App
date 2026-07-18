import db from "../db.js";

async function run() {
  try {
    console.log("Starting DB Migration...");
    
    // Check if column already exists
    const [cols] = await db.query("SHOW COLUMNS FROM expenses LIKE 'type'");
    if (cols.length === 0) {
      await db.query("ALTER TABLE expenses ADD COLUMN type VARCHAR(20) DEFAULT 'debit'");
      console.log("Added 'type' column successfully!");
    } else {
      console.log("'type' column already exists.");
    }
    
    // Clean all existing data to start fresh and avoid discrepancies
    await db.query("DELETE FROM expenses");
    console.log("Cleared expenses table for fresh import.");
    
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
