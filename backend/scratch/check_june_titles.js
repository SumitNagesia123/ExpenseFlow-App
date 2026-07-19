import db from "../db.js";

async function search() {
  try {
    const [rows] = await db.query(
      "SELECT id, title, amount, type, date FROM expenses WHERE title LIKE '%Flipkart%' OR title LIKE '%Rawat%'"
    );
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

search();
