export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 w-full max-w-sm border border-stone-200/60 dark:border-white/[0.08] shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {title || "Confirm Action"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {message || "Are you sure you want to proceed?"}
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            type="button"
            className="px-4 py-2 text-sm font-semibold border border-stone-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
