// Student: MyExams, Results, Profile pages
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import { toast } from "sonner";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { DataTableWrapper } from "@/shared/components/Table/DataTableWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { FormField, FormTextarea } from "@/shared/components/Form/FormField";
import { Modal } from "@/shared/components/Modal/Modal";
import { ROUTES } from "@/core/constants/routes";
import { LayoutDashboard, FileText, BarChart3, User, PlayCircle, Download, AlertCircle, Ticket, Printer, CheckCircle, SearchX } from "lucide-react";
import { formatDate, downloadCSV } from "@/core/utils/helpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NAV = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: ROUTES.STUDENT_DASHBOARD },
  { label: "My Exams", icon: <FileText className="w-4 h-4" />, path: ROUTES.STUDENT_EXAMS },
  { label: "Results", icon: <BarChart3 className="w-4 h-4" />, path: ROUTES.STUDENT_RESULTS },
  { label: "Profile", icon: <User className="w-4 h-4" />, path: ROUTES.STUDENT_PROFILE },
];

export function MyExams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticketOpen, setTicketOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["student-exams"],
    queryFn: () => apiClient.get("/api/exams").then(res => res.data || [])
  });

  const STATUS_STYLE = {
    upcoming: "bg-blue-500/10 text-blue-700",
    scheduled: "bg-emerald-500/10 text-emerald-700",
    completed: "bg-muted text-muted-foreground",
    active: "bg-primary/10 text-primary border border-primary/20 animate-pulse",
  };

  const upcomingExams = Array.isArray(exams) ? exams.filter(e => e.status === "upcoming" || e.status === "scheduled" || e.status === "active") : [];
  const pastExams = Array.isArray(exams) ? exams.filter(e => e.status === "completed" || e.status === "cancelled") : [];

  const handleViewTicket = async (examId) => {
    try {
      setTicketLoading(true);
      const ticket = await apiClient.get(`/api/exams/${examId}/hall-tickets`);
      setActiveTicket(ticket);
      setTicketOpen(true);
    } catch (err) {
      toast.error("Ticket not found", { description: "Your hall ticket hasn't been generated yet." });
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <MainLayout navItems={NAV} title="My Tests">
      <div className="space-y-6 max-w-7xl mx-auto">
        <Tabs defaultValue="open" className="w-full">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
             <div className="bg-white/5 border border-white/5 rounded-[32px] px-8 py-6 flex-1 w-full">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-primary">Test Center</h2>
                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-1">Exams assigned to: {user?.name}</p>
             </div>
             <TabsList className="bg-card border border-white/10 p-1 rounded-xl h-14 shadow-sm w-full sm:w-auto">
                <TabsTrigger value="open" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-8 h-full text-xs uppercase tracking-widest">Pending</TabsTrigger>
                <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-8 h-full text-xs uppercase tracking-widest">History</TabsTrigger>
             </TabsList>
           </div>

           <TabsContent value="open" className="mt-0">
             {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[1, 2].map(i => <div key={i} className="h-40 bg-white/5 rounded-[32px] animate-pulse" />)}
                </div>
             ) : upcomingExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[40px] border border-white/5 shadow-inner mt-4">
                   <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-12 h-12 text-emerald-500" />
                   </div>
                   <h3 className="text-2xl font-black tracking-tight mb-2">All Caught Up!</h3>
                   <p className="text-sm text-muted-foreground max-w-md text-center">You have no pending tests or exams at the moment. Take a break, or review your past history to prepare for the next one.</p>
                   <Button variant="outline" className="mt-8 rounded-xl font-bold uppercase tracking-widest text-xs h-12 px-8 border-white/10" onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}>
                     Return to Dashboard
                   </Button>
                </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                 {upcomingExams.map((e) => (
                   <Card key={e._id} className="group border-white/5 hover:border-primary/30 transition-all rounded-[32px] bg-white/5 overflow-hidden">
                     <CardContent className="pt-6">
                       <div className="flex justify-between items-start mb-4">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${STATUS_STYLE[e.status] || STATUS_STYLE.upcoming}`}>
                           {e.status}
                         </span>
                         <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Course: {e.course?.code || "AI"}</span>
                       </div>
                       <h3 className="text-xl font-bold tracking-tight mb-1">{e.title}</h3>
                       <p className="text-xs text-muted-foreground mb-4">{e.course?.title} · {e.duration} MINS</p>
                       
                       <div className="flex items-center justify-between mt-6">
                         <div className="text-[10px] font-black uppercase tracking-widest opacity-50">
                           Starts: {formatDate(e.scheduledAt)}
                         </div>
                         <div className="flex gap-2">
                           <Button 
                             variant="outline"
                             className="rounded-2xl gap-2 font-black italic uppercase tracking-tighter"
                             onClick={() => handleViewTicket(e._id)}
                             disabled={ticketLoading}
                           >
                             <Ticket className="w-4 h-4" /> Ticket
                           </Button>
                           <Button 
                             className="rounded-2xl gap-2 font-black italic uppercase tracking-tighter"
                             onClick={() => navigate(ROUTES.STUDENT_EXAM_INTERFACE.replace(":examId", e._id))}
                           >
                             <PlayCircle className="w-4 h-4" /> Start
                           </Button>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             )}
           </TabsContent>

           <TabsContent value="past" className="mt-0">
             {isLoading ? (
                <div className="h-64 bg-white/5 rounded-[32px] animate-pulse mt-4" />
             ) : pastExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[40px] border border-white/5 shadow-inner mt-4">
                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                      <SearchX className="w-12 h-12 text-muted-foreground" />
                   </div>
                   <h3 className="text-2xl font-black tracking-tight mb-2">No History Found</h3>
                   <p className="text-sm text-muted-foreground max-w-md text-center">You haven't completed any tests yet. Once you finish a test, it will appear here for your reference.</p>
                </div>
             ) : (
                <div className="bg-card border border-white/5 rounded-[32px] p-6 shadow-xl mt-4">
                   <DataTableWrapper
                     columns={[
                       { key: "title", header: "Test Name", sortable: true },
                       { key: "course", header: "Course", render: (r) => r.course?.code },
                       { key: "scheduledAt", header: "Date", render: (r) => formatDate(r.scheduledAt), sortable: true },
                       { key: "duration", header: "Duration", render: (r) => `${r.duration} MINS` },
                       { key: "status", header: "Status", render: (r) => (
                         <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground italic">Done</span>
                       )},
                     ]}
                     data={pastExams}
                   />
                </div>
             )}
           </TabsContent>
        </Tabs>

        <Modal open={ticketOpen} onOpenChange={setTicketOpen} title="Hall Ticket">
          {activeTicket && (
            <div className="space-y-6">
              <div id="printable-ticket" className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden print:bg-white print:text-black print:border-black print:p-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] -z-10 print:hidden" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 print:text-black">Official Exam Ticket</h3>
                <h2 className="text-xl font-black italic tracking-tight mb-6">{activeTicket.exam?.title}</h2>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 print:text-gray-500">Student Name</p>
                    <p className="text-sm font-bold">{activeTicket.student?.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 print:text-gray-500">Roll Number</p>
                    <p className="text-sm font-bold">{activeTicket.student?.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 print:text-gray-500">Assigned Lab</p>
                    <p className="text-sm font-black text-primary uppercase print:text-black">{activeTicket.lab?.name || "Pending"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 print:text-gray-500">Seat / PC Number</p>
                    <p className="text-sm font-black italic">{activeTicket.seatNumber}</p>
                  </div>
                  <div className="col-span-2 mt-2 pt-4 border-t border-white/10 print:border-black/20 flex justify-between">
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 print:text-gray-500">Date & Time</p>
                       <p className="text-xs font-bold">{formatDate(activeTicket.exam?.scheduledAt)}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 print:text-gray-500">Ticket No.</p>
                       <p className="text-xs font-mono font-bold text-primary print:text-black">{activeTicket.ticketNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setTicketOpen(false)}>Close</Button>
                <Button 
                  onClick={() => {
                    const printWindow = window.open('', '', 'height=600,width=800');
                    const content = document.getElementById('printable-ticket').innerHTML;
                    printWindow.document.write('<html><head><title>Hall Ticket</title><script src="https://cdn.tailwindcss.com"></script></head><body class="p-10 font-sans">' + content + '</body></html>');
                    printWindow.document.close();
                    setTimeout(() => printWindow.print(), 1000);
                  }}
                  className="font-black italic uppercase tracking-tighter gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Ticket
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}

const getGradeColor = (g) => g?.startsWith("A") ? "text-success" : g?.startsWith("B") ? "text-blue-500" : "text-warning";

export function Results() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [revalOpen, setRevalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [reason, setReason] = useState("");

  const { data: results = {}, isLoading } = useQuery({
    queryKey: ["student-results"],
    queryFn: () => apiClient.get("/api/reports/student-results").then(res => res.data || {})
  });

  const revalMutation = useMutation({
    mutationFn: (data) => apiClient.post(`/api/submissions/${data.id}/revaluate`, { reason: data.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(["student-results"]);
      setRevalOpen(false);
      setReason("");
      setSelectedSub(null);
      toast.success("Re-evaluation requested successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to request re-evaluation")
  });

  return (
    <MainLayout navItems={NAV} title="My Grades">
      <Card className="rounded-[40px] glass border-white/5 relative overflow-hidden shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
          <div>
            <CardTitle className="text-2xl font-black italic uppercase">My Results</CardTitle>
            <CardDescription className="text-xs font-black uppercase tracking-widest text-primary">Your records: {user?.name}</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl h-10 font-black gap-2 border-white/10 hover:bg-white/5 uppercase text-xs" onClick={() => downloadCSV(results, "results.csv")}>
            <Download className="w-4 h-4" /> Download
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
             <p className="text-center py-20 text-muted-foreground animate-pulse font-black uppercase tracking-widest text-[10px]">Loading...</p>
          ) : (
            <DataTableWrapper
              columns={[
                { key: "name", header: "Test Name", sortable: true },
                { key: "progress", header: "Score", render: (r) => (
                  <div className="flex items-center gap-2">
                    <Progress value={r.progress} className="w-16 h-1.5" />
                    <span className="text-[10px] font-black">{r.progress}%</span>
                  </div>
                )},
                { key: "grade", header: "Grade", render: (r) => <span className={`font-black italic ${getGradeColor(r.grade)}`}>{r.grade}</span> },
                { key: "status", header: "Status", render: (r) => (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-success/10 text-success rounded-full italic">Done</span>
                )},
                { key: "actions", header: "Actions", render: (r) => (
                  r.revaluationRequested ? (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg">
                      {r.revaluationStatus === 'pending' ? 'Reviewing' : r.revaluationStatus}
                    </span>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
                      onClick={() => { setSelectedSub(r); setRevalOpen(true); }}
                    >
                      <AlertCircle className="w-3 h-3 mr-1" /> Appeal
                    </Button>
                  )
                )},
              ]}
              data={results.courses || []} 
            />
          )}
        </CardContent>
      </Card>

      <Modal open={revalOpen} onOpenChange={setRevalOpen} title="Request Re-evaluation">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground font-bold">
            If you believe your marks for <span className="text-primary italic">{selectedSub?.name}</span> were calculated incorrectly, provide a specific reason below.
          </p>
          <FormTextarea 
            label="Reason for Appeal" 
            placeholder="E.g., I believe my essay on Question 3 was fully correct..." 
            value={reason} 
            onChange={e => setReason(e.target.value)} 
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setRevalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => revalMutation.mutate({ id: selectedSub.id, reason })}
              disabled={revalMutation.isPending || !reason.trim()}
            >
              {revalMutation.isPending ? "Submitting..." : "Submit Appeal"}
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}

export default MyExams;
