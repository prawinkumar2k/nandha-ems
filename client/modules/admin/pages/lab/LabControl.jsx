import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/core/constants/routes";
import { 
  Monitor, Power, PowerOff, Lock, Unlock, RefreshCw, Volume2, 
  VolumeX, Wifi, Shield, LayoutGrid, Terminal, Cpu, Sparkles, Info, Zap 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { getAdminNav } from "@/core/constants/navigation";

const NAV = getAdminNav();


const STATUS_THEMES = {
  online: { 
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20",
    glow: "bg-emerald-500/50"
  },
  offline: { 
    bg: "bg-white/5 border-white/5 text-muted-foreground/40 hover:bg-white/10",
    glow: "bg-muted-foreground/20"
  },
  exam: { 
    bg: "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20",
    glow: "bg-primary/50"
  },
};

const COMMANDS = [
  { label: "Lock All", icon: <Lock className="w-4 h-4" />, command: "lock_all", color: "text-rose-500 border-rose-500/20 hover:bg-rose-500/10" },
  { label: "Unlock All", icon: <Unlock className="w-4 h-4" />, command: "unlock_all", color: "text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10" },
  { label: "Force Restart", icon: <RefreshCw className="w-4 h-4" />, command: "restart_all", color: "text-blue-500 border-blue-500/20 hover:bg-blue-500/10" },
  { label: "Exam Mode", icon: <Shield className="w-4 h-4" />, command: "exam_mode", color: "text-primary border-primary/20 hover:bg-primary/10" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

import { useSocket } from "@/contexts/SocketContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentService, deviceService, labService } from "@/core/api/services";
import { timeAgo } from "@/core/utils/helpers";

export default function LabControl() {
  const [activeLab, setActiveLab] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [detailDevice, setDetailDevice] = useState(null);
  const { toast } = useToast();
  const socket = useSocket();
  const queryClient = useQueryClient();

  const { data: depts } = useQuery({
    queryKey: ["depts-list"],
    queryFn: async () => {
      const data = await departmentService.getAll();
      if (data?.length > 0 && !activeLab) setActiveLab(data[0]._id);
      return data;
    },
  });

  const { data: allDevices, refetch } = useQuery({
    queryKey: ["admin-devices-list"],
    queryFn: () => deviceService.getAll(),
  });

  // Socket updates
  useEffect(() => {
    if (!socket) return;
    socket.on("device-update", (updated) => {
      queryClient.setQueryData(["admin-devices-list"], (old) => 
        old?.map(d => d._id === updated._id ? updated : d)
      );
    });
    return () => socket.off("device-update");
  }, [socket, queryClient]);

  const computers = allDevices?.filter(d => d.department?._id === activeLab) || [];

  const toggle = (id) => setSelected((prev) => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const sendCommand = async (cmd, targetOverride = null) => {
    const targets = targetOverride ? [targetOverride] : (selected.size > 0 ? [...selected] : computers.map(c => c._id));
    try {
      await labService.sendCommand(cmd, { targetIds: targets });
      toast({ 
        title: "Action Sent", 
        description: `Command sent to ${targets.length} computer(s).` 
      });
      refetch();
    } catch (err) {
      toast({ title: "Action Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <MainLayout navItems={NAV} title="Lab Management">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 relative"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3 text-foreground italic uppercase">
              Controls <Shield className="w-6 h-6 text-primary animate-pulse" />
            </h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">Manage all lab computers</p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex p-2 bg-white/5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
            {depts?.map((dept) => (
              <button key={dept._id} onClick={() => { setActiveLab(dept._id); setSelected(new Set()); }}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeLab === dept._id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground/60 hover:text-foreground"}`}>
                {dept.code}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Controls */}
          <motion.div variants={itemVariants} className="xl:col-span-3 space-y-6">
            <Card className="rounded-[40px] glass border-white/5 relative overflow-hidden h-fit shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black italic uppercase">Manage PCs</CardTitle>
                    <CardDescription className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Lab Manager</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 rounded-[32px] bg-black/40 border border-white/5 mb-2 shadow-inner group">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-3 group-hover:text-primary transition-colors text-center font-mono">--- CHOSEN ---</p>
                  <div className="text-center">
                    <p className="text-5xl font-black italic tracking-tighter text-foreground leading-none">
                      {selected.size > 0 ? String(selected.size).padStart(2, "0") : String(computers.length).padStart(2, "0")} 
                    </p>
                    <p className="text-[10px] font-black uppercase mt-1 tracking-widest text-primary/60">Selected PCs</p>
                  </div>
                </div>
                {COMMANDS.map((cmd) => (
                  <Button key={cmd.command} variant="outline" className={`w-full justify-start rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest group transition-all relative overflow-hidden border-white/5 bg-white/5 ${cmd.color}`} onClick={() => sendCommand(cmd.command)}>
                    {cmd.icon}
                    <span className="ml-4">{cmd.label}</span>
                    <div className="absolute -right-4 top-0 h-full w-12 bg-white/5 skew-x-12 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                       <Zap className="w-4 h-4" />
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Live Alerts Panel */}
            <div className="glass rounded-[32px] p-6 border border-white/5 space-y-4">
               <div className="flex items-center justify-between font-black uppercase tracking-widest text-[10px]">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Live Status</span>
                  <span className="text-muted-foreground/40 text-[8px]">Real-time</span>
               </div>
               <div className="space-y-3 opacity-60 italic text-[9px] font-medium leading-relaxed font-mono">
                  <p className="text-emerald-500/80">{">>>"} Lab is active</p>
                  <p className="text-primary/80">{">>>"} Monitoring {depts?.find(d => d._id === activeLab)?.code} Lab</p>
                  <p className="text-muted-foreground/40">{">>>"} Reading computer data...</p>
               </div>
            </div>
          </motion.div>

          {/* Computers Grid */}
          <motion.div variants={itemVariants} className="xl:col-span-9">
            <Card className="rounded-[40px] glass border-white/5 relative overflow-hidden shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-8 lg:px-8">
                <div>
                  <CardTitle className="text-xl font-black italic uppercase">Computer List</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">Live view of all machines</CardDescription>
                </div>
                <div className="flex gap-6 items-center">
                  {Object.entries(STATUS_THEMES).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${v.glow} ${k !== 'offline' ? 'animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.3)]' : ''}`} />
                       <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{
                         k === 'online' ? 'Active' : k === 'offline' ? 'Power Off' : 'In Test'
                       }</span>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5">
                  {computers.map((pc) => (
                    <motion.div 
                      key={pc._id} 
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={`relative flex flex-col items-center justify-center aspect-square rounded-[28px] border-2 transition-all p-4 text-center overflow-hidden group
                        ${STATUS_THEMES[pc.status]?.bg || STATUS_THEMES.offline.bg}
                        ${selected.has(pc._id) ? "ring-2 ring-primary ring-offset-4 ring-offset-background border-primary" : "border-transparent"}`}
                    >
                      {/* Interaction Layer */}
                      <div className="absolute inset-0 z-10" onClick={() => toggle(pc._id)} />
                      
                      {/* Computer Options */}
                      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                         <button onClick={(e) => { e.stopPropagation(); setDetailDevice(pc); }} className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center hover:bg-primary transition-colors">
                            <Info className="w-3 h-3 text-white" />
                         </button>
                      </div>

                      <Monitor className={`w-10 h-10 mb-3 transition-all duration-500 z-0 ${selected.has(pc._id) ? "scale-110 text-primary" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"}`} />
                      <span className="text-[11px] font-black tracking-tight uppercase leading-none z-0">{pc.hostname}</span>
                      
                      {pc.currentStudent && (
                        <div className="absolute bottom-3 left-0 w-full px-2 z-0">
                          <p className="text-[7px] font-black uppercase tracking-[0.2em] bg-white/10 py-1 rounded-full text-white/50">{pc.currentStudent.name}</p>
                        </div>
                      )}

                      <div className={`absolute top-4 left-4 w-1.5 h-1.5 rounded-full ${STATUS_THEMES[pc.status]?.glow || STATUS_THEMES.offline.glow} ${pc.status !== "offline" ? "animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" : ""}`} />
                    </motion.div>
                  ))}
                  {computers.length === 0 && (
                    <div className="col-span-full py-40 text-center glass rounded-[40px] border-dashed border-white/5 bg-white/5 shadow-inner">
                      <Cpu className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4 animate-pulse" />
                      <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">No PCs found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Computer Info Sidebar */}
        <AnimatePresence>
           {detailDevice && (
              <>
                 <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                    onClick={() => setDetailDevice(null)}
                 />
                 <motion.div 
                    initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed top-0 right-0 h-full w-full max-w-sm glass border-l border-white/5 z-[100] shadow-2xl p-8 flex flex-col"
                 >
                    <div className="flex justify-between items-center mb-10">
                       <h3 className="text-xl font-black italic uppercase">PC Info</h3>
                       <button onClick={() => setDetailDevice(null)} className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 text-muted-foreground" />
                       </button>
                    </div>

                    <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                       <div className="space-y-2 text-center pb-8 border-b border-white/5">
                          <div className="w-20 h-20 rounded-3xl bg-primary/10 mx-auto flex items-center justify-center shadow-2xl shadow-primary/20 mb-4 border border-primary/20">
                             <Monitor className="w-10 h-10 text-primary" />
                          </div>
                          <h4 className="text-2xl font-black italic">{detailDevice.hostname}</h4>
                          <Badge variant="outline" className={`rounded-xl py-1.5 px-4 font-black text-[10px] uppercase tracking-[0.2em] bg-white/5 border-white/10 ${detailDevice.status === 'online' ? 'text-emerald-500' : 'text-rose-500'}`}>
                             State: {detailDevice.status === 'online' ? 'Active' : 'Offline'}
                          </Badge>
                       </div>

                    <div className="grid grid-cols-2 gap-4">
                       {[
                          { label: "IP ADDRESS", value: detailDevice.ipAddress },
                          { label: "PC ID (MAC)", value: detailDevice.macAddress || "N/A" },
                          { label: "WINDOWS", value: detailDevice.os || "W11 Enterprise" },
                          { label: "LAST SEEN", value: detailDevice.lastSeen ? timeAgo(detailDevice.lastSeen) : "Never" },
                       ].map((stat, i) => (
                          <div key={i} className="space-y-1">
                             <p className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-widest">{stat.label}</p>
                             <p className="text-[11px] font-bold text-foreground font-mono truncate">{stat.value}</p>
                          </div>
                       ))}
                    </div>

                    <div className="space-y-4 pt-8">
                       <p className="text-[9px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Single PC Actions</p>
                       <div className="grid grid-cols-2 gap-3">
                          <Button onClick={() => sendCommand("lock", detailDevice._id)} className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20">Lock PC</Button>
                          <Button onClick={() => sendCommand("unlock", detailDevice._id)} className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">Unlock PC</Button>
                          <Button onClick={() => sendCommand("restart", detailDevice._id)} variant="outline" className="rounded-xl h-12 font-black text-[9px] uppercase tracking-widest border-white/10 glass col-span-2">Restart PC</Button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              </>
           )}
        </AnimatePresence>
      </motion.div>
    </MainLayout>
  );
}
