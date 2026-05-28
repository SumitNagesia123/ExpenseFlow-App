import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { useNavigate } from "react-router-dom";

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#64748b", // slate
];

/* ── Indian number formatting ──────────────────────────── */
function formatINR(num) {
  return Number(num || 0).toLocaleString("en-IN");
}

/* ── Custom Tooltip ────────────────────────────────────── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-[#334155] px-4 py-3 rounded-xl shadow-lg border border-stone-200/60 dark:border-white/[0.08]">
      <p className="text-[13px] font-semibold text-stone-900 dark:text-white">{d.category}</p>
      <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5 tabular-nums">
        ₹{formatINR(d.spent)} · {d.percent}%
      </p>
    </div>
  );
};

export default function CategoryChart({ data = [] }) {
  const navigate = useNavigate();

  const totalSpent = data.reduce(
    (sum, item) => sum + Number(item.total),
    0
  );

  const chartData = data.map((item) => ({
    category: item.category || "Uncategorized",
    spent: Number(item.total),
    percent: ((Number(item.total) / totalSpent) * 100).toFixed(1),
  }));

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-stone-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-stone-300/60 dark:hover:border-white/[0.1] transition-all duration-200">
      <h2 className="text-[15px] font-bold text-stone-900 dark:text-white">
        Spending by Category
      </h2>
      <p className="text-[12px] text-stone-400 dark:text-slate-500 mt-0.5 mb-5">
        Tap a bar to view category expenses
      </p>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[320px] bg-stone-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-stone-200/60 dark:border-white/[0.06]">
          <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
            <span className="text-lg">📊</span>
          </div>
          <p className="text-[13px] text-stone-400 dark:text-slate-500">No spending data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="category"
              type="category"
              width={90}
              tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.04)" }} />

            <Bar
              dataKey="spent"
              radius={[0, 6, 6, 0]}
              barSize={18}
              animationDuration={800}
              onClick={(data) =>
                navigate(`/expenses?category=${data.category}`)
              }
            >
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  cursor="pointer"
                />
              ))}

              {/* % LABEL on the right */}
              <LabelList
                dataKey="percent"
                position="right"
                formatter={(v) => `${v}%`}
                style={{ fontSize: 11, fontWeight: 600, fill: "#9ca3af" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
