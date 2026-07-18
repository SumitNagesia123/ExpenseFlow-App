import express from "express";
import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";
import { callAI, buildSystemPrompt } from "../utils/aiProvider.js";

const router = express.Router();

// ─── Helper: gather rich SQL context for a user ──────────────────────────────
async function gatherFinancialContext(userId) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const totalBudget = 10000;

  const [[thisMonthRow]] = await db.query(
    `SELECT IFNULL(SUM(amount),0) AS total FROM expenses WHERE user_id=? AND MONTH(date)=? AND YEAR(date)=?`,
    [userId, currentMonth, currentYear]
  );
  const [[lastMonthRow]] = await db.query(
    `SELECT IFNULL(SUM(amount),0) AS total FROM expenses WHERE user_id=? AND MONTH(date)=? AND YEAR(date)=?`,
    [userId, lastMonth, lastMonthYear]
  );

  const [categories] = await db.query(
    `SELECT category, SUM(amount) AS total, COUNT(*) AS txn_count
     FROM expenses WHERE user_id=? AND MONTH(date)=? AND YEAR(date)=?
     GROUP BY category ORDER BY total DESC`,
    [userId, currentMonth, currentYear]
  );

  const [lastMonthCategories] = await db.query(
    `SELECT category, SUM(amount) AS total FROM expenses
     WHERE user_id=? AND MONTH(date)=? AND YEAR(date)=?
     GROUP BY category`,
    [userId, lastMonth, lastMonthYear]
  );

  const [subs] = await db.query(
    `SELECT title, AVG(amount) AS avg_amount, COUNT(DISTINCT MONTH(date)) AS months
     FROM expenses WHERE user_id=? GROUP BY title HAVING months >= 2 ORDER BY avg_amount DESC LIMIT 8`,
    [userId]
  );

  const [recentTxns] = await db.query(
    `SELECT title, amount, category, date FROM expenses WHERE user_id=?
     ORDER BY date DESC, id DESC LIMIT 10`,
    [userId]
  );

  const [allTimeRow] = await db.query(
    `SELECT IFNULL(SUM(amount),0) AS total, COUNT(*) AS count FROM expenses WHERE user_id=?`,
    [userId]
  );

  const thisMonth = Number(thisMonthRow.total);
  const lastMonthTotal = Number(lastMonthRow.total);
  const remaining = totalBudget - thisMonth;
  const trend = lastMonthTotal > 0
    ? (((thisMonth - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
    : 0;

  return {
    thisMonth, lastMonthTotal, remaining, trend, categories,
    lastMonthCategories, subs, recentTxns, totalBudget,
    allTimeTotal: Number(allTimeRow[0]?.total || 0),
    allTimeCount: Number(allTimeRow[0]?.count || 0),
    currentMonth, currentYear
  };
}

function buildContextString(ctx) {
  return `
THIS MONTH (${ctx.currentMonth}/${ctx.currentYear}):
- Budget Limit: ₹${ctx.totalBudget.toLocaleString()}
- Total Spent: ₹${ctx.thisMonth.toLocaleString()}
- Remaining: ₹${ctx.remaining.toLocaleString()} (${ctx.remaining < 0 ? "OVERSPENT" : ctx.remaining < 2000 ? "WARNING" : "SAFE"})
- vs Last Month: ${ctx.trend > 0 ? "+" : ""}${ctx.trend}% (Last: ₹${ctx.lastMonthTotal.toLocaleString()})

CATEGORY BREAKDOWN THIS MONTH:
${ctx.categories.map(c => `- ${c.category}: ₹${Number(c.total).toLocaleString()} (${c.txn_count} transactions)`).join("\n") || "- No spending recorded yet"}

DETECTED RECURRING SUBSCRIPTIONS:
${ctx.subs.map(s => `- ${s.title}: ~₹${Math.round(s.avg_amount)}/mo (active ${s.months} months)`).join("\n") || "- None detected"}

RECENT TRANSACTIONS:
${ctx.recentTxns.map(t => `- ${t.title} | ₹${t.amount} | ${t.category} | ${new Date(t.date).toLocaleDateString("en-IN")}`).join("\n") || "- No transactions yet"}

ALL-TIME: ₹${ctx.allTimeTotal.toLocaleString()} across ${ctx.allTimeCount} transactions.`;
}


// ─── 1. GET /api/ai-coach/profile ────────────────────────────────────────────
// Financial Digital Twin + Behavioral Profile
router.get("/profile", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const ctx = await gatherFinancialContext(userId);

    // Compute behavioral scores
    const budgetScore = ctx.remaining >= 0
      ? Math.min(100, Math.round((ctx.remaining / ctx.totalBudget) * 100) + 50)
      : Math.max(0, 50 + Math.round((ctx.remaining / ctx.totalBudget) * 100));

    const subscriptionBurden = ctx.subs.reduce((sum, s) => sum + s.avg_amount, 0);
    const subscriptionScore = Math.max(0, 100 - Math.round((subscriptionBurden / ctx.totalBudget) * 100));

    const trendScore = ctx.trend <= 0 ? 100 : ctx.trend <= 10 ? 75 : ctx.trend <= 25 ? 50 : 25;

    const overallScore = Math.round((budgetScore + subscriptionScore + trendScore) / 3);

    // Spending personality
    let personality = "Balanced Spender";
    let personalityEmoji = "⚖️";
    if (ctx.thisMonth > ctx.totalBudget) { personality = "Impulsive Spender"; personalityEmoji = "🔥"; }
    else if (ctx.trend > 20) { personality = "Rising Spender"; personalityEmoji = "📈"; }
    else if (ctx.remaining > ctx.totalBudget * 0.5) { personality = "Conservative Saver"; personalityEmoji = "🛡️"; }
    else if (subscriptionBurden > ctx.totalBudget * 0.25) { personality = "Subscription Heavy"; personalityEmoji = "📺"; }

    // Top category analysis
    const topCat = ctx.categories[0];
    const riskProfile = overallScore >= 75 ? "Low Risk" : overallScore >= 50 ? "Moderate Risk" : "High Risk";

    res.json({
      overallScore,
      riskProfile,
      personality,
      personalityEmoji,
      budgetScore,
      subscriptionScore,
      trendScore,
      subscriptionBurden: Math.round(subscriptionBurden),
      topCategory: topCat ? { name: topCat.category, amount: Number(topCat.total) } : null,
      spendingTrend: Number(ctx.trend),
      thisMonth: ctx.thisMonth,
      remaining: ctx.remaining,
      totalBudget: ctx.totalBudget
    });
  } catch (err) {
    console.error("[AI Coach] profile error:", err);
    res.status(500).json({ error: "Failed to generate financial profile" });
  }
});


