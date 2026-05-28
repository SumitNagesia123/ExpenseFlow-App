import express from "express";
import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* DASHBOARD */
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

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

    const [[cards]] = await db.query(
      `
      SELECT 
        COUNT(*) AS totalTransactions,
        SUM(amount) AS totalSpent,
        SUM(
          CASE 
            WHEN MONTH(date) = MONTH(CURDATE()) 
             AND YEAR(date) = YEAR(CURDATE())
            THEN amount ELSE 0 
          END
        ) AS thisMonth
      FROM expenses
      WHERE user_id = ? ${timeFilter}
      `,
      params
    );

    const [categories] = await db.query(
      `
      SELECT category, SUM(amount) AS total
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
        SUM(amount) AS total
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
        totalTransactions: Number(cards?.totalTransactions || 0),
        totalSpent: Number(cards?.totalSpent || 0),
        thisMonth: (month && month !== "All") ? Number(cards?.totalSpent || 0) : Number(cards?.thisMonth || 0),
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
