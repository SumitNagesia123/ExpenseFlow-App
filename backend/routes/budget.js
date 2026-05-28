import express from "express";
import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------------------
   GET ALL BUDGET LIMITS
----------------------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT category, budget_limit
      FROM category_budgets
    `);

    res.json(rows);
  } catch (err) {
    console.error("Budget load error:", err);
    res.status(500).json({ error: "Failed to load budgets" });
  }
});

/* ----------------------------------------
   GET BUDGET STATUS (MONTH + YEAR AWARE)
----------------------------------------- */
router.get("/status", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();

    const [rows] = await db.query(
      `
      SELECT 
        b.category,
        b.budget_limit AS budget,
        IFNULL(SUM(e.amount), 0) AS spent
      FROM category_budgets b
      LEFT JOIN expenses e
        ON b.category = e.category
        AND MONTH(e.date) = ?
        AND YEAR(e.date) = ?
        AND e.user_id = ?
      GROUP BY b.category, b.budget_limit
      `,
      [month, year, userId]
    );

    /* ✅ STATUS LOGIC WITH NUMBER PARSING TO FIX BUG */
    const result = rows.map((r) => {
      const budget = Number(r.budget);
      const spent = Number(r.spent);
      const remaining = budget - spent;

      let status = "safe";
      if (spent >= budget) status = "overspent";
      else if (spent >= 0.8 * budget) status = "warning";

      return {
        category: r.category,
        budget,
        spent,
        remaining,
        status,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Budget status error:", err);
    res.status(500).json({ error: "Budget status failed" });
  }
});

/* ----------------------------------------
   EXPORT CSV (MONTH + YEAR)
----------------------------------------- */
router.get("/export", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();

    const [rows] = await db.query(
      `
      SELECT 
        b.category,
        b.budget_limit AS budget,
        IFNULL(SUM(e.amount), 0) AS spent
      FROM category_budgets b
      LEFT JOIN expenses e
        ON b.category = e.category
        AND MONTH(e.date) = ?
        AND YEAR(e.date) = ?
        AND e.user_id = ?
      GROUP BY b.category, b.budget_limit
      `,
      [month, year, userId]
    );

    let csv = "Category,Budget,Spent\n";
    rows.forEach((r) => {
      csv += `${r.category},${r.budget},${r.spent}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment(`budget_${month}_${year}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("Budget export error:", err);
    res.status(500).json({ error: "Export failed" });
  }
});

export default router;
