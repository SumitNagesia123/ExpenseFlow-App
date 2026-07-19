import db from "../db.js";

async function list() {
  try {
    const [rows] = await db.query(
      "SELECT id, title, amount, type, date FROM expenses WHERE NOT (MONTH(date) = 7 AND YEAR(date) = 2026) LIMIT 20"
    );
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

list();
