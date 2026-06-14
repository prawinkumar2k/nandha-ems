import { useState, useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { apiClient } from "@/core/api/client";
import { Monitor, AlertTriangle, PlayCircle, StopCircle, Lock, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function LiveMonitoringCenter() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [students, setStudents] = useState(new Map());
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch active exams
    apiClient.get("/api/exams?status=active").then(res => setExams(res));
  }, []);

  useEffect(() => {
    if (socket && selectedExam) {
      socket.emit("join-monitoring", selectedExam);

      socket.on("live-frame-update", (data) => {
        setStudents(prev => {
          const map = new Map(prev);
          map.set(data.deviceId, { ...map.get(data.deviceId), ...data });
          return map;
        });
      });

      socket.on("new-security-violation", (violation) => {
        // Update student violation count or display alert
      });

      return () => {
        socket.emit("leave-monitoring", selectedExam);
        socket.off("live-frame-update");
        socket.off("new-security-violation");
      };
    }
  }, [socket, selectedExam]);

  const handleAction = async (command, targetId) => {
    socket.emit("send-command", { targetIds: [targetId], command, payload: null });
  };

  const handleLabAction = async (command) => {
    const targetIds = Array.from(students.keys());
    socket.emit("send-command", { targetIds, command, payload: null });
  };

  return (
    <MainLayout navItems={NAV} title="Live Monitoring">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-10"
      >
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 uppercase italic text-foreground">
               Command Center <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground/50 mt-1">Live Exams</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex gap-4">
            <select 
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm glass focus:outline-none focus:border-primary/50 transition-colors"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="" className="bg-background">Select Exam Session...</option>
              {exams.map(ex => <option key={ex._id} value={ex._id} className="bg-background">{ex.title}</option>)}
            </select>
            <Button className="rounded-xl h-12 px-6 font-black shadow-lg shadow-primary/20 gap-2 uppercase text-xs italic" onClick={() => handleLabAction("device_lock")} disabled={!selectedExam}>
              <Lock className="w-4 h-4" /> Lock Lab
            </Button>
            <Button variant="destructive" className="rounded-xl h-12 px-6 font-black shadow-lg shadow-red-500/20 gap-2 uppercase text-xs italic" onClick={() => handleLabAction("force_submit")} disabled={!selectedExam}>
              <StopCircle className="w-4 h-4" /> Force Submit All
            </Button>
          </motion.div>
        </div>

        {!selectedExam ? (
          <motion.div variants={itemVariants} className="glass border border-white/10 rounded-[32px] p-12 text-center text-muted-foreground shadow-sm mt-6 flex flex-col items-center justify-center min-h-[400px]">
            <Monitor className="w-16 h-16 mb-6 opacity-20 text-primary animate-pulse" />
            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2 italic">Awaiting Session</h3>
            <p className="text-sm font-medium opacity-60">Select an active examination to begin live surveillance.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from(students.values()).map(student => (
              <motion.div variants={itemVariants} key={student.deviceId} className="glass rounded-[24px] border border-white/5 overflow-hidden flex flex-col relative group shadow-2xl shadow-black/10 hover:border-primary/20 transition-colors">
              <div className="aspect-video bg-black relative">
                {student.frame ? (
                  <img src={`data:image/jpeg;base64,${student.frame}`} alt="Live Feed" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                    No Feed
                  </div>
                )}
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="destructive" onClick={() => handleAction("device_lock", student.deviceId)}>
                    <Lock className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="default" onClick={() => handleAction("force_submit", student.deviceId)}>
                    <StopCircle className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/monitoring/session/${student.deviceId}`)}>
                    View
                  </Button>
                </div>
              </div>
              <div className="p-3 border-t border-white/10 bg-white/5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{student.studentId || "Unknown Student"}</p>
                  <p className="text-xs text-muted-foreground font-mono">{student.deviceId}</p>
                </div>
                {student.violations > 0 && (
                  <div className="flex items-center text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">
                    <ShieldAlert className="w-3 h-3 mr-1" /> {student.violations}
                  </div>
                )}
              </div>
              </motion.div>
            ))}

            {students.size === 0 && (
              <motion.div variants={itemVariants} className="col-span-full py-20 text-center flex flex-col items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500/50 mb-4" />
                <p className="text-lg font-black uppercase tracking-widest text-muted-foreground">No Active Students</p>
                <p className="text-xs text-muted-foreground/60 mt-2 font-medium">Waiting for devices to establish a secure connection...</p>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
