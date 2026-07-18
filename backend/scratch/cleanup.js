import db from "../db.js";

async function run() {
  try {
    console.log("Starting DB cleanup...");

    // 1. Delete all transactions that represent credits/deposits
    const [delRes] = await db.query(
      `DELETE FROM expenses 
       WHERE title LIKE '%Received%' 
          OR title LIKE '%Refund%' 
          OR title LIKE '%Cashback%' 
          OR title LIKE '%Credit%' 
          OR title LIKE '%Cash Deposit%'`
    );
    console.log("Deleted credit transactions:", delRes.affectedRows);

    // 2. Fetch remaining rows and remove fuzzy duplicates
    const [rows] = await db.query("SELECT * FROM expenses ORDER BY id");
    const seen = new Set();
    const toDelete = [];

    for (const r of rows) {
      // Normalize title (remove non-alphanumeric, strip prefixes, remove extra spaces)
      const cleanTitle = r.title
        .toLowerCase()
        .replace(/paid to|money sent to|transfer to/g, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();

      const dateStr = new Date(r.date).toISOString().split("T")[0];
      const key = `${r.user_id}|${cleanTitle}|${Number(r.amount)}|${dateStr}`;

      if (seen.has(key)) {
        toDelete.push(r.id);
      } else {
        seen.add(key);
      }
    }

    console.log("Duplicate rows to delete:", toDelete.length);

    if (toDelete.length > 0) {
      // Delete in batches of 50 to prevent packet size limits
      for (let i = 0; i < toDelete.length; i += 50) {
        const batch = toDelete.slice(i, i + 50);
        await db.query(`DELETE FROM expenses WHERE id IN (${batch.join(",")})`);
      }
      console.log("Successfully deleted all duplicates!");
    }

    console.log("DB cleanup completed!");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err);
    process.exit(1);
  }
}

run();
