import { useEffect, useState } from "react";
import api from "../api/api";

/* 🔒 Stable year list (last 10 years) */
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export default function Budget() {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        setLoading(true);
        setError("");

        /* ✅ USE AXIOS INSTANCE WITH JWT TOKEN */
        const res = await api.get(
          `/budget/status?month=${month}&year=${year}`
        );

        const data = res.data;

        /* 🔥 DEFENSIVE NORMALIZATION */
        const normalized = data.map((b) => ({
          ...b,
          budget: Number(b.budget || 0),
          spent: Number(b.spent || 0),
          remaining: Number(b.remaining || 0),
          status: b.status || "safe",
        }));

        setBudgets(normalized);
      } catch (err) {
        console.error("Budget API error:", err);
        setError("Failed to load budget data");
      } finally {
        setLoading(false);
      }
    };

    loadBudgets();
  }, [month, year]);

  /* ✅ CSV EXPORT WITH TOKEN */
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");

      // Use the same base URL as the api instance — works on all devices
      const baseUrl = import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : "https://expenseflow-app-production.up.railway.app/api";

      const response = await fetch(
        `${baseUrl}/budget/export?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `budget_${month}_${year}.csv`;

      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Export error:", err);
      alert("CSV export failed");
    }
  };

  if (loading) {
    return <div className="p-6">Loading budgets…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const hasAnySpend = budgets.some((b) => b.spent > 0);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">
            Budget Overview
          </h1>

          <p className="text-sm text-gray-500 dark:text-slate-400">
            Real-time budget usage for selected month
          </p>
        </div>

        {/* MONTH + YEAR SELECTORS */}
        <div className="flex gap-2">
          {/* Month */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-stone-200/60 dark:border-white/[0.08] bg-white dark:bg-[#1e293b] text-stone-900 dark:text-white px-2 py-1 rounded"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-2 py-1 rounded max-h-40 overflow-y-auto"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* EXPORT */}
      <button
        onClick={handleExport}
        className="text-sm text-blue-600 underline"
      >
        Export CSV
      </button>

      {/* EMPTY STATE */}
      {!hasAnySpend && (
        <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-800 dark:text-yellow-400 p-3 rounded text-sm transition-colors">
          No transactions found for the selected month.
        </div>
      )}

      {/* BUDGET CARDS */}
      <div className="space-y-4">
        {budgets.map((b) => {
          const percent =
            b.budget === 0
              ? 0
              : Math.min((b.spent / b.budget) * 100, 100);

          return (
            <div
              key={b.category}
              className="bg-white dark:bg-[#1e293b] border border-stone-200/60 dark:border-white/[0.06] p-4 rounded-xl shadow-sm transition-colors"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {b.category}
                </h2>

                <span
                  className={`text-sm font-bold ${b.status === "overspent"
                    ? "text-red-500"
                    : b.status === "warning"
                      ? "text-yellow-500"
                      : "text-green-600"
                    }`}
                >
                  {b.status.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-slate-400">
                Spent ₹{b.spent} / ₹{b.budget}
              </p>

              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded h-2 my-2">
                <div
                  className={`h-2 rounded ${b.status === "overspent"
                    ? "bg-red-500"
                    : b.status === "warning"
                      ? "bg-yellow-400"
                      : "bg-green-500"
                    }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-slate-400">
                Remaining: ₹{b.remaining}
              </p>

              {/* ALERTS */}
              {b.status === "warning" && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠ You are close to exceeding this budget
                </p>
              )}

              {b.status === "overspent" && (
                <p className="text-xs text-red-600 mt-1 font-semibold">
                  🚨 Budget exceeded!
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}