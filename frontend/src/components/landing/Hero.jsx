import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-20 items-center">
      {/* LEFT */}
      <div>
        <h1 className="text-5xl font-extrabold leading-tight">
          Track Expenses.
          <br />
          <span className="text-indigo-400">Spend Smarter.</span>
        </h1>

        <p className="mt-6 text-gray-300 max-w-xl">
          A real-world expense management system built using real transaction
          data, SQL, and REST APIs. Designed for analytics and scalability.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            to="/dashboard"
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-medium transition"
          >
            Open Dashboard
          </Link>

          <Link
            to="/expenses"
            className="border border-white/20 px-6 py-3 rounded-xl hover:bg-white/10 transition"
          >
            View Expenses
          </Link>
        </div>
      </div>

      {/* RIGHT */}
      <div className="bg-neutral-800 rounded-2xl p-8 shadow-xl">
        <h3 className="text-lg font-semibold mb-6">
          Live Expense Overview
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <Stat title="Total Spent" value="₹ Real Data" />
          <Stat title="Database" value="MySQL" />
          <Stat title="Backend" value="Node + Express" />
          <Stat title="Dataset" value="Paytm UPI" />
        </div>
      </div>
    </section>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-neutral-700 rounded-xl p-4">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
