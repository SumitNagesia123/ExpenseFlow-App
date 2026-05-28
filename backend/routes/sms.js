import express from "express";
import crypto from "crypto";
import db from "../db.js";
import eventBus from "../utils/events.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure sms_logs table exists on startup
const initDb = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS sms_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message TEXT,
        hash VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error("Failed to initialize SMS logs table", err);
  }
};
initDb();

// Shared auto-categorize helper
function autoCategorize(merchant) {
  const m = merchant.toLowerCase();
  if (m.includes("swiggy") || m.includes("zomato") || m.includes("starbucks") || m.includes("restaurant") || m.includes("mcdonalds") || m.includes("kfc") || m.includes("food")) return "Food";
  if (m.includes("grocer") || m.includes("supermarket") || m.includes("blinkit") || m.includes("instamart") || m.includes("dmart") || m.includes("reliance fresh")) return "Groceries";
  if (m.includes("uber") || m.includes("ola") || m.includes("fuel") || m.includes("petrol") || m.includes("shell") || m.includes("rapido") || m.includes("metro")) return "Travel";
  if (m.includes("netflix") || m.includes("spotify") || m.includes("prime") || m.includes("hotstar") || m.includes("cinema") || m.includes("bookmyshow")) return "Entertainment";
  if (m.includes("amazon") || m.includes("flipkart") || m.includes("myntra") || m.includes("zara") || m.includes("h&m") || m.includes("shopping")) return "Shopping";
  if (m.includes("airtel") || m.includes("jio") || m.includes("recharge") || m.includes("electricity") || m.includes("water") || m.includes("gas") || m.includes("bill")) return "Bills";
  if (m.includes("hospital") || m.includes("medical") || m.includes("pharmacy") || m.includes("apollo") || m.includes("clinic")) return "Medical";
  if (m.includes("school") || m.includes("udemy") || m.includes("coursera") || m.includes("college") || m.includes("tuition")) return "Education";
  if (m.includes("transfer") || m.includes("sent to") || m.includes("upi to")) return "Transfers";
  return "Miscellaneous";
}

// Smart amount + merchant parser for Indian UPI/bank SMS
function parseSmS(message) {
  let amount = null;
  let merchant = "UPI Transaction";

  // Match currency formats: ₹450, Rs.450, INR 1,200, Rs 8500
  const amountPatterns = [
    /(?:Rs\.?\s?|INR\s?|₹\s?)([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:Rs|INR|₹)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = message.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ""));
      break;
    }
  }

  // Extract merchant name from common SMS patterns
  const merchantPatterns = [
    /(?:at|to|for)\s+([A-Za-z][A-Za-z0-9\s&\.\-]{1,30}?)(?:\s+(?:on|via|using|ref|txn|transaction|\.|,)|$)/i,
    /(?:UPI|NEFT|IMPS)[\s\-](?:to|at)\s+([A-Za-z][A-Za-z0-9\s&\.\-]{1,30})/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = message.match(pattern);
    if (match) {
      const candidate = match[1].trim();
      // Filter out noise like "your account", "XX1234"
      if (candidate.length > 1 && !/^\d+$/.test(candidate) && !candidate.toLowerCase().includes("your") && !candidate.toLowerCase().includes("ac") && !candidate.toLowerCase().includes("xx")) {
        merchant = candidate;
        break;
      }
    }
  }

  return { amount, merchant };
}

/**
 * POST /api/sms/ingest  &  /api/transactions/sms/mock
 * Authenticated SMS UPI Ingestion Engine
 */
router.post(["/ingest", "/mock"], protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "SMS message is required" });
    }

    // 1. Idempotency — prevent duplicate processing
    const hash = crypto.createHash("sha256").update(message.trim()).digest("hex");
    const [existing] = await db.query("SELECT id FROM sms_logs WHERE hash = ?", [hash]);
    if (existing.length > 0) {
      // Return success silently so UI does not hang
      return res.json({ success: true, message: "Duplicate SMS — already processed", duplicate: true });
    }

    // 2. Parse amount and merchant
    const { amount, merchant } = parseSmS(message);

    if (!amount || amount <= 0) {
      // Log raw SMS for debugging but do not fail hard
      return res.status(422).json({ error: "Could not detect a valid transaction amount in this SMS. Try a format like: ₹450 spent at Swiggy via UPI" });
    }

    // 3. Save raw SMS to log AFTER successful parse to allow retry if parse failed
    await db.query("INSERT IGNORE INTO sms_logs (message, hash) VALUES (?, ?)", [message.trim(), hash]);

    // 4. Auto-categorize
    const category = autoCategorize(merchant);

    // 5. Fraud detection
    let fraudAlert = null;
    if (amount > 5000) {
      fraudAlert = `High-value transaction of ₹${amount.toLocaleString()} at ${merchant} flagged.`;
    }
    const [dupes] = await db.query(
      `SELECT id FROM expenses WHERE title = ? AND amount = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)`,
      [merchant, amount]
    );
    if (dupes.length > 0) {
      fraudAlert = `Duplicate pattern: ₹${amount} at ${merchant} within 10 minutes.`;
    }

    // 6. Resolve the authenticated user's ID from their JWT token
    const userId = req.user.id;

    // Verify this user actually exists in the DB
    const [userRows] = await db.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (userRows.length === 0) {
      return res.status(400).json({ error: "Your user account was not found. Please log out and log back in." });
    }

    // 7. Save transaction to expenses
    const [insertResult] = await db.query(
      `INSERT INTO expenses (title, category, amount, date, source, user_id) VALUES (?, ?, ?, CURDATE(), 'sms', ?)`,
      [merchant, category, amount, userId]
    );

    const newExpense = {
      id: insertResult.insertId,
      title: merchant,
      category,
      amount,
      date: new Date().toISOString().split("T")[0],
      source: "sms",
      isAnomaly: amount > 3000,
    };

    // 8. Emit real-time events to SSE clients
    eventBus.emitEvent("new_transaction", newExpense);
    if (fraudAlert) {
      eventBus.emitEvent("fraud_alert", { message: fraudAlert, amount, merchant, timestamp: new Date() });
    }

    res.json({
      success: true,
      message: `Transaction ingested: ₹${amount} at ${merchant}`,
      data: newExpense,
      fraudWarning: fraudAlert || undefined,
    });
  } catch (err) {
    console.error("SMS ingestion error:", err);
    res.status(500).json({ error: "SMS ingestion failed: " + err.message });
  }
});

/**
 * GET /api/sms/events  &  /api/transactions/sms/events
 * Server-Sent Events stream for real-time transaction pushes
 */
router.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  eventBus.registerClient(res);

  // Send keepalive every 25s to prevent browser timeout
  const keepAlive = setInterval(() => {
    res.write(": keepalive\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(keepAlive);
  });
});

export default router;
