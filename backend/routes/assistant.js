import express from "express";
import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";
import { callAI } from "../utils/aiProvider.js";

const router = express.Router();

/**
 * POST /api/assistant/chat
 * Generative AI Copilot integrated with live SQL database context.
 */
router.post("/chat", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, history } = req.body; // history can contain previous chat turns
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    const query = message.toLowerCase();
    
    // 1. Gather SQL Context
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const totalBudget = 10000;
    
    // Month total
    const [[totalSpentRow]] = await db.query(
      `SELECT IFNULL(SUM(amount), 0) as total FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [userId, currentMonth, currentYear]
    );
    const totalSpent = Number(totalSpentRow.total);
    const remaining = totalBudget - totalSpent;
    
    // Category totals
    const [categories] = await db.query(
      `SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? GROUP BY category ORDER BY total DESC`,
      [userId, currentMonth, currentYear]
    );
    
    // Subscriptions
    const [subs] = await db.query(
      `SELECT title, AVG(amount) as avg_amount FROM expenses WHERE user_id = ? GROUP BY title HAVING COUNT(DISTINCT MONTH(date)) >= 2 LIMIT 5`,
      [userId]
    );
    
    // Format live context for the LLM
    const sqlContext = `
USER LIVE FINANCIAL DATA FOR CURRENT MONTH (${currentMonth}/${currentYear}):
- Total Monthly Budget Limit: ₹${totalBudget}
- Total Spent So Far: ₹${totalSpent}
- Remaining Budget: ₹${remaining}
- Budget Status: ${remaining < 0 ? "OVERSPENT (DANGER)" : remaining < 2000 ? "WARNING (NEAR LIMIT)" : "SAFE"}

CATEGORY-WISE SPENDING BREAKDOWN:
${categories.map(c => `- ${c.category}: ₹${Number(c.total).toLocaleString()}`).join('\n') || "- No category spending recorded."}

DETECTED RECURRING SUBSCRIPTIONS:
${subs.map(s => `- ${s.title}: ~₹${Math.round(s.avg_amount)}`).join('\n') || "- No active subscriptions detected."}
`;

    // 2. Setup System Prompt
    const systemPrompt = `You are "Copilot AI", an advanced, friendly, and highly professional personal finance operating system assistant for ExpenseFlow.
Your primary role is to help the user manage their money, explain their spending patterns, track budgets, and offer actionable financial advice.
Always be extremely helpful, professional, polite, and encouraging. Use elegant emojis where appropriate.

Use the following real-time, 100% database-driven context of the user to answer any financial questions accurately. If they ask generally or casually (e.g. greetings, jokes, general knowledge), feel free to answer creatively while keeping a smart, financial advisor persona.

${sqlContext}

RULES:
1. Always base financial facts, spending amounts, and categories strictly on the data provided above.
2. If the user asks general questions unrelated to finances (e.g. "tell me a joke", "how is the weather", "help me code"), answer them perfectly and professionally, but maintain a witty and premium tone.
3. Keep answers relatively concise, easy to read, and split into clear paragraphs or bullet points.
`;

    // 3. Prepare messages payload
    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // Add history if present
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach(h => {
        messages.push({
          role: h.role === "user" ? "user" : "assistant",
          content: h.text
        });
      });
    }

    // Add current user prompt
    messages.push({ role: "user", content: message });

    // 4. Fetch from AI Provider Layer
    let reply = "";
    try {
      const result = await callAI(messages, { maxTokens: 600, forceProvider: "groq" });
      reply = result.reply;
      if (!reply) {
        throw new Error("AI provider returned empty response");
      }
    } catch (apiErr) {
      console.warn("AI call failed, falling back to rules engine:", apiErr);
      
      // Heuristic Fallback
      reply = "I am your AI financial assistant. I can help analyze your spending, budget, and subscriptions.";
      if (query.includes("spend") || query.includes("spent") || query.includes("expense") || query.includes("how much")) {
        reply = `You have spent ₹${totalSpent.toLocaleString()} out of your ₹${totalBudget.toLocaleString()} budget this month.`;
      } else if (query.includes("category") || query.includes("top")) {
        reply = categories.length > 0 
          ? `Your top category is ${categories[0].category} with ₹${Number(categories[0].total).toLocaleString()} spent.` 
          : "You don't have any spending recorded this month yet.";
      }
    }

    res.json({ reply });
  } catch (err) {
    console.error("AI Assistant main error:", err);
    res.status(500).json({ error: "AI Assistant failed to process request" });
  }
});

export default router;