// ─── 2. GET /api/ai-coach/recommendations ────────────────────────────────────
// Proactive AI Recommendations (DB-driven + AI-generated)
router.get("/recommendations", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const ctx = await gatherFinancialContext(userId);
    const contextStr = buildContextString(ctx);

    const systemPrompt = buildSystemPrompt("coach", contextStr);
    const userPrompt = `Analyze this user's financial profile and generate exactly 5 highly specific, actionable recommendations.
Format each as: **[Category]** — Recommendation text here.
Be data-driven — reference real numbers from their data. Focus on their biggest spending areas and trends.`;

    let aiResult = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], { maxTokens: 600, forceProvider: "gemini" });

    // Fallback to Groq if Gemini fails
    if (!aiResult.reply) {
      aiResult = await callAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ], { maxTokens: 600, forceProvider: "groq" });
    }

    const { reply, provider } = aiResult;

    // Also compute rule-based quick wins
    const quickWins = [];
    if (ctx.remaining < 0) {
      quickWins.push({ type: "danger", title: "Budget Exceeded!", body: `You've overspent by ₹${Math.abs(ctx.remaining).toLocaleString()} this month. Freeze non-essential spending immediately.` });
    }
    if (ctx.trend > 15) {
      quickWins.push({ type: "warning", title: "Spending Surge Detected", body: `Your spending is up ${ctx.trend}% vs last month. Review your recent transactions.` });
    }
    if (ctx.subs.length > 3) {
      const subTotal = ctx.subs.reduce((s, x) => s + x.avg_amount, 0);
      quickWins.push({ type: "info", title: "Subscription Audit", body: `You have ${ctx.subs.length} recurring subscriptions costing ~₹${Math.round(subTotal)}/month. Review unused ones.` });
    }
    if (ctx.categories[0] && Number(ctx.categories[0].total) > ctx.totalBudget * 0.4) {
      quickWins.push({ type: "warning", title: `${ctx.categories[0].category} Dominates Budget`, body: `${ctx.categories[0].category} is ${Math.round((Number(ctx.categories[0].total) / ctx.totalBudget) * 100)}% of your total budget limit.` });
    }

    res.json({
      aiRecommendations: reply,
      quickWins,
      provider,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("[AI Coach] recommendations error:", err);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});


