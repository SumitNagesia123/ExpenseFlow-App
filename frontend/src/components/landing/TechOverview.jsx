export default function TechOverview() {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center mb-12">
        Project Technology
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TechCard
          title="Real Dataset"
          desc="Expenses imported from Paytm Excel into MySQL."
        />
        <TechCard
          title="REST APIs"
          desc="Node.js and Express power all backend APIs."
        />
        <TechCard
          title="Analytics Ready"
          desc="Designed for insights, trends, and dashboards."
        />
      </div>
    </section>
  );
}

function TechCard({ title, desc }) {
  return (
    <div className="bg-neutral-800 rounded-xl p-6 text-center shadow-lg">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
