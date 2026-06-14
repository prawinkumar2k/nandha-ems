import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/core/api/client";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { getFacultyNav } from "@/core/constants/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, Search, Users, Shield, 
  ChevronRight, Calendar, Clock, Monitor 
} from "lucide-react";
import { cn } from "@/core/utils/helpers";

const NAV = getFacultyNav();

const getImageSrc = (url) => {
  if (!url) return "";
  return url.startsWith("/api") ? `${url}?token=${sessionStorage.getItem("authToken")}` : url;
};

export default function EvidenceVault() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: violations = [], isLoading } = useQuery({
    queryKey: ["all-evidence-sessions"],
    queryFn: () => apiClient.get("/api/violations"),
  });

  // Group by Student + Exam
  const sessions = Array.isArray(violations) ? violations.reduce((acc, v) => {
    const key = `${v.student?._id}_${v.exam?._id}`;
    if (!acc[key]) {
      acc[key] = {
        student: v.student,
        exam: v.exam,
        frameCount: 0,
        violationCount: 0,
        lastUpdate: v.timestamp,
        thumbnail: v.screenshot
      };
    }
    acc[key].frameCount++;
    if (v.type !== 'periodic_snapshot') acc[key].violationCount++;
    if (new Date(v.timestamp) > new Date(acc[key].lastUpdate)) {
      acc[key].lastUpdate = v.timestamp;
      acc[key].thumbnail = v.screenshot;
    }
    return acc;
  }, {}) : {};

  const sessionList = Object.values(sessions).filter(s => 
    s.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.exam?.title?.toLowerCase().includes(search.toLowerCase())
  ).sort((a,b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));

  return (
    <MainLayout navItems={NAV} title="Evidence Vault">
      <div className="space-y-8 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-8 rounded-[40px] border border-white/5">
           <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                 Evidence Vault <Camera className="w-10 h-10 text-primary animate-pulse" />
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-2">Historical session audit & screen recordings</p>
           </div>
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input 
                 placeholder="FILTER BY STUDENT OR EXAM..." 
                 className="pl-12 rounded-2xl h-14 bg-black/40 border-white/10 font-black text-xs uppercase tracking-widest focus:ring-primary"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white/5 rounded-[32px]" />)}
           </div>
        ) : sessionList.length === 0 ? (
           <div className="py-40 text-center glass rounded-[40px] border-2 border-dashed border-white/5">
              <Camera className="w-20 h-20 text-white/5 mx-auto mb-6" />
              <p className="text-xl font-black italic uppercase opacity-20 tracking-widest">No recordings found</p>
              <p className="text-[10px] font-black uppercase text-primary/40 mt-2">Recordings are generated automatically during active exams</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sessionList.map((session, i) => (
                 <button 
                    key={i}
                    onClick={() => navigate(`/faculty/evidence/${session.exam?._id}/${session.student?._id}`)}
                    className="group relative overflow-hidden rounded-[32px] bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                 >
                    <div className="aspect-[16/9] relative overflow-hidden bg-black/40">
                       <img 
                          src={getImageSrc(session.thumbnail)} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-60 group-hover:opacity-100" 
                          alt="Session" 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                       <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <Badge className="bg-primary text-white border-0 font-black text-[9px] px-3 py-1">
                             {session.frameCount} SNAPSHOTS
                          </Badge>
                          {session.violationCount > 0 && (
                             <Badge variant="destructive" className="font-black text-[9px] px-3 py-1 animate-pulse">
                                {session.violationCount} ALERTS
                             </Badge>
                          )}
                       </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                       <div className="flex items-start justify-between">
                          <div>
                             <h4 className="font-black italic text-lg uppercase tracking-tight group-hover:text-primary transition-colors truncate max-w-[200px]">
                                {session.student?.name}
                             </h4>
                             <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{session.student?.rollNumber}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                       </div>

                       <div className="pt-4 border-t border-white/5 space-y-2">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground/60">
                             <Shield className="w-3.5 h-3.5" /> {session.exam?.title}
                          </div>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground/60">
                                <Calendar className="w-3.5 h-3.5" /> {new Date(session.lastUpdate).toLocaleDateString()}
                             </div>
                             <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground/60">
                                <Clock className="w-3.5 h-3.5" /> {new Date(session.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </div>
                          </div>
                       </div>
                    </div>
                 </button>
              ))}
           </div>
        )}
      </div>
    </MainLayout>
  );
}
