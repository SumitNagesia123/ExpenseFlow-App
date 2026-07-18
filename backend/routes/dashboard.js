import express from "express";
import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* DASHBOARD */
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    // Time filter for category list, recent list, etc. (uses full filters)
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

    /* ==========================================================
       1. CUMULATIVE STATS (Total Spent & Transactions)
       Calculates net spent up to the end of the selected month/year.
       Net Spent = SUM(debits) - SUM(credits)
       ========================================================== */
    let cumulativeFilter = "";
    let cumulativeParams = [userId];

    if (year && year !== "All") {
      if (month && month !== "All") {
        // Filter up to the last day of the selected month
        cumulativeFilter += " AND date <= LAST_DAY(STR_TO_DATE(?, '%Y-%m-%d'))";
        const paddedMonth = String(month).padStart(2, "0");
        cumulativeParams.push(`${year}-${paddedMonth}-01`);
      } else {
        // Filter up to the end of the selected year
        cumulativeFilter += " AND YEAR(date) <= ?";
        cumulativeParams.push(Number(year));
      }
    }

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

    /* ==========================================================
       2. MONTHLY STATS (This Month's Spent)
       If a month is selected: returns net spent for that month.
       ========================================================== */
    let thisMonthSpent = 0;
    if (month && month !== "All") {
      const targetYear = (year && year !== "All") ? Number(year) : new Date().getFullYear();
      const [[monthRow]] = await db.query(
        `SELECT 
           SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) - 
           SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) AS total 
         FROM expenses 
         WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [userId, Number(month), targetYear]
      );
      thisMonthSpent = Number(monthRow?.total || 0);
    } else {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const [[monthRow]] = await db.query(
        `SELECT 
           SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) - 
           SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) AS total 
         FROM expenses 
         WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [userId, currentMonth, currentYear]
      );
      thisMonthSpent = Number(monthRow?.total || 0);
    }

    const [categories] = await db.query(
      `
      SELECT category, 
        SUM(CASE WHEN type = 'debit' THEN amount ELSE -amount END) AS total
      FROM expenses
      WHERE user_id = ? ${timeFilter}
      GROUP BY category
      `,
      params
    );

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

    const [recent] = await db.query(
      `
      SELECT id, title, category, amount, date
      FROM expenses
      WHERE user_id = ? ${timeFilter}
      ORDER BY date DESC
      LIMIT 5
      `,
      params
    );

    const [subscriptions] = await db.query(
      `
      SELECT title AS name, amount
      FROM expenses
      WHERE user_id = ? AND category IN ('Bills', 'Services') ${timeFilter}
      ORDER BY amount DESC
      LIMIT 4
      `,
      params
    );

    res.json({
      cards: {
        totalTransactions: Number(cumulativeCards?.totalTransactions || 0),
        totalSpent: Number(cumulativeCards?.totalSpent || 0),
        thisMonth: thisMonthSpent,
      },
      charts: {
        categoryData: categories.map(c => ({
          category: c.category || "Uncategorized",
          total: Number(c.total),
        })),
        monthlyTrend: monthly.map(m => ({
          year: m.year,
          month: m.month,
          total: Number(m.total),
        })),
      },
      recent,
      subscriptions: subscriptions.map(s => ({
        name: s.name || "Unknown",
        amount: Number(s.amount || 0)
      })),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

export default router;
