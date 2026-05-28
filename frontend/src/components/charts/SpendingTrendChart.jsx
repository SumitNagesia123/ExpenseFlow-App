import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function SpendingTrendChart() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Total Monthly Spending (₹)",
        data: [4000, 5200, 4800, 6100, 5600, 6900],
        borderColor: "#6366f1", // Indigo
        backgroundColor: "rgba(99,102,241,0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: "#6366f1",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#374151",
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `₹${ctx.raw}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (v) => `₹${v}`,
        },
      },
    },
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">
        This chart shows how your total spending changes month by month.
        An upward trend means your expenses are increasing over time.
      </p>

      <Line data={data} options={options} />
    </div>
  );
}
