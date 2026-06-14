import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, User, Clock, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/core/utils/helpers";

const SEVERITY_COLOR = {
  high: "text-red-500 bg-red-500/10 border-red-500/20",
  medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  low: "text-blue-500 bg-blue-500/10 border-blue-500/20",
};

export function ViolationPanel({ violations = [] }) {
  return (
    <Card className="rounded-[32px] glass overflow-hidden border-red-500/10">
      <CardHeader className="bg-red-500/5 border-b border-red-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight">Security Breaches</CardTitle>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500/70">Real-time anti-cheat monitor</p>
            </div>
          </div>
          <div className="px-2 py-1 rounded bg-red-500 text-white text-[10px] font-black animate-pulse">
            LIVE
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <AnimatePresence initial={false}>
          {violations.length === 0 ? (
            <div className="py-10 text-center opacity-30 italic text-sm">
              No recent security incidents detected.
            </div>
          ) : (
            violations.slice(0, 5).map((v, i) => (
              <motion.div
                key={v._id || v.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-4 rounded-2xl border flex items-center justify-between group hover:scale-[1.02] transition-transform",
                  SEVERITY_COLOR[v.severity || 'high']
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black">
                    {(v.studentName || v.student?.name || (typeof v.student === 'string' ? v.student : "S")).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-sm tracking-tight truncate w-32 whitespace-nowrap">
                       {v.studentName || v.student?.name || (typeof v.student === 'string' ? v.student : "Unknown")}
                    </h4>
                    <div className="flex items-center gap-2 opacity-70 text-[10px] font-bold uppercase mt-0.5">
                      <span className="truncate max-w-[80px]">{v.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 whitespace-nowrap"><Clock className="w-2.5 h-2.5" /> {formatDistanceToNow(new Date(v.timestamp || v.createdAt))} ago</span>
                    </div>
                  </div>
                </div>
                <Zap className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
