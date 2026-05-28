import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";
import AlertItem from "./AlertItem";

export default function AlertsPanel({ alerts }) {
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-stone-200/60 dark:border-white/[0.06] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-stone-300/60 dark:hover:border-white/[0.1] transition-all duration-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10">
          <Bell className="w-4 h-4 text-amber-500" />
        </div>
        <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">
          Alerts
        </h3>
      </div>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-2.5 py-3 px-3 bg-emerald-50/60 dark:bg-emerald-500/5 rounded-lg">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-[13px] text-emerald-700 dark:text-emerald-400 font-medium">
            No alerts — everything looks good 👍
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <AlertItem key={i} alert={a} />
          ))}
        </div>
      )}
    </div>
  );
}
