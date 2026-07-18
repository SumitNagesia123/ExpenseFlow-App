import { useEffect, useState } from "react";

import {
  getExpenses,
  addExpense,
  deleteExpense,
} from "../services/expenseService";

/* REAL IMPORT SERVICES */
import { importCSV, deleteCSVImports, deletePDFImports } from "../services/importService";
import { importPDF } from "../services/pdfImportService";

/* CSV / Excel utilities */
import { exportToCSV } from "../utils/exportToCSV";
import { parseCSVPreview } from "../utils/parseCSVPreview";
import { parseExcelFile } from "../utils/parseExcel";



/* AI / ML */
import { detectAnomalies } from "../utils/detectAnomalies";

/* Preview modal */
import CSVPreviewModal from "../components/expenses/CSVPreviewModal";

/* 🎯 Category → Emoji map */
const CATEGORY_EMOJI = {
  Food: "🍔",
  Groceries: "🛒",
  Transfers: "💸",
  Entertainment: "🎬",
  Bills: "💡",
  Medical: "🏥",
  Travel: "✈️",
  Shopping: "🛍️",
  Education: "📚",
  Services: "🛠️",
  Fuel: "⛽",
  Miscellaneous: "📦",
  Uncategorized: "📦",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* CSV Preview State */
  const [previewData, setPreviewData] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);

  /* Add Expense State */
  const [newExpense, setNewExpense] = useState({
    title: "",
    category: "Food",
    amount: "",
    date: "",
    source: "manual",
  });

  const [addingExpense, setAddingExpense] =
    useState(false);

  /* =========================
     FETCH EXPENSES
  ========================= */
  useEffect(() => {
    async function fetchExpenses() {
      try {
        setLoading(true);

        const data = await getExpenses();

        setExpenses(data || []);
      } catch (err) {
        console.error(
          "Expenses API error:",
          err
        );

        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchExpenses();
  }, []);

  /* =========================
     ADD EXPENSE
  ========================= */
  const handleAddExpense = async (e) => {
    e.preventDefault();

    try {
      setAddingExpense(true);

      await addExpense({
        ...newExpense,
        amount: Number(newExpense.amount),
      });

      /* Refresh expenses */
      const updatedExpenses =
        await getExpenses();

      setExpenses(updatedExpenses);

      /* Reset form */
      setNewExpense({
        title: "",
        category: "Food",
        amount: "",
        date: "",
        source: "manual",
      });

      alert("Expense added successfully");
    } catch (err) {
      console.error(
        "Add expense error:",
        err
      );

      alert("Failed to add expense");
    } finally {
      setAddingExpense(false);
    }
  };

  /* =========================
     DELETE EXPENSE
  ========================= */
  const handleDeleteExpense = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    try {
      await deleteExpense(id);

      setExpenses((prev) =>
        prev.filter(
          (expense) => expense.id !== id
        )
      );

      alert("Expense deleted successfully");
    } catch (err) {
      console.error(
        "Delete expense error:",
        err
      );

      alert("Failed to delete expense");
    }
  };

  /* =========================
     EXCEL IMPORT
  ========================= */
  const handleImportExcel = async (file) => {
    if (!file) return;
    try {
      const { preview, total, csvFile } = await parseExcelFile(file);
      setPreviewData(preview);
      setPendingFile(csvFile);
      alert(`Found ${total} expense rows. Review the preview and confirm.`);
    } catch (err) {
      console.error("Excel parse error:", err);
      alert(typeof err === "string" ? err : "Failed to read Excel file. Make sure it has Date, Description and Amount columns.");
    }
  };

  /* =========================
     CSV IMPORT
  ========================= */
  const handleImportCSV = async (file) => {
    try {
      if (!file) return;
      const result = await importCSV(file);
      alert(`CSV imported successfully. ${result.imported} transactions added.`);
      const updatedExpenses = await getExpenses();
      setExpenses(updatedExpenses);
    } catch (err) {
      console.error("CSV Import Error:", err);
      alert("CSV import failed");
    }
  };

  /* =========================
     PDF IMPORT
  ========================= */
  const handleImportPDF = async (file) => {
    try {
      if (!file) return;
      const result = await importPDF(file);
      alert(`PDF imported successfully. ${result.imported} transactions added.`);
      const updatedExpenses = await getExpenses();
      setExpenses(updatedExpenses);
    } catch (err) {
      console.error("PDF Import Error:", err);
      alert("PDF import failed");
    }
  };

  /* =========================
     CONFIRM IMPORT (from preview modal)
  ========================= */
  const handleConfirmImport = async () => {
    if (!pendingFile) return;
    try {
      const result = await importCSV(pendingFile);
      alert(`✅ Imported ${result.imported} transactions successfully!`);
      setPreviewData(null);
      setPendingFile(null);
      const updated = await getExpenses();
      setExpenses(updated);
    } catch (err) {
      console.error("Import error:", err);
      alert("Import failed. Please try again.");
    }
  };

  /* =========================
     DELETE IMPORTED
  ========================= */
  const handleDeleteImports = async () => {
    const count = expenses.filter(
      (e) => e.source === "Paytm CSV" || e.source === "PDF Statement"
    ).length;
    if (count === 0) return alert("No imported expenses found.");

    const confirmed = window.confirm(
      `This will permanently delete all ${count} imported expense(s). Continue?`
    );
    if (!confirmed) return;

    try {
      await deleteCSVImports();
      await deletePDFImports().catch(() => {}); // ignore if none
      alert("Imported expenses deleted.");
      const updated = await getExpenses();
      setExpenses(updated);
    } catch (err) {
      console.error("Delete imports error:", err);
      alert("Failed to delete imports.");
    }
  };

  /* =========================
     AI ANOMALY DETECTION
  ========================= */
  const expensesWithAnomalies =
    detectAnomalies(expenses);

  /* =========================
     LOADING / ERROR STATES
  ========================= */
  if (loading) {
    return (
      <div className="text-gray-400">
        Loading expenses…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Failed to load expenses
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* =========================
          HEADER
      ========================= */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Expenses
          </h1>

          <p className="text-sm text-gray-500 dark:text-slate-400">
            Real-time transaction management &amp; analytics
          </p>
        </div>

        {/* IMPORT / EXPORT */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => exportToCSV(expenses)}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Export All
          </button>

          {/* EXCEL IMPORT */}
          <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl cursor-pointer hover:bg-emerald-700 transition-colors">
            📊 Import Excel
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              hidden
              onChange={async (e) => {
                const file = e.target.files[0];
                e.target.value = "";
                await handleImportExcel(file);
              }}
            />
          </label>

          {/* CSV IMPORT */}
          <label className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-xl cursor-pointer hover:bg-red-600 transition-colors">
            Import CSV
            <input
              type="file"
              accept=".csv,.CSV,text/csv,application/csv,text/plain,application/vnd.ms-excel"
              hidden
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                  const preview = await parseCSVPreview(file);
                  setPreviewData(preview);
                  setPendingFile(file);
                } catch (err) {
                  console.error(err);
                  alert("Invalid CSV file");
                }
              }}
            />
          </label>

          {/* PDF IMPORT */}
          <label className="px-4 py-2 text-sm font-medium bg-yellow-400 text-gray-900 rounded-xl cursor-pointer hover:bg-yellow-500 transition-colors">
            Import PDF
            <input
              type="file"
              accept=".pdf"
              hidden
              onChange={async (e) => {
                const file = e.target.files[0];
                await handleImportPDF(file);
              }}
            />
          </label>

          {/* DIVIDER */}
          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 self-center" />

          {/* DELETE IMPORTS */}
          <button
            onClick={handleDeleteImports}
            title="Delete all imported expenses"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <span>🗑️</span>
            Delete Imported
          </button>
        </div>
      </div>

      {/* =========================
          ADD EXPENSE FORM
      ========================= */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Add Expense
        </h2>

        <form
          onSubmit={handleAddExpense}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <input
            type="text"
            placeholder="Expense title"
            value={newExpense.title}
            onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
            className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            required
          />

          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {Object.keys(CATEGORY_EMOJI).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_EMOJI[cat]} {cat}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            required
          />

          <input
            type="date"
            value={newExpense.date}
            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            required
          />

          <button
            type="submit"
            disabled={addingExpense}
            className="bg-indigo-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {addingExpense ? "Adding..." : "Add Expense"}
          </button>
        </form>
      </div>

      {/* =========================
          EXPENSE TABLE
      ========================= */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-x-auto transition-colors">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Description</th>
              <th className="px-6 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Category</th>
              <th className="px-6 py-3.5 text-left font-semibold text-gray-600 dark:text-slate-300">Date</th>
              <th className="px-6 py-3.5 text-right font-semibold text-gray-600 dark:text-slate-300">Amount (₹)</th>
              <th className="px-6 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-300">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {expensesWithAnomalies.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-400 dark:text-slate-500">
                  No expenses found
                </td>
              </tr>
            ) : (
              expensesWithAnomalies.map((exp) => {
                const category = exp.category || "Uncategorized";
                const emoji = CATEGORY_EMOJI[category] || "📦";

                return (
                  <tr
                    key={exp.id}
                    className={`transition-colors ${
                      exp.isAnomaly
                        ? "bg-red-50 dark:bg-red-950/20 hover:bg-red-100/60 dark:hover:bg-red-950/30"
                        : "hover:bg-gray-50 dark:hover:bg-slate-700/30"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-100">
                      {exp.title}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                        <span>{emoji}</span>
                        <span>{category}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                      {new Date(exp.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                      ₹{Number(exp.amount).toFixed(2)}
                      {exp.isAnomaly && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">
                          ⚠ Unusual
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* =========================
          CSV PREVIEW MODAL
      ========================= */}
      {previewData && (
        <CSVPreviewModal
          previewData={previewData}
          onCancel={() => {
            setPreviewData(null);
            setPendingFile(null);
          }}
          onConfirm={handleConfirmImport}
        />
      )}
    </div>
  );
}