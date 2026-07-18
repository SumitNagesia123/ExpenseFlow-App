import express from "express";
import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================================
   GET /api/goals — Load all goals + history for user
   ========================================================== */
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT id, name, target_amount, current_amount, deadline, created_at FROM goals WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    const goals = await Promise.all(
      rows.map(async (r) => {
        const target = Number(r.target_amount || 0);
        const saved = Number(r.current_amount || 0);

        // Fetch history records for this specific goal
        const [historyRows] = await db.query(
          "SELECT amount, created_at FROM goal_history WHERE goal_id = ? ORDER BY created_at DESC",
          [r.id]
        );

        const history = historyRows.map((h) => ({
          amount: Number(h.amount),
          date: h.created_at,
        }));

        return {
          id: r.id,
          name: r.name,
          target_amount: target,
          current_amount: saved,
          deadline: r.deadline,
          status: saved >= target ? "completed" : "active",
          history, // Return history array!
        };
      })
    );

    res.json(goals);
  } catch (err) {
    console.error("Fetch goals error:", err);
    res.status(500).json({ error: "Failed to load goals" });
  }
});

/* ==========================================================
   POST /api/goals — Create a new goal
   ========================================================== */
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, target_amount, deadline } = req.body;

    if (!name || !target_amount) {
      return res.status(400).json({ error: "Name and Target Amount are required" });
    }

    const [result] = await db.query(
      "INSERT INTO goals (user_id, name, target_amount, current_amount, deadline) VALUES (?, ?, ?, 0, ?)",
      [userId, name, Number(target_amount), deadline || null]
    );

    res.json({
      id: result.insertId,
      name,
      target_amount: Number(target_amount),
      current_amount: 0,
      deadline,
      status: "active",
      history: []
    });
  } catch (err) {
    console.error("Create goal error:", err);
    res.status(500).json({ error: "Failed to create goal" });
  }
});

/* ==========================================================
   PUT /api/goals/:id/add-money — Add funds + record history
   ========================================================== */
router.put("/:id/add-money", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    // Verify ownership
    const [[goal]] = await db.query("SELECT id, current_amount, target_amount FROM goals WHERE id = ? AND user_id = ?", [id, userId]);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const newAmount = Number(goal.current_amount || 0) + Number(amount);
    
    // Update goal saved amount
    await db.query("UPDATE goals SET current_amount = ? WHERE id = ?", [newAmount, id]);

    // Insert history record!
    await db.query("INSERT INTO goal_history (goal_id, amount) VALUES (?, ?)", [id, Number(amount)]);

    // Fetch fresh history list
    const [historyRows] = await db.query(
      "SELECT amount, created_at FROM goal_history WHERE goal_id = ? ORDER BY created_at DESC",
      [id]
    );

    const history = historyRows.map((h) => ({
      amount: Number(h.amount),
      date: h.created_at,
    }));

    res.json({
      id: Number(id),
      current_amount: newAmount,
      status: newAmount >= Number(goal.target_amount) ? "completed" : "active",
      history
    });
  } catch (err) {
    console.error("Add money error:", err);
    res.status(500).json({ error: "Failed to add money to goal" });
  }
});

/* ==========================================================
   DELETE /api/goals/:id — Delete a goal
   ========================================================== */
router.delete("/:id", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM goals WHERE id = ? AND user_id = ?", [id, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("Delete goal error:", err);
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

export default router;
