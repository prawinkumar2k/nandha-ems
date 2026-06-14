import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, User, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/core/utils/helpers";

const STATUS_ICONS = {
  online: <Monitor className="w-4 h-4 text-emerald-500" />,
  offline: <Monitor className="w-4 h-4 text-slate-400 opacity-50" />,
  exam: <Shield className="w-4 h-4 text-amber-500 animate-pulse" />,
  locked: <Shield className="w-4 h-4 text-red-500" />,
};

const STATUS_BG = {
  online: "bg-emerald-500/10 border-emerald-500/20",
  offline: "bg-slate-500/5 border-slate-500/10",
  exam: "bg-amber-500/10 border-amber-500/20",
  locked: "bg-red-500/10 border-red-500/20",
};

export function DeviceGrid({ devices = [], isLoading = false }) {
  if (isLoading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
      {[...Array(12)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/10" />)}
    </div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
      {devices.map((device) => (
        <DeviceCard key={device._id} device={device} />
      ))}
    </div>
  );
}

function DeviceCard({ device }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "p-4 rounded-3xl border transition-all cursor-pointer relative group",
        STATUS_BG[device.status] || STATUS_BG.offline
      )}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div className="p-3 rounded-2xl bg-white/10 shadow-sm mb-1 group-hover:rotate-6 transition-transform">
          {STATUS_ICONS[device.status] || STATUS_ICONS.offline}
        </div>
        <p className="text-[11px] font-black tracking-tighter uppercase opacity-80 truncate w-full whitespace-nowrap">
          {device.hostname}
        </p>
        <span className={cn(
          "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md whitespace-nowrap",
          device.status === 'online' ? "text-emerald-500" : "text-muted-foreground"
        )}>
          {device.status}
        </span>
      </div>

      {/* Tooltip-like info on hover if active */}
      {device.currentStudent && (
        <div className="absolute inset-0 bg-black/80 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center p-2 text-center transition-opacity backdrop-blur-sm">
          <div className="space-y-1">
            <User className="w-4 h-4 mx-auto text-primary" />
            <p className="text-[9px] font-bold text-white leading-tight">{device.currentStudent.name}</p>
            <p className="text-[7px] font-black text-primary uppercase">Assigned</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
