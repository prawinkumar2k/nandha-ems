import React, { useEffect, useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Monitor } from "lucide-react";
import { Modal } from "@/shared/components/Modal/Modal";
import { cn } from "@/core/utils/helpers";
import { Activity, ShieldAlert, Wifi, Monitor as MonitorIcon, Clock, BookOpen, AlertTriangle } from "lucide-react";

const ScreenCard = React.memo(({ s, onClick }) => (

  <Card 
    className="group relative rounded-[32px] overflow-hidden border-white/5 bg-black/40 hover:border-primary/50 transition-all cursor-pointer shadow-2xl" 
    onClick={() => onClick(s)}
  >
    <div className="aspect-video bg-black relative">
      <img src={s.frame} alt={s.studentName} className="w-full h-full object-contain" />
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-white uppercase italic truncate max-w-[120px]">{s.studentName}</p>
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{s.studentRoll || "LIVE"}</p>
          </div>
          <div className="flex items-center gap-2">
            {s.violationCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 rounded-lg text-[8px] font-black animate-pulse">
                {s.violationCount} ALERTS
              </Badge>
            )}
            <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  </Card>
));

export const LiveScreenGrid = ({ examId }) => {
  const socket = useSocket();
  const [screens, setScreens] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [debugInfo, setDebugInfo] = useState({ joins: 0, packets: 0, lastPacketTime: null });

  useEffect(() => {
    if (!socket || !examId) return;

    console.log(`🔌 [SURVEILLANCE] Connecting to room: monitoring-${examId}`);
    socket.emit("join-exam-room-monitoring", examId);
    setDebugInfo(d => ({ ...d, joins: d.joins + 1 }));

    const handleScreenUpdate = (data) => {
      console.log(`📥 RECEIVED screen-update: ${data.studentName} (${data.studentId})`);
      setDebugInfo(d => ({ ...d, packets: d.packets + 1, lastPacketTime: new Date() }));
      setScreens((prev) => {
        return {
          ...prev,
          [data.studentId]: {
            ...data,
            lastUpdate: new Date(),
          },
        };
      });
    };

    socket.on("screen-update", handleScreenUpdate);

    const cleanup = setInterval(() => {
      const now = new Date();
      setScreens((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((id) => {
          if (now - next[id].lastUpdate > 15000) { // Increased timeout to 15s
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 10000);

    return () => {
      socket.off("screen-update", handleScreenUpdate);
      clearInterval(cleanup);
    };
  }, [socket, examId]);

  const studentList = React.useMemo(() => Object.values(screens), [screens]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
          <Monitor className="text-primary w-5 h-5" /> Live Student Screens
        </h3>
        <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 font-black">
          {studentList.length} Active Feeds
        </Badge>
      </div>

      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
         <span className={cn("inline-flex items-center gap-2", socket?.connected ? "text-emerald-500" : "text-rose-500")}>
           <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
           {socket?.connected ? "Socket: Online" : "Socket: Link Lost"}
         </span>
         <span className="border-l border-white/10 pl-4">Packets: {debugInfo.packets}</span>
         {debugInfo.lastPacketTime && (
           <span className="border-l border-white/10 pl-4">Last: {debugInfo.lastPacketTime.toLocaleTimeString()}</span>
         )}
         <span className="border-l border-white/10 pl-4">Room: {examId.slice(-6)}</span>
      </div>

      {studentList.length === 0 ? (
        <div className="py-20 text-center bg-white/5 rounded-[40px] border-2 border-dashed border-white/5">
          <p className="text-muted-foreground font-black italic uppercase tracking-widest text-[10px] mb-2">No active feeds detected</p>
          <p className="text-[8px] font-black text-primary uppercase animate-pulse">Ensure students have started the exam and shared their screen</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {studentList.map((s) => (
            <ScreenCard key={s.studentId} s={s} onClick={setSelectedStudent} />
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title={selectedStudent?.studentName} size="xl">
        {selectedStudent && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            
            {/* Left Column: Live Screen */}
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-video bg-black rounded-[32px] overflow-hidden border-4 border-white/5 shadow-2xl relative">
                <img src={selectedStudent.frame} alt={selectedStudent.studentName} className="w-full h-full object-contain" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge className="bg-emerald-500 text-white border-none px-3 font-black uppercase tracking-widest animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white mr-2 inline-block" /> Live
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Wifi className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Network</p>
                    <p className="text-sm font-black uppercase tracking-tight">{selectedStudent.networkStatus || "Online"}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl"><MonitorIcon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Device</p>
                    <p className="text-sm font-black uppercase tracking-tight">{selectedStudent.deviceStatus || "Active"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Telemetry & Status */}
            <div className="space-y-4">
              {/* Identity */}
              <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/20 shadow-inner flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black italic text-2xl mb-4">
                  {selectedStudent.studentName[0]}
                </div>
                <h4 className="font-black italic text-2xl uppercase tracking-tight leading-tight">{selectedStudent.studentName}</h4>
                <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">Roll: {selectedStudent.studentRoll || selectedStudent.studentId}</p>
              </div>

              {/* Progress */}
              <div className="p-6 rounded-[32px] bg-white/5 border border-white/5">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Exam Progress
                </h5>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-3xl font-black italic tracking-tighter">{selectedStudent.answeredCount || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Answered</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black italic text-muted-foreground">/ {selectedStudent.totalQuestions || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
                  </div>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-4">
                  <div 
                    className="bg-primary h-full rounded-full transition-all" 
                    style={{ width: `${((selectedStudent.answeredCount || 0) / (selectedStudent.totalQuestions || 1)) * 100}%` }} 
                  />
                </div>
                <div className="mt-4 p-3 bg-white/5 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest">Current Question</span>
                  <Badge variant="outline" className="border-primary/20 text-primary text-[10px] font-black">
                    Q{(selectedStudent.currentQuestion || 0) + 1}
                  </Badge>
                </div>
              </div>

              {/* Security Status */}
              <div className="p-6 rounded-[32px] bg-rose-500/5 border border-rose-500/20">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Security Status
                </h5>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-3xl font-black italic tracking-tighter text-rose-500">{selectedStudent.violationCount || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Violations</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black italic tracking-tighter text-amber-500">
                      {selectedStudent.violationCount > 5 ? "HIGH" : selectedStudent.violationCount > 0 ? "MED" : "LOW"}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Risk Score</p>
                  </div>
                </div>
                
                {selectedStudent.lastViolation && selectedStudent.lastViolation !== "none" && (
                  <div className="mt-4 p-3 bg-rose-500/10 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Last Violation</p>
                      <p className="text-xs font-bold text-rose-400 mt-1 uppercase tracking-tight">{selectedStudent.lastViolation.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

