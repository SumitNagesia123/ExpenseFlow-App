// src/components/dashboard/AddExpenseModal.jsx

import { useState } from "react";

export default function AddExpenseModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    source: "manual",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
    setForm({
      title: "",
      amount: "",
      category: "",
      date: "",
      source: "manual",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Add Expense</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            required
            className="w-full border rounded-lg p-2"
          />

          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            required
            className="w-full border rounded-lg p-2"
          />

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            required
            className="w-full border rounded-lg p-2"
          />

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-2"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
