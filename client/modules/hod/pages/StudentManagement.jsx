import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { DataTableWrapper } from "@/shared/components/Table/DataTableWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Modal } from "@/shared/components/Modal/Modal";
import { FormField } from "@/shared/components/Form/FormField";
import { BulkOnboardingModal } from "../components/BulkOnboardingModal";
import { getHODNav } from "@/core/constants/navigation";
import { apiClient } from "@/core/api/client";
import { toast } from "sonner";
import { 
  GraduationCap, Mail, FileSpreadsheet, UserPlus, Sparkles, Eye, Loader2, 
  Trash2, ShieldAlert, Fingerprint, Lock, ShieldCheck
} from "lucide-react";

const NAV = getHODNav();

export default function StudentManagement() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", rollNumber: "", password: "" });
  
  const queryClient = useQueryClient();

  const { data: students, isLoading, error } = useQuery({
    queryKey: ["hod-students-list"],
    queryFn: () => apiClient.get("/api/users?role=student"), // Filtered by dept on backend
  });

  const addStudentMutation = useMutation({
    mutationFn: (data) => apiClient.post("/api/hod/student", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["hod-students-list"]);
      setIsAddModalOpen(false);
      setNewStudent({ name: "", email: "", rollNumber: "", password: "" });
      toast.success("Student Added", { description: "Profile created." });
    },
    onError: (err) => toast.error("Error", { description: err.message })
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addStudentMutation.mutate(newStudent);
  };

  const columns = [
    {
      key: "name",
      header: "Student Name",
      render: (r) => (
        <div className="flex items-center gap-3 py-2">
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">{r.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-black text-sm tracking-tight uppercase italic">{r.name}</p>
            <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">{r.rollNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (r) => <span className="text-[10px] font-black uppercase text-muted-foreground">{r.email}</span>
    },
    {
      key: "violations",
      header: "Alert Level",
      render: (r) => (
        <Badge variant="outline" className={cn(
          "rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest",
          (r.totalViolations || 0) > 3 ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        )}>
           { (r.totalViolations || 0) > 3 ? 'Needs Check' : 'Safe' }
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
            className="rounded-xl h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={() => setSelectedStudent(r)}
          >
            <Eye className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout navItems={NAV} title="Student List">
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-2 uppercase italic">
              Student Details <GraduationCap className="w-7 h-7 text-primary" />
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mt-1">managing students</p>
          </div>
          <div className="flex gap-3">
             <Button 
                variant="outline" 
                onClick={() => setIsBulkModalOpen(true)}
                className="rounded-xl border-white/10 glass px-6 font-black uppercase text-xs h-11 gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" /> Bulk Upload
             </Button>
             <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="rounded-xl shadow-lg shadow-primary/20 px-6 font-black uppercase text-xs h-11 gap-2"
              >
                <UserPlus className="w-4 h-4" /> Add Student
             </Button>
          </div>
        </div>

        <Card className="rounded-[40px] glass border-white/5 shadow-2xl overflow-hidden relative">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-xl font-black uppercase italic italic">Active Students</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">Total: {students?.length || 0}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             {isLoading ? (
               <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Loading Students...</p>
               </div>
             ) : error ? (
               <div className="p-10 text-center text-rose-500 font-black italic tracking-tighter uppercase">🚨 Error: Cannot get students.</div>
             ) : (
               <DataTableWrapper 
                 columns={columns} 
                 data={Array.isArray(students) ? students : []} 
                 searchKeys={["name", "rollNumber", "email"]} 
                 searchPlaceholder="Search students..."
               />
             )}
          </CardContent>
        </Card>

        {/* Modal Suite */}
        <BulkOnboardingModal 
          isOpen={isBulkModalOpen} 
          onClose={() => setIsBulkModalOpen(false)} 
          targetRole="student"
          onComplete={() => queryClient.invalidateQueries(["hod-students-list"])}
        />

        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Student">
          <form onSubmit={handleAddSubmit} className="space-y-5 pt-6">
             <div className="space-y-4">
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-[40px] w-4 h-4 text-primary" />
                  <FormField label="Full Name" placeholder="Student Name" value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} className="pl-12 rounded-xl h-11 font-black uppercase text-xs" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-[40px] w-4 h-4 text-primary" />
                  <FormField label="Institutional Email" type="email" placeholder="student@nec.edu" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} className="pl-12 rounded-xl h-11 font-black uppercase text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-[40px] w-4 h-4 text-primary" />
                    <FormField label="Roll Number" placeholder="21AD001" value={newStudent.rollNumber} onChange={(e) => setNewStudent({...newStudent, rollNumber: e.target.value})} className="pl-12 rounded-xl h-11 font-black uppercase text-xs" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-[40px] w-4 h-4 text-primary" />
                    <FormField label="Password" type="password" placeholder="••••••••" value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} className="pl-12 rounded-xl h-11 font-black uppercase text-xs" />
                  </div>
                </div>
             </div>
             <div className="flex gap-4 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="flex-1 rounded-xl h-12 font-black uppercase text-xs border border-white/5">Cancel</Button>
                <Button type="submit" disabled={addStudentMutation.isPending} className="flex-1 rounded-xl h-12 font-black uppercase text-xs shadow-xl shadow-primary/20">
                  {addStudentMutation.isPending ? "Adding..." : "Add Student"}
                </Button>
             </div>
          </form>
        </Modal>

        {/* Student Detail View Modal */}
        <Modal 
          isOpen={!!selectedStudent} 
          onClose={() => setSelectedStudent(null)}
          title="Student Profile"
        >
          {selectedStudent && (
             <div className="space-y-6 pt-4">
                <div className="flex items-center gap-6 p-6 rounded-[32px] glass border border-white/5 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                   <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-2xl">
                      <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">{selectedStudent.name[0]}</AvatarFallback>
                   </Avatar>
                   <div className="relative z-10">
                      <h3 className="text-3xl font-black tracking-tight uppercase italic">{selectedStudent.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="bg-primary text-primary-foreground text-[10px] font-black rounded-lg uppercase px-3 shadow-lg">{selectedStudent.rollNumber}</Badge>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Student account</span>
                      </div>
                   </div>
                </div>

                <div className="p-6 rounded-[24px] bg-white/5 border border-white/5 space-y-4 shadow-inner">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-3">Grades</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-black uppercase text-muted-foreground opacity-50">Average Marks</span>
                         <span className="text-2xl font-black italic">8.42</span>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                         <span className="text-[10px] font-black uppercase text-muted-foreground opacity-50">Class Rank</span>
                         <span className="text-2xl font-black text-emerald-500 italic">Top 15%</span>
                      </div>
                   </div>
                </div>

                <div className="flex justify-between items-center p-6 rounded-[24px] bg-rose-500/5 border border-rose-500/10 shadow-lg">
                   <div className="flex gap-4 items-center">
                      <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-500 shadow-inner"><ShieldAlert className="w-6 h-6" /></div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none text-rose-500">Alert Report</p>
                         <p className="text-[10px] font-black text-muted-foreground mt-1 uppercase italic">{selectedStudent.totalViolations || 0} Previous Alerts</p>
                      </div>
                   </div>
                   <Button variant="ghost" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-500 border border-transparent hover:border-rose-500/20">View Alerts</Button>
                </div>
             </div>
          )}
        </Modal>

      </div>
    </MainLayout>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
