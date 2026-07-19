import db from "../db.js";

async function run() {
  try {
    const [rows] = await db.query("SELECT * FROM expenses LIMIT 5");
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
