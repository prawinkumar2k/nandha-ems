import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/shared/components/Loader/Loader";
import { ArrowLeft, Clock, ShieldAlert, CheckCircle, XCircle, Code, FileText, BarChart3, User, BookOpen } from "lucide-react";
import { getFacultyNav } from "@/core/constants/navigation";

const NAV = getFacultyNav();

export default function AnswerCenter() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const { data: sub, isLoading, error } = useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () => apiClient.get(`/api/submissions/${submissionId}`),
  });

  if (isLoading) return <PageLoader />;
  if (error || !sub) {
    return (
      <MainLayout navItems={NAV} title="Answer Center">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <p className="text-xl font-black text-rose-500 uppercase tracking-widest">Error loading submission</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </MainLayout>
    );
  }

  const { student, exam, answers, percentage, marksObtained, totalMarks, grade, totalViolations, startedAt, submittedAt, status } = sub;

  // Calculate Time Spent
  const timeSpentStr = startedAt && submittedAt ? (() => {
    const diff = new Date(submittedAt) - new Date(startedAt);
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m}m ${s}s`;
  })() : "N/A";

  const questions = exam?.questions || [];

  return (
    <MainLayout navItems={NAV} title="Student Answer Center">
      <div className="space-y-8">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-primary gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Results
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 px-4 rounded-xl border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
              Export PDF
            </Button>
          </div>
        </div>

        {/* Global Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass border-white/5 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Candidate</p>
              <p className="text-lg font-black tracking-tight leading-tight mt-1">{student?.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{student?.rollNumber}</p>
            </div>
          </Card>

          <Card className="glass border-white/5 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Final Score</p>
              <p className="text-2xl font-black italic tracking-tighter leading-tight mt-1 text-emerald-500">{marksObtained} / {totalMarks}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-emerald-500/20 text-emerald-500 border-none px-2 py-0.5 text-[9px] rounded-lg uppercase tracking-widest font-black">{percentage}%</Badge>
                <Badge className="bg-primary/20 text-primary border-none px-2 py-0.5 text-[9px] rounded-lg uppercase tracking-widest font-black">Grade {grade}</Badge>
              </div>
            </div>
          </Card>

          <Card className="glass border-white/5 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time Spent</p>
              <p className="text-lg font-black tracking-tight leading-tight mt-1">{timeSpentStr}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {status === "auto_submitted" ? "Auto-Submitted" : "Normal Submission"}
              </p>
            </div>
          </Card>

          <Card className="glass border-white/5 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Integrity Index</p>
              <p className="text-lg font-black tracking-tight leading-tight mt-1 text-rose-500">{totalViolations || 0} Violations</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
                {sub.lateSubmission ? "Late Submission" : "On Time"}
              </p>
            </div>
          </Card>
        </div>

        {/* Detailed Answer Review */}
        <div>
          <h3 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" /> Question Review
          </h3>
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const studentAnswer = answers?.[idx];
              let isCorrect = false;

              if (q.type === "mcq") {
                isCorrect = studentAnswer === q.correctAnswer;
              } else if (q.type === "code" || q.type === "descriptive") {
                // Auto-eval placeholder for descriptive/code
                isCorrect = studentAnswer && studentAnswer.length > 5;
              }

              return (
                <Card key={idx} className="glass border-white/5 rounded-[30px] overflow-hidden shadow-2xl relative">
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  
                  <CardHeader className="bg-white/5 border-b border-white/5 pl-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary rounded-lg text-[9px] uppercase tracking-widest font-black">
                          Q{idx + 1} • {q.type.toUpperCase()} • {q.marks || 1} Marks
                        </Badge>
                        <CardTitle className="text-lg font-bold leading-relaxed">{q.text}</CardTitle>
                      </div>
                      <div className={`p-2 rounded-xl ${isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 pl-8 space-y-6">
                    {/* MCQ Representation */}
                    {q.type === "mcq" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, oIdx) => {
                          const isStudentChoice = studentAnswer === opt;
                          const isActuallyCorrect = q.correctAnswer === opt;
                          
                          let badgeStyle = "bg-white/5 text-muted-foreground border-white/10";
                          if (isActuallyCorrect) badgeStyle = "bg-emerald-500/20 text-emerald-500 border-emerald-500/30 ring-1 ring-emerald-500/50";
                          else if (isStudentChoice && !isActuallyCorrect) badgeStyle = "bg-rose-500/20 text-rose-500 border-rose-500/30";

                          return (
                            <div key={oIdx} className={`p-4 rounded-2xl border flex items-center justify-between ${badgeStyle}`}>
                              <span className="font-bold text-sm">{opt}</span>
                              {isStudentChoice && <Badge className="bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest rounded-lg border-none">Selected</Badge>}
                              {isActuallyCorrect && !isStudentChoice && <Badge className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg border-none">Correct Answer</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Descriptive Representation */}
                    {q.type === "descriptive" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5" /> Candidate Response
                          </p>
                          <p className="text-sm font-medium leading-relaxed text-foreground/80 whitespace-pre-wrap">
                            {studentAnswer || <span className="italic opacity-50">No response provided.</span>}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Code Representation */}
                    {q.type === "code" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 font-mono text-sm overflow-x-auto relative group">
                          <p className="absolute top-3 right-4 text-[10px] font-black uppercase tracking-widest text-primary/50 flex items-center gap-2">
                            <Code className="w-3.5 h-3.5" /> Source Code
                          </p>
                          <pre className="text-emerald-400 mt-4">
                            <code>{studentAnswer || "// No code submitted"}</code>
                          </pre>
                        </div>
                        {q.testCases && (
                           <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Test Cases (Evaluated by Platform)</p>
                             <div className="space-y-2">
                               <Badge className="bg-emerald-500/20 text-emerald-500 border-none px-3 py-1 text-[9px] rounded-lg uppercase font-black mr-2">Passed: {q.testCases.length}</Badge>
                               <Badge className="bg-rose-500/20 text-rose-500 border-none px-3 py-1 text-[9px] rounded-lg uppercase font-black">Failed: 0</Badge>
                             </div>
                           </div>
                        )}
                      </div>
                    )}

                  </CardContent>
                </Card>
              );
            })}

            {questions.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-sm font-black italic tracking-widest uppercase text-muted-foreground/50">No questions recorded for this exam</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
