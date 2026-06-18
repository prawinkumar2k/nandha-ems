import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { StatCard } from "@/shared/components/StatCard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROUTES } from "@/core/constants/routes";
import { getHODNav } from "@/core/constants/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { apiClient } from "@/core/api/client";
import {
  LayoutDashboard, Users, BookOpen, BarChart3, ClipboardList, Eye,
  GraduationCap, UserCheck, CheckCircle2, Clock, Sparkles, AlertTriangle, 
  ShieldCheck, Activity, Users2, Ban, PlayCircle, Loader2
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const NAV = getHODNav();

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function HODDashboard() {
  const navigate = useNavigate();
  const socket = useSocket();
  const { addNotification } = useNotifications();

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["hod-stats"],
    queryFn: () => apiClient.get("/api/hod/stats"),
    retry: 1
  });

  const { data: exams, isLoading: examsLoading, error: examsError } = useQuery({
    queryKey: ["hod-exams"],
    queryFn: () => apiClient.get("/api/hod/exams"),
    retry: 1
  });

  const { data: faculty, isLoading: facultyLoading, error: facultyError } = useQuery({
    queryKey: ["hod-faculty"],
    queryFn: () => apiClient.get("/api/hod/faculty/status"),
    retry: 1
  });

  const { data: alerts, isLoading: alertsLoading, error: alertsError } = useQuery({
    queryKey: ["hod-alerts"],
    queryFn: () => apiClient.get("/api/hod/alerts"),
    retry: 1
  });

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ["hod-analytics"],
    queryFn: () => apiClient.get("/api/hod/analytics"),
    retry: 1
  });

  const hasSystemError = statsError || examsError || facultyError;

  // ─── Real-time Listeners ────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on("new-violation", (data) => {
      addNotification({
        title: "Serious Alert",
        message: `${data.studentName} flagged in ${data.examTitle}`,
        type: "error"
      });
    });

    socket.on("exam-started", (data) => {
      addNotification({
        title: "Test Started",
        message: `${data.examTitle} is now LIVE with ${data.studentCount} students.`,
        type: "info"
      });
    });

    return () => {
      socket.off("new-violation");
      socket.off("exam-started");
    };
  }, [socket, addNotification]);

  const statItems = useMemo(() => [
    { label: "Total Teachers", value: stats?.facultyCount || 0, icon: <UserCheck />, color: "bg-blue-500/10 text-blue-500" },
    { label: "Total Students", value: stats?.studentCount || 0, icon: <GraduationCap />, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Active Courses", value: stats?.activeCourses || 0, icon: <BookOpen />, color: "bg-primary/10 text-primary" },
    { label: "Class Grade", value: `${stats?.avgGrade || 0}%`, icon: <BarChart3 />, color: "bg-purple-500/10 text-purple-500" },
    { label: "Students in Tests", value: stats?.activeExams || 0, icon: <Users2 />, color: "bg-orange-500/10 text-orange-500", subText: "Active Now" },
    { label: "Alerts", value: stats?.recentViolations || 0, icon: <Ban />, color: "bg-red-500/10 text-red-500", subText: "Last 24 hours" },
  ], [stats]);

  return (
    <MainLayout navItems={NAV} title="HOD Dashboard">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-2 uppercase">
              HOD Dashboard <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            </h2>
            <p className="text-xs text-primary font-black uppercase tracking-[0.2em]">Department Status</p>
          </motion.div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl border-white/10 glass font-black uppercase text-xs" onClick={() => navigate(ROUTES.HOD_REPORTS)}>Get Report</Button>
            <Button className="rounded-2xl shadow-lg shadow-primary/20 font-black uppercase text-xs" onClick={() => navigate(ROUTES.HOD_EXAMS)}>Manage Tests</Button>
          </div>
        </div>

        {hasSystemError && (
          <div className="p-6 rounded-[32px] bg-red-500/10 border border-red-500/20 text-red-500">
            <p className="font-bold flex items-center gap-2 italic uppercase tracking-widest text-xs">
              <AlertTriangle className="w-4 h-4" /> Connection Error: {statsError?.message || examsError?.message || facultyError?.message || "Cannot reach server"}.
            </p>
          </div>
        )}

        {/* 1️⃣ TOP STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {statItems.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* 2️⃣ ACTIVE EXAMS PANEL */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <Card className="rounded-[40px] glass border-white/5 h-full shadow-2xl overflow-hidden relative">
              <CardHeader className="border-b border-white/5 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight uppercase italic">Active & Next Tests</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-black tracking-widest text-primary">Live Status</CardDescription>
                  </div>
                  <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 font-black uppercase text-[10px]">
                    <Activity className="w-3 h-3 mr-2 animate-pulse" /> Live Now
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {examsLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div> : 
                    (Array.isArray(exams) ? exams.filter(e => e.status !== "completed") : []).map((exam) => (
                    <div key={exam._id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-[24px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all gap-4">
                      <div className="flex gap-4 items-center">
                        <div className={`p-4 rounded-2xl ${exam.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'}`}>
                          <PlayCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black tracking-tight">{exam.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-primary"/> {exam.course?.title}</span>
                            <span className="flex items-center gap-1"><UserCheck className="w-3 h-3 text-primary"/> {exam.faculty?.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className="rounded-lg px-3 py-1 bg-white/10 text-white font-black uppercase text-[10px]">{exam.status}</Badge>
                          <p className="text-[10px] uppercase font-black text-muted-foreground mt-1 opacity-50">{new Date(exam.scheduledAt).toLocaleString()}</p>
                        </div>
                        <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 hover:bg-white/10" onClick={() => navigate(`${ROUTES.HOD_MONITORING}/${exam._id}`)}>
                          <Eye className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!examsLoading && (!Array.isArray(exams) || exams.filter(e => e.status !== "completed").length === 0) && (
                    <div className="text-center py-12 opacity-30 italic font-black tracking-widest uppercase text-[10px]">No tests found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3️⃣ FACULTY ACTIVITY PANEL */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[40px] glass border-white/5 h-full shadow-2xl">
              <CardHeader className="border-b border-white/5 pb-6">
                <CardTitle className="text-xl font-black tracking-tight uppercase italic">Teacher Status</CardTitle>
                <CardDescription className="text-[10px] uppercase font-black tracking-widest text-accent">Real-time Status</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {facultyLoading ? <Loader2 className="animate-spin text-primary mx-auto" /> : 
                  (Array.isArray(faculty) ? faculty : []).map((f) => (
                  <div key={f._id} className="flex items-center justify-between p-3 rounded-[20px] hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage src={f.profilePic} />
                        <AvatarFallback className="font-black text-xs">{f.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-black tracking-tight">{f.name}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{f.status || 'Offline'}</p>
                      </div>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full ${f.status === 'Conducting Exam' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                  </div>
                ))}
                {!facultyLoading && (!Array.isArray(faculty) || faculty.length === 0) && (
                  <div className="text-center py-12 opacity-30 italic font-black tracking-widest uppercase text-[10px]">No teacher data</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 5️⃣ ALERTS / ISSUE PANEL */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[40px] glass border-white/5 border-l-4 border-l-rose-500 shadow-2xl">
              <CardHeader className="pb-6 border-b border-white/5">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2 uppercase italic">
                  <AlertTriangle className="text-rose-500 w-6 h-6" /> Alerts
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-black tracking-widest text-rose-500/70">Serious Alerts</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <AnimatePresence>
                  {(Array.isArray(alerts) ? alerts : []).map((alert) => (
                    <motion.div 
                      key={alert._id} 
                      className="flex items-start gap-4 p-5 rounded-[24px] bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Ban className="w-5 h-5 text-rose-500 shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-black tracking-tight">{alert.student?.name} broke a rule in {alert.exam?.title}</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Severity: <span className="text-rose-500">{alert.severity?.toUpperCase() || 'MEDIUM'}</span> | {alert.type?.replace('_', ' ') || 'SUSPICIOUS'}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground/30 mt-2">{new Date(alert.createdAt).toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))}
                  {!alertsLoading && (!Array.isArray(alerts) || alerts.length === 0) && (
                    <div className="text-center py-10 opacity-30 italic font-black tracking-widest uppercase text-[10px]">No alerts found</div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* 6️⃣ PERFORMANCE ANALYTICS */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[40px] glass border-white/5 shadow-2xl">
              <CardHeader className="pb-6 border-b border-white/5">
                <CardTitle className="text-xl font-black tracking-tight uppercase italic">Marks</CardTitle>
                <CardDescription className="text-[10px] uppercase font-black tracking-widest text-primary">Marks by date</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-8">
                {analyticsLoading ? <Loader2 className="animate-spin text-primary mx-auto" /> : 
                  (Array.isArray(analytics) && analytics.length > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                      <XAxis dataKey="_id" stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="avgScore" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAvg)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-20 opacity-30 italic font-black tracking-widest uppercase text-[10px]">No data yet</div>
                  )
                }
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 7️⃣ QUICK ACTIONS */}
        <motion.div variants={itemVariants} className="pt-8 border-t border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Button variant="ghost" className="h-[140px] rounded-[40px] glass border border-white/5 flex flex-col gap-4 hover:bg-primary/10 hover:border-primary/20 transition-all font-black uppercase tracking-widest text-xs italic" onClick={() => navigate(ROUTES.HOD_EXAMS)}>
              <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-lg"><ClipboardList /></div>
              New Test
            </Button>
            <Button variant="ghost" className="h-[140px] rounded-[40px] glass border border-white/5 flex flex-col gap-4 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all font-black uppercase tracking-widest text-xs italic" onClick={() => navigate(ROUTES.HOD_FACULTY)}>
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 shadow-lg"><Users /></div>
              Add Teacher
            </Button>
            <Button variant="ghost" className="h-[140px] rounded-[40px] glass border border-white/5 flex flex-col gap-4 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all font-black uppercase tracking-widest text-xs italic" onClick={() => navigate(ROUTES.HOD_REPORTS)}>
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-lg"><BarChart3 /></div>
              Results
            </Button>
            <Button variant="ghost" className="h-[140px] rounded-[40px] glass border border-white/5 flex flex-col gap-4 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all font-black uppercase tracking-widest text-xs italic" onClick={() => navigate("/hod/monitoring")}>
              <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 shadow-lg"><Ban /></div>
              Alerts
            </Button>
          </div>
        </motion.div>

      </motion.div>
    </MainLayout>
  );
}
