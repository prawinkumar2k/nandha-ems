import { useQuery } from "@tanstack/react-query";
import { logService } from "@/core/api/services";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { DataTableWrapper } from "@/shared/components/Table/DataTableWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/core/constants/routes";
import { formatDateTime, downloadCSV } from "@/core/utils/helpers";
import { Activity, Download, Cpu, Zap, Box, User, Globe } from "lucide-react";
import { getAdminNav } from "@/core/constants/navigation";

const NAV = getAdminNav();

const ACTION_THEMES = {
  exam_started: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  exam_submitted: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  user_created: "text-primary bg-primary/10 border-primary/20",
  device_registered: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  system_alert: "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

export default function ActivityLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-activity-logs"],
    queryFn: () => logService.getActivityLogs(),
  });

  const cols = [
    { key: "user", header: <span className="whitespace-nowrap">User</span>, sortable: true, render: (r) => (
       <div className="flex items-center gap-3 whitespace-nowrap">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
             <User className="w-4 h-4 text-muted-foreground/60" />
          </div>
          <div className="whitespace-nowrap">
             <p className="font-bold tracking-tight text-foreground leading-none whitespace-nowrap">{r.user?.name || "System"}</p>
             <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1 whitespace-nowrap">{r.user?.role || "Staff"}</p>
          </div>
       </div>
    )},
    { key: "action", header: <span className="whitespace-nowrap">Action</span>, sortable: true, render: (r) => {
      const displayMap = {
        exam_started: "test started",
        exam_submitted: "test finished",
        user_created: "user added",
        device_registered: "pc added",
        system_alert: "system alert"
      };
      return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap border ${ACTION_THEMES[r.action] || "bg-white/5 text-muted-foreground border-white/10"}`}>
          <Zap className="w-3 h-3" />
          {displayMap[r.action] || r.action?.replaceAll("_", " ")}
        </span>
      );
    }},
    { key: "resource", header: <span className="whitespace-nowrap">Detail</span>, render: (r) => (
      <div className="flex items-center gap-2 whitespace-nowrap">
         <Box className="w-3 h-3 text-primary/40" />
         <span className="text-xs font-medium italic text-muted-foreground/80 whitespace-nowrap">{r.resource || "General"}</span>
      </div>
    )},
    { key: "ip", header: <span className="whitespace-nowrap">IP Address</span>, render: (r) => (
      <div className="flex items-center gap-2 whitespace-nowrap">
         <Globe className="w-3 h-3 text-muted-foreground/40" />
         <span className="font-mono text-[10px] font-bold text-muted-foreground/60 whitespace-nowrap">{r.ipAddress || "::1"}</span>
      </div>
    )},
    { key: "time", header: <span className="whitespace-nowrap">Date & Time</span>, sortable: true, render: (r) => (
       <span className="text-[10px] font-medium text-muted-foreground/40 font-mono tracking-tighter whitespace-nowrap">
          {formatDateTime(r.createdAt || r.time)}
       </span>
    )},
  ];

  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <MainLayout navItems={NAV} title="Action History">
       <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
             <div>
                <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3 text-foreground italic uppercase">
                   Action History <Cpu className="w-6 h-6 text-primary animate-pulse" />
                </h2>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">All student and staff actions</p>
             </div>
             <Button variant="outline" className="rounded-2xl h-12 px-8 border-white/5 bg-white/5 hover:bg-white/10 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl backdrop-blur-xl" onClick={() => {
               const flatData = safeLogs.map(l => ({
                 User: l.user?.name || "System",
                 Role: l.user?.role?.toUpperCase() || "STAFF",
                 Action: l.action?.toUpperCase().replaceAll("_", " ") || "UNKNOWN",
                 Detail: l.resource || "General",
                 IP_Address: l.ipAddress || "::1",
                 Date: formatDateTime(l.createdAt || l.time)
               }));
               downloadCSV(flatData, "system_activity_logs.csv");
             }}>
                <Download className="w-4 h-4 mr-3" /> Save To File
             </Button>
          </div>

          <Card className="rounded-[44px] glass border-white/5 relative overflow-hidden shadow-2xl border-t-primary/10">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
             <CardHeader className="px-10 pt-10 pb-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-[24px] bg-primary/10 flex items-center justify-center animate-pulse shadow-2xl shadow-primary/20 border border-primary/20">
                      <Activity className="w-7 h-7 text-primary" />
                   </div>
                   <div>
                      <CardTitle className="text-2xl font-black italic uppercase italic">Recent Actions</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60">List of all system actions</CardDescription>
                   </div>
                </div>
             </CardHeader>
             <CardContent className="px-8 pb-8 pt-2">
                <DataTableWrapper 
                   columns={cols} 
                   data={safeLogs} 
                   searchKeys={["user.name", "action", "resource"]}
                   searchPlaceholder="Search activities…" 
                   pageSize={12} 
                   isLoading={isLoading}
                 />
             </CardContent>
          </Card>
       </div>
    </MainLayout>
  );
}
