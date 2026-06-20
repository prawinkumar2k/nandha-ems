import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { StatCard } from "@/shared/components/StatCard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROUTES } from "@/core/constants/routes";
import { apiClient } from "@/core/api/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen, GraduationCap, CheckCircle2, Clock, PlayCircle, Target, BarChart3
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
  const { user } = useAuth();

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
        <Tabs defaultValue="skill" className="w-full">
          
          {/* Header Row with Dashboard title and Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
             <div className="flex flex-col">
               <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
                 Dashboard 
               </h2>
               <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">
                 Last Updated on {new Date().toLocaleString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', hour12: true })}
               </p>
             </div>
             <TabsList className="bg-card border border-white/10 p-1 rounded-xl h-12 shadow-sm">
               <TabsTrigger value="skill" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-6">Skill</TabsTrigger>
               <TabsTrigger value="course" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-6">Course</TabsTrigger>
               <TabsTrigger value="drives" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold px-6">Drives</TabsTrigger>
             </TabsList>
          </div>

          {/* Profile Banner */}
          <div className="w-full relative mb-8">
            <div className="h-40 w-full rounded-t-[32px] overflow-hidden bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 opacity-90">
               {/* Abstract background elements */}
               <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay" />
            </div>

            <div className="px-8 pb-8 pt-4 bg-card border-x border-b border-white/5 shadow-xl rounded-b-[32px] flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 relative z-10 mx-4">
               <Avatar className="w-28 h-28 border-4 border-card rounded-full bg-muted shadow-2xl">
                  <AvatarImage src={user?.profilePic} />
                  <AvatarFallback className="text-4xl font-black text-primary">{user?.name?.charAt(0)}</AvatarFallback>
               </Avatar>
               <div className="flex-1 pb-2">
                  <h2 className="text-2xl font-black uppercase tracking-tight">{user?.name}</h2>
                  <p className="text-primary font-bold text-sm mt-1">{user?.email}</p>
                  <div className="flex flex-wrap gap-x-8 gap-y-3 mt-4 text-sm font-semibold">
                     <span><span className="text-muted-foreground/60 mr-2 uppercase tracking-widest text-[10px]">Register Number:</span> {dashboard?.profile?.rollNumber || user?.rollNumber || 'Not Assigned'}</span>
                     <span><span className="text-muted-foreground/60 mr-2 uppercase tracking-widest text-[10px]">Degree:</span> {dashboard?.profile?.degree || 'Not Assigned'}</span>
                     <span><span className="text-muted-foreground/60 mr-2 uppercase tracking-widest text-[10px]">Batch:</span> {dashboard?.profile?.batch || 'Not Assigned'}</span>
                     <span><span className="text-muted-foreground/60 mr-2 uppercase tracking-widest text-[10px]">College:</span> {dashboard?.profile?.college || 'Nandha Educational Institutions'}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* SKILL TAB */}
          <TabsContent value="skill" className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <motion.div variants={itemVariants}>
                  <Card className="rounded-[24px] glass border-white/5 p-6 h-48 flex flex-col hover:border-white/10 transition-colors">
                     <h3 className="text-lg font-black tracking-tight">Overall Proficiency</h3>
                     <div className="mt-auto pt-6 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Marks</p>
                          <p className="text-4xl font-black">{dashboard?.skills?.overallScore || 0}</p>
                          <p className="text-xs text-primary font-bold mt-2">Level {dashboard?.skills?.proficiencyLevel || 1}</p>
                        </div>
                     </div>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="rounded-[24px] glass border-white/5 p-6 h-48 flex flex-col hover:border-white/10 transition-colors">
                     <h3 className="text-lg font-black tracking-tight">Exam Activity</h3>
                     <div className="mt-auto grid grid-cols-3 gap-2 text-center">
                        <div>
                           <p className="text-2xl font-black">{dashboard?.skills?.examStats?.attended || 0}</p>
                           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Attended</p>
                        </div>
                        <div>
                           <p className="text-2xl font-black text-emerald-500">{dashboard?.skills?.examStats?.passed || 0}</p>
                           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Passed</p>
                        </div>
                        <div>
                           <p className="text-2xl font-black text-red-500">{dashboard?.skills?.examStats?.failed || 0}</p>
                           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Failed</p>
                        </div>
                     </div>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:row-span-2">
                  <Card className="rounded-[24px] glass border-white/5 p-6 h-full flex flex-col hover:border-white/10 transition-colors">
                     <h3 className="text-lg font-black tracking-tight mb-8">Solved Questions</h3>
                     <div className="flex-1 flex flex-col items-center justify-center gap-10">
                        <div className="w-40 h-40 rounded-full border-[12px] border-primary/20 flex items-center justify-center relative shadow-inner">
                           <div className="absolute inset-0 border-[12px] border-primary rounded-full" style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 0 70%)" }} />
                           <div className="text-center z-10">
                              <p className="text-2xl font-black">{dashboard?.skills?.solved?.total || 0}<span className="text-muted-foreground/50 text-lg">/{dashboard?.skills?.totalQuestions?.total || 0}</span></p>
                              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">Questions</p>
                           </div>
                        </div>
                        <div className="w-full space-y-4 px-4">
                           <div className="space-y-1.5">
                             <div className="flex justify-between text-xs font-bold items-center">
                               <span className="text-emerald-500 uppercase tracking-widest text-[10px]">Easy</span>
                               <span>{dashboard?.skills?.solved?.easy || 0}/{dashboard?.skills?.totalQuestions?.easy || 0}</span>
                             </div>
                             <Progress value={dashboard?.skills?.totalQuestions?.easy ? (dashboard.skills.solved.easy / dashboard.skills.totalQuestions.easy) * 100 : 0} className="h-1.5 bg-white/5" indicatorClassName="bg-emerald-500" />
                           </div>
                           <div className="space-y-1.5">
                             <div className="flex justify-between text-xs font-bold items-center">
                               <span className="text-yellow-500 uppercase tracking-widest text-[10px]">Medium</span>
                               <span>{dashboard?.skills?.solved?.medium || 0}/{dashboard?.skills?.totalQuestions?.medium || 0}</span>
                             </div>
                             <Progress value={dashboard?.skills?.totalQuestions?.medium ? (dashboard.skills.solved.medium / dashboard.skills.totalQuestions.medium) * 100 : 0} className="h-1.5 bg-white/5" indicatorClassName="bg-yellow-500" />
                           </div>
                           <div className="space-y-1.5">
                             <div className="flex justify-between text-xs font-bold items-center">
                               <span className="text-red-500 uppercase tracking-widest text-[10px]">Hard</span>
                               <span>{dashboard?.skills?.solved?.hard || 0}/{dashboard?.skills?.totalQuestions?.hard || 0}</span>
                             </div>
                             <Progress value={dashboard?.skills?.totalQuestions?.hard ? (dashboard.skills.solved.hard / dashboard.skills.totalQuestions.hard) * 100 : 0} className="h-1.5 bg-white/5" indicatorClassName="bg-red-500" />
                           </div>
                        </div>
                     </div>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="rounded-[24px] glass border-white/5 p-6 flex flex-col h-full hover:border-white/10 transition-colors">
                     <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-black tracking-tight">Coding</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Questions Attended</p>
                          <p className="text-2xl font-black">{dashboard?.skills?.coding?.attended || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Solved Correctly</p>
                          <p className="text-2xl font-black">{dashboard?.skills?.coding?.solvedCorrectly || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Your Score</p>
                          <p className="text-2xl font-black text-primary">{dashboard?.skills?.coding?.score || 0}</p>
                        </div>
                        <div className="text-right flex flex-col justify-end">
                          <p className="text-2xl font-black text-emerald-500">{dashboard?.skills?.coding?.accuracy || 0}%</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Accuracy</p>
                        </div>
                     </div>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="rounded-[24px] glass border-white/5 p-6 flex flex-col h-full hover:border-white/10 transition-colors">
                     <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-black tracking-tight">Trust & Integrity</h3>
                     </div>
                     <div className="mt-auto flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Recorded Violations</p>
                          <p className="text-2xl font-black text-orange-500">{dashboard?.skills?.examStats?.violations || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-primary">{dashboard?.skills?.examStats?.integrityScore ?? 100}%</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Trust Score</p>
                        </div>
                     </div>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="md:col-span-2">
                  <Card className="rounded-[24px] glass border-white/5 p-6 hover:border-white/10 transition-colors">
                     <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-black tracking-tight">MCQ</h3>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Questions Attended</p>
                          <p className="text-2xl font-black">{dashboard?.skills?.mcq?.attended || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Solved Correctly</p>
                          <p className="text-2xl font-black">{dashboard?.skills?.mcq?.solvedCorrectly || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Your Score</p>
                          <p className="text-2xl font-black text-primary">{dashboard?.skills?.mcq?.score || 0}</p>
                        </div>
                        <div className="text-right flex flex-col justify-end">
                          <p className="text-2xl font-black text-orange-500">{dashboard?.skills?.mcq?.accuracy || 0}%</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Accuracy</p>
                        </div>
                     </div>
                  </Card>
                </motion.div>
             </div>
           </TabsContent>

          {/* COURSE TAB (Existing Dashboard functionality) */}
          <TabsContent value="course" className="space-y-6">
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

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </TabsContent>

          {/* DRIVES TAB */}
          <TabsContent value="drives" className="mt-6">
             <Card className="rounded-[32px] glass border-white/5 p-16 text-center h-96 flex flex-col items-center justify-center">
                <Target className="w-16 h-16 mx-auto mb-6 text-primary/30" />
                <h3 className="text-3xl font-black uppercase tracking-tight">No Upcoming Drives</h3>
                <p className="text-muted-foreground mt-3 font-medium max-w-md mx-auto">Check back later for placement and internship opportunities. Ensure your skill scores are high to qualify for premium drives.</p>
             </Card>
          </TabsContent>

        </Tabs>
      </motion.div>
    </MainLayout>
  );
}

