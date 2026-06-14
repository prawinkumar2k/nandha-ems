import { useState, useEffect } from "react";
import { Monitor, ServerOff, PlayCircle, Lock, Cpu, Network, Sparkles, RefreshCw, Plus, Trash2 } from "lucide-react";
import { useSocket } from "@/contexts/SocketContext";
import { apiClient } from "@/core/api/client";
import { motion } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { getAdminNav } from "@/core/constants/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const STATUS_COLORS = {
  online: "bg-green-500",
  offline: "bg-gray-500",
  exam_running: "bg-blue-500",
  locked: "bg-red-500",
  pending: "bg-yellow-500",
};

export default function LabTopology() {
  const [labs, setLabs] = useState([]);
  const [devices, setDevices] = useState([]);
  const { socket } = useSocket();
  const [isAddLabOpen, setIsAddLabOpen] = useState(false);
  const [newLab, setNewLab] = useState({ name: "", labCode: "", subnet: "", capacity: 30 });

  useEffect(() => {
    fetchTopology();

    if (socket) {
      socket.on("device-update", (device) => {
        setDevices((prev) => prev.map((d) => (d._id === device._id ? device : d)));
      });
      socket.on("device-update-bulk", fetchTopology);
    }
    return () => {
      if (socket) {
        socket.off("device-update");
        socket.off("device-update-bulk");
      }
    };
  }, [socket]);

  const fetchTopology = async () => {
    try {
      const [labsRes, devicesRes] = await Promise.all([
        apiClient.get("/api/labs"),
        apiClient.get("/api/devices"),
      ]);
      setLabs(labsRes);
      setDevices(devicesRes);
    } catch (err) {
      console.error("Failed to fetch topology", err);
    }
  };

  const handleAddDevice = async (labId) => {
    try {
      await apiClient.post("/api/devices/mock", { labId });
      fetchTopology();
    } catch (err) {
      console.error("Failed to add mock device", err);
    }
  };

  const handleCreateLab = async () => {
    try {
      await apiClient.post("/api/labs", newLab);
      setIsAddLabOpen(false);
      setNewLab({ name: "", labCode: "", subnet: "", capacity: 30 });
      fetchTopology();
    } catch (err) {
      console.error("Failed to create lab", err);
    }
  };

  const handleDeleteLab = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lab? All associated devices will be unassigned.")) return;
    try {
      await apiClient.delete(`/api/labs/${id}`);
      fetchTopology();
    } catch (err) {
      console.error("Failed to delete lab", err);
    }
  };

  return (
    <MainLayout navItems={NAV} title="Lab Topology">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-10"
      >
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 uppercase italic text-foreground">
               Network Map <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground/50 mt-1">Live Lab Topology</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex gap-4">
            <Button variant="outline" className="rounded-xl h-12 px-6 border-white/10 hover:bg-white/5 font-black text-xs uppercase tracking-widest" onClick={() => fetchTopology()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button className="rounded-xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => setIsAddLabOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Lab
            </Button>
          </motion.div>
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {labs.map((lab) => {
            const labDevices = devices.filter(d => d.labId?._id === lab._id || d.labId === lab._id);
            
            return (
              <motion.div variants={itemVariants} key={lab._id} className="glass rounded-[32px] p-6 border border-white/5 relative overflow-hidden group shadow-2xl shadow-black/10 hover:border-primary/20 transition-colors">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Network className="w-4 h-4 text-primary" /> {lab.name}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{lab.subnet}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium">{labDevices.length} / {lab.capacity}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Nodes</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleAddDevice(lab._id)} title="Add Mock PC">
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteLab(lab._id)} title="Delete Lab">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {labDevices.map(device => (
                  <div 
                    key={device._id} 
                    title={`${device.deviceId}\n${device.status}`}
                    className="aspect-square flex items-center justify-center rounded-md bg-white/5 border border-white/10 relative group cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${STATUS_COLORS[device.status] || "bg-gray-500"}`} />
                    <Monitor className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {labs.length === 0 && (
          <motion.div variants={itemVariants} className="glass border border-white/10 rounded-[32px] p-12 text-center text-muted-foreground shadow-sm mt-6 flex flex-col items-center justify-center min-h-[300px]">
            <ServerOff className="w-16 h-16 mb-6 opacity-20 text-primary" />
            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2 italic">No Labs Configured</h3>
            <p className="text-sm font-medium opacity-60">There are currently no engineering labs registered in the zero-trust network.</p>
          </motion.div>
        )}
      </motion.div>

      <Dialog open={isAddLabOpen} onOpenChange={setIsAddLabOpen}>
        <DialogContent className="glass border-white/10 sm:max-w-[425px] rounded-[32px] p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black uppercase italic tracking-widest text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" /> New Lab
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Lab Name</label>
              <Input 
                className="bg-white/5 border-white/10 rounded-xl"
                placeholder="e.g. Cyber Security Lab A" 
                value={newLab.name} 
                onChange={e => setNewLab({...newLab, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Lab Code</label>
              <Input 
                className="bg-white/5 border-white/10 rounded-xl"
                placeholder="e.g. CSLAB-A" 
                value={newLab.labCode} 
                onChange={e => setNewLab({...newLab, labCode: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Subnet (Optional)</label>
              <Input 
                className="bg-white/5 border-white/10 rounded-xl font-mono"
                placeholder="e.g. 192.168.100.x" 
                value={newLab.subnet} 
                onChange={e => setNewLab({...newLab, subnet: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Capacity</label>
              <Input 
                type="number"
                className="bg-white/5 border-white/10 rounded-xl"
                value={newLab.capacity} 
                onChange={e => setNewLab({...newLab, capacity: parseInt(e.target.value)})} 
              />
            </div>
          </div>
          <DialogFooter className="mt-8 gap-2">
            <Button variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-xs" onClick={() => setIsAddLabOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateLab} className="rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
              Create Lab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
