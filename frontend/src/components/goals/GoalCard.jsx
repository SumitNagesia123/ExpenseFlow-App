import { useState } from "react";

export default function GoalCard({ goal, onDelete, onAddMoney }) {
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [amount, setAmount] = useState("");

  const saved = Number(goal.current_amount !== undefined ? goal.current_amount : goal.saved || 0);
  const target = Number(goal.target_amount !== undefined ? goal.target_amount : goal.target || 0);

  const progress = Math.min(
    Math.round((saved / target) * 100),
    100
  );

  const remainingAmount = target - saved;

  const daysLeft = goal.deadline
    ? Math.ceil(
        (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const isCompleted = goal.status === "completed" || progress === 100;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (onAddMoney) {
      onAddMoney(goal.id, numAmount);
    }
    setAmount("");
    setShowAddMoney(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm border border-stone-200/60 dark:border-white/[0.06] space-y-4 transition-colors group relative">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-white pr-8">{goal.name}</h3>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              isCompleted
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {isCompleted ? "Completed" : "Active"}
          </span>
          <button
            onClick={() => onDelete && onDelete(goal.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete Goal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>

      {/* AMOUNTS */}
      <div className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
        <p>Target: ₹{target.toLocaleString()}</p>
        <p>Saved: ₹{saved.toLocaleString()}</p>
        {!isCompleted && (
          <p>Remaining: ₹{remainingAmount.toLocaleString()}</p>
        )}
      </div>

      {/* PROGRESS BAR */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              isCompleted ? "bg-green-500" : "bg-blue-600"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* DEADLINE & ACTIONS */}
      <div className="flex items-center justify-between pt-1">
        {goal.deadline ? (
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {isCompleted
              ? "🎉 Goal achieved"
              : daysLeft > 0
              ? `⏳ ${daysLeft} days left`
              : "⚠️ Deadline passed"}
          </p>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {/* View History Toggle */}
          {goal.history && goal.history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs font-semibold text-gray-500 dark:text-slate-400 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {showHistory ? "Hide History" : "View History"}
            </button>
          )}

          {!isCompleted && (
            <button
              onClick={() => setShowAddMoney(!showAddMoney)}
              className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
            >
              💰 Add Funds
            </button>
          )}
        </div>
      </div>

      {/* ADD MONEY BOX */}
      {showAddMoney && (
        <form onSubmit={handleAddSubmit} className="flex gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
          <input
            type="number"
            placeholder="Amount to save"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 text-xs border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
            min="1"
          />
          <button
            type="submit"
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Save
          </button>
        </form>
      )}

      {/* SAVINGS HISTORY RECORD PANEL */}
      {showHistory && goal.history && goal.history.length > 0 && (
        <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300">Savings History:</h4>
          <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {goal.history.map((record, index) => (
              <div key={index} className="flex justify-between text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/40 px-2 py-1 rounded">
                <span>📅 {formatDate(record.date)}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">+₹{record.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
