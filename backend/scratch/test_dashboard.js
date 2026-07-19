import db from "../db.js";

async function test() {
  try {
    const userId = 1; // test user ID
    const year = "2026";
    const month = "7";

    let timeFilter = "";
    let params = [userId];

    if (year && year !== "All") {
      timeFilter += " AND YEAR(date) = ?";
      params.push(year);
    }

    if (month && month !== "All") {
      timeFilter += " AND MONTH(date) = ?";
      params.push(month);
    }

    let cumulativeFilter = "";
    let cumulativeParams = [userId];

    if (year && year !== "All") {
      if (month && month !== "All") {
        cumulativeFilter += " AND date <= LAST_DAY(STR_TO_DATE(?, '%Y-%m-%d'))";
        const paddedMonth = String(month).padStart(2, "0");
        cumulativeParams.push(`${year}-${paddedMonth}-01`);
      } else {
        cumulativeFilter += " AND YEAR(date) <= ?";
        cumulativeParams.push(Number(year));
      }
    }

    console.log("Running cumulativeCards query...");
    const [[cumulativeCards]] = await db.query(
      `
      SELECT 
        COUNT(*) AS totalTransactions,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) - 
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) AS totalSpent
      FROM expenses
      WHERE user_id = ? ${cumulativeFilter}
      `,
      cumulativeParams
    );
    console.log("cumulativeCards:", cumulativeCards);

    console.log("Running monthly query...");
    const [monthly] = await db.query(
      `
      SELECT 
        YEAR(date) AS year,
        MONTH(date) AS month,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE -amount END) AS total
      FROM expenses
      WHERE user_id = ? ${year && year !== "All" ? "AND YEAR(date) = ?" : ""}
      GROUP BY year, month
      ORDER BY year, month
      `,
      year && year !== "All" ? [userId, year] : [userId]
    );
    console.log("monthly:", monthly);

    console.log("Success!");
    process.exit(0);
  } catch (err) {
    console.error("Dashboard calculation failed:", err);
    process.exit(1);
  }
}

test();
