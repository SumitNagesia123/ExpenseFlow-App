import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api/api";

/* Stable year list */
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Analytics() {
  const now = new Date();

  /* Default to the CURRENT month (getMonth() returns 0-indexed, +1 = 1-indexed) */
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [data, setData]       = useState(null);
  const [budget, setBudget]   = useState(null);
  const [insights, setInsights] = useState([]);
  
  // Phase 4 States
  const [healthScore, setHealthScore] = useState(null);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [finSummary, setFinSummary] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        /* ── Both requests use the authenticated Axios instance ── */
        const [
          analyticsRes, 
          budgetRes, 
          insightsRes,
          healthRes,
          riskRes,
          summaryRes
        ] = await Promise.all([
          api.get(`/analytics?month=${month}&year=${year}`),
          api.get(`/analytics/budget-vs-actual?month=${month}&year=${year}`),
          api.get(`/analytics/insights?month=${month}&year=${year}`),
          api.get(`/analytics/health-score?month=${month}&year=${year}`),
          api.get(`/analytics/risk-analysis?month=${month}&year=${year}`),
          api.get(`/analytics/financial-summary?month=${month}&year=${year}`)
        ]);

        const json = analyticsRes.data;

        setData({
          categoryData: (json.categoryData || []).map((c) => ({
            ...c,
            total: Number(c.total || 0),
          })),
          /* Daily trend for the selected month */
          trendData: (json.trendData || []).map((t) => ({
            ...t,
            total: Number(t.total || 0),
          })),
          /* Monthly trend across the full year */
          monthlyTrend: (json.monthlyTrend || []).map((m) => ({
            ...m,
            total: Number(m.total || 0),
          })),
          topCategory:  json.topCategory  || "No Data",
          highestSpend: Number(json.highestSpend || 0),
        });

        setBudget(budgetRes.data);
        setInsights(insightsRes.data || []);
        setHealthScore(healthRes.data);
        setRiskAlerts(riskRes.data?.alerts || []);
        setFinSummary(summaryRes.data?.summaries || []);
      } catch (err) {
        console.error("Analytics load error:", err);
        setError("Failed to load analytics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [month, year]);

  /* ─── Derived budget display values ─── */
  const totalBudget  = budget?.totalBudget  ?? 0;
  const totalSpent   = budget?.totalSpent   ?? 0;
  const remaining    = budget?.remaining    ?? 0;
  const budgetStatus = budget?.status       ?? "safe";

  const statusStyles = {
    safe:      { text: "SAFE",      color: "text-green-600  dark:text-green-400" },
    warning:   { text: "WARNING",   color: "text-yellow-600 dark:text-yellow-400" },
    overspent: { text: "OVERSPENT", color: "text-red-600    dark:text-red-400" },
  };
  const { text: statusText, color: statusColor } =
    statusStyles[budgetStatus] ?? statusStyles.safe;

  /* ─── Loading / Error states ─── */
  if (loading) {
    return (
      <div className="p-6 flex items-center gap-3 text-gray-400 dark:text-slate-400">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Loading analytics…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const hasCategories  = data.categoryData.length  > 0;
  const hasDailyTrend  = data.trendData.length      > 0;
  const hasMonthlyTrend = data.monthlyTrend.length  > 0;

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Real spending data for{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {MONTH_NAMES[month]} {year}
            </span>
          </p>
        </div>

        {/* Month / Year selectors */}
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {MONTH_NAMES[i + 1]}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── PHASE 4: FINANCIAL HEALTH & SUMMARY (FINTECH UI) ── */}
      {healthScore && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Health Score Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
            <h2 className="text-lg font-semibold text-indigo-200 mb-4">Financial Health Score</h2>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-700"
                    strokeDasharray="100, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="3"
                  />
                  <path
                    className={`${healthScore.score >= 80 ? 'text-green-400' : healthScore.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}
                    strokeDasharray={`${healthScore.score}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-2xl font-bold">{healthScore.score}</span>
              </div>
              <div>
                <p className={`text-xl font-bold ${healthScore.score >= 80 ? 'text-green-400' : healthScore.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {healthScore.status}
                </p>
                <p className="text-sm text-slate-300 mt-1">{healthScore.summary}</p>
              </div>
            </div>
          </div>

          {/* AI Financial Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              🤖 AI Financial Summary
            </h2>
            <ul className="space-y-3">
              {finSummary.map((sum, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-slate-300">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  {sum}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── PHASE 4: RISK ANALYSIS INDICATORS ── */}
      {riskAlerts.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Risk Analysis</h2>
          {riskAlerts.map((alert, i) => {
            const isCritical = alert.includes("Critical") || alert.includes("High Risk");
            return (
              <div key={i} className={`p-4 rounded-xl text-sm border flex items-center gap-3 ${
                isCritical 
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400"
                  : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400"
              }`}>
                <span className="text-lg">{isCritical ? '🚨' : '⚠️'}</span>
                {alert}
              </div>
            );
          })}
        </div>
      )}

      {/* ── INSIGHT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400 mb-1">
            Top Category
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.topCategory}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400 mb-1">
            Highest Spend
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{data.highestSpend.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-5 rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400 mb-1">
            Actual vs Budget
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ₹{totalSpent.toLocaleString("en-IN")}{" "}
            <span className="text-sm font-normal text-gray-400">
              / ₹{totalBudget.toLocaleString("en-IN")}
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Remaining: ₹{remaining.toLocaleString("en-IN")}
          </p>
          <p className={`text-sm font-bold mt-1 ${statusColor}`}>
            {statusText}
          </p>
        </div>
      </div>

      {/* ── AI FINANCIAL INSIGHTS ── */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            ✨ AI Financial Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.map((insight, idx) => {
              const bgColors = {
                success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                danger: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
                info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
              };
              const textColors = {
                success: "text-green-800 dark:text-green-400",
                danger: "text-red-800 dark:text-red-400",
                warning: "text-yellow-800 dark:text-yellow-400",
                info: "text-blue-800 dark:text-blue-400",
              };

              return (
                <div key={idx} className={`border rounded-xl p-4 ${bgColors[insight.type] || bgColors.info} transition-colors`}>
                  <p className={`text-sm font-semibold mb-1 ${textColors[insight.type] || textColors.info}`}>
                    {insight.title}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-slate-300">
                    {insight.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CATEGORY BAR CHART ── */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm p-5 transition-colors">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Spending by Category — {MONTH_NAMES[month]} {year}
        </h2>

        {!hasCategories ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 gap-2">
            <span className="text-3xl">📊</span>
            <p className="text-sm">No expenses found for {MONTH_NAMES[month]} {year}</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Spent"]}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── DAILY SPEND TREND (within selected month) ── */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm p-5 transition-colors">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Daily Spend Trend — {MONTH_NAMES[month]} {year}
        </h2>

        {!hasDailyTrend ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 gap-2">
            <span className="text-3xl">📈</span>
            <p className="text-sm">No daily data for {MONTH_NAMES[month]} {year}</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Spent"]}
                />
                <Line
                  dataKey="total"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#22c55e" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── MONTHLY TREND (whole year) ── */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm p-5 transition-colors">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Spend Trend — {year}
        </h2>

        {!hasMonthlyTrend ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 gap-2">
            <span className="text-3xl">📉</span>
            <p className="text-sm">No monthly data for {year}</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Spent"]}
                />
                <Line
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366f1" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
