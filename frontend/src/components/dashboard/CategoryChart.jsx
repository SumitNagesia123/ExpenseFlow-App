import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryChart() {
  const data = {
    labels: ["Food", "Groceries", "Transport", "Entertainment"],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: [
          "#6366f1",
          "#22c55e",
          "#f59e0b",
          "#ef4444",
        ],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    cutout: "65%",
  };

  return <Doughnut data={data} options={options} />;
}
