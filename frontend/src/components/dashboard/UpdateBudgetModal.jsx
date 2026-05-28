// src/components/dashboard/UpdateBudgetModal.jsx

import { useState, useEffect } from "react";

export default function UpdateBudgetModal({ open, onClose, onSave, current }) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (open) setAmount(current || "");
  }, [open, current]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ amount: Number(amount) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Update Budget</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Monthly Budget"
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
              className="px-4 py-2 rounded-lg bg-purple-600 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
