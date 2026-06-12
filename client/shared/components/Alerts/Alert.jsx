import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useState } from "react";

const VARIANTS = {
  success: { icon: CheckCircle2, bg: "bg-success/10", border: "border-success/30", text: "text-success", icon_color: "text-success" },
  error: { icon: AlertCircle, bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", icon_color: "text-destructive" },
  warning: { icon: TriangleAlert, bg: "bg-warning/10", border: "border-warning/30", text: "text-yellow-700 dark:text-yellow-300", icon_color: "text-warning" },
  info: { icon: Info, bg: "bg-blue-500/10", border: "border-blue-300/40", text: "text-blue-700 dark:text-blue-300", icon_color: "text-blue-500" },
};

/**
 * Alert – inline dismissible alert banner.
 * variant: "success" | "error" | "warning" | "info"
 */
export function Alert({ variant = "info", title, message, dismissible = false, className = "" }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const { icon: Icon, bg, border, text, icon_color } = VARIANTS[variant] || VARIANTS.info;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${bg} ${border} ${className}`} role="alert">
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${icon_color}`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`font-semibold text-sm ${text}`}>{title}</p>}
        {message && <p className={`text-sm mt-0.5 ${text} opacity-90`}>{message}</p>}
      </div>
      {dismissible && (
        <button onClick={() => setDismissed(true)} className={`shrink-0 p-0.5 rounded hover:bg-black/10 ${text} transition-colors`}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * EmptyState – shown when a list/table has no data.
 */
export function EmptyState({ icon, title = "No data", message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {icon && <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">{icon}</div>}
      <h3 className="font-semibold text-foreground">{title}</h3>
      {message && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default Alert;
