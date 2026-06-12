import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/core/api/client";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { getFacultyNav } from "@/core/constants/navigation";
import { 
  ChevronLeft, Camera, Shield, User, Clock, Monitor, 
  ExternalLink, Download, Play, AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const NAV = getFacultyNav();

const getImageSrc = (url) => {
  if (!url) return "";
  return url.startsWith("/api") ? `${url}?token=${sessionStorage.getItem("authToken")}` : url;
};

export default function ExamEvidence() {
  const { examId, studentId } = useParams();
  const navigate = useNavigate();
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeFrame, setActiveFrame] = useState(null);

  const { data: violations = [], isLoading } = useQuery({
    queryKey: ["evidence", examId, studentId],
    queryFn: async () => {
        const res = await apiClient.get("/api/violations");
        if (!Array.isArray(res)) return [];
        return res.filter(v => {
           const vExamId = v.exam?._id?.toString() || v.exam?.toString();
           const vStudentId = v.student?._id?.toString() || v.student?.toString();
           return vExamId === examId && vStudentId === studentId;
        });
    }
  });

  const student = violations[0]?.student;
  const exam = violations[0]?.exam;
  const sortedFrames = [...violations].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Replay Logic
  useEffect(() => {
    let interval;
    if (isPlaying && sortedFrames.length > 0) {
      interval = setInterval(() => {
        setActiveFrameIndex((prev) => {
          if (prev >= sortedFrames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed); // 1 sec per frame, modified by speed
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, sortedFrames.length]);

  useEffect(() => {
    if (sortedFrames.length > 0) {
      setActiveFrame(sortedFrames[activeFrameIndex]);
    }
  }, [activeFrameIndex, sortedFrames]);

  if (isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em]">Digitizing Evidence...</div>;

  return (
    <MainLayout navItems={NAV} title="Evidence Gallery">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                Session Recording <Camera className="w-6 h-6 text-primary" />
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Audit trail for student: {student?.name || "Student"}</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-2xl h-12 px-8 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px]">
             <Download className="w-4 h-4 mr-2" /> Export Case File
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Primary Evidence Player */}
           <div className="lg:col-span-2 space-y-4">
              <Card className="rounded-[40px] overflow-hidden glass border-white/5 bg-black shadow-3xl">
                 <div className="aspect-video relative group">
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                     {activeFrame || sortedFrames.length > 0 ? (
                       <img src={getImageSrc(activeFrame?.screenshot || sortedFrames[0]?.screenshot)} className="w-full h-full object-contain" alt="Current Frame" />
                     ) : (
                       <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                          <p className="text-sm font-black text-rose-500 uppercase italic">No snapshots available for this session</p>
                       </div>
                    )}
                    <div className="absolute top-6 left-6 flex items-center gap-3">
                       <Badge className="bg-primary/90 text-white border-0 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-xl">SESSION RECORD</Badge>
                       <span className="bg-black/40 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-lg">
                          FRAME: {activeFrame ? new Date(activeFrame.timestamp).toLocaleTimeString() : (sortedFrames[0] ? new Date(sortedFrames[0].timestamp).toLocaleTimeString() : "READY")}
                       </span>
                    </div>
                 </div>
                 </div>
              </Card>

              {/* Controls & Details */}
              <div className="flex items-center justify-between p-6 glass rounded-[32px] border-white/5 shadow-2xl">
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type:</span>
                    <Badge variant="outline" className="rounded-xl border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5">
                       {activeFrame?.type?.replace('_', ' ') || "SESSION SNAPSHOT"}
                    </Badge>
                 </div>
                 
                 <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl">
                    <Button variant="ghost" className="rounded-xl h-10 w-10 p-0 hover:bg-white/10" onClick={() => setActiveFrameIndex(p => Math.max(0, p - 1))}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="solid" 
                      className="rounded-xl h-10 w-12 p-0 bg-primary/20 text-primary hover:bg-primary/30"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <span className="w-3 h-3 bg-primary rounded-sm" /> : <Play className="w-5 h-5 ml-1" />}
                    </Button>
                    <Button variant="ghost" className="rounded-xl h-10 w-10 p-0 hover:bg-white/10" onClick={() => setActiveFrameIndex(p => Math.min(sortedFrames.length - 1, p + 1))}>
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </Button>
                    
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    
                    <div className="flex gap-1">
                      {[1, 2, 4].map(s => (
                        <button 
                          key={s}
                          onClick={() => setSpeed(s)}
                          className={`w-8 h-8 rounded-lg text-[9px] font-black ${speed === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-white/10'}`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Sidebar: Details & Snapshots */}
           <div className="space-y-6">
              {/* Profile Overview */}
              <div className="glass rounded-[32px] p-8 border-white/5 shadow-2xl space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xl shadow-primary/10">
                       <User className="w-7 h-7" />
                    </div>
                    <div>
                       <p className="text-lg font-black italic uppercase leading-none">{student?.name || "Loading..."}</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mt-1">{student?.rollNumber || "ID: ---"}</p>
                    </div>
                 </div>

                 <div className="space-y-3 pt-4 border-t border-white/5">
                    {[
                       { label: "Test Paper", value: exam?.title || "Exam Link", icon: <Shield className="w-3.5 h-3.5 text-primary" /> },
                       { label: "Alert Count", value: violations.filter(v => v.type !== 'periodic_snapshot').length, icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> },
                       { label: "Frames", value: sortedFrames.length, icon: <Camera className="w-3.5 h-3.5 text-emerald-500" /> },
                    ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground">
                             {item.icon} {item.label}
                          </div>
                          <span className="text-xs font-bold text-foreground">{item.value}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Timeline Thumbs */}
              <div className="glass rounded-[32px] p-6 border-white/5 h-[450px] flex flex-col">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-primary italic">Session Timeline</p>
                 <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {sortedFrames.map((frame, idx) => (
                       <button 
                          key={idx} 
                          onClick={() => setActiveFrameIndex(idx)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border ${activeFrameIndex === idx ? 'bg-primary/10 border-primary/20 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                       >
                          <div 
                             className={`aspect-video rounded-xl border-4 overflow-hidden shadow-lg transition-all ${activeFrame?._id === frame._id ? 'border-primary ring-4 ring-primary/20' : 'border-white/5 hover:border-white/20 hover:scale-105'}`}
                          >
                             <img src={getImageSrc(frame.screenshot)} className="w-full h-full object-cover" alt="ts" />
                          </div>
                          <div className="text-left overflow-hidden">
                             <p className={`text-[9px] font-black uppercase truncate ${frame.type !== 'periodic_snapshot' ? 'text-rose-500 font-black' : 'text-primary/60'}`}>
                                {frame.type?.replace('_', ' ')}
                             </p>
                             <p className="text-[8px] font-bold text-muted-foreground/40 mt-0.5">{new Date(frame.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                          </div>
                       </button>
                    ))}
                    {sortedFrames.length === 0 && (
                       <p className="p-10 text-center text-[10px] font-black uppercase opacity-20 italic">No recording data</p>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </MainLayout>
  );
}
