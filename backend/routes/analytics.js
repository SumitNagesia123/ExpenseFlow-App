import express from "express";
import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/analytics?month=&year=
 * Returns real per-user category breakdown, daily trend for the month,
 * and full monthly trend for the selected year.
 */
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year required" });
    }

    /* =========================
       CATEGORY TOTALS (month)
    ========================= */
    const [categoryRows] = await db.query(
      `SELECT
         category,
         SUM(amount) AS total
       FROM expenses
       WHERE user_id = ?
         AND MONTH(date) = ?
         AND YEAR(date)  = ?
       GROUP BY category
       ORDER BY total DESC`,
      [userId, month, year]
    );

    /* =========================
       DAILY SPEND TREND (for the selected month)
       Used to build the sparkline inside the month
    ========================= */
    const [dailyRows] = await db.query(
      `SELECT
         DAY(date)  AS day,
         SUM(amount) AS total
       FROM expenses
       WHERE user_id = ?
         AND MONTH(date) = ?
         AND YEAR(date)  = ?
       GROUP BY DAY(date)
       ORDER BY DAY(date) ASC`,
      [userId, month, year]
    );

    /* =========================
       MONTHLY TREND (full year)
       Used for the yearly line chart
    ========================= */
    const [monthlyRows] = await db.query(
      `SELECT
         MONTH(date) AS month,
         SUM(amount) AS total
       FROM expenses
       WHERE user_id = ?
         AND YEAR(date) = ?
       GROUP BY MONTH(date)
       ORDER BY MONTH(date) ASC`,
      [userId, year]
    );

    /* Month names for the X-axis labels */
    const MONTH_NAMES = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    /* =========================
       TOP CATEGORY
    ========================= */
    const topCategory = categoryRows.length > 0
      ? categoryRows[0].category
      : "No Data";
    const highestSpend = categoryRows.length > 0
      ? Number(categoryRows[0].total)
      : 0;

    res.json({
      categoryData: categoryRows.map((c) => ({
        category: c.category,
        total: Number(c.total),
      })),

      /* Daily trend for the selected month */
      trendData: dailyRows.map((t) => ({
        label: `Day ${t.day}`,
        total: Number(t.total),
      })),

      /* Monthly trend for the whole year (for the bottom chart) */
      monthlyTrend: monthlyRows.map((m) => ({
        label: MONTH_NAMES[m.month] || `M${m.month}`,
        month: Number(m.month),
        total: Number(m.total),
      })),

      topCategory,
      highestSpend,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Analytics failed" });
  }
});

/**
 * GET /api/analytics/budget-vs-actual?month=&year=
 * Returns real per-user budget vs actual spend.
 */
router.get("/budget-vs-actual", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year required" });
    }

    /* Total budget is globally set to 10000 */
    const totalBudget = 10000;

    /* Total spent by THIS user for the period */
    const [[expenseRow]] = await db.query(
      `SELECT SUM(amount) AS totalSpent
       FROM expenses
       WHERE user_id = ?
         AND MONTH(date) = ?
         AND YEAR(date)  = ?`,
      [userId, month, year]
    );

    const totalSpent  = Number(expenseRow?.totalSpent  || 0);
    const remaining   = totalBudget - totalSpent;

    let status = "safe";
    if (totalSpent >= totalBudget)           status = "overspent";
    else if (totalSpent >= 0.7 * totalBudget) status = "warning";

    res.json({ totalBudget, totalSpent, remaining, status });
  } catch (err) {
    console.error("Budget vs Actual error:", err);
    res.status(500).json({ error: "Budget vs actual failed" });
  }
});

/**
 * GET /api/analytics/insights?month=&year=
 * AI Financial Insights Engine
 * Month-over-month comparisons, category growth, abnormal spending.
 */
