import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { StatCard } from "@/shared/components/StatCard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/core/constants/routes";
import { apiClient } from "@/core/api/client";
import { logService } from "@/core/api/services";
import {
  LayoutDashboard, FileText, HelpCircle, Eye, BarChart3,
  BookOpen, Users, ClipboardList, Plus, UserCheck, Sparkles, ChevronRight,
  AlertTriangle, Clock, X, ExternalLink
} from "lucide-react";
import { useSocket } from "@/contexts/SocketContext";
import { Modal } from "@/shared/components/Modal/Modal";
import { Badge } from "@/components/ui/badge";
import { getFacultyNav } from "@/core/constants/navigation";

const NAV = getFacultyNav();

const getImageSrc = (url) => {
  if (!url) return "";
  return url.startsWith("/api") ? `${url}?token=${sessionStorage.getItem("authToken")}` : url;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const socket = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    const fetchInitialAlerts = async () => {
      try {
        const res = await logService.getViolations({ limit: 5 });
        if (Array.isArray(res)) setAlerts(res.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch initial alerts", err);
      }
    };
    fetchInitialAlerts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("new-violation", (data) => {
      setAlerts((prev) => [data, ...prev].slice(0, 5)); // Keep last 5
    });

    return () => socket.off("new-violation");
  }, [socket]);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["faculty-dashboard"],
    queryFn: () => apiClient.get("/api/reports/faculty"),
  });

  const stats = React.useMemo(() => [
    { label: "My Courses", value: dashboard?.courseCount || 0, icon: <BookOpen className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
    { label: "Total Students", value: dashboard?.studentCount || 0, icon: <Users className="w-5 h-5" />, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Waiting Tests", value: dashboard?.pendingExams || 0, icon: <ClipboardList className="w-5 h-5" />, color: "bg-purple-500/10 text-purple-500" },
    { label: "Attendance", value: dashboard?.avgAttendance || "0%", icon: <UserCheck className="w-5 h-5" />, color: "bg-blue-500/10 text-blue-500" },
  ], [dashboard]);

  return (
    <MainLayout navItems={NAV} title="Teacher Dashboard">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
              Teacher Panel <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            </h2>
            <p className="text-xs text-primary font-black uppercase tracking-[0.2em]">Control your courses and tests</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-[24px] opacity-10" />)
          ) : (
            stats.map((s, i) => (
              <motion.div key={i} variants={itemVariants}>
                <StatCard {...s} />
              </motion.div>
            ))
          )}
        </div>

        {/* Real-time Alerts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="xl:col-span-1">
            <Card className="rounded-[32px] glass border-white/5 border-l-4 border-l-rose-500 overflow-hidden shadow-2xl h-full">
              <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black italic uppercase flex items-center gap-2">
                       Alerts <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-rose-500/70">Real-time alerts</CardDescription>
                  </div>
                  <Badge className="bg-rose-500/10 text-rose-500 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">{alerts.length} New</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <AnimatePresence>
                  {alerts.length === 0 ? (
                    <div className="py-12 text-center opacity-20 italic font-black text-xs uppercase tracking-widest">
                       All systems secure
                    </div>
                  ) : (
                    alerts.map((alert, i) => (
                      <motion.div 
                        key={alert._id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 cursor-pointer transition-all group"
                        onClick={() => setSelectedAlert(alert)}
                      >
                         <div className="flex items-start gap-3">
                            {alert.screenshot ? (
                               <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden shrink-0 shadow-lg">
                                 <img src={getImageSrc(alert.screenshot)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="proof" />
                               </div>
                            ) : (
                               <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                                 <AlertTriangle className="w-5 h-5 text-rose-500" />
                               </div>
                            )}
                            <div className="min-w-0 flex-1">
                               <div className="flex items-center gap-2">
                                  <p className="text-xs font-black tracking-tight truncate">{alert.studentName || alert.student?.name || (typeof alert.student === 'string' ? alert.student : "Unknown")}</p>
                                  <span className="text-[9px] font-black text-rose-500/40">{alert.studentRoll || alert.student?.rollNumber || ""}</span>
                               </div>
                               <p className="text-[9px] font-black uppercase text-rose-500/70 tracking-widest mb-1">{alert.type?.replace('_', ' ')}</p>
                               <div className="flex items-center gap-2 text-[8px] font-bold text-muted-foreground uppercase opacity-40">
                                  <Clock className="w-3 h-3" /> {new Date(alert.createdAt || alert.timestamp).toLocaleTimeString()}
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Course List */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <Card className="rounded-[32px] glass overflow-hidden border-white/5 h-full">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
                <div>
                  <CardTitle className="text-xl font-black italic uppercase">Course List</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-primary">Your active courses and students</CardDescription>
                </div>
                <Button size="sm" onClick={() => navigate(ROUTES.FACULTY_CREATE_EXAM)} className="rounded-xl h-10 font-black shadow-lg">
                  <Plus className="w-4 h-4 mr-1" />New Test
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl opacity-10" />)}
                  </div>
                ) : (
                  dashboard?.courses?.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {c.code?.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-tight">{c.name}</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">{c.code} · {c.students} Students</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-primary">{c.progress}%</span>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground/40 tracking-tighter">Done</p>
                        </div>
                      </div>
                      <Progress value={c.progress} className="h-1.5 bg-white/5" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="mt-6 rounded-[32px] glass overflow-hidden border-white/5">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
                <div>
                  <CardTitle className="text-xl font-black italic uppercase">Scheduled Exams</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-primary">Manage upcoming assessments</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {isLoading ? (
                  <Skeleton className="h-20 w-full rounded-2xl opacity-10" />
                ) : dashboard?.pendingExams?.length === 0 ? (
                  <p className="text-center text-xs font-black uppercase text-muted-foreground/40 italic py-4">No upcoming exams</p>
                ) : (
                  dashboard?.pendingExams?.map((e) => (
                    <div key={e._id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                       <div>
                         <p className="font-bold text-sm tracking-tight">{e.title}</p>
                         <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{new Date(e.scheduledAt).toLocaleString()}</p>
                       </div>
                       <Button 
                         variant="secondary" 
                         size="sm" 
                         className="rounded-xl h-8 font-black text-[9px] uppercase tracking-widest"
                         onClick={() => navigate(`/faculty/hall-tickets/${e._id}`)}
                       >
                         Hall Tickets
                       </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Selected Alert Proof Modal */}
        <Modal isOpen={!!selectedAlert} onClose={() => setSelectedAlert(null)} title="Security Review" size="lg">
           {selectedAlert && (
              <div className="space-y-6 pt-4">
                 <div className="aspect-video bg-black rounded-[24px] overflow-hidden border-4 border-rose-500/20 shadow-2xl relative">
                    {selectedAlert.screenshot ? (
                       <img src={getImageSrc(selectedAlert.screenshot)} className="w-full h-full object-contain" alt="evidence" />
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground/20">
                          <Eye className="w-20 h-20" />
                          <p className="font-black italic uppercase tracking-widest text-xs">No image available</p>
                       </div>
                    )}
                    <div className="absolute top-4 right-4 bg-rose-500 text-white text-[9px] font-black italic px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest ring-4 ring-black/50">
                       PROVEN AT {new Date(selectedAlert.createdAt || selectedAlert.timestamp).toLocaleTimeString()}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest mb-1">Student</p>
                        <p className="font-bold tracking-tight">{selectedAlert.studentName || selectedAlert.student?.name || (typeof selectedAlert.student === 'string' ? selectedAlert.student : "Unknown")}</p>
                        <p className="text-[9px] font-bold text-muted-foreground/60">{selectedAlert.studentRoll || selectedAlert.student?.rollNumber || ""}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[10px] font-black uppercase text-rose-500/40 tracking-widest mb-1">Type</p>
                        <p className="font-black italic text-rose-500 uppercase tracking-tighter">{selectedAlert.type?.replace('_', ' ')}</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 rounded-2xl h-14 border-white/10 glass font-black uppercase text-xs" onClick={() => setSelectedAlert(null)}>Close</Button>
                    <Button className="flex-1 rounded-2xl h-14 bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-500/20 font-black uppercase text-xs">Report Issue</Button>
                 </div>
              </div>
           )}
        </Modal>
      </motion.div>
    </MainLayout>
  );
}
