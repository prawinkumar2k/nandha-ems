import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { logService } from "@/core/api/services";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { DataTableWrapper } from "@/shared/components/Table/DataTableWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/core/constants/routes";
import { formatDateTime, downloadCSV, cn } from "@/core/utils/helpers";
import { AlertTriangle, Download, Eye, ShieldAlert, ShieldX, UserX, X, Clock, Monitor, User } from "lucide-react";
import { getAdminNav } from "@/core/constants/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV = getAdminNav();

const VIOLATION_STYLE = {
  tab_switch: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  copy_paste: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  fullscreen_exit: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  devtools_open: "bg-red-500/10 text-red-700 border-red-500/20",
  right_click: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  window_blur: "bg-slate-500/10 text-slate-700 border-slate-500/20",
};

export default function Violations() {
  const navigate = useNavigate();
  const [viewing, setViewing] = useState(null);
  
  const { data: violations, isLoading } = useQuery({
    queryKey: ["admin-violations"],
    queryFn: () => logService.getViolations(),
    refetchInterval: 10000, 
  });

  const safeViolations = Array.isArray(violations) ? violations : [];

  const cols = [
    { key: "student", header: <span className="whitespace-nowrap">Student</span>, sortable: true, render: (r) => (
      <div className="flex flex-col whitespace-nowrap">
        <span className="font-bold tracking-tight text-foreground whitespace-nowrap">{r.student?.name || "No Name"}</span>
        <span className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] whitespace-nowrap">{r.student?.rollNumber}</span>
      </div>
    )},
    { key: "exam", header: <span className="whitespace-nowrap">Test Name</span>, render: (r) => (
      <span className="text-xs font-bold text-primary italic whitespace-nowrap">{r.exam?.title || "Test"}</span>
    )},
    { key: "violation", header: <span className="whitespace-nowrap">Broken Rule</span>, render: (r) => {
      const firstV = r.violations?.[0]?.type || "not_allowed";
      const displayMap = {
        tab_switch: "switched tab",
        copy_paste: "copy/paste",
        fullscreen_exit: "left screen",
        devtools_open: "opened tools",
        right_click: "right clicked",
        window_blur: "minimized window"
      };
      return (
        <span className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border whitespace-nowrap", VIOLATION_STYLE[firstV] || "bg-white/5 text-muted-foreground border-white/10")}>
          {displayMap[firstV] || firstV.replaceAll("_", " ")}
        </span>
      );
    }},
    { key: "count", header: <span className="whitespace-nowrap">How Many</span>, sortable: true, render: (r) => (
      <span className={cn("font-black text-xs whitespace-nowrap", r.totalViolations > 3 ? "text-rose-500" : "text-amber-500")}>
        {r.totalViolations || 0}
      </span>
    )},
    { key: "status", header: <span className="whitespace-nowrap">Alert State</span>, render: (r) => (
      <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap", r.totalViolations > 3 ? "text-rose-500 animate-pulse" : "text-amber-500")}>
        {r.totalViolations > 3 ? "Serious" : "Warning"}
      </span>
    )},
    { key: "time", header: <span className="whitespace-nowrap">Final Check</span>, sortable: true, render: (r) => (
      <span className="text-[10px] font-medium text-muted-foreground/50 font-mono tracking-tighter whitespace-nowrap">
        {formatDateTime(r.updatedAt || r.time)}
      </span>
    )},
    { key: "actions", header: "", render: (r) => (
      <div className="flex justify-end whitespace-nowrap">
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => setViewing(r)}>
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    )},
  ];

  const flaggedSize = safeViolations.filter((v) => v.totalViolations > 3).length;

  return (
    <MainLayout navItems={NAV} title="Test Alerts">
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
           <div>
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3 text-foreground italic uppercase">
                 Alert List <ShieldAlert className="w-6 h-6 text-rose-500" />
              </h2>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">List of test rules broken</p>
           </div>
           <Button variant="outline" className="rounded-2xl h-12 px-8 border-white/5 bg-white/5 hover:bg-white/10 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl backdrop-blur-xl" onClick={() => {
              const flatData = safeViolations.map(v => ({
                 Student_Name: v.student?.name || "Unknown",
                 Student_ID: v.student?.rollNumber || "",
                 Test_Name: v.exam?.title || "Unknown Test",
                 Total_Violations: v.totalViolations || 0,
                 State: v.totalViolations > 3 ? "SERIOUS" : "WARNING",
                 Last_Update: formatDateTime(v.updatedAt || v.time)
              }));
              downloadCSV(flatData, "system_test_alerts.csv");
           }}>
              <Download className="w-4 h-4 mr-3" /> Save To File
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Broken Rules", value: safeViolations.length, color: "text-foreground", icon: <ShieldAlert className="w-5 h-5" />, glow: "shadow-black/5" },
            { label: "Large Alerts", value: flaggedSize, color: "text-rose-500", icon: <ShieldX className="w-5 h-5" />, glow: "shadow-rose-500/10" },
            { label: "Small Alerts", value: safeViolations.length - flaggedSize, color: "text-amber-500", icon: <UserX className="w-5 h-5" />, glow: "shadow-amber-500/10" },
          ].map((s, i) => (
            <div key={i} className={`glass rounded-[32px] p-8 border border-white/5 relative overflow-hidden group shadow-2xl ${s.glow}`}>
               <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700">
                  {s.icon}
               </div>
               <p className={`text-5xl font-black italic tracking-tighter ${s.color} leading-none mb-2`}>{String(s.value).padStart(2, "0")}</p>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{s.label}</p>
            </div>
          ))}
        </div>

        <Card className="rounded-[44px] glass border-white/5 relative overflow-hidden shadow-2xl border-t-rose-500/10">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
           <CardHeader className="px-10 pt-10 pb-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 rounded-[24px] bg-rose-500/10 flex items-center justify-center animate-pulse shadow-2xl shadow-rose-500/20 border border-rose-500/20">
                    <AlertTriangle className="w-7 h-7 text-rose-500" />
                 </div>
                 <div>
                    <CardTitle className="text-2xl font-black italic uppercase">Broken Rules</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-rose-500/60">List of all rule breaks</CardDescription>
                 </div>
              </div>
           </CardHeader>
           <CardContent className="px-8 pb-8 pt-2">
            <DataTableWrapper 
              columns={cols} 
              data={safeViolations} 
              searchKeys={["student.name", "exam.title", "violation"]}
              searchPlaceholder="Search rule breaks…" 
              pageSize={10} 
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {viewing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setViewing(null)} />
             <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl glass rounded-[44px] border border-white/10 shadow-3xl overflow-hidden p-0 max-h-[90vh] flex flex-col">
               
               <div className="p-10 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tight">Alert Details</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Checking test rules</p>
                     </div>
                  </div>
                  <button onClick={() => setViewing(null)} className="w-10 h-10 rounded-2xl hover:bg-white/5 flex items-center justify-center text-muted-foreground transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black tracking-widest text-primary/40 uppercase mb-1">Student Name</span>
                           <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-primary" />
                              <span className="text-sm font-bold">{viewing.student?.name}</span>
                           </div>
                           <span className="text-[9px] font-bold text-muted-foreground/60 ml-7 mt-0.5">{viewing.student?.email}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black tracking-widest text-primary/40 uppercase mb-1">PC Name</span>
                           <div className="flex items-center gap-3">
                              <Monitor className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm font-bold">{viewing.device?.deviceId || viewing.device?.hostname || "Remote Link"}</span>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black tracking-widest text-primary/40 uppercase mb-1">Test Name</span>
                           <span className="text-sm font-bold text-primary italic ml-1">{viewing.exam?.title}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black tracking-widest text-primary/40 uppercase mb-1">State</span>
                           <span className={cn("text-xs font-black uppercase tracking-widest ml-1", viewing.totalViolations > 3 ? "text-rose-500" : "text-amber-500")}>
                              {viewing.totalViolations > 3 ? "Needs Attention" : "Warning Given"}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-4 py-2 rounded-xl inline-block border border-primary/10">Alert Times ({viewing.violations?.length || 0})</p>
                     <div className="space-y-3">
                        {viewing.violations?.map((v, i) => (
                           <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                              <div className="flex items-center gap-4">
                                 <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", VIOLATION_STYLE[v.type]?.replace('text-', 'bg-').split(' ')[0])} />
                                 <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">
                                    {{
                                      tab_switch: "switched tab",
                                      copy_paste: "copy/paste",
                                      fullscreen_exit: "left screen",
                                      devtools_open: "opened tools",
                                      right_click: "right clicked",
                                      window_blur: "minimized window"
                                    }[v.type] || v.type?.replaceAll("_", " ")}
                                 </span>
                              </div>
                              <div className="flex items-center gap-4">
                                 <span className="text-[10px] font-mono text-muted-foreground/40">{formatDateTime(v.timestamp)}</span>
                                 <span className="px-2 py-0.5 rounded-lg bg-white/10 text-[9px] font-black">x{v.count}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="p-8 border-t border-white/5 bg-black/20 flex gap-4">
                  <Button variant="outline" className="flex-1 rounded-2xl h-14 border-white/5 bg-white/5 font-black uppercase tracking-widest text-[10px]" onClick={() => setViewing(null)}>
                     Close
                  </Button>
                  <Button className="flex-1 rounded-2xl h-14 shadow-2xl shadow-rose-500/20 bg-rose-500 hover:bg-rose-600 font-black uppercase tracking-widest text-[10px]" onClick={() => navigate(`${ROUTES.ADMIN_MONITORING}?examId=${viewing.exam?._id}`)}>
                     Watch Live
                  </Button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
