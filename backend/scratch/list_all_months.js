import db from "../db.js";

async function list() {
  try {
    const [rows] = await db.query(
      `SELECT YEAR(date) AS yr, MONTH(date) AS mo, type, COUNT(*), SUM(amount) 
       FROM expenses 
       GROUP BY yr, mo, type`
    );
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

list();
