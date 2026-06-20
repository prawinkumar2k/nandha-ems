import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { StatCard } from "@/shared/components/StatCard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/core/constants/routes";
import { apiClient } from "@/core/api/client";
import {
  LayoutDashboard, FileText, BarChart3, User, BookOpen,
  GraduationCap, CheckCircle2, Clock, AlertTriangle, PlayCircle, ChevronRight
} from "lucide-react";

import { getStudentNav } from "@/core/constants/navigation";

const NAV = getStudentNav();

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function StudentDashboard() {
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: () => apiClient.get("/api/reports/student"),
  });

  const stats = [
    { label: "My Courses", value: dashboard?.courseCount || 0, icon: <BookOpen className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
    { label: "My Grade", value: dashboard?.gpa || "0.0", icon: <GraduationCap className="w-5 h-5" />, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Attendance", value: dashboard?.attendance || "0%", icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-blue-500/10 text-blue-500" },
    { label: "Next Tests", value: dashboard?.pendingTasks || 0, icon: <Clock className="w-5 h-5" />, color: "bg-orange-500/10 text-orange-500" },
  ];

  return (
    <MainLayout navItems={NAV} title="Student Dashboard">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
              My Dashboard 
            </h2>
            <p className="text-xs text-primary font-black uppercase tracking-[0.2em]">My Grades and Tests</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-[24px] opacity-10" />)
          ) : (
            stats.map((s, i) => (
              <motion.div key={i} variants={itemVariants}>
                <StatCard {...s} />
              </motion.div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Exams */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[32px] glass border-white/5 h-full">
              <CardHeader className="flex flex-row items-center gap-2 pb-6 border-b border-white/5">
                <Clock className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-xl font-black italic uppercase">Next Tests</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {isLoading ? (
                  [1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl opacity-10" />)
                ) : dashboard?.upcomingExams?.length > 0 ? (
                  dashboard.upcomingExams.map((e) => (
                    <div key={e.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-150 transition-transform">
                        <PlayCircle className="w-12 h-12" />
                      </div>
                      <p className="font-bold text-sm tracking-tight">{e.title}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">{e.course} · {e.duration} MIN</p>
                      <Button size="sm" className="w-full mt-4 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                        onClick={() => navigate(ROUTES.STUDENT_EXAM_INTERFACE.replace(":examId", e.id))}>
                        <PlayCircle className="w-4 h-4 mr-2" /> Start Test
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 opacity-30">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-bold text-sm uppercase">No Tests Now</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Assignments/Tasks */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[32px] glass border-white/5 h-full">
              <CardHeader className="flex flex-row items-center gap-2 pb-6 border-b border-white/5">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl font-black italic uppercase">To Do</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl opacity-10" />)
                ) : (
                  <div className="text-center py-12 opacity-30">
                    
                    <p className="font-bold text-sm uppercase">All done</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Progress */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[32px] glass border-white/5 h-full">
              <CardHeader className="flex flex-row items-center gap-2 pb-6 border-b border-white/5">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <CardTitle className="text-xl font-black italic uppercase">My Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {isLoading ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl opacity-10" />)
                ) : (
                  dashboard?.courses?.map((c, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm font-bold tracking-tight">{c.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Course Done</p>
                        </div>
                        <span className="text-sm font-black text-emerald-500">{c.grade}</span>
                      </div>
                      <Progress value={c.progress} className="h-1.5 bg-white/5" indicatorClassName="bg-gradient-to-r from-emerald-500 to-teal-400" />
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        <span>{c.progress}% done</span>
                        <span>Status: Good</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
