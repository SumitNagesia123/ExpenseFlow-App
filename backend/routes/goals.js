import express from "express";
import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/goals
 * Goal-based financial planning and calculations.
 */
router.post("/", protect, async (req, res) => {
  try {
    const { title, targetAmount, months } = req.body;
    
    if (!title || !targetAmount || !months) {
      return res.status(400).json({ error: "Missing required fields: title, targetAmount, months" });
    }
    
    const requiredMonthlySavings = Math.ceil(targetAmount / months);
    
    // In a fully integrated system, this could be saved to a `goals` table
    res.json({
      title,
      targetAmount,
      months,
      requiredMonthlySavings,
      advice: `To achieve your goal of ₹${targetAmount.toLocaleString()} in ${months} months, you need to systematically save ₹${requiredMonthlySavings.toLocaleString()} every month.`,
      strategy: [
        `Automate a monthly transfer of ₹${requiredMonthlySavings.toLocaleString()} to a savings account.`,
        "Reduce discretionary spending (e.g., dining out) by 15%.",
        "Monitor your monthly budget compliance to ensure you don't dip into your savings."
      ]
    });
  } catch (err) {
    console.error("Goals API error:", err);
    res.status(500).json({ error: "Failed to process financial goal" });
  }
});

export default router;
