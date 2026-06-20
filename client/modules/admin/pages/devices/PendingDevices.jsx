import { useState, useEffect } from "react";
import { Check, X, Server, Shield,  RefreshCw, Terminal } from "lucide-react";
import { apiClient } from "@/core/api/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { getAdminNav } from "@/core/constants/navigation";

const NAV = getAdminNav();

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function PendingDevices() {
  const [devices, setDevices] = useState([]);
  const [labs, setLabs] = useState([]);
  const [selectedLabs, setSelectedLabs] = useState({});

  useEffect(() => {
    fetchPending();
    fetchLabs();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await apiClient.get("/api/devices/pending");
      setDevices(res);
    } catch (err) {
      console.error("Failed to fetch pending devices", err);
    }
  };

  const fetchLabs = async () => {
    try {
      const res = await apiClient.get("/api/labs");
      setLabs(res);
    } catch (err) {
      console.error("Failed to fetch labs", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const labId = selectedLabs[id] || null;
      await apiClient.patch(`/api/devices/${id}/approve`, { labId });
      fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await apiClient.patch(`/api/devices/${id}/revoke`, {});
      fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateDevice = async () => {
    try {
      const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      await apiClient.post("/api/devices/register", {
        deviceId: `PENDING-PC-${randomId}`,
        macAddress: `1A:2B:3C:4D:5E:${Math.floor(Math.random() * 99).toString().padStart(2, "0")}`,
        cpuId: `INTEL-PENDING-${randomId}`,
        machineFingerprint: `NEW-FINGERPRINT-${randomId}`
      });
      fetchPending();
    } catch (err) {
      console.error("Failed to simulate device connection", err);
    }
  };

  return (
    <MainLayout navItems={NAV} title="Pending Devices">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-10"
      >
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 uppercase italic text-foreground">
               Approvals 
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground/50 mt-1">Pending Devices</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex gap-4">
            <Button variant="outline" className="rounded-xl h-12 px-6 border-white/10 hover:bg-white/5 font-black text-xs uppercase tracking-widest" onClick={() => fetchPending()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button variant="secondary" className="rounded-xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-white/5 bg-white/10 hover:bg-white/20 text-white border border-white/10" onClick={handleSimulateDevice}>
              <Terminal className="w-4 h-4 mr-2" /> Simulate Connection
            </Button>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="glass rounded-[40px] border border-white/5 overflow-hidden shadow-2xl shadow-black/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-primary border-b border-white/5 uppercase text-[10px] tracking-widest font-black">
                <tr>
                  <th className="px-8 py-6">Device ID</th>
                  <th className="px-6 py-6">MAC Address</th>
                  <th className="px-6 py-6">CPU ID</th>
                  <th className="px-6 py-6">Fingerprint</th>
                  <th className="px-6 py-6">Assign Lab</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-white/5">
              {devices.map(device => (
                <tr key={device._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5 font-mono text-foreground transition-colors">{device.deviceId}</td>
                  <td className="px-6 py-5 font-mono text-muted-foreground">{device.macAddress}</td>
                  <td className="px-6 py-5 font-mono text-muted-foreground truncate max-w-[150px]">{device.cpuId}</td>
                  <td className="px-6 py-5 font-mono text-muted-foreground truncate max-w-[150px]">{device.machineFingerprint}</td>
                  <td className="px-6 py-5">
                    <select
                      className="bg-background border border-white/10 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 transition-colors w-full min-w-[140px]"
                      value={selectedLabs[device._id] || ""}
                      onChange={(e) => setSelectedLabs(prev => ({ ...prev, [device._id]: e.target.value }))}
                    >
                      <option value="">Unassigned</option>
                      {labs.map(lab => (
                        <option key={lab._id} value={lab._id}>{lab.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-5 flex justify-end gap-3">
                    <Button size="sm" className="h-9 px-4 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all" onClick={() => handleApprove(device._id)}>
                      <Check className="w-3 h-3 mr-2" /> Approve
                    </Button>
                    <Button size="sm" className="h-9 px-4 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all" onClick={() => handleReject(device._id)}>
                      <X className="w-3 h-3 mr-2" /> Reject
                    </Button>
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Shield className="w-12 h-12 text-primary/30 mb-4 animate-pulse" />
                      <p className="text-lg font-black uppercase tracking-widest text-foreground/80 italic">No Pending Devices</p>
                      <p className="text-sm font-medium text-muted-foreground/60 mt-2">Waiting for new Electron clients to connect securely.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
