export default function BudgetAlert({ data }) {
  const alerts = data.filter(
    (b) => b.status === "overspent" || b.status === "warning"
  );

  if (alerts.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-red-700 mb-2">
        Budget Alerts
      </h3>

      <ul className="space-y-1 text-sm">
        {alerts.map((b) => (
          <li key={b.category}>
            {b.status === "overspent" ? "🔴" : "🟡"} {b.category} — Spent ₹
            {b.spent} / ₹{b.budget}
          </li>
        ))}
      </ul>
    </div>
  );
}
