import { Receipt, CreditCard } from "lucide-react";

/* ── Indian number formatting ──────────────────────────── */
function formatINR(num) {
  return Number(num || 0).toLocaleString("en-IN");
}

export default function SubscriptionsCard({ subscriptions = [] }) {
  const total = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 border border-stone-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-stone-300/60 dark:hover:border-white/[0.1] transition-all duration-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10">
          <Receipt className="w-4 h-4 text-rose-500" />
        </div>
        <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">
          Bills & Subscriptions
        </h3>
      </div>

      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center py-4">
          <div className="w-12 h-12 rounded-full bg-stone-50 dark:bg-white/[0.04] flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5 text-gray-300 dark:text-slate-700" />
          </div>
          <p className="text-[13px] text-gray-400 dark:text-slate-500">
            No bills found
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {subscriptions.map((sub, idx) => (
              <div
                key={sub.name + idx}
                className="flex justify-between items-center text-[13px] py-2 px-3 rounded-lg hover:bg-stone-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-stone-600 dark:text-slate-400 truncate max-w-[150px] font-medium">
                  {sub.name}
                </span>
                <span className="font-bold text-stone-900 dark:text-white tabular-nums">
                  ₹{formatINR(sub.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 dark:border-white/[0.06] mt-4 pt-3 flex justify-between text-[13px]">
            <span className="font-semibold text-gray-500 dark:text-slate-400">Total</span>
            <span className="font-bold text-gray-900 dark:text-white tabular-nums">
              ₹{formatINR(total)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
