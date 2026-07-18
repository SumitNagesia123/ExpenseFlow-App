import { useState } from "react";

export default function AddGoalModal({ onClose, onAddGoal }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("Savings");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name || !target || Number(target) <= 0) {
      setError("Please enter a valid goal name and target amount");
      return;
    }

    onAddGoal({
      name,
      target_amount: Number(target),
      deadline,
      category,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Add New Goal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Goal name (e.g. Emergency Fund)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Target amount"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />

          <input
            type="date"
            className="w-full border rounded px-3 py-2 text-sm"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Savings</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Education</option>
            <option>Other</option>
          </select>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Goal
          </button>
        </div>
      </div>
    </div>
  );
}