// ─── 3. GET /api/ai-coach/fraud-prediction ───────────────────────────────────
// AI Fraud Prediction Engine
router.get("/fraud-prediction", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Detect anomalous transactions (amount > 2 std deviations)
    const [[stats]] = await db.query(
      `SELECT AVG(amount) AS avg_amount, STDDEV(amount) AS std_amount FROM expenses WHERE user_id=?`,
      [userId]
    );
    const threshold = Number(stats.avg_amount) + 2 * Number(stats.std_amount);

    const [anomalies] = await db.query(
      `SELECT title, amount, category, date FROM expenses
       WHERE user_id=? AND amount > ? ORDER BY date DESC LIMIT 10`,
      [userId, threshold || 5000]
    );

    // Duplicate pattern detection
    const [duplicates] = await db.query(
      `SELECT title, amount, COUNT(*) AS cnt FROM expenses
       WHERE user_id=? GROUP BY title, amount HAVING cnt > 1 ORDER BY cnt DESC LIMIT 5`,
      [userId]
    );

    // Late-night transactions (potential fraud signal)
    const [lateNight] = await db.query(
      `SELECT title, amount, date FROM expenses
       WHERE user_id=? AND HOUR(created_at) >= 23 ORDER BY date DESC LIMIT 5`,
      [userId]
    );

    const fraudScore = Math.min(100, anomalies.length * 15 + duplicates.length * 10 + lateNight.length * 5);
    const riskLevel = fraudScore >= 60 ? "High" : fraudScore >= 30 ? "Medium" : "Low";

    res.json({
      fraudScore,
      riskLevel,
      anomalousTransactions: anomalies,
      duplicatePatterns: duplicates,
      lateNightTransactions: lateNight,
      threshold: Math.round(threshold),
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("[AI Coach] fraud prediction error:", err);
    res.status(500).json({ error: "Failed to run fraud prediction" });
  }
});


// ─── 4. POST /api/ai-coach/query ─────────────────────────────────────────────
// Natural Language Finance Query Engine
router.post("/query", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    const ctx = await gatherFinancialContext(userId);
    const contextStr = buildContextString(ctx);
    const systemPrompt = buildSystemPrompt("analyst", contextStr);

    let aiResult = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ], { maxTokens: 500, forceProvider: "gemini" });

    // Fallback to Groq if Gemini fails
    if (!aiResult.reply) {
      aiResult = await callAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ], { maxTokens: 500, forceProvider: "groq" });
    }

    const { reply, provider } = aiResult;

    // Fallback: rule-based answers if AI unavailable
    let fallbackReply = reply;
    if (!reply) {
      const q = question.toLowerCase();
      if (q.includes("food")) {
        const foodCat = ctx.categories.find(c => c.category === "Food");
        fallbackReply = foodCat ? `You spent ₹${Number(foodCat.total).toLocaleString()} on Food this month.` : "No Food expenses recorded this month.";
      } else if (q.includes("subscription")) {
        fallbackReply = ctx.subs.length > 0
          ? `Subscriptions: ${ctx.subs.map(s => `${s.title} ~₹${Math.round(s.avg_amount)}`).join(", ")}`
          : "No recurring subscriptions detected.";
      } else {
        fallbackReply = `This month you've spent ₹${ctx.thisMonth.toLocaleString()} out of your ₹${ctx.totalBudget.toLocaleString()} budget.`;
      }
    }

    res.json({ answer: fallbackReply || reply, provider, question });
  } catch (err) {
    console.error("[AI Coach] query error:", err);
    res.status(500).json({ error: "Natural language query failed" });
  }
});


