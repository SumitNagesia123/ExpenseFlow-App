export default function CSVPreviewModal({
  previewData,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl space-y-4">
        <h2 className="text-lg font-semibold">Preview Imported Data</h2>

        <div className="overflow-auto max-h-80 border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">{row.title}</td>
                  <td className="px-3 py-2">{row.category}</td>
                  <td className="px-3 py-2 text-right">₹{row.amount}</td>
                  <td className="px-3 py-2">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
