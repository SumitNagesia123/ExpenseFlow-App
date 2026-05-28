import { AlertTriangle, AlertCircle, CheckCircle, Info } from "lucide-react";

const config = {
  danger: {
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200/60 dark:border-red-500/20",
    text: "text-red-700 dark:text-red-400",
    Icon: AlertTriangle,
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200/60 dark:border-amber-500/20",
    text: "text-amber-700 dark:text-amber-400",
    Icon: AlertCircle,
  },
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200/60 dark:border-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    Icon: CheckCircle,
  },
  info: {
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200/60 dark:border-sky-500/20",
    text: "text-sky-700 dark:text-sky-400",
    Icon: Info,
  },
};

export default function AlertItem({ alert }) {
  const style = config[alert.type] || config.info;
  const { Icon } = style;

  return (
    <div
      className={`flex items-start gap-2.5 border rounded-lg px-3 py-2.5 text-[13px] font-medium ${style.bg} ${style.border} ${style.text}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{alert.message}</span>
    </div>
  );
}
