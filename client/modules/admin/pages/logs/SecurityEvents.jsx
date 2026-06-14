import { useState, useEffect } from "react";
import { ShieldAlert, Shield, AlertTriangle, AlertCircle, RefreshCw, Activity, Terminal } from "lucide-react";
import { apiClient } from "@/core/api/client";
import { motion } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { getAdminNav } from "@/core/constants/navigation";
import { Button } from "@/components/ui/button";

const NAV = getAdminNav();

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function SecurityEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await apiClient.get("/api/security-events");
      setEvents(res);
    } catch (err) {
      console.error("Failed to fetch security events", err);
    }
  };

  const handleSimulate = async () => {
    try {
      await apiClient.post("/api/security-events", {
        eventType: "Malware Signature Detected",
        severity: "critical",
        description: "Anomalous background process identified during live execution."
      });
      fetchEvents();
    } catch (err) {
      console.error("Failed to simulate event", err);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical": return <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-500 text-[10px] uppercase font-black tracking-widest border border-rose-500/20">Critical</span>;
      case "high": return <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-500 text-[10px] uppercase font-black tracking-widest border border-orange-500/20">High</span>;
      case "medium": return <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] uppercase font-black tracking-widest border border-yellow-500/20">Medium</span>;
      default: return <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 text-[10px] uppercase font-black tracking-widest border border-blue-500/20">Low</span>;
    }
  };

  return (
    <MainLayout navItems={NAV} title="Security Events">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-10"
      >
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 uppercase italic text-foreground">
               Threat Intelligence <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground/50 mt-1">Live Security Events</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex gap-4">
            <Button variant="outline" className="rounded-xl h-12 px-6 border-white/10 hover:bg-white/5 font-black text-xs uppercase tracking-widest" onClick={() => fetchEvents()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button variant="destructive" className="rounded-xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20" onClick={handleSimulate}>
              <Terminal className="w-4 h-4 mr-2" /> Simulate Threat
            </Button>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="glass rounded-[40px] border border-white/5 overflow-hidden shadow-2xl shadow-black/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-primary border-b border-white/5 uppercase text-[10px] tracking-widest font-black">
                <tr>
                  <th className="px-8 py-6">Timestamp</th>
                  <th className="px-6 py-6">Severity</th>
                  <th className="px-6 py-6">Event Type</th>
                  <th className="px-6 py-6">Description</th>
                  <th className="px-6 py-6">Target Device</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-white/5">
              {events.map((event, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5 font-mono text-muted-foreground whitespace-nowrap">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-5">{getSeverityBadge(event.severity)}</td>
                  <td className="px-6 py-5 font-bold uppercase tracking-widest text-[10px] text-foreground">{event.eventType}</td>
                  <td className="px-6 py-5 text-muted-foreground">{event.metadata?.description || event.description || "N/A"}</td>
                  <td className="px-6 py-5 font-mono text-muted-foreground truncate max-w-[200px]">
                    {event.deviceId?.hostname || event.deviceId?.deviceId || "Unknown Node"}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Shield className="w-12 h-12 text-primary/30 mb-4 animate-pulse" />
                      <p className="text-lg font-black uppercase tracking-widest text-foreground/80 italic">No Security Events</p>
                      <p className="text-sm font-medium text-muted-foreground/60 mt-2">The zero-trust network is secure. Awaiting violation triggers from Electron.</p>
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
