import express from "express";
import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------------------
   GET ALL EXPENSES
----------------------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT id, title, category, amount, date, source, type
       FROM expenses
       WHERE user_id = ?
       ORDER BY date DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Fetch expenses error:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

/* ----------------------------------------
   ADD EXPENSE
----------------------------------------- */
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, category, amount, date, source, type } = req.body;

    if (!title || !category || !amount || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await db.query(
      `INSERT INTO expenses (user_id, title, category, amount, date, source, type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, category, amount, date, source || "manual", type || "debit"]
    );

    res.json({ message: "Expense added successfully" });
  } catch (err) {
    console.error("Add expense error:", err);
    res.status(500).json({ error: "Failed to add expense" });
  }
});

/* ----------------------------------------
   DELETE ALL CSV-IMPORTED EXPENSES
   Route: DELETE /api/expenses/imported/csv
   Note: Must be defined BEFORE /:id to avoid
         "imported" being captured as an id param
----------------------------------------- */
router.delete("/imported/csv", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await db.query(
      `DELETE FROM expenses
       WHERE user_id = ?
       AND (source = 'Paytm CSV' OR source = 'csv' OR source LIKE '%csv%')`,
      [userId]
    );

    res.json({
      success: true,
      deleted: result.affectedRows,
      message: `${result.affectedRows} CSV-imported expense(s) deleted`,
    });
  } catch (err) {
    console.error("Delete CSV imports error:", err);
    res.status(500).json({ error: "Failed to delete CSV imports" });
  }
});

/* ----------------------------------------
   DELETE ALL PDF-IMPORTED EXPENSES
   Route: DELETE /api/expenses/imported/pdf
----------------------------------------- */
router.delete("/imported/pdf", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await db.query(
      `DELETE FROM expenses
       WHERE user_id = ?
       AND (source = 'PDF Statement' OR source = 'pdf' OR source LIKE '%pdf%')`,
      [userId]
    );

    res.json({
      success: true,
      deleted: result.affectedRows,
      message: `${result.affectedRows} PDF-imported expense(s) deleted`,
    });
  } catch (err) {
    console.error("Delete PDF imports error:", err);
    res.status(500).json({ error: "Failed to delete PDF imports" });
  }
});

/* ----------------------------------------
   DELETE SINGLE EXPENSE BY ID
   Must come AFTER specific static routes
----------------------------------------- */
router.delete("/:id", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query(
      `DELETE FROM expenses WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Delete expense error:", err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

export default router;
