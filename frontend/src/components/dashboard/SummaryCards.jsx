import {
  TrendingDown,
  TrendingUp,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

/* ── Indian number formatting (1,28,673.97) ────────────── */
function formatINR(num) {
  const n = Number(num || 0);
  return n.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

export default function SummaryCards({ data, budgets = {} }) {
  const savedSettings = JSON.parse(localStorage.getItem("userSettings") || "{}");
  const userBudget = Number(savedSettings.budget);
  const categoryBudgetSum = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalBudget = userBudget || categoryBudgetSum || 10000;
  const remainingBudget = totalBudget - (data?.thisMonth || 0);
  const budgetUsedPercent = totalBudget > 0 ? Math.round(((data?.thisMonth || 0) / totalBudget) * 100) : 0;

  const cards = [
    {
      label: "Total Spent",
      value: `₹${formatINR(data?.totalSpent)}`,
      icon: TrendingDown,
      iconBg: "bg-rose-100/80 dark:bg-rose-500/10",
      iconColor: "text-rose-500",
      trend: null,
    },
    {
      label: "This Month",
      value: `₹${formatINR(data?.thisMonth)}`,
      icon: CreditCard,
      iconBg: "bg-violet-100/80 dark:bg-violet-500/10",
      iconColor: "text-violet-500",
      trend: data?.thisMonth > 0 ? { direction: "up", text: "Active" } : null,
    },
    {
      label: "Remaining Budget",
      value: (!userBudget && categoryBudgetSum === 0)
        ? "No limit set"
        : `₹${formatINR(Math.max(0, remainingBudget))}`,
      icon: Wallet,
      iconBg: "bg-emerald-100/80 dark:bg-emerald-500/10",
      iconColor: "text-emerald-500",
      trend: (!userBudget && categoryBudgetSum === 0)
        ? null
        : remainingBudget > 0
          ? { direction: "up", text: `${100 - budgetUsedPercent}% left` }
          : { direction: "down", text: "Over budget" },
    },
    {
      label: "Transactions",
      value: `${data?.totalTransactions || 0}`,
      icon: ArrowUpRight,
      iconBg: "bg-sky-100/80 dark:bg-sky-500/10",
      iconColor: "text-sky-500",
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group bg-white dark:bg-[#1e293b] rounded-xl border border-stone-200/60 dark:border-white/[0.06] p-5 shadow-sm hover:shadow-md hover:border-stone-300/60 dark:hover:border-white/[0.1] transition-all duration-200 cursor-default"
        >
          <div className="flex items-start justify-between">
            <p className="text-[13px] font-medium text-stone-500 dark:text-slate-400">
              {card.label}
            </p>
            <div className={`p-2 rounded-lg ${card.iconBg}`}>
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
          </div>

          <h2 className="text-[22px] font-bold mt-2 text-stone-900 dark:text-white tabular-nums tracking-tight">
            {card.value}
          </h2>

          {card.trend && (
            <div className="flex items-center gap-1 mt-2">
              {card.trend.direction === "up" ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span
                className={`text-[11px] font-semibold ${
                  card.trend.direction === "up"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {card.trend.text}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
