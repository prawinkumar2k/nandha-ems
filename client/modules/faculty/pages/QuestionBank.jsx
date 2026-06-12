import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { DataTableWrapper } from "@/shared/components/Table/DataTableWrapper";
import { Modal } from "@/shared/components/Modal/Modal";
import { FormField, FormSelect, FormTextarea } from "@/shared/components/Form/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ROUTES } from "@/core/constants/routes";
import { LayoutDashboard, FileText, HelpCircle, Eye, BarChart3, Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { QuestionFactory } from "../components/QuestionFactory";
import { getFacultyNav } from "@/core/constants/navigation";

const NAV = getFacultyNav();


const DIFF_STYLE = { easy: "bg-success/10 text-success", medium: "bg-warning/10 text-warning", hard: "bg-destructive/10 text-destructive" };

const EMPTY_Q = { 
  type: "mcq", 
  questionText: "", 
  options: { A: "", B: "", C: "", D: "" }, 
  correctAnswer: "A",
  marks: 1,
  difficulty: "medium",
  testCases: [],
  language: "python",
  course: ""
};

export default function QuestionBank() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newQ, setNewQ] = useState({ ...EMPTY_Q });
  const [editingQ, setEditingQ] = useState(null);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: () => apiClient.get("/api/questions")
  });

  const { user } = useAuth();
  const { data: coursesData } = useQuery({
    queryKey: ["faculty-courses"],
    queryFn: () => apiClient.get("/api/reports/faculty"),
    enabled: !!user && user.role === "faculty"
  });

  const { data: allCourses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: () => apiClient.get("/api/courses"),
    enabled: !!user && user.role !== "faculty"
  });

  let COURSE_OPTIONS = [];
  if (user?.role === "faculty" && coursesData?.courses) {
    COURSE_OPTIONS = coursesData.courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` }));
  } else if (allCourses?.length) {
    COURSE_OPTIONS = allCourses.map((c) => ({ value: c._id, label: `${c.code} - ${c.title}` }));
  }

  const handleUpdateNewQ = (index, field, value) => {
    setNewQ(p => ({ ...p, [field]: value }));
  };

  const handleUpdateEditingQ = (index, field, value) => {
    setEditingQ(p => ({ ...p, [field]: value }));
  };

  const createMutation = useMutation({
    pointer: "createMutation",
    mutationFn: (data) => apiClient.post("/api/questions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      setAddOpen(false);
      setNewQ({ ...EMPTY_Q });
      toast.success("Question added!");
    },
    onError: (err) => toast.error("Error", { description: err.message })
  });

  const updateMutation = useMutation({
    pointer: "updateMutation",
    mutationFn: ({ id, data }) => apiClient.put(`/api/questions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      setEditOpen(false);
      setEditingQ(null);
      toast.success("Question updated!");
    },
    onError: (err) => toast.error("Error", { description: err.message })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/api/questions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Deleted!");
    }
  });

  const handleAdd = () => {
    if (!newQ.questionText || !newQ.course) { toast.error("Fill all boxes"); return; }
    createMutation.mutate(newQ);
  };

  const handleEditClick = (question) => {
    setEditingQ({
      ...question,
      course: typeof question.course === 'object' ? question.course?._id : question.course
    });
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editingQ.questionText || !editingQ.course) { toast.error("Fill all boxes"); return; }
    updateMutation.mutate({ id: editingQ._id, data: editingQ });
  };

  const cols = [
    { key: "questionText", header: "Question", sortable: true },
    { key: "course", header: "Course", sortable: true, render: (r) => r.course?.title || r.course || "N/A" },
    { key: "type", header: "Type", render: (r) => r.type?.toUpperCase() },
    { key: "difficulty", header: "Difficulty", render: (r) => (
      <span className={`text-xs font-black px-3 py-1 rounded-xl uppercase tracking-widest ${DIFF_STYLE[r.difficulty] || DIFF_STYLE.medium}`}>{r.difficulty}</span>
    )},
    { key: "actions", header: "", render: (r) => (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditClick(r)}><Edit className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-500/10"
          onClick={() => deleteMutation.mutate(r._id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    )},
  ];

  return (
    <MainLayout navItems={NAV} title="Question Bank">
      <Card className="rounded-[40px] glass border-white/5 relative overflow-hidden shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
          <div><CardTitle className="text-2xl font-black italic uppercase">Question Bank</CardTitle><CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">{questions.length} questions stored</CardDescription></div>
          <Button size="sm" className="rounded-xl h-10 font-black shadow-lg" onClick={() => setAddOpen(true)} disabled={isLoading || createMutation.isPending}><Plus className="w-4 h-4 mr-1" />Add Question</Button>
        </CardHeader>
        <CardContent className="pt-6">
          <DataTableWrapper columns={cols} data={questions} searchKeys={["questionText", "course.title", "difficulty"]} searchPlaceholder="Search questions…" pageSize={8} />
        </CardContent>
      </Card>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Question" size="xl"
        footer={<><Button variant="outline" className="rounded-xl font-bold" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="rounded-xl font-black px-6" onClick={handleAdd} disabled={createMutation.isPending}>Save Question</Button></>}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pt-4">
          <div className="grid grid-cols-2 gap-6">
            <FormSelect label="Course" required options={COURSE_OPTIONS}
              value={newQ.course} onChange={(v) => setNewQ((p) => ({ ...p, course: v }))} 
            />
            <FormSelect label="Difficulty" options={["easy", "medium", "hard"].map((d) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))}
              value={newQ.difficulty} onChange={(v) => setNewQ((p) => ({ ...p, difficulty: v }))} 
            />
          </div>
          
          <div className="pt-4 border-t border-white/5">
            <QuestionFactory 
              question={newQ} 
              index={0} 
              onChange={handleUpdateNewQ} 
              onRemove={() => toast.error("Cannot delete this.")} 
            />
          </div>
        </div>
      </Modal>

      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setEditingQ(null); }} title="Edit Question" size="xl"
        footer={<><Button variant="outline" className="rounded-xl font-bold" onClick={() => { setEditOpen(false); setEditingQ(null); }}>Cancel</Button><Button className="rounded-xl font-black px-6" onClick={handleEditSave} disabled={updateMutation.isPending}>Save Changes</Button></>}>
        {editingQ && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pt-4">
            <div className="grid grid-cols-2 gap-6">
              <FormSelect label="Course" required options={COURSE_OPTIONS}
                value={editingQ.course} onChange={(v) => setEditingQ((p) => ({ ...p, course: v }))} 
              />
              <FormSelect label="Difficulty" options={["easy", "medium", "hard"].map((d) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))}
                value={editingQ.difficulty} onChange={(v) => setEditingQ((p) => ({ ...p, difficulty: v }))} 
              />
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <QuestionFactory 
                question={editingQ} 
                index={0} 
                onChange={handleUpdateEditingQ} 
                onRemove={() => toast.error("Cannot delete this.")} 
              />
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}

