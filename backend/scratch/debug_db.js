import dotenv from "dotenv";
import mysql from "mysql2/promise";
dotenv.config();

async function run() {
  const url = process.env.DATABASE_URL;
  console.log("DATABASE_URL:", url);
  try {
    const conn = await mysql.createConnection(url);
    const [rows] = await conn.query("SELECT COUNT(*) AS count FROM expenses");
    console.log("Row count in expenses table:", rows[0].count);
    
    const [sample] = await conn.query("SELECT * FROM expenses LIMIT 3");
    console.log("Sample rows:", sample);
    
    conn.end();
  } catch (err) {
    console.error(err);
  }
}
run();
