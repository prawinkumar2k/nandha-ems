import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/shared/components/Modal/Modal";
import { apiClient } from "@/core/api/client";
import { getFacultyNav } from "@/core/constants/navigation";
import { AlertCircle, Eye, Download, Search, ShieldAlert, Clock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const NAV = getFacultyNav();

const getImageSrc = (url) => {
  if (!url) return "";
  return url.startsWith("/api") ? `${url}?token=${sessionStorage.getItem("authToken")}` : url;
};

export default function Violations() {
  const [search, setSearch] = useState("");
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [showSnapshots, setShowSnapshots] = useState(true);

  const { data: violations = [], isLoading } = useQuery({
    queryKey: ["faculty-violations"],
    queryFn: () => apiClient.get("/api/violations"), // This returns violations for the faculty's exams
  });

  const safeViolations = Array.isArray(violations) ? violations : [];

  const filtered = safeViolations.filter(v => {
    const matchesSearch = 
      v.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.student?.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
      v.exam?.title?.toLowerCase().includes(search.toLowerCase());
    
    if (!showSnapshots && v.type === 'periodic_snapshot') return false;
    return matchesSearch;
  });




  return (
    <MainLayout navItems={NAV} title="Security Violations">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              Violation Log <ShieldAlert className="w-8 h-8 text-rose-500" />
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/60 mt-1">Immutable evidence of academic misconduct</p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="SEARCH ROLL NO OR NAME..." 
              className="pl-12 rounded-2xl h-12 bg-white/5 border-white/10 font-black text-[10px] uppercase tracking-widest focus:ring-rose-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-white/5 rounded-[40px] border border-white/5 shadow-inner" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center bg-white/5 rounded-[40px] border-2 border-dashed border-white/10 opacity-30 italic font-black uppercase tracking-widest">
             No violations detected
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((v) => (
              <Card key={v._id} className="rounded-[40px] glass border-white/5 overflow-hidden group hover:border-rose-500/50 transition-all duration-300 shadow-2xl">
                <div className="aspect-video relative overflow-hidden bg-black/40">
                  {v.screenshot ? (
                    <img src={getImageSrc(v.screenshot)} alt="Violation proof" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                      <AlertCircle className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest px-3 py-1 border-none shadow-lg">
                      {v.type?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-black shrink-0">
                      {v.student?.name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black italic text-lg uppercase tracking-tight truncate">{v.student?.name}</p>
                      <p className="text-[10px] font-black uppercase text-rose-500 tracking-[0.2em]">{v.student?.rollNumber}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(v.timestamp).toLocaleTimeString()}</span>
                      <span className="flex items-center gap-1.5 truncate"><User className="w-3.5 h-3.5" /> {v.exam?.title}</span>
                    </div>
                  </div>


                  <Button 
                    onClick={() => setSelectedViolation(v)}
                    className="w-full h-12 rounded-2xl mt-4 font-black uppercase text-[10px] tracking-widest bg-white/10 hover:bg-rose-500 hover:text-white transition-all border border-white/10"
                  >
                    View Full Evidence
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={!!selectedViolation} 
        onClose={() => setSelectedViolation(null)}
        title="Violation Evidence"
        size="xl"
      >
        {selectedViolation && (
          <div className="space-y-6 pt-4">
             <div className="rounded-[32px] overflow-hidden border-2 border-rose-500/30 shadow-2xl bg-black">
                <img src={getImageSrc(selectedViolation.screenshot)} className="w-full h-auto" alt="Proof" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Student Identity</p>
                   <p className="text-xl font-black italic uppercase italic uppercase">{selectedViolation.student?.name}</p>
                   <p className="text-xs font-bold text-rose-500 uppercase">{selectedViolation.student?.rollNumber}</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Violation Source</p>
                   <p className="text-xl font-black italic uppercase italic uppercase">{selectedViolation.type?.replace('_', ' ')}</p>
                   <p className="text-xs font-bold text-muted-foreground uppercase">{new Date(selectedViolation.timestamp).toLocaleString()}</p>
                </div>
             </div>
             <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2 italic">Context</p>
                <p className="text-sm font-bold leading-relaxed tracking-tight">
                  This violation was recorded during the <span className="text-white">"{selectedViolation.exam?.title}"</span> exam. 
                  Visual evidence has been cryptographically logged to the system audit trail.
                </p>
             </div>

             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Screen Timeline (Full Session Record)</h4>
                <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                   {safeViolations
                      .filter(sn => sn.student?._id === selectedViolation.student?._id && sn.exam?._id === selectedViolation.exam?._id)
                      .sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp))
                      .map((sn, idx) => (
                         <div key={idx} className="shrink-0 w-32 space-y-2 group cursor-pointer" onClick={() => setSelectedViolation(sn)}>
                            <div className={`aspect-video rounded-xl border-2 overflow-hidden transition-all ${sn._id === selectedViolation._id ? 'border-primary' : 'border-white/5 group-hover:border-white/20'}`}>
                               <img src={getImageSrc(sn.screenshot)} className="w-full h-full object-cover" alt="ts" />
                            </div>
                            <p className="text-[8px] font-bold text-center opacity-40">{new Date(sn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                         </div>
                      ))}
                </div>
             </div>


             <div className="flex gap-4">
                <Button className="flex-1 h-16 rounded-2xl font-black text-xl italic bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-500/20 uppercase">Email Proctor Report</Button>
                <Button variant="outline" className="h-16 w-16 rounded-2xl border-white/10 glass">
                   <Download className="w-6 h-6" />
                </Button>
             </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}
