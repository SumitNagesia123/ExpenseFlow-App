import db from "../db.js";

async function run() {
  try {
    console.log("Removing incorrect credit from database...");
    const [res] = await db.query(
      "DELETE FROM expenses WHERE title = 'Amit Nagesia' AND amount = 1000.00"
    );
    console.log("Deleted rows:", res.affectedRows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