// ─── 5. GET /api/ai-coach/report ─────────────────────────────────────────────
// AI Monthly Report Generator
router.get("/report", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const ctx = await gatherFinancialContext(userId);
    const contextStr = buildContextString(ctx);
    const systemPrompt = buildSystemPrompt("analyst", contextStr);

    let aiResult = await callAI([
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate a comprehensive monthly AI financial intelligence report. Include:
1. Executive Summary (2-3 sentences)
2. Spending Breakdown Analysis (reference real category numbers)
3. Top 3 Financial Risks this month
4. Subscription & Recurring Cost Analysis
5. Savings Opportunity Recommendations (3 specific suggestions)
6. Financial Health Score verdict
Format using markdown with headers and bullet points.`
      }
    ], { maxTokens: 1000, forceProvider: "gemini" });

    // Fallback to Groq if Gemini fails
    if (!aiResult.reply) {
      aiResult = await callAI([
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate a comprehensive monthly AI financial intelligence report. Include:
1. Executive Summary (2-3 sentences)
2. Spending Breakdown Analysis (reference real category numbers)
3. Top 3 Financial Risks this month
4. Subscription & Recurring Cost Analysis
5. Savings Opportunity Recommendations (3 specific suggestions)
6. Financial Health Score verdict
Format using markdown with headers and bullet points.`
        }
      ], { maxTokens: 1000, forceProvider: "groq" });
    }

    const { reply, provider } = aiResult;

    // Compute budget health score
    const healthScore = Math.min(100, Math.max(0,
      Math.round(100 - ((ctx.thisMonth / ctx.totalBudget) * 60) - (ctx.trend > 0 ? ctx.trend * 0.5 : 0))
    ));

    res.json({
      report: reply || `## Monthly Financial Report\n- Spent: ₹${ctx.thisMonth}\n- Budget: ₹${ctx.totalBudget}\n- Remaining: ₹${ctx.remaining}`,
      healthScore,
      provider,
      month: ctx.currentMonth,
      year: ctx.currentYear,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("[AI Coach] report error:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});


// ─── 6. POST /api/goals/ai-plan ──────────────────────────────────────────────
// Smart Goal Planner
router.post("/goals/ai-plan", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalName, targetAmount, targetMonths } = req.body;

    if (!goalName || !targetAmount) {
      return res.status(400).json({ error: "goalName and targetAmount are required" });
    }

    const ctx = await gatherFinancialContext(userId);
    const contextStr = buildContextString(ctx);
    const monthlyRequired = Math.ceil(targetAmount / (targetMonths || 12));
    const achievable = monthlyRequired <= ctx.remaining;

    const systemPrompt = buildSystemPrompt("coach", contextStr);
    let aiResult = await callAI([
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `The user wants to save ₹${targetAmount.toLocaleString()} for "${goalName}" in ${targetMonths || 12} months (₹${monthlyRequired}/month needed).
Given their current spending pattern, generate:
1. Feasibility assessment (can they realistically achieve this?)
2. Top 3 specific expense categories they can cut to free up ₹${monthlyRequired}/month
3. A month-by-month savings milestone plan
4. Motivational closing statement`
      }
    ], { maxTokens: 700, forceProvider: "gemini" });

    // Fallback to Groq if Gemini fails
    if (!aiResult.reply) {
      aiResult = await callAI([
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `The user wants to save ₹${targetAmount.toLocaleString()} for "${goalName}" in ${targetMonths || 12} months (₹${monthlyRequired}/month needed).
Given their current spending pattern, generate:
1. Feasibility assessment (can they realistically achieve this?)
2. Top 3 specific expense categories they can cut to free up ₹${monthlyRequired}/month
3. A month-by-month savings milestone plan
4. Motivational closing statement`
        }
      ], { maxTokens: 700, forceProvider: "groq" });
    }

    const { reply, provider } = aiResult;

    res.json({
      goalName,
      targetAmount: Number(targetAmount),
      targetMonths: targetMonths || 12,
      monthlyRequired,
      achievable,
      currentSavingsCapacity: Math.max(0, ctx.remaining),
      plan: reply,
      provider,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("[AI Coach] goals ai-plan error:", err);
    res.status(500).json({ error: "Failed to generate savings plan" });
  }
});


export default router;
