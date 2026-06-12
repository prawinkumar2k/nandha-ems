import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { DataTableWrapper } from "@/shared/components/Table/DataTableWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/core/constants/routes";
import { formatDate } from "@/core/utils/helpers";
import { BookOpen, Plus, Clock, Users } from "lucide-react";
import { getAdminNav } from "@/core/constants/navigation";
import { examService } from "@/core/api/services";

const NAV = getAdminNav();

const STATUS_STYLE = {
  upcoming: "bg-blue-500/10 text-blue-700 border-blue-200",
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  completed: "bg-muted text-muted-foreground border-border",
};

export default function AllExams() {
  const navigate = useNavigate();
  const { data: exams, isLoading } = useQuery({
    queryKey: ["admin-all-exams"],
    queryFn: () => examService.getAll(),
  });

  const cols = [
    { key: "title", header: "Test Name", sortable: true, render: (r) => (
      <p className="font-bold tracking-tight text-foreground">{r.title}</p>
    )},
    { key: "course", header: "Subject", render: (r) => (
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{r.course?.code || "N/A"}</span>
    )},
    { key: "department", header: "Dept", sortable: true, render: (r) => (
      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{r.department?.code || "N/A"}</span>
    )},
    { key: "faculty", header: "Staff", render: (r) => (
      <p className="text-xs font-medium">{r.faculty?.name || "System"}</p>
    )},
    { key: "duration", header: "Time", render: (r) => (
       <div className="flex items-center gap-2 text-xs font-bold">
          <Clock className="w-3 h-3 opacity-40" /> {r.duration} min
       </div>
    )},
    { key: "questions", header: "Questions", render: (r) => (
       <span className="font-mono text-xs font-bold">{r.questions?.length || 0}</span>
    )},
    { key: "scheduled", header: "Date", sortable: true, render: (r) => (
       <p className="text-xs font-medium text-muted-foreground/80">{formatDate(r.scheduledAt)}</p>
    )},
    { key: "status", header: "Status", render: (r) => (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLE[r.status] || STATUS_STYLE.upcoming}`}>
        {r.status}
      </span>
    )},
    { key: "actions", header: "", render: (r) => (
      <Button variant="outline" size="sm" className="h-8 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border-white/10" onClick={() => navigate(`${ROUTES.ADMIN_MONITORING}?examId=${r._id}`)}>
        Watch
      </Button>
    )},
  ];

  return (
    <MainLayout navItems={NAV} title="Exam List">
      <Card className="rounded-[40px] glass border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-20" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-8 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/10 border border-primary/20">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black italic uppercase italic">Exams Registry</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">All department tests</CardDescription>
            </div>
          </div>
          <Button className="rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => navigate(ROUTES.FACULTY_CREATE_EXAM)}>
            <Plus className="w-4 h-4 mr-2" /> Schedule Test
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <DataTableWrapper columns={cols} data={exams || []} searchKeys={["title", "status"]}
            searchPlaceholder="Search tests…" pageSize={8} isLoading={isLoading} />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
