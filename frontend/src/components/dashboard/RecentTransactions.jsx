import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* ── Format a date string to a readable format ────────── */
function formatDate(raw) {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return raw;
  }
}

/* ── Category icon + color mapping ─────────────────────── */
const CATEGORY_META = {
  Food:          { emoji: "🍔", bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-600" },
  Groceries:     { emoji: "🛒", bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-600" },
  Transport:     { emoji: "🚕", bg: "bg-sky-50 dark:bg-sky-500/10", text: "text-sky-600" },
  Travel:        { emoji: "✈️", bg: "bg-sky-50 dark:bg-sky-500/10", text: "text-sky-600" },
  Entertainment: { emoji: "🎬", bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600" },
  Shopping:      { emoji: "🛍️", bg: "bg-pink-50 dark:bg-pink-500/10", text: "text-pink-600" },
  Medical:       { emoji: "💊", bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600" },
  Bills:         { emoji: "📃", bg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-600" },
  Services:      { emoji: "⚙️", bg: "bg-teal-50 dark:bg-teal-500/10", text: "text-teal-600" },
  Education:     { emoji: "📚", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600" },
  Transfers:     { emoji: "💸", bg: "bg-slate-100 dark:bg-slate-500/10", text: "text-slate-600" },
  Miscellaneous: { emoji: "📦", bg: "bg-gray-100 dark:bg-gray-500/10", text: "text-gray-600" },
};

const fallbackMeta = { emoji: "📦", bg: "bg-gray-100 dark:bg-gray-500/10", text: "text-gray-600" };

/* ── Indian number formatting ──────────────────────────── */
function formatINR(num) {
  return Number(num || 0).toLocaleString("en-IN");
}

export default function RecentTransactions({ data = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-stone-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-stone-300/60 dark:hover:border-white/[0.1] transition-all duration-200">
      {/* Header */}
      <div className="px-6 pt-5 pb-3">
        <h2 className="text-[15px] font-bold text-stone-900 dark:text-white">
          Recent Transactions
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center py-10 px-6">
          <div className="w-12 h-12 rounded-full bg-stone-50 dark:bg-white/[0.04] flex items-center justify-center mb-3">
            <span className="text-2xl">💳</span>
          </div>
          <p className="text-[13px] text-gray-400 dark:text-slate-500">No recent transactions found</p>
        </div>
      ) : (
        <ul className="px-3">
          {data.map((item, index) => {
            const meta = CATEGORY_META[item.category] || fallbackMeta;
            return (
              <li
                key={item.id || index}
                className="flex items-center gap-3.5 px-3 py-3 mx-0 rounded-lg hover:bg-stone-50 dark:hover:bg-white/[0.04] transition-colors cursor-default group"
              >
                {/* Category Icon Badge */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${meta.bg} transition-transform duration-200 group-hover:scale-105`}>
                  <span className="text-base leading-none">{meta.emoji}</span>
                </div>

                {/* Name + Category */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-stone-900 dark:text-white truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                    {item.category || "Uncategorized"}
                    {item.date && ` · ${formatDate(item.date)}`}
                  </p>
                </div>

                {/* Amount */}
                <span className="text-[14px] font-bold text-rose-500 dark:text-rose-400 tabular-nums shrink-0">
                  −₹{formatINR(item.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* View All Button */}
      <div className="px-5 pb-5 pt-2">
        <button
          onClick={() => navigate("/expenses")}
          className="w-full flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-500/30 rounded-xl py-2.5 text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all duration-200"
        >
          View All Expenses
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
