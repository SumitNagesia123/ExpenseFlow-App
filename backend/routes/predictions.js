import express from "express";
import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/predictions/spending
 * Predicts next month's spending using moving averages.
 */
router.get("/spending", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get monthly totals for the last 3 months
    const [monthlyRows] = await db.query(
      `SELECT MONTH(date) as month, YEAR(date) as year, SUM(amount) as total
       FROM expenses
       WHERE user_id = ?
       GROUP BY YEAR(date), MONTH(date)
       ORDER BY YEAR(date) DESC, MONTH(date) DESC
       LIMIT 3`,
      [userId]
    );

    let predictedTotal = 0;
    if (monthlyRows.length > 0) {
      const sum = monthlyRows.reduce((acc, row) => acc + Number(row.total), 0);
      predictedTotal = Math.round(sum / monthlyRows.length);
    }

    // Get category-level predictions based on the last 3 months
    const [categoryRows] = await db.query(
      `SELECT category, SUM(amount) as total
       FROM expenses
       WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
       GROUP BY category
       ORDER BY total DESC`,
      [userId]
    );

    const predictedCategories = categoryRows.map(row => ({
      category: row.category,
      predicted: Math.round(Number(row.total) / 3)
    }));

    res.json({
      predictedTotal,
      predictedCategories
    });
  } catch (err) {
    console.error("Spending prediction error:", err);
    res.status(500).json({ error: "Spending prediction failed" });
  }
});

/**
 * GET /api/predictions/savings
 * Estimates future savings based on budget limit and predicted spending.
 */
router.get("/savings", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const totalBudget = 10000; // In a real app, this might come from a user settings table

    // Predict spending for the next month based on last 3 months average
    const [monthlyRows] = await db.query(
      `SELECT SUM(amount) as total
       FROM expenses
       WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`,
      [userId]
    );

    let averageMonthlySpend = 0;
    if (monthlyRows[0] && monthlyRows[0].total) {
      averageMonthlySpend = Math.round(Number(monthlyRows[0].total) / 3);
    }

    const estimatedSavings = totalBudget - averageMonthlySpend;
    const achievablePotential = estimatedSavings > 0 ? estimatedSavings * 1.1 : 0; // Suggesting a 10% improvement

    res.json({
      estimatedSavings,
      projectedRunway: estimatedSavings > 0 ? "Positive" : "Negative",
      achievablePotential: Math.round(achievablePotential)
    });
  } catch (err) {
    console.error("Savings prediction error:", err);
    res.status(500).json({ error: "Savings prediction failed" });
  }
});

export default router;
