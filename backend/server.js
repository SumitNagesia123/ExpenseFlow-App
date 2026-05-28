import express from "express";
import cors from "cors";

/* =========================
   ROUTES (ESM IMPORTS)
   ========================= */
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";
import budgetRoutes from "./routes/budget.js";
import expensesRoutes from "./routes/expenses.js";
import transactionsRoutes from "./routes/transactions.js";
import analyticsRoutes from "./routes/analytics.js";
import smsRoutes from "./routes/sms.js";
import importRoutes from "./routes/importRoutes.js";

/* Phase 5 Routes */
import predictionsRoutes from "./routes/predictions.js";
import assistantRoutes from "./routes/assistant.js";
import goalsRoutes from "./routes/goals.js";
import gmailRoutes from "./routes/gmail.js";

/* Phase 7 — Autonomous AI OS */
import aiCoachRoutes from "./routes/aiCoach.js";

/* Proxy Route for External APIs */
import externalProxyRoutes from "./routes/externalProxy.js";

const app = express();

/* =========================
   MIDDLEWARE
   ========================= */
app.use(cors());
app.use(express.json());

/* =========================
   AUTH ROUTES
   ========================= */
app.use("/api/auth", authRoutes);

/* =========================
   EXISTING ROUTES (UNCHANGED LOGIC)
   ========================= */
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/import", importRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/transactions/sms", smsRoutes);
app.use("/api/sms", smsRoutes);

/* =========================
   ANALYTICS
   ========================= */
app.use("/api/analytics", analyticsRoutes);

/* =========================
   PREDICTIVE AI & ASSISTANT (PHASE 5)
   ========================= */
app.use("/api/predictions", predictionsRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/gmail", gmailRoutes);

/* Phase 7 — Autonomous AI OS */
app.use("/api/ai-coach", aiCoachRoutes);

/* External API Proxy Route */
app.use("/api/external-data", externalProxyRoutes);

/* =========================
   ROOT
   ========================= */
app.get("/", (req, res) => {
  res.send("ExpenseFlow Backend Running ✅");
});

/* =========================
   SERVER  –  always port 5000
   ========================= */
const PORT = 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
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
