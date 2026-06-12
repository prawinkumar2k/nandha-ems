import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, User, Monitor, Shield, AlertTriangle, Key } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/core/utils/helpers";
import { ScrollArea } from "@/components/ui/scroll-area";

const LOG_ICONS = {
  login: <Key className="w-3 h-3 text-blue-500" />,
  exam_start: <Shield className="w-3 h-3 text-amber-500" />,
  device_connect: <Monitor className="w-3 h-3 text-emerald-500" />,
  violation: <AlertTriangle className="w-3 h-3 text-red-500" />,
  default: <Activity className="w-3 h-3 text-slate-500" />
};

export function ActivityFeed({ activities = [] }) {
  return (
    <Card className="rounded-[32px] glass h-[500px] flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-lg font-black tracking-tight">System Pulse</CardTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Live telemetry stream</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6">
          <div className="space-y-4 pb-6">
            {activities.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <Activity className="w-12 h-12 mx-auto mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">Waiting for pulse...</p>
              </div>
            ) : (
              activities.map((log, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="relative flex flex-col items-center">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      {LOG_ICONS[log.type] || LOG_ICONS.default}
                    </div>
                    {i !== activities.length - 1 && <div className="w-px h-full bg-white/5 my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-bold leading-tight group-hover:text-primary transition-colors">
                      {log.message}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 mt-1">
                      {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : "just now"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
