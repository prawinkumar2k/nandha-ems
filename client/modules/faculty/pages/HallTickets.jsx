import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Ticket, Users, Print, ArrowLeft, RefreshCw } from "lucide-react";
import { getHODNav, getFacultyNav } from "@/core/constants/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/core/utils/helpers";

export default function HallTickets() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const NAV = user?.role === "hod" ? getHODNav() : getFacultyNav();

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => apiClient.get(`/api/exams/${examId}`)
  });

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["hall-tickets", examId],
    queryFn: () => apiClient.get(`/api/exams/${examId}/hall-tickets`)
  });

  const allocateMutation = useMutation({
    mutationFn: () => apiClient.post(`/api/exams/${examId}/allocate-seats`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["hall-tickets", examId]);
      toast.success("Seats Allocated", { description: res.message });
    },
    onError: (err) => {
      toast.error("Allocation Failed", { description: err.message });
    }
  });

  const handlePrint = () => {
    window.print();
  };

  if (examLoading || ticketsLoading) return <MainLayout navItems={NAV}><div className="p-10 text-center">Loading...</div></MainLayout>;

  return (
    <MainLayout navItems={NAV} title="Hall Tickets">
      {/* Non-printable header */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <Button variant="ghost" className="mb-2 -ml-4 hover:bg-white/5" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-black italic uppercase tracking-tight">{exam?.title} - Seating</h1>
          <p className="text-muted-foreground font-semibold">Generate and print hall tickets for lab allocation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl h-12 px-6 border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-xs"
            onClick={() => allocateMutation.mutate()}
            disabled={allocateMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${allocateMutation.isPending ? 'animate-spin' : ''}`} /> 
            {tickets.length > 0 ? "Re-allocate Seats" : "Allocate Seats"}
          </Button>
          <Button 
            className="rounded-xl h-12 px-6 font-black uppercase tracking-widest text-xs"
            onClick={handlePrint}
            disabled={tickets.length === 0}
          >
            <Print className="w-4 h-4 mr-2" /> Print Tickets
          </Button>
        </div>
      </div>

      {tickets.length === 0 ? (
        <Card className="rounded-[40px] glass border-white/5 print:hidden">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
              <Ticket className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-widest mb-2">No Tickets Generated</h3>
            <p className="text-muted-foreground mb-8">Click 'Allocate Seats' to automatically assign students to available lab machines.</p>
            <Button 
              size="lg" 
              className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-sm"
              onClick={() => allocateMutation.mutate()}
              disabled={allocateMutation.isPending}
            >
              <Users className="w-5 h-5 mr-2" /> Generate Seating Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:block">
          {tickets.map(ticket => (
            <Card key={ticket._id} className="rounded-[32px] glass border-white/10 relative overflow-hidden print:border-black print:rounded-xl print:shadow-none print:break-inside-avoid print:mb-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] -z-10 print:hidden" />
              <CardHeader className="border-b border-white/10 print:border-black/20 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Official Hall Ticket</CardDescription>
                    <CardTitle className="text-xl font-black italic tracking-tight">{ticket.exam?.title}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ticket No.</p>
                    <p className="text-sm font-bold font-mono">{ticket.ticketNumber}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Candidate Name</p>
                    <p className="text-sm font-bold">{ticket.student?.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Roll Number</p>
                    <p className="text-sm font-bold">{ticket.student?.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Assigned Lab</p>
                    <p className="text-sm font-black text-primary uppercase">{ticket.lab?.name || "Pending"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Seat / PC Number</p>
                    <p className="text-sm font-black italic">{ticket.seatNumber}</p>
                  </div>
                  <div className="col-span-2 bg-white/5 print:bg-black/5 rounded-2xl p-4 flex items-center justify-between border border-white/5 print:border-black/20">
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Date & Time</p>
                       <p className="text-xs font-bold">{formatDate(ticket.exam?.scheduledAt)}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Machine Auth</p>
                       <p className="text-xs font-mono font-bold text-primary">{ticket.device?.machineFingerprint?.substring(0, 8)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
