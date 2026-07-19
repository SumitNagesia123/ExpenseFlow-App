import db from "../db.js";

async function list() {
  try {
    const [rows] = await db.query(
      `SELECT YEAR(date) AS year, MONTH(date) AS month, type, COUNT(*), SUM(amount) 
       FROM expenses 
       GROUP BY year, month, type 
       ORDER BY year DESC, month DESC`
    );
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

list();
