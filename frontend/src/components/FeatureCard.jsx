export default function FeatureCard({ title, description, bg }) {
  return (
    <div className={`rounded-xl p-6 ${bg}`}>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
