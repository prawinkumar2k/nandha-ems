import { useQuery } from "@tanstack/react-query";
import { logService } from "@/core/api/services";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { DataTableWrapper } from "@/shared/components/Table/DataTableWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/core/constants/routes";
import { formatDateTime, downloadCSV } from "@/core/utils/helpers";
import { LogIn, CheckCircle2, XCircle, Download, ShieldCheck, ShieldAlert, Wifi, Globe } from "lucide-react";
import { getAdminNav } from "@/core/constants/navigation";

const NAV = getAdminNav();

const STATUS_STYLE = {
  success: { text: "text-emerald-500", icon: <ShieldCheck className="w-4 h-4" />, bg: "bg-emerald-500/10 border-emerald-500/20" },
  failed: { text: "text-rose-500", icon: <ShieldAlert className="w-4 h-4" />, bg: "bg-rose-500/10 border-rose-500/20" },
};

export default function LoginLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-login-logs"],
    queryFn: () => logService.getLoginLogs(),
  });

  const cols = [
    { key: "user", header: "User", sortable: true, render: (r) => (
      <div className="flex flex-col">
        <span className="font-bold tracking-tight text-foreground">{r.user?.name || "Login"}</span>
        <span className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest">{r.user?.email}</span>
      </div>
    )},
    { key: "role", header: "Work Role", sortable: true, render: (r) => (
      <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
        {r.user?.role || "guest"}
      </span>
    )},
    { key: "ip", header: "IP Address", render: (r) => (
      <div className="flex items-center gap-2 group">
        <Globe className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" />
        <span className="font-mono text-xs font-bold text-muted-foreground/80">{r.ipAddress || "127.0.0.1"}</span>
      </div>
    )},
    { key: "device", header: "PC Name", render: (r) => (
      <div className="flex items-center gap-2">
        <Wifi className="w-3 h-3 text-emerald-500/40" />
        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{r.device?.hostname || "Remote Link"}</span>
      </div>
    )},
    { key: "status", header: "Status", render: (r) => {
      const style = STATUS_STYLE[r.status] || STATUS_STYLE.success;
      return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
          {style.icon}
          {r.status === 'success' ? 'Success' : 'Failed'}
        </span>
      );
    }},
    { key: "time", header: "Date & Time", sortable: true, render: (r) => (
      <span className="text-[10px] font-medium text-muted-foreground/60 font-mono tracking-tighter">
        {formatDateTime(r.createdAt || r.time)}
      </span>
    )},
  ];

  const safeLogs = Array.isArray(logs) ? logs : [];
  const failedCount = safeLogs.filter(l => l.status === "failed").length || 0;

  return (
    <MainLayout navItems={NAV} title="Login History">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          <div>
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3 text-foreground italic uppercase">
               Login History <ShieldCheck className="w-6 h-6 text-primary" />
            </h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">Track system logins</p>
          </div>
          <Button variant="outline" className="rounded-2xl h-12 px-8 border-white/5 bg-white/5 hover:bg-white/10 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl backdrop-blur-xl" onClick={() => downloadCSV(safeLogs, "login_logs.csv")}>
            <Download className="w-4 h-4 mr-3" /> Save To File
          </Button>
        </div>

        <Card className="rounded-[44px] glass border-white/5 relative overflow-hidden shadow-2xl border-t-primary/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between px-10 pt-10 pb-6">
             <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[24px] bg-primary/10 flex items-center justify-center shadow-2xl shadow-primary/20 border border-primary/20">
                  <LogIn className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black italic uppercase">Login History</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                    {failedCount > 0 ? `${failedCount} failed logins` : "All good"}
                  </CardDescription>
                </div>
             </div>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-2">
            <DataTableWrapper 
              columns={cols} 
              data={safeLogs} 
              searchKeys={["user.name", "user.email", "ipAddress", "status"]}
              searchPlaceholder="Search logins…" 
              pageSize={10} 
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
