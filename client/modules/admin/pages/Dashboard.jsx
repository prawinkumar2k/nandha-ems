import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { StatCard } from "@/shared/components/StatCard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/core/constants/routes";
import { reportService, deviceService, labService, logService } from "@/core/api/services";
import { useSocket } from "@/contexts/SocketContext";
import {
  Monitor, BookOpen, BarChart3, Shield,
  Activity, GraduationCap, UserCheck, AlertTriangle, Plus, Sparkles, Zap, Lock, Unlock, RefreshCcw
} from "lucide-react";
import { getAdminNav } from "@/core/constants/navigation";
import { DeviceGrid } from "../components/Dashboard/DeviceGrid";
import { ActivityFeed } from "../components/Dashboard/ActivityFeed";
import { ViolationPanel } from "../components/Dashboard/ViolationPanel";
import { toast } from "sonner";

const NAV = getAdminNav();

export default function AdminDashboard() {
  const navigate = useNavigate();
  const socket = useSocket();
  const queryClient = useQueryClient();
  const [liveActivities, setLiveActivities] = useState([]);
  const [liveViolations, setLiveViolations] = useState([]);

  // 1. Static Initial Data
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => reportService.getSystemStats(),
  });

  const { data: devices, isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ["admin-devices"],
    queryFn: () => deviceService.getAll(),
  });

  // Fetch initial telemetry logs
  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        const [activityRes, violationRes] = await Promise.all([
          logService.getActivityLogs({ limit: 20 }),
          logService.getViolations({ limit: 10 })
        ]);
        if (Array.isArray(activityRes)) setLiveActivities(activityRes.slice(0, 20));
        if (Array.isArray(violationRes)) setLiveViolations(violationRes.slice(0, 10));
      } catch (err) {
        console.error("Failed to load initial logs", err);
      }
    };
    fetchInitialLogs();
  }, []);

  // 2. Socket Listeners (Throttled & Optimized)
  useEffect(() => {
    if (!socket) return;

    let deviceUpdateTimeout = null;

    socket.on("stats-update", (newStats) => {
      queryClient.setQueryData(["admin-dashboard-stats"], (old) => ({ ...old, ...newStats }));
    });

    socket.on("device-update", () => {
      // Throttle device refetching to prevent network spam
      if (!deviceUpdateTimeout) {
        refetchDevices();
        deviceUpdateTimeout = setTimeout(() => { deviceUpdateTimeout = null; }, 10000); 
      }
    });

    socket.on("new-violation", (violation) => {
      setLiveViolations(prev => [violation, ...prev].slice(0, 10));
    });

    socket.on("new-activity", (activity) => {
      setLiveActivities(prev => [activity, ...prev].slice(0, 20));
    });

    return () => {
      socket.off("stats-update");
      socket.off("device-update");
      socket.off("new-violation");
      socket.off("new-activity");
      if (deviceUpdateTimeout) clearTimeout(deviceUpdateTimeout);
    };
  }, [socket, queryClient]); // Removed refetchDevices from deps to avoid potential loops

  const statConfig = [
    { label: "Total Students", value: stats?.students ?? 0, icon: <GraduationCap className="w-5 h-5" />, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Total Teachers", value: stats?.faculty ?? 0, icon: <UserCheck className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
    { label: "PCs Ready", value: stats?.online ?? 0, icon: <Monitor className="w-5 h-5" />, color: "bg-purple-500/10 text-purple-500" },
    { label: "Tests Running", value: stats?.activeExams ?? 0, icon: <BookOpen className="w-5 h-5" />, color: "bg-accent/10 text-accent" },
    { label: "Alerts", value: stats?.violationsToday ?? 0, icon: <AlertTriangle className="w-5 h-5" />, color: "bg-red-500/10 text-red-500" },
    { label: "System OK", value: "Good", icon: <Zap className="w-5 h-5" />, color: "bg-amber-500/10 text-amber-500" },
  ];

  return (
    <MainLayout navItems={NAV} title="Main Panel">
      <div className="space-y-8 pb-10">
        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 uppercase italic">
               Main View <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground/50 mt-1">Home</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => { refetchStats(); refetchDevices(); }} className="rounded-xl h-12 w-12 border-white/10 glass hover:bg-white/10">
              <RefreshCcw className="w-5 h-5" />
            </Button>
            {devices && devices.some(d => d.status === "locked") ? (
              <Button 
                variant="default" 
                className="rounded-xl h-12 px-6 font-black shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 uppercase text-xs italic border-0" 
                onClick={async () => { 
                  try { 
                    await labService.sendCommand("unlock_all"); 
                    toast.success("All labs unlocked"); 
                    refetchDevices();
                    refetchStats();
                  } catch (e) { 
                    toast.error("Failed to unlock labs"); 
                  } 
                }}
              >
                <Unlock className="w-5 h-5" /> UNLOCK LABS
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                className="rounded-xl h-12 px-6 font-black shadow-lg shadow-red-500/20 gap-2 uppercase text-xs italic" 
                onClick={async () => { 
                  try { 
                    await labService.sendCommand("lock_all"); 
                    toast.success("All labs locked"); 
                    refetchDevices();
                    refetchStats();
                  } catch (e) { 
                    toast.error("Failed to lock labs"); 
                  } 
                }}
              >
                <Lock className="w-5 h-5" /> LOCK LABS
              </Button>
            )}
            <Button onClick={() => navigate(ROUTES.ADMIN_USERS_ADD)} className="rounded-xl h-12 px-6 font-black shadow-lg shadow-primary/20 gap-2 uppercase text-xs italic">
              <Plus className="w-5 h-5" /> ADD USER
            </Button>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
          {statConfig.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              {statsLoading ? <Skeleton className="h-32 w-full rounded-3xl" /> : <StatCard {...s} />}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Computers Grid */}
          <div className="xl:col-span-8 space-y-6">
            <Card className="rounded-[40px] glass border-white/5 overflow-hidden">
              <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight uppercase italic">Computer List</CardTitle>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">PC State</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Active</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> In use</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-500" /> Off</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 h-[550px] overflow-y-auto custom-scrollbar p-8">
                <DeviceGrid devices={devices} isLoading={devicesLoading} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <ViolationPanel violations={liveViolations} />
               <Card className="rounded-[32px] glass hover:border-primary/20 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg font-black tracking-tight uppercase italic">System OK</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">Check Info</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                         <span className="text-muted-foreground">Status</span>
                         <span className="text-emerald-500">Ready</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <div className="h-full bg-emerald-500 w-full rounded-full shadow-lg shadow-emerald-500/20" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                         <span className="text-muted-foreground">Speed</span>
                         <span className="text-primary italic">42ms</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <div className="h-full bg-primary w-11/12 rounded-full shadow-lg shadow-primary/20" />
                       </div>
                    </div>
                  </CardContent>
               </Card>
            </div>
          </div>

          {/* Recent Actions */}
          <div className="xl:col-span-4">
            <ActivityFeed activities={liveActivities} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
