import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { DataTableWrapper } from "@/shared/components/Table/DataTableWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/core/constants/routes";
import { formatDateTime, cn } from "@/core/utils/helpers";
import { Wifi, WifiOff, Eye, Monitor, RefreshCw, Activity, Shield, Sparkles, UserCheck, X, Clock, User, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { examService } from "@/core/api/services";
import { getAdminNav } from "@/core/constants/navigation";
import { LiveScreenGrid } from "@/shared/components/Monitoring/LiveScreenGrid";


const NAV = getAdminNav();

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function LiveMonitoring() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const examId = searchParams.get("examId");
  const [viewing, setViewing] = useState(null);
  const apiClient = { post: (url) => fetch(`${import.meta.env.VITE_API_URL}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()) };

  const { data: submissions, isLoading, refetch } = useQuery({
    queryKey: ["live-submissions", examId],
    queryFn: () => examService.getSubmissions(examId ? { examId } : {}),
    refetchInterval: 5000, 
  });

  const safeSubmissions = Array.isArray(submissions) ? submissions : [];
  const activeCount = safeSubmissions.filter(s => s.status === "in_progress").length || 0;
  const violationCount = safeSubmissions.reduce((acc, s) => acc + (s.totalViolations || 0), 0) || 0;

  const cols = [
    { key: "student", header: "Student", sortable: true, render: (r) => (
      <div>
        <p className="font-bold tracking-tight text-foreground">{r.student?.name}</p>
        <p className="text-[9px] font-black uppercase text-muted-foreground/40">{r.student?.rollNumber}</p>
      </div>
    )},
    { key: "exam", header: "Test", render: (r) => (
      <p className="text-xs font-bold text-primary/80 italic">{r.exam?.title || "N/A"}</p>
    )},
    { key: "pc", header: "PC Name", render: (r) => (
      <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
        {r.device?.deviceId || r.device?.hostname || "REMOTE"}
      </span>
    )},
    { key: "status", header: "Status", render: (r) => (
      <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${r.status === "in_progress" ? "text-emerald-500" : "text-muted-foreground/40"}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${r.status === "in_progress" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/40"}`} />
        {r.status === 'in_progress' ? 'Doing Test' : 'Finished'}
      </span>
    )},
    { key: "violations", header: "Rules Broken", sortable: true, render: (r) => (
      <div className="flex items-center gap-2">
        <span className={`font-black text-xs ${r.totalViolations > 0 ? "text-rose-500" : "text-emerald-500/40"}`}>{r.totalViolations || 0}</span>
        {r.totalViolations > 3 && <Shield className="w-3 h-3 text-rose-500 animate-pulse" />}
      </div>
    )},
    { key: "started", header: "Time Started", render: (r) => (
      <p className="text-[10px] font-medium text-muted-foreground/60">{formatDateTime(r.startedAt)}</p>
    )},
    { key: "actions", header: "", render: (r) => (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => setViewing(r)}>
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    )},
  ];

  return (
    <MainLayout navItems={NAV} title="Live View">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3 text-foreground italic uppercase">
              Test Progress <Activity className="w-6 h-6 text-primary animate-pulse" />
            </h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">Watch students during the test</p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button onClick={() => refetch()} variant="outline" className="rounded-2xl h-12 px-8 border-white/5 bg-white/5 hover:bg-white/10 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl backdrop-blur-xl">
              <RefreshCw className="w-4 h-4 mr-3 animate-spin-slow" /> Refresh Data
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Students Online", value: String(activeCount).padStart(2, "0"), color: "text-emerald-500", icon: <UserCheck className="w-5 h-5" />, glow: "shadow-emerald-500/20" },
            { label: "Test Group", value: examId ? "TARGET" : "ALL", color: "text-primary", icon: <Activity className="w-5 h-5" />, glow: "shadow-primary/20" },
            { label: "Warnings", value: String(violationCount).padStart(2, "0"), color: "text-rose-500", icon: <Shield className="w-5 h-5" />, glow: "shadow-rose-500/20" },
            { label: "Offline", value: "00", color: "text-muted-foreground/40", icon: <WifiOff className="w-5 h-5" />, glow: "shadow-black/5" },
          ].map((s, i) => (
            <motion.div key={i} variants={itemVariants} className={`glass rounded-[32px] p-8 border border-white/5 relative overflow-hidden group shadow-2xl ${s.glow}`}>
               <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700">
                  {s.icon}
               </div>
               <p className={`text-5xl font-black italic tracking-tighter ${s.color} leading-none mb-2`}>{s.value}</p>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[44px] glass border-white/5 relative overflow-hidden shadow-2xl border-t-primary/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-8 p-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[24px] bg-primary/10 flex items-center justify-center animate-pulse shadow-2xl shadow-primary/20 border border-primary/20">
                  <Monitor className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black italic uppercase">Students Online</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60">Current activity of students</CardDescription>
                </div>
              </div>
              <div className="flex gap-4">
                 <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-full">System Working</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 lg:p-8 space-y-8">
              {examId && (
                <div className="mb-10 p-8 rounded-[40px] bg-primary/5 border border-primary/10">
                  <LiveScreenGrid examId={examId} />
                </div>
              )}
              <DataTableWrapper

                columns={cols}
                data={safeSubmissions}
                searchKeys={["student.name", "exam.title", "device.hostname"]}
                searchPlaceholder="Search students or tests…"
                pageSize={10}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <AnimatePresence>
         {viewing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setViewing(null)} />
               <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-2xl glass rounded-[44px] border border-white/10 shadow-3xl overflow-hidden p-0 max-h-[90vh] flex flex-col">
                  
                  <div className="p-10 border-b border-white/5 flex items-center justify-between bg-primary/5">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                           <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black italic uppercase tracking-tight">Student Details</h3>
                           <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Current Status</p>
                        </div>
                     </div>
                     <button onClick={() => setViewing(null)} className="w-10 h-10 rounded-2xl hover:bg-white/5 flex items-center justify-center text-muted-foreground transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-10">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Student Name</p>
                              <div className="flex items-center gap-2">
                                 <User className="w-4 h-4 text-primary" />
                                 <p className="text-sm font-bold">{viewing.student?.name}</p>
                              </div>
                              <p className="text-[9px] font-bold text-muted-foreground/60 ml-6 uppercase">{viewing.student?.rollNumber}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">PC Name</p>
                              <div className="flex items-center gap-2">
                                 <Monitor className="w-4 h-4 text-emerald-500" />
                                 <p className="text-sm font-bold">{viewing.device?.hostname || "REMOTE"}</p>
                              </div>
                              <p className="text-[9px] font-mono text-muted-foreground/60 ml-6 uppercase">{viewing.device?.ipAddress || "::1"}</p>
                           </div>
                        </div>
                        <div className="space-y-6">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Test Name</p>
                              <p className="text-sm font-bold text-primary italic">{viewing.exam?.title}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Status</p>
                              <Badge className={cn("rounded-lg px-3 py-1 text-[9px] font-black tracking-widest border border-white/10 shadow-xl", viewing.status === 'in_progress' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground')}>{viewing.status === 'in_progress' ? 'DOING TEST' : 'FINISHED'}</Badge>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                        {[
                           { label: "Rules Broken", value: viewing.totalViolations || 0, color: viewing.totalViolations > 0 ? "text-rose-500" : "text-emerald-500", icon: <Shield className="w-4 h-4" /> },
                           { label: "Total Answers", value: viewing.answers?.length || 0, color: "text-primary", icon: <UserCheck className="w-4 h-4" /> },
                           { label: "Started At", value: viewing.startedAt ? formatDateTime(viewing.startedAt) : "N/A", color: "text-muted-foreground/60", icon: <Clock className="w-4 h-4" />, small: true },
                        ].map((s, i) => (
                           <div key={i} className="p-6 rounded-[28px] bg-white/5 border border-white/5 text-center space-y-2">
                              {s.icon}
                              <p className={cn("text-2xl font-black italic tracking-tighter", s.color, s.small && "text-xs")}>{s.value}</p>
                              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">{s.label}</p>
                           </div>
                        ))}
                     </div>

                     {viewing.violations?.length > 0 && (
                        <div className="space-y-4">
                           <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/5 px-4 py-2 rounded-xl flex items-center gap-2 border border-rose-500/10">Rule Break History</p>
                           <div className="space-y-2">
                              {viewing.violations.map((v, i) => (
                                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                    <span className="text-[11px] font-black uppercase text-rose-500">{{
                                      tab_switch: "switched tab",
                                      copy_paste: "copy paste",
                                      fullscreen_exit: "left full screen",
                                      devtools_open: "opened tools",
                                      right_click: "right clicked",
                                      window_blur: "minimized window"
                                    }[v.type] || v.type?.replace('_', ' ')}</span>
                                    <span className="text-[10px] font-bold opacity-30 italic">{formatDateTime(v.timestamp)}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="p-8 border-t border-white/5 bg-black/20 flex gap-4">
                     <Button variant="outline" className="flex-1 rounded-2xl h-14 border-white/5 bg-white/5 font-black uppercase tracking-widest text-[10px]" onClick={() => setViewing(null)}>Close</Button>
                     <Button className="flex-1 rounded-2xl h-14 shadow-2xl shadow-rose-500/20 bg-rose-500 hover:bg-rose-600 font-black uppercase tracking-widest text-[10px]" onClick={async () => {
                       try {
                         await apiClient.post(`/api/submissions/${viewing._id}/force-submit`);
                         refetch();
                         setViewing(null);
                       } catch (err) {
                         console.error("Failed to end test", err);
                       }
                     }}>End Test</Button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </MainLayout>
  );
}
