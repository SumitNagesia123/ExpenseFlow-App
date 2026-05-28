import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function CategoryComparisonChart() {
  const data = {
    labels: ["Food", "Transport", "Shopping", "Entertainment"],
    datasets: [
      {
        label: "Amount Spent (₹)",
        data: [5200, 2100, 3300, 1800],
        backgroundColor: [
          "#6366f1", // Food - Indigo
          "#22c55e", // Transport - Green
          "#f59e0b", // Shopping - Amber
          "#ef4444", // Entertainment - Red
        ],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `₹${ctx.raw}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (v) => `₹${v}`,
        },
      },
    },
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">
        This chart compares how much you spend across different categories.
        Longer bars indicate higher spending in that category.
      </p>

      <Bar data={data} options={options} />
    </div>
  );
}
