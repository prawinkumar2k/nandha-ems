import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";

export function StatCard({ label, value, change, icon, color = "bg-primary/10 text-primary", subText }) {
  const isPos = change?.startsWith("+");
  const isNeg = change?.startsWith("-") && change !== "-0%";
  const ChangeIcon = isPos ? TrendingUp : isNeg ? TrendingDown : Minus;
  const changeColor = isPos
    ? "text-emerald-500"
    : isNeg
    ? "text-red-500"
    : "text-muted-foreground";

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-card relative overflow-hidden group">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
          <CardDescription className="text-xs font-black uppercase tracking-[0.1em] text-foreground/70">{label}</CardDescription>
          {icon && (
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${color} shadow-sm border border-white/10`}>
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-end justify-between gap-2">
            <p className="text-3xl font-black text-card-foreground tracking-tight leading-none">{value}</p>
            {change && (
              <div className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-bold bg-white/10 dark:bg-black/20 ring-1 ring-white/10 ${changeColor}`}>
                <ChangeIcon className="w-3.5 h-3.5" />
                <span>{change}</span>
              </div>
            )}
          </div>
          {subText && <p className="text-xs text-muted-foreground mt-2 font-medium">{subText}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default StatCard;
