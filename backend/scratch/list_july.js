import db from "../db.js";

async function list() {
  try {
    const [rows] = await db.query(
      "SELECT id, title, amount, type, date, category FROM expenses WHERE MONTH(date) = 7 AND YEAR(date) = 2026 ORDER BY date DESC"
    );
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

list();