router.get("/insights", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year required" });
    }

    const currentMonth = Number(month);
    const currentYear = Number(year);
    
    // Calculate previous month/year
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    // 1. Get current month categories
    const [currentRows] = await db.query(
      `SELECT category, SUM(amount) AS total
       FROM expenses
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
       GROUP BY category`,
      [userId, currentMonth, currentYear]
    );

    // 2. Get previous month categories
    const [prevRows] = await db.query(
      `SELECT category, SUM(amount) AS total
       FROM expenses
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
       GROUP BY category`,
      [userId, prevMonth, prevYear]
    );

    // Map previous data for easy lookup
    const prevMap = {};
    let prevTotal = 0;
    prevRows.forEach(r => {
      prevMap[r.category] = Number(r.total);
      prevTotal += Number(r.total);
    });

    let currentTotal = 0;
    let insights = [];

    // Analyze current vs previous
    currentRows.forEach(r => {
      const category = r.category;
      const currentSpend = Number(r.total);
      currentTotal += currentSpend;

      const prevSpend = prevMap[category] || 0;

      if (prevSpend > 0) {
        const percentChange = ((currentSpend - prevSpend) / prevSpend) * 100;
        
        if (percentChange >= 30) {
          insights.push({
            type: "warning",
            title: "High Spending Detected",
            message: `${category} spending increased by ${Math.round(percentChange)}% compared to last month.`
          });
        } else if (percentChange <= -20) {
          insights.push({
            type: "success",
            title: "Great Savings!",
            message: `${category} spending decreased by ${Math.round(Math.abs(percentChange))}% since last month.`
          });
        }
      } else if (currentSpend > 1000) {
        insights.push({
          type: "info",
          title: "New Expense Trend",
          message: `You spent ₹${currentSpend} on ${category} this month, which is a new spending category.`
        });
      }
    });

    // Overall spending insight
    if (prevTotal > 0) {
      const totalChange = ((currentTotal - prevTotal) / prevTotal) * 100;
      if (totalChange > 20) {
        insights.unshift({
          type: "danger",
          title: "Overall Spending Up",
          message: `Your total spending is up ${Math.round(totalChange)}% from last month.`
        });
      } else if (totalChange < -10) {
        insights.unshift({
          type: "success",
          title: "Excellent Budgeting",
          message: `Your total spending is down ${Math.round(Math.abs(totalChange))}% from last month.`
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        type: "info",
        title: "Stable Spending",
        message: "Your spending habits are stable and closely match your previous month."
      });
    }

    res.json(insights);
  } catch (err) {
    console.error("Insights error:", err);
    res.status(500).json({ error: "Insights failed" });
  }
});

/**
 * GET /api/analytics/subscriptions
 * Subscription Detection Engine
 * Detects recurring monthly payments.
 */
router.get("/subscriptions", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Detect subscriptions by finding merchants with stable recurring payments across multiple months
    const [rows] = await db.query(
      `SELECT 
         title AS merchant,
         ROUND(AVG(amount), 2) AS amount,
         COUNT(DISTINCT MONTH(date)) as frequency_months,
         MAX(date) as last_paid
       FROM expenses
       WHERE user_id = ?
       GROUP BY title
       HAVING frequency_months >= 2 
          AND (MAX(amount) - MIN(amount)) < 50
       ORDER BY frequency_months DESC, amount DESC
       LIMIT 10`,
      [userId]
    );

    const subscriptions = rows.map(r => ({
      merchant: r.merchant,
      amount: Number(r.amount),
      frequency: "Monthly", // since we checked COUNT(DISTINCT MONTH)
      lastPaid: r.last_paid,
      alerts: Number(r.amount) > 1000 ? ["High value subscription"] : []
    }));

    res.json(subscriptions);
  } catch (err) {
    console.error("Subscription detection error:", err);
    res.status(500).json({ error: "Subscription detection failed" });
  }
});

/* =======================================================
   PHASE 4: FINANCIAL HEALTH & RISK ANALYSIS ENGINES
======================================================== */

/**
 * GET /api/analytics/health-score
 * Generates a dynamic financial score out of 100.
 */
