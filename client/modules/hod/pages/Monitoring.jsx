import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { apiClient } from "@/core/api/client";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getHODNav } from "@/core/constants/navigation";
import { Activity, ShieldCheck, Search, Shield } from "lucide-react";
import { LiveScreenGrid } from "@/shared/components/Monitoring/LiveScreenGrid";
import { cn } from "@/core/utils/helpers";
import { useNavigate } from "react-router-dom";

const NAV = getHODNav();

export default function HODMonitoring() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const { data: examData } = useQuery({
    queryKey: ["exam-details", examId],
    queryFn: () => apiClient.get(`/api/exams/${examId}`),
    enabled: !!examId
  });

  const { data: activeExams = [] } = useQuery({
    queryKey: ["active-exams"],
    queryFn: () => apiClient.get("/api/exams"),
    enabled: !examId
  });

  const activeOnly = activeExams.filter(e => ['active', 'scheduled', 'completed'].includes(e.status));

  if (!examId) {
    return (
      <MainLayout navItems={NAV} title="Department Oversight">
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center py-12 glass rounded-[40px] border-white/5 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
             <div className="p-8 rounded-[32px] bg-primary/10 text-primary border border-primary/20 shadow-xl mb-8">
               <Activity className="w-16 h-16" />
             </div>
             <div className="text-center space-y-2 mb-10">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Live Surveillance</h2>
               <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Select an active session to monitor from HOD desk</p>
             </div>

             <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 px-10">
                {activeOnly.map(e => (
                  <button 
                    key={e._id} 
                    onClick={() => {
                        console.log("HOD Navigating to:", e._id);
                        navigate(`/hod/monitoring/${e._id}`);
                    }}
                    className="flex items-center justify-between p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-primary/5 hover:border-primary/40 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black italic text-xl border border-primary/20 group-hover:scale-110 transition-transform">
                        {e.title?.[0]}
                      </div>
                      <div className="text-left">
                        <p className="font-black italic uppercase tracking-tight">{e.title}</p>
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">{e.course?.title || "DEPT"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <Badge className={cn(
                          "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-none shadow-sm",
                          e.status === 'active' ? "bg-emerald-500 text-white animate-pulse" : 
                          e.status === 'scheduled' ? "bg-amber-500 text-white" : "bg-white/10 text-white/40"
                       )}>
                         {e.status}
                       </Badge>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout navItems={NAV} title="HOD Live Watch">
      <div className="space-y-8">
        <Card className="rounded-[40px] glass border-white/5 relative overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black italic uppercase">{examData?.title || "Staff Monitoring"}</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">
                  {examData?.course?.title} · Head of Department Oversight
                </CardDescription>
              </div>
              <div className="flex gap-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black uppercase text-[10px]">
                  <ShieldCheck className="w-3 h-3 mr-2" /> Admin Oversight
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1.5 rounded-full font-black uppercase text-[10px]">
                  Live
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <LiveScreenGrid examId={examId} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
