import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableWrapper } from "@/shared/components/Table/DataTableWrapper";
import { Modal } from "@/shared/components/Modal/Modal";
import { getHODNav } from "@/core/constants/navigation";
import { apiClient } from "@/core/api/client";
import { 
  BookOpen, Calendar, Clock, User, Download, Eye, Sparkles, 
  Loader2, PlayCircle, CheckCircle2, AlertCircle, Trash2, ShieldCheck, Activity, Shield
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/core/constants/routes";

const NAV = getHODNav();

export function Exams() {
  const [selectedExam, setSelectedExam] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: exams, isLoading, error } = useQuery({
    queryKey: ["hod-exams-list"],
    queryFn: () => apiClient.get("/api/hod/exams"),
  });

  const approveExam = useMutation({
    mutationFn: (examId) => apiClient.patch(`/api/hod/exams/${examId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hod-exams-list"] });
      setSelectedExam((current) => current ? { ...current, approvedByHod: true } : current);
    },
  });

  const columns = [
    {
      key: "title",
      header: "Test Name",
      render: (r) => (
        <div className="flex items-center gap-3 py-1">
          <div className={`p-2 rounded-xl ${r.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="font-black text-sm leading-none">{r.title}</p>
            <p className="text-[10px] uppercase font-black text-muted-foreground mt-1 tracking-widest">{r.course?.code || 'AI'}</p>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: "faculty",
      header: "Teacher",
      render: (r) => (
        <div className="text-sm font-black flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">{r.faculty?.name?.[0]}</div>
          {r.faculty?.name}
        </div>
      )
    },
    {
      key: "scheduledAt",
      header: "Date",
      render: (r) => (
        <div className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">
          {new Date(r.scheduledAt).toLocaleDateString()} · {new Date(r.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      ),
      sortable: true
    },
    {
      key: "security",
      header: "Security",
      render: (r) => (
        <div className="flex items-center gap-2">
           <Shield className="w-3.5 h-3.5 text-primary" />
           <span className="text-[10px] font-black uppercase tracking-widest leading-none">
             Max {r.security?.maxViolations || 5} Alerts
           </span>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge className={cn(
          "rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest",
          r.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
          r.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
          'bg-slate-500/10 text-slate-500 border-slate-500/20'
        )}>
          {r.status}
        </Badge>
      )
    },

    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-xl h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={() => setSelectedExam(r)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {r.status === 'active' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-xl h-9 w-9 p-0 text-emerald-500 hover:bg-emerald-500/10"
              onClick={() => navigate(`/faculty/monitoring/${r._id}`)}
            >
              <Activity className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10">
            <Trash2 className="w-4 h-4" />
          </Button>

        </div>
      ),
    },
  ];

  return (
    <MainLayout navItems={NAV} title="Department Tests">
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-2 uppercase italic">
              Managing Tests <Sparkles className="w-6 h-6 text-accent" />
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mt-1">Past and future tests</p>
          </div>
          <div className="flex gap-3">
             <Button 
                variant="outline" 
                className="rounded-xl border-white/10 glass px-6 font-black uppercase text-xs"
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," + "Title,Course,Faculty,Status,Date\n" + exams.map(e => `${e.title},${e.course?.code},${e.faculty?.name},${e.status},${e.scheduledAt}`).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  window.open(encodedUri);
                }}
              >
                Save List
              </Button>
             <Button 
                onClick={() => navigate(ROUTES.FACULTY_CREATE_EXAM)}
                className="rounded-xl shadow-lg shadow-primary/20 px-6 font-black uppercase text-xs h-11"
              >
                New Test
              </Button>
          </div>
        </div>

        <Card className="rounded-[40px] glass border-white/5 shadow-2xl overflow-hidden relative">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-xl font-black uppercase italic italic">Test List</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">View and manage all tests</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest">Loading Tests...</p>
              </div>
            ) : error ? (
              <div className="p-10 text-center text-rose-500 font-black italic tracking-tighter uppercase">
                🚨 Error: Cannot get tests.
              </div>
            ) : (
              <DataTableWrapper 
                columns={columns} 
                data={Array.isArray(exams) ? exams : []} 
                searchKeys={["title", "status"]} 
                searchPlaceholder="Search tests..."
              />
            )}
          </CardContent>
        </Card>

        {/* Exam Detail Modal */}
        <Modal 
          isOpen={!!selectedExam} 
          onClose={() => setSelectedExam(null)}
          title="Test Details"
          size="lg"
        >
          {selectedExam && (
            <div className="space-y-6 pt-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-black italic uppercase tracking-tight italic">{selectedExam.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedExam.course?.title}</Badge>
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest border-l border-white/10 pl-2">{selectedExam.course?.code}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[24px] bg-white/5 border border-white/5 space-y-1 shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</p>
                  <p className="font-black italic flex items-center gap-2 uppercase"><Calendar className="w-5 h-5 text-primary" /> {new Date(selectedExam.scheduledAt).toLocaleDateString()}</p>
                </div>
                <div className="p-6 rounded-[24px] bg-white/5 border border-white/5 space-y-1 shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Minutes</p>
                  <p className="font-black italic flex items-center gap-2 uppercase"><Clock className="w-5 h-5 text-primary" /> {selectedExam.duration}</p>
                </div>
              </div>

              <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 shadow-lg">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-5">Safe Settings</h4>
                <div className="grid grid-cols-2 gap-y-4">
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-tight">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> Fullscreen Required
                  </div>
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-tight">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> Photo Check
                  </div>
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-tight">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> No tab switching
                  </div>
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-tight">
                    <AlertCircle className="w-5 h-5 text-primary" /> Max 5 Alerts
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                 <Button 
                   onClick={() => navigate(`${ROUTES.HOD_MONITORING}/${selectedExam._id}`)}
                   className="flex-1 rounded-2xl h-14 font-black text-xl italic bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 uppercase"
                 >
                   <PlayCircle className="mr-2 w-6 h-6" /> WATCH LIVE
                 </Button>
                 <Button 
                   variant={selectedExam.approvedByHod ? "outline" : "default"}
                   className="rounded-2xl h-14 px-6 border-white/10 glass font-black uppercase text-xs"
                   disabled={approveExam.isPending || selectedExam.approvedByHod}
                   onClick={() => approveExam.mutate(selectedExam._id)}
                 >
                   <CheckCircle2 className="w-6 h-6 mr-2" />
                   {selectedExam.approvedByHod ? "Approved" : approveExam.isPending ? "Approving..." : "Approve"}
                 </Button>
                 <Button variant="outline" className="rounded-2xl h-14 px-6 border-white/10 glass">
                   <Download className="w-6 h-6" />
                 </Button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </MainLayout>
  );
}

// Stubs for other sub-pages in this file
export function Monitoring() {
  return (
    <MainLayout navItems={NAV} title="Live Watch">
      <div className="h-[60vh] flex flex-col items-center justify-center gap-8 glass rounded-[40px] border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="p-8 rounded-[32px] bg-primary/10 animate-pulse text-primary border border-primary/20 shadow-xl">
          <Activity className="w-16 h-16" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase italic tracking-tighter">Ready to watch</h2>
          <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Connecting...</p>
        </div>
        <p className="text-xs opacity-40 font-black max-w-sm text-center px-10 leading-relaxed uppercase tracking-tight">Watch begins when a test starts. Please check the Test List to open a session.</p>
      </div>
    </MainLayout>
  );
}

export function Reports() {
  const navigate = useNavigate();
  return (
    <MainLayout navItems={NAV} title="Results">
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {[
          { title: "Attendance", icon: <Calendar className="text-blue-500 w-8 h-8" /> },
          { title: "Alert List", icon: <ShieldCheck className="text-rose-500 w-8 h-8" /> },
          { title: "Teacher Grades", icon: <BookOpen className="text-emerald-500 w-8 h-8" /> }
        ].map((r, i) => (
          <Card key={i} className="rounded-[40px] glass hover:border-primary/50 transition-all cursor-pointer group shadow-xl">
            <CardContent className="pt-10 p-8 text-center space-y-6">
               <div className="w-20 h-20 mx-auto rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                 {r.icon}
               </div>
               <h3 className="text-xl font-black italic uppercase italic tracking-tight">{r.title}</h3>
               <Button variant="outline" className="w-full rounded-2xl h-12 font-black uppercase text-xs gap-3 border-white/10 glass shadow-lg">
                 <Download className="w-4 h-4" /> Get Result
               </Button>
            </CardContent>
          </Card>
        ))}
       </div>
    </MainLayout>
  );
}

function cn(...classes) { return classes.filter(Boolean).join(" "); }

export default Exams;
