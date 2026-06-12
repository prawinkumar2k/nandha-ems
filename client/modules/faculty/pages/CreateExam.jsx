import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { FormField, FormSelect, FormTextarea } from "@/shared/components/Form/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ROUTES } from "@/core/constants/routes";
import { 
  LayoutDashboard, FileText, HelpCircle, Eye, BarChart3, Plus, 
  Trash2, Sparkles, Wand2, ShieldCheck, Clock, Calendar, Database, AlertCircle
} from "lucide-react";
import { getHODNav, getFacultyNav } from "@/core/constants/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/core/api/client";
import { QuestionFactory } from "../components/QuestionFactory";

const EMPTY_Q = { 
  type: "mcq", 
  questionText: "", 
  options: { A: "", B: "", C: "", D: "" }, 
  correctAnswer: "A",
  marks: 1,
  difficulty: "medium",
  testCases: [],
  language: "python"
};

export default function CreateExam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([{ ...EMPTY_Q }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [selectedBankQs, setSelectedBankQs] = useState([]);
  const [targetIndex, setTargetIndex] = useState(null); // null means bulk append
  const [examInfo, setExamInfo] = useState({
    title: "",
    course: "",
    duration: 60,
    scheduledAt: "",
    description: "",
    security: {
      maxViolations: 5,
      requireFullscreen: true,
      disableCopyPaste: true,
      detectTabSwitch: true
    }
  });


  const { data: bankQuestions = [], isLoading: isBankLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: () => apiClient.get("/api/questions"),
    enabled: isBankOpen
  });

  const handleImportQuestions = () => {
    if (selectedBankQs.length === 0) return;
    const mapped = bankQuestions.filter(q => selectedBankQs.includes(q._id)).map(q => ({
      ...EMPTY_Q,
      type: q.type || "mcq",
      questionText: q.questionText,
      options: q.options || { A: "", B: "", C: "", D: "" },
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
      difficulty: q.difficulty || "medium",
      testCases: q.testCases || [],
      language: q.language || "python"
    }));
    
    if (targetIndex !== null) {
      // Auto-fill specific slot (only takes the first selected)
      const newQs = [...questions];
      newQs[targetIndex] = mapped[0];
      setQuestions(newQs);
      toast.success("Synced", { description: "Question slot auto-filled from database." });
    } else {
      // Bulk append
      const currentList = questions.length === 1 && !questions[0].questionText ? [] : questions;
      setQuestions([...currentList, ...mapped]);
      toast.success("Auto-Filled", { description: `Imported ${mapped.length} questions from database.` });
    }

    setSelectedBankQs([]);
    setTargetIndex(null);
    setIsBankOpen(false);
  };

  const openBankForSlot = (index) => {
    setTargetIndex(index);
    setIsBankOpen(true);
  };

  const NAV = user?.role === "hod" ? getHODNav() : getFacultyNav();

  const { data: coursesData } = useQuery({
    queryKey: ["faculty-courses"],
    queryFn: () => apiClient.get("/api/reports/faculty"),
    enabled: user?.role === "faculty"
  });

  const { data: allCourses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: () => apiClient.get("/api/courses"),
    enabled: user?.role !== "faculty"
  });

  // Prepare options array from fetched data
  let courseOptions = [];
  if (user?.role === "faculty" && coursesData?.courses) {
    courseOptions = coursesData.courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` }));
  } else if (allCourses?.length) {
    courseOptions = allCourses.map((c) => ({ value: c._id, label: `${c.code} - ${c.title}` }));
  }

  const handleInfoChange = (field, value) => {
    if (field.startsWith("security.")) {
      const key = field.split(".")[1];
      setExamInfo(prev => ({
        ...prev,
        security: { ...prev.security, [key]: value }
      }));
    } else {
      setExamInfo(prev => ({ ...prev, [field]: value }));
    }
  };


  const addQuestion = () => setQuestions(prev => [...prev, { ...EMPTY_Q, marks: questions[questions.length-1]?.marks || 1 }]);
  const removeQuestion = (i) => setQuestions(prev => prev.filter((_, idx) => idx !== i));
  const updateQ = (i, field, val) => setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: val } : q));

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!examInfo.title || !examInfo.course || !examInfo.scheduledAt) {
      return toast.error("Missing Info", { description: "Title, Course, and Time are required." });
    }
    if (questions.length === 0) {
      return toast.error("No Questions", { description: "A test must have at least one question." });
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...examInfo,
        questions,
        totalMarks: questions.reduce((sum, q) => sum + (q.marks || 1), 0),
        status: "scheduled"
      };

      await apiClient.post("/api/hod/exams", payload); // Generic endpoint to be confirmed
      toast.success("Test Saved", {
        description: `${examInfo.title} successfully saved to the system.`,
      });
      navigate(user?.role === "hod" ? ROUTES.HOD_EXAMS : ROUTES.FACULTY_DASHBOARD);
    } catch (err) {
      toast.error("Could not save", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout navItems={NAV} title="Make New Test">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3 uppercase">
               Make Test <Wand2 className="w-8 h-8 text-primary" />
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-2">Test Builder</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold" onClick={() => navigate(-1)}>Cancel</Button>
            <Button 
               onClick={handlePublish} 
               disabled={isSubmitting}
               className="rounded-2xl h-12 px-8 font-black shadow-lg shadow-primary/20 text-lg"
            >
              <ShieldCheck className="w-5 h-5 mr-2" /> SAVE TEST
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Config Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[40px] glass border-white/5 shadow-2xl overflow-hidden sticky top-8">
              <CardHeader className="bg-primary/5 border-b border-white/5">
                <CardTitle className="text-lg font-black italic tracking-tighter uppercase">Test Info</CardTitle>
                <CardDescription className="text-[10px] uppercase font-black tracking-widest leading-none mt-1">Set Test Info</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <FormField 
                  label="Test Name" 
                  placeholder="e.g., Python Advanced Lab"
                  value={examInfo.title}
                  onChange={(e) => handleInfoChange("title", e.target.value)}
                  inputClassName="rounded-2xl h-12"
                />
                
                <div className="space-y-4 pt-2">
                  <FormSelect 
                    label="Course" 
                    placeholder="Select Course..." 
                    options={courseOptions}
                    value={examInfo.course}
                    onChange={(v) => handleInfoChange("course", v)}
                  />
                  <FormField label="Test Duration (Min)" type="number" value={examInfo.duration}
                    onChange={(e) => handleInfoChange("duration", parseInt(e.target.value))}
                    startIcon={Clock}
                    inputClassName="rounded-2xl h-12" />
                  <FormField label="Test Time" type="datetime-local" value={examInfo.scheduledAt}
                    onChange={(e) => handleInfoChange("scheduledAt", e.target.value)}
                    startIcon={Calendar}
                    inputClassName="rounded-2xl h-12 text-sm font-semibold tracking-tight" />
                  
                  <FormField 
                    label="Max Violations (Alert Limit)" 
                    type="number" 
                    value={examInfo.security.maxViolations}
                    onChange={(e) => handleInfoChange("security.maxViolations", parseInt(e.target.value))}
                    startIcon={AlertCircle}
                    inputClassName="rounded-2xl h-12"
                    placeholder="e.g. 5"
                  />
                </div>


                <FormTextarea 
                   label="Rules for Students" 
                   placeholder="Instructions for students..."
                   value={examInfo.description}
                   onChange={(e) => handleInfoChange("description", e.target.value)}
                   className="rounded-2xl h-32"
                />

                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Total Marks</span>
                    <span className="text-lg font-black text-primary">{questions.reduce((sum, q) => sum + (q.marks || 1), 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Matrix */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex justify-between items-center px-4">
                <h3 className="text-xl font-black italic tracking-tighter uppercase">Questions</h3>
                <div className="flex gap-2">
                  <Button 
                     variant="outline"
                     onClick={() => setIsBankOpen(true)}
                     className="rounded-xl h-10 px-4 font-bold gap-2 text-xs"
                  >
                    <Database className="w-4 h-4 text-primary" strokeWidth={3} /> Get from DB
                  </Button>
                  <Button 
                     onClick={addQuestion}
                     className="rounded-xl h-10 px-4 font-bold gap-2 text-xs"
                  >
                    <Plus className="w-4 h-4" strokeWidth={3} /> Add New Question
                  </Button>
                </div>
             </div>

             <div className="space-y-6">
                {questions.map((q, i) => (
                   <QuestionFactory 
                     key={i} 
                     index={i} 
                     question={q} 
                     onChange={updateQ} 
                     onRemove={removeQuestion}
                     onImportSource={() => openBankForSlot(i)}
                   />
                ))}
             </div>

             <Button 
                variant="outline" 
                onClick={addQuestion}
                className="w-full h-20 rounded-[32px] border-2 border-dashed border-white/10 glass hover:border-primary/50 transition-all font-black uppercase tracking-[0.3em] flex flex-col gap-2"
             >
                <Plus className="w-6 h-6 text-primary" />
                <span>Add Question</span>
             </Button>
          </div>
        </div>

      </div>

      <Modal isOpen={isBankOpen} onClose={() => setIsBankOpen(false)} title="Question Bank" size="xl"
        footer={<><Button variant="outline" onClick={() => setIsBankOpen(false)}>Cancel</Button><Button onClick={handleImportQuestions} disabled={selectedBankQs.length === 0}>Import Selected ({selectedBankQs.length})</Button></>}>
        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {isBankLoading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : bankQuestions.length === 0 ? <p className="text-center text-muted-foreground py-8">No questions found in database.</p> : bankQuestions.map(q => (
             <div key={q._id} onClick={() => setSelectedBankQs(p => p.includes(q._id) ? p.filter(id => id !== q._id) : [...p, q._id])} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${selectedBankQs.includes(q._id) ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20'}`}>
                <input type="checkbox" checked={selectedBankQs.includes(q._id)} onChange={() => {}} className="mt-1 w-4 h-4 rounded border-white/20 accent-primary flex-shrink-0 cursor-pointer" />
                <div>
                   <p className="font-semibold text-sm">{q.questionText}</p>
                   <div className="flex gap-2 mt-2">
                     <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">{q.type}</span>
                     <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">{q.topic || "General"}</span>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </Modal>
    </MainLayout>
  );
}
