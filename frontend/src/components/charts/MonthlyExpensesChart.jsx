import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ── Indian number formatting ──────────────────────────── */
function formatINR(num) {
  return Number(num || 0).toLocaleString("en-IN");
}

/* ── Custom Tooltip ────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#334155] px-4 py-3 rounded-xl shadow-lg border border-stone-200/60 dark:border-white/[0.08] min-w-[120px]">
      <p className="text-[12px] font-medium text-gray-500 dark:text-slate-400">{label}</p>
      <p className="text-[15px] font-bold text-gray-900 dark:text-white mt-0.5 tabular-nums">
        ₹{formatINR(payload[0].value)}
      </p>
    </div>
  );
};

const MonthlyExpensesChart = ({ data }) => {
  return (
    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-stone-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-stone-300/60 dark:hover:border-white/[0.1] transition-all duration-200">
      <h3 className="text-[15px] font-bold text-stone-900 dark:text-white">
        Monthly Spending Trend
      </h3>
      <p className="text-[12px] text-stone-400 dark:text-slate-500 mt-0.5 mb-5">
        Total expenses aggregated month-wise
      </p>

      {(!data || data.length === 0) ? (
        <div className="flex flex-col items-center justify-center h-[280px] bg-stone-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-stone-200/60 dark:border-white/[0.06]">
          <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
            <span className="text-lg">📈</span>
          </div>
          <p className="text-[13px] text-gray-400 dark:text-slate-500">No trend data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 4" }} />

            <Area
              type="monotone"
              dataKey="total"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#areaGradient)"
              dot={{ r: 4, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 2.5 }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MonthlyExpensesChart;
