export default function GoalCard({ goal, onDelete }) {
  const progress = Math.min(
    Math.round((goal.saved / goal.target) * 100),
    100
  );

  const remainingAmount = goal.target - goal.saved;

  const daysLeft = goal.deadline
    ? Math.ceil(
        (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const isCompleted = goal.status === "completed" || progress === 100;

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
        <p>Target: ₹{goal.target.toLocaleString()}</p>
        <p>Saved: ₹{goal.saved.toLocaleString()}</p>
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

      {/* DEADLINE */}
      {goal.deadline && (
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {isCompleted
            ? "🎉 Goal achieved"
            : daysLeft > 0
            ? `⏳ ${daysLeft} days left`
            : "⚠️ Deadline passed"}
        </p>
      )}
    </div>
  );
}
