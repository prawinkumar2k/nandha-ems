import { motion } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { DataTableWrapper } from "@/shared/components/Table/DataTableWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/core/constants/routes";
import { useNavigate } from "react-router-dom";
import { Monitor, Plus, Wifi, WifiOff, RefreshCw, Cpu, Activity, Shield} from "lucide-react";
import { getAdminNav } from "@/core/constants/navigation";

const NAV = getAdminNav();

import { useQuery } from "@tanstack/react-query";
import { deviceService } from "@/core/api/services";
import { timeAgo } from "@/core/utils/helpers";

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

export default function DeviceList() {
  const navigate = useNavigate();

  const { data: devices, isLoading, refetch } = useQuery({
    queryKey: ["admin-devices-list"],
    queryFn: () => deviceService.getAll(),
  });

  const cols = [
    { key: "deviceId", header: "Device ID", sortable: true, render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Monitor className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="font-bold tracking-tight">{r.deviceId}</p>
      </div>
    )},
    { key: "macAddress", header: "MAC / Ident", render: (r) => <span className="text-[10px] font-mono text-muted-foreground">{r.macAddress}</span> },
    { key: "lab", header: "Assigned Lab", sortable: true, render: (r) => r.labId?.name || "UNASSIGNED" },
    { key: "status", header: "Status", sortable: true, render: (r) => {
      const isOnline = r.lastHeartbeat && (new Date() - new Date(r.lastHeartbeat)) < 60000;
      const statusColor = r.status === "approved" ? (isOnline ? "text-emerald-500" : "text-rose-500") : "text-primary";
      const statusText = r.status === "approved" ? (isOnline ? "Active" : "Offline") : r.status;
      return (
        <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : (r.status === 'approved' ? "bg-rose-500" : "bg-primary animate-bounce")}`} />
          {statusText}
        </span>
      );
    }},
    { key: "lastHeartbeat", header: "Last Active", render: (r) => <span className="text-[10px] font-medium text-muted-foreground/60">{r.lastHeartbeat ? timeAgo(r.lastHeartbeat) : "Never"}</span> },
    { key: "actions", header: "", render: (r) => (
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5" onClick={() => navigate(`${ROUTES.ADMIN_DEVICES}/${r._id}`)}>
          Look
        </Button>
      </div>
    )},
  ];

  const getActiveCount = () => {
    return devices?.filter(d => d.lastHeartbeat && (new Date() - new Date(d.lastHeartbeat)) < 60000).length || 0;
  };

  const getOfflineCount = () => {
    return devices?.filter(d => !d.lastHeartbeat || (new Date() - new Date(d.lastHeartbeat)) >= 60000).length || 0;
  };

  const stats = [
    { label: "All PCs", value: devices?.length || 0, color: "text-foreground", icon: <Cpu className="w-4 h-4" /> },
    { label: "Active", value: getActiveCount(), color: "text-emerald-500", icon: <Wifi className="w-4 h-4" /> },
    { label: "Offline", value: getOfflineCount(), color: "text-rose-500", icon: <WifiOff className="w-4 h-4" /> },
    { label: "PC Usage", value: devices?.length ? `${Math.round((getActiveCount() / devices.length) * 100)}%` : "0%", color: "text-primary", icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <MainLayout navItems={NAV} title="PC List">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground uppercase">
              Computers 
            </h2>
            <p className="text-xs text-primary font-black uppercase tracking-[0.2em]">Control Lab PCs</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex gap-4">
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-white/10 hover:bg-white/5 font-black text-xs uppercase tracking-widest" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => navigate(ROUTES.ADMIN_DEVICES_REGISTER)}>
              <Plus className="w-4 h-4 mr-2" /> Add PC
            </Button>
          </motion.div>
        </div>

        {/* Vital Signs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <motion.div key={i} variants={itemVariants} className="glass rounded-[24px] p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:scale-150 transition-transform">
                {s.icon}
              </div>
              <p className={`text-3xl font-black tracking-tight ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[40px] glass border-white/5 relative overflow-hidden shadow-2xl shadow-black/10">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-8 lg:px-8">
              <div>
                <CardTitle className="text-xl font-black italic uppercase">PC List</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">List of all computers in lab</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 lg:p-4">
              <DataTableWrapper 
                columns={cols} 
                data={devices || []} 
                isLoading={isLoading}
                searchKeys={["hostname", "ipAddress", "status"]}
                searchPlaceholder="Search PCs..." 
                pageSize={10} 
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
