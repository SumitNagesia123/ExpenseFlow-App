import express from "express";
import db from "../db.js";

const router = express.Router();

/* ----------------------------------------
   GET ALL TRANSACTIONS
----------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, category, amount, date, source, type
      FROM expenses
      ORDER BY date DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Transactions fetch error:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

/* ----------------------------------------
   DELETE TRANSACTION
----------------------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `
      DELETE FROM expenses WHERE id = ?
    `,
      [id]
    );

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Transaction delete error:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

export default router;
