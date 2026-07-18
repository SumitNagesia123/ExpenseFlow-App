/**
 * ============================================================
 *  ExpenseFlow — Backend Server
 * ============================================================
 *  Self-Healing features built in:
 *  - Global Express error handler (no more CORS-less 500s)
 *  - process.on('uncaughtException') — server never crashes silently
 *  - process.on('unhandledRejection') — all async errors caught
 *  - CORS headers are ALWAYS sent, even on error responses
 * ============================================================
 */
import express from "express";
import cors from "cors";
import db from "./db.js";

/* =========================
   ROUTES (ESM IMPORTS)
   ========================= */
import authRoutes       from "./routes/authRoutes.js";
import dashboardRoutes  from "./routes/dashboard.js";
import budgetRoutes     from "./routes/budget.js";
import expensesRoutes   from "./routes/expenses.js";
import transactionsRoutes from "./routes/transactions.js";
import analyticsRoutes  from "./routes/analytics.js";
import smsRoutes        from "./routes/sms.js";
import importRoutes     from "./routes/importRoutes.js";

/* Phase 5 Routes */
import predictionsRoutes from "./routes/predictions.js";
import assistantRoutes   from "./routes/assistant.js";
import goalsRoutes       from "./routes/goals.js";
import gmailRoutes       from "./routes/gmail.js";

/* Phase 7 — Autonomous AI OS */
import aiCoachRoutes from "./routes/aiCoach.js";

/* Proxy Route for External APIs */
import externalProxyRoutes from "./routes/externalProxy.js";

const app = express();

/* =========================
   ALLOWED ORIGINS
   ========================= */
const ALLOWED_ORIGINS = [
  "https://expenseflow-fintech.web.app",
  "https://expenseflow-fintech.firebaseapp.com",
  "http://localhost:5173",
  "http://localhost:3000"
];

/* =========================
   CORS MIDDLEWARE
   Always runs — even before route errors
   ========================= */
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));

// Ensure CORS headers are present on every response (including error responses)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

/* =========================
   ROUTES
   ========================= */
app.use("/api/auth",          authRoutes);
app.use("/api/dashboard",     dashboardRoutes);
app.use("/api/budget",        budgetRoutes);
app.use("/api/expenses",      expensesRoutes);
app.use("/api/import",        importRoutes);
app.use("/api/transactions",  transactionsRoutes);
app.use("/api/transactions/sms", smsRoutes);
app.use("/api/sms",           smsRoutes);
app.use("/api/analytics",     analyticsRoutes);
app.use("/api/predictions",   predictionsRoutes);
app.use("/api/assistant",     assistantRoutes);
app.use("/api/goals",         goalsRoutes);
app.use("/api/gmail",         gmailRoutes);
app.use("/api/ai-coach",      aiCoachRoutes);
app.use("/api/external-data", externalProxyRoutes);

/* =========================
   ROOT
   ========================= */
app.get("/", (req, res) => {
  res.send("ExpenseFlow Backend Running ✅");
});

/* =========================
   HEALTH CHECK (DB status)
   ========================= */
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({
      status:    "ok",
      db:        "connected",
      dbHost:    process.env.DB_HOST || "(from DATABASE_URL)",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status:  "error",
      db:      "disconnected",
      error:   err.message || "Unknown error",
      code:    err.code,
      hint:    "Check DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME env vars"
    });
  }
});

/* =========================
   GLOBAL ERROR HANDLER
   Catches any error thrown inside a route handler.
   Ensures CORS headers are always present so the browser
   never silently swallows errors as CORS failures.
   ========================= */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("🔥 [GlobalErrorHandler]", err.stack || err.message);

  // Make sure CORS header is present even on error
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.status(err.status || 500).json({
    error:   err.message || "An unexpected error occurred",
    code:    err.code    || "INTERNAL_ERROR"
  });
});

/* =========================
   SERVER
   ========================= */
const PORT = 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);

  // ── Keep-Alive Self-Ping ──────────────────────────────────────────────
  // Prevents Railway from sleeping — pings every 4 minutes
  const SELF_URL = process.env.NODE_ENV === "production"
    ? "https://expenseflow-app-yxjg.onrender.com/api/health"
    : `http://localhost:${PORT}/api/health`;

  setInterval(async () => {
    try {
      await fetch(SELF_URL, { signal: AbortSignal.timeout(8000) });
      console.log(`[KeepAlive] ✅ Pinged ${new Date().toISOString()}`);
    } catch (err) {
      console.warn("[KeepAlive] ⚠️  Ping failed:", err.message);
    }
  }, 4 * 60 * 1000); // every 4 minutes
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n❌ Port ${PORT} is already in use.\n` +
      `   Run:  netstat -ano | findstr :${PORT}\n` +
      `   Then: taskkill /PID <PID> /F\n` +
      `   Then: npm start\n`
    );
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

/* =========================
   PROCESS-LEVEL CRASH SHIELD
   Prevents the server from silently dying on unhandled errors.
   Logs the full stack trace — you will ALWAYS know what failed.
   ========================= */
process.on("uncaughtException", (err) => {
  console.error("\n💥 [UNCAUGHT EXCEPTION] Server will continue running:");
  console.error(err.stack || err.message);
  // Do NOT exit — the server stays alive
});

process.on("unhandledRejection", (reason) => {
  console.error("\n💥 [UNHANDLED REJECTION] A promise was rejected without a catch:");
  console.error(reason?.stack || reason);
  // Do NOT exit — the server stays alive
});
