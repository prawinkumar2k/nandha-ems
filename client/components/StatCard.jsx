import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * StatCard – a premium KPI card with icon, value, change indicator.
 *
 * @param {string} label
 * @param {string|number} value
 * @param {string} change    e.g. "+12%" or "-3%"
 * @param {ReactNode} icon
 * @param {string} color     Tailwind color class for the icon bg e.g. "bg-blue-500/10 text-blue-600"
 */
export function StatCard({ label, value, change, icon, color = "bg-primary/10 text-primary" }) {
  const isPositive = change?.startsWith("+");
  const isNegative = change?.startsWith("-");
  const ChangeIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const changeColor = isPositive
    ? "text-emerald-600 dark:text-emerald-400"
    : isNegative
    ? "text-red-500 dark:text-red-400"
    : "text-muted-foreground";

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardDescription className="text-xs font-medium uppercase tracking-wide">
          {label}
        </CardDescription>
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          <div className="text-2xl lg:text-3xl font-bold text-foreground">{value}</div>
          {change && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${changeColor}`}>
              <ChangeIcon className="w-3.5 h-3.5" />
              <span>{change}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