router.get("/health-score", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year required" });
    }

    let score = 100;
    let summary = "Your financial habits are excellent.";
    const totalBudget = 10000;

    // Current month total spent
    const [[currentExpense]] = await db.query(
      `SELECT SUM(amount) AS totalSpent FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [userId, month, year]
    );
    const totalSpent = Number(currentExpense?.totalSpent || 0);

    // Overspending penalty
    if (totalSpent > totalBudget) {
      score -= 25;
      summary = "You have exceeded your monthly budget. Reduce spending immediately.";
    } else if (totalSpent > totalBudget * 0.8) {
      score -= 10;
      summary = "You are very close to your budget limit. Monitor expenses carefully.";
    }

    // High anomaly spending penalty (e.g., any transaction > 3000)
    const [[anomalyRow]] = await db.query(
      `SELECT COUNT(*) AS anomalyCount FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? AND amount > 3000`,
      [userId, month, year]
    );
    const anomalies = Number(anomalyRow?.anomalyCount || 0);
    if (anomalies > 0) {
      score -= (anomalies * 5); // Subtract 5 points for each large transaction
    }

    // Cap score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    let status = "Excellent";
    if (score < 50) status = "Poor";
    else if (score < 70) status = "Fair";
    else if (score < 85) status = "Good";

    res.json({ score, status, summary });
  } catch (err) {
    console.error("Health score error:", err);
    res.status(500).json({ error: "Health score failed" });
  }
});

/**
 * GET /api/analytics/risk-analysis
 * Detects unusual spending spikes and category risks.
 */
router.get("/risk-analysis", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year required" });
    }

    const alerts = [];
    const totalBudget = 10000;

    // 1. Budget Risk
    const [[currentExpense]] = await db.query(
      `SELECT SUM(amount) AS totalSpent FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [userId, month, year]
    );
    const totalSpent = Number(currentExpense?.totalSpent || 0);
    if (totalSpent > totalBudget) {
      alerts.push("Critical Risk: You have exceeded your overall monthly budget.");
    }

    // 2. High Category Spending Imbalance
    const [categories] = await db.query(
      `SELECT category, SUM(amount) AS total FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? GROUP BY category`,
      [userId, month, year]
    );
    
    categories.forEach(c => {
      const catTotal = Number(c.total);
      if (catTotal > totalBudget * 0.4) {
        alerts.push(`Category Risk: ${c.category} spending is consuming over 40% of your total budget.`);
      }
    });

    // 3. Unusual spikes
    const [[spikes]] = await db.query(
      `SELECT COUNT(*) AS spikeCount FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? AND amount > 4000`,
      [userId, month, year]
    );
    if (spikes?.spikeCount > 0) {
      alerts.push(`Volatility Risk: Detected ${spikes.spikeCount} unusually large transactions this month.`);
    }

    if (alerts.length === 0) {
      alerts.push("Low Risk: Your spending patterns are currently stable and safe.");
    }

    res.json({ alerts });
  } catch (err) {
    console.error("Risk analysis error:", err);
    res.status(500).json({ error: "Risk analysis failed" });
  }
});

/**
 * GET /api/analytics/financial-summary
 * Generates natural-language AI summaries.
 */
router.get("/financial-summary", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year required" });
    }

    const currentMonth = Number(month);
    const currentYear = Number(year);
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) { prevMonth = 12; prevYear -= 1; }

    const [[currRow]] = await db.query(`SELECT IFNULL(SUM(amount), 0) AS total FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`, [userId, currentMonth, currentYear]);
    const [[prevRow]] = await db.query(`SELECT IFNULL(SUM(amount), 0) AS total FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`, [userId, prevMonth, prevYear]);

    const currSpend = Number(currRow.total);
    const prevSpend = Number(prevRow.total);
    const totalBudget = 10000;

    let summary = [];

    // 1. Spending Behavior
    if (prevSpend > 0) {
      const diff = ((currSpend - prevSpend) / prevSpend) * 100;
      if (diff > 0) {
        summary.push(`Your spending increased by ${Math.round(diff)}% compared to last month.`);
      } else {
        summary.push(`Your spending improved by ${Math.round(Math.abs(diff))}% compared to last month.`);
      }
    } else {
      summary.push(`You spent ₹${currSpend.toLocaleString()} this month.`);
    }

    // 2. Budget Performance
    if (currSpend > totalBudget) {
      summary.push("Budget discipline needs attention due to overspending.");
    } else if (currSpend <= totalBudget * 0.8) {
      summary.push("Excellent budget discipline. Your savings rate is healthy.");
    } else {
      summary.push("You are staying within your budget, but nearing the limit.");
    }

    // 3. Top category insight
    const [[topCat]] = await db.query(
      `SELECT category FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? GROUP BY category ORDER BY SUM(amount) DESC LIMIT 1`,
      [userId, currentMonth, currentYear]
    );

    if (topCat) {
      summary.push(`${topCat.category} became your highest spending category this month.`);
    }

    res.json({ summaries: summary });
  } catch (err) {
    console.error("Financial summary error:", err);
    res.status(500).json({ error: "Financial summary failed" });
  }
});

export default router;