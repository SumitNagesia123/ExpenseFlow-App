import dotenv from "dotenv";
import mysql from "mysql2/promise";
dotenv.config();

async function run() {
  const url = process.env.DATABASE_URL;
  console.log("DATABASE_URL:", url);
  try {
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Nagesia@123",
      database: "expenseflow"
    });
    const [rows] = await conn.query("SELECT * FROM expenses WHERE title LIKE '%Nagesia%'");
    console.log("Amit Nagesia rows:", rows);
    
    conn.end();
  } catch (err) {
    console.error(err);
  }
}
run();
