import { useNavigate } from "react-router-dom";
import { Target } from "lucide-react";

export default function DashboardGoalsCard({ goals = [] }) {
  const navigate = useNavigate();

  /* ── Empty State ─────────────────────────────────────── */
  if (goals.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 border border-stone-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-stone-300/60 dark:hover:border-white/[0.1] transition-all duration-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">
            Goals
          </h3>
        </div>

        <div className="flex flex-col items-center py-4">
          <div className="w-12 h-12 rounded-full bg-stone-50 dark:bg-white/[0.04] flex items-center justify-center mb-3">
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-[13px] text-gray-400 dark:text-slate-500 mb-3">
            No goals set yet
          </p>
          <button
            onClick={() => navigate("/goals")}
            className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            Create a Goal →
          </button>
        </div>
      </div>
    );
  }

  /* ── With Goals ──────────────────────────────────────── */
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const progress = Math.round((totalSaved / totalTarget) * 100);

  /* SVG progress ring dimensions */
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
          <Target className="w-4 h-4 text-indigo-500" />
        </div>
        <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">
          Goals Progress
        </h3>
      </div>

      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <div className="relative shrink-0">
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle
              cx="34" cy="34" r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="5"
              className="dark:stroke-slate-700"
            />
            <circle
              cx="34" cy="34" r={radius}
              fill="none"
              stroke="#6366f1"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 34 34)"
              className="transition-all duration-700"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-gray-900 dark:text-white tabular-nums">
            {progress}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-gray-500 dark:text-slate-400">
            {goals.length} Active Goal{goals.length > 1 ? "s" : ""}
          </p>
          <p className="text-[14px] font-bold text-gray-900 dark:text-white tabular-nums mt-0.5">
            ₹{totalSaved.toLocaleString("en-IN")} / ₹{totalTarget.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate("/goals")}
        className="mt-4 text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
      >
        View All Goals →
      </button>
    </div>
  );
}
