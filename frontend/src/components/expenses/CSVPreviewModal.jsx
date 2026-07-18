export default function CSVPreviewModal({
  previewData,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 w-full max-w-3xl space-y-4 border border-stone-200/60 dark:border-white/[0.08] shadow-2xl">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Preview Imported Data
        </h2>

        <div className="overflow-auto max-h-80 border border-gray-100 dark:border-slate-800 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-slate-300 divide-y divide-gray-100 dark:divide-slate-800">
              {previewData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 font-medium">{row.title}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white">
                    ₹{row.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-slate-400">
                    {row.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold border border-stone-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
