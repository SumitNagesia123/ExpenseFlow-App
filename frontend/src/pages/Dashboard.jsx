import { useEffect, useState } from "react";

/* Dashboard Components */
import SummaryCards from "../components/dashboard/SummaryCards";
import DashboardGoalsCard from "../components/dashboard/DashboardGoalsCard";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import SubscriptionsCard from "../components/dashboard/SubscriptionsCard";

/* Charts */
import CategoryChart from "../components/charts/CategoryChart";
import MonthlyExpensesChart from "../components/charts/MonthlyExpensesChart";

/* Alerts */
import AlertsPanel from "../components/alerts/AlertsPanel";

/* Utils & Data */
import { generateAlerts } from "../utils/generateAlerts";

/* API */
import api from "../api/api";

/* 🎨 Category colors — curated palette */
const CATEGORY_COLORS = {
  Food: "#22c55e",
  Groceries: "#16a34a",
  Transport: "#0ea5e9",
  Entertainment: "#a855f7",
  Shopping: "#f97316",
  Medical: "#ef4444",
  Bills: "#6366f1",
  Services: "#14b8a6",
  Transfers: "#64748b",
  Miscellaneous: "#9ca3af",
};

/* 📅 Month names */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [budgets, setBudgets] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        /* ✅ DASHBOARD DATA (AUTH PROTECTED) */
        let queryParams = [];
        if (selectedMonth !== "All") queryParams.push(`month=${selectedMonth}`);
        if (selectedYear !== "All") queryParams.push(`year=${selectedYear}`);
        const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
        
        const dashRes = await api.get(`/dashboard${queryString}`);
        const dashData = dashRes.data;

        /* Normalization */
        dashData.cards ||= { totalTransactions: 0, totalSpent: 0, thisMonth: 0 };
        dashData.charts ||= {};
        dashData.charts.categoryData ||= [];
        dashData.charts.monthlyTrend ||= [];
        dashData.recent ||= [];
        dashData.subscriptions ||= [];

        dashData.cards.totalTransactions = Number(dashData.cards.totalTransactions || 0);
        dashData.cards.totalSpent = Number(dashData.cards.totalSpent || 0);
        dashData.cards.thisMonth = Number(dashData.cards.thisMonth || 0);

        dashData.charts.categoryData = dashData.charts.categoryData.map(c => ({
          ...c,
          total: Number(c.total || 0),
        }));

        dashData.charts.monthlyTrend = dashData.charts.monthlyTrend.map(m => ({
          ...m,
          total: Number(m.total || 0),
        }));

        dashData.recent = dashData.recent.map(r => ({
          ...r,
          amount: Number(r.amount || 0),
        }));

        /* ✅ BUDGET STATUS */
        const budgetRes = await api.get("/budget/status");
        const budgetData = budgetRes.data;

        const budgetMap = {};
        budgetData.forEach(b => {
          budgetMap[b.category] = Number(b.budget || 0);
        });

        setBudgets(budgetMap);
        setDashboard(dashData);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [selectedMonth, selectedYear]);

  /* ── Loading State ─────────────────────────────────────── */
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3">
        <span className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-sm text-gray-400 font-medium">Loading dashboard…</span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );

  const { cards, charts, recent, subscriptions } = dashboard;

  /* Month filter */
  const filteredMonthlyData = charts.monthlyTrend;

  /* Alerts */
  const alerts = generateAlerts({
    budgets,
    expenses: recent,
    goals: [],
  });

  return (
    <div className="space-y-6">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-[13px] text-stone-500 dark:text-slate-400 mt-0.5">
            Your financial overview at a glance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-stone-200/60 dark:border-white/[0.08] bg-white dark:bg-[#1e293b] text-stone-700 dark:text-white rounded-full px-4 py-2 text-[13px] font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:border-stone-300 cursor-pointer"
          >
            <option value="All">All Years</option>
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-stone-200/60 dark:border-white/[0.08] bg-white dark:bg-[#1e293b] text-stone-700 dark:text-white rounded-full px-4 py-2 text-[13px] font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:border-stone-300 cursor-pointer"
          >
            <option value="All">All Months</option>
            {MONTH_NAMES.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── SUMMARY CARDS ──────────────────────────────────── */}
      <SummaryCards data={cards} budgets={budgets} />

      {/* ── MAIN GRID ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Charts */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryChart
            data={charts.categoryData}
            budgets={budgets}
            colors={CATEGORY_COLORS}
          />
          <MonthlyExpensesChart data={filteredMonthlyData} />
        </div>

        {/* RIGHT — Panels */}
        <div className="space-y-6">
          <AlertsPanel alerts={alerts} />
          <DashboardGoalsCard goals={[]} />
          <SubscriptionsCard subscriptions={subscriptions} />
        </div>
      </div>

      {/* ── RECENT TRANSACTIONS ────────────────────────────── */}
      <RecentTransactions data={recent} />
    </div>
  );
}
