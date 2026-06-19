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
  Users, Mail, Award, Cpu, Sparkles, Eye, Loader2, 
  Calendar, BookOpen, Clock, ShieldCheck, Activity, Terminal,
  BarChart, LineChart, TrendingUp, ChevronLeft, UserPlus, Lock, Fingerprint, FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const NAV = getHODNav();



export default function FacultyManagement() {
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [viewMode, setViewMode] = useState("profile");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: "", email: "", employeeId: "", password: "" });
  
  const queryClient = useQueryClient();

  // Queries
  const { data: faculty, isLoading, error } = useQuery({
    queryKey: ["hod-faculty-list"],
    queryFn: () => apiClient.get("/api/hod/faculty/status"),
  });

  const { data: analyticsData = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ["hod-faculty-analytics", selectedFaculty?._id],
    queryFn: () => apiClient.get(`/api/hod/faculty/${selectedFaculty._id}/analytics`),
    enabled: !!selectedFaculty && viewMode === "analytics"
  });

  // Mutations
  const addFacultyMutation = useMutation({
    mutationFn: (data) => apiClient.post("/api/hod/faculty", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["hod-faculty-list"]);
      setIsAddModalOpen(false);
      setNewFaculty({ name: "", email: "", employeeId: "", password: "" });
      toast.success("Teacher Added", {
        description: "New account created.",
      });
    },
    onError: (err) => {
      toast.error("Error", { description: err.message });
    }
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.email || !newFaculty.password) {
      return toast.error("Error", { description: "All information is required." });
    }
    addFacultyMutation.mutate(newFaculty);
  };

  const columns = [
    {
      key: "name",
      header: "Teacher",
      render: (r) => (
        <div className="flex items-center gap-3 py-2">
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarImage src={r.profilePic} />
            <AvatarFallback className="bg-primary/10 text-primary font-black">
              {r.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-black tracking-tight text-sm uppercase italic">{r.name}</p>
            <p className="text-[10px] font-black uppercase text-primary tracking-widest">{r.employeeId || "TEACHER"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Activity",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest",
            r.status === "Conducting Exam" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
          )}>
            {r.status || "Idle"}
          </Badge>
          {r.activeExam && <span className="text-[10px] font-black text-muted-foreground uppercase">in {r.activeExam}</span>}
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (r) => (
        <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase">
          <Mail className="w-3.5 h-3.5 text-primary" /> {r.email}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-xl h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary"
          onClick={() => { setSelectedFaculty(r); setViewMode("profile"); }}
        >
          <Eye className="w-5 h-5" />
        </Button>
      ),
    },
  ];

  return (
    <MainLayout navItems={NAV} title="Teacher List">
      <div className="space-y-8 animate-in fade-in duration-500">
        
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-2 uppercase italic">
              Teacher Details <Sparkles className="w-6 h-6 text-accent" />
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mt-1">managing teachers</p>
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
              <UserPlus className="w-4 h-4" /> Add Teacher
            </Button>
          </div>
        </div>

        <Card className="rounded-[40px] glass border-white/5 shadow-2xl overflow-hidden relative">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-[20px] bg-primary/10 text-primary shadow-lg shadow-primary/10">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase italic italic">Active Teachers</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">Total: {faculty?.length || 0}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest">Loading Teachers...</p>
              </div>
            ) : error ? (
              <div className="p-10 text-center text-rose-500 font-black italic tracking-tighter uppercase">
                🚨 Error: Cannot get teachers.
              </div>
            ) : (
              <DataTableWrapper 
                columns={columns} 
                data={Array.isArray(faculty) ? faculty : []} 
                searchKeys={["name", "email", "status"]} 
                searchPlaceholder="Search teachers..."
              />
            )}
          </CardContent>
        </Card>

        {/* Bulk Upload Modal */}
        <BulkOnboardingModal 
          isOpen={isBulkModalOpen} 
          onClose={() => setIsBulkModalOpen(false)} 
          targetRole="faculty"
          onComplete={() => queryClient.invalidateQueries(["hod-faculty-list"])}
        />

        {/* Add Faculty Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Teacher"
          description="Create a new teacher account."
          size="md"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-6">
             <div className="space-y-4">
               <div className="relative">
                 <Users className="absolute left-4 top-[40px] w-4 h-4 text-primary" />
                 <FormField label="Full Name" placeholder="Teacher Name" value={newFaculty.name} 
                    onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})} 
                    className="pl-12 rounded-xl h-11 font-black uppercase text-xs" />
               </div>
               <div className="relative">
                 <Mail className="absolute left-4 top-[40px] w-4 h-4 text-primary" />
                 <FormField label="Work Email" type="email" placeholder="email@nec.edu" value={newFaculty.email} 
                    onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})} 
                    className="pl-12 rounded-xl h-11 font-black uppercase text-xs" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="relative">
                   <Fingerprint className="absolute left-4 top-[40px] w-4 h-4 text-primary" />
                   <FormField label="Teacher ID" placeholder="T-001" value={newFaculty.employeeId} 
                      onChange={(e) => setNewFaculty({...newFaculty, employeeId: e.target.value})} 
                      className="pl-12 rounded-xl h-11 font-black uppercase text-xs" />
                 </div>
                 <div className="relative">
                   <Lock className="absolute left-4 top-[40px] w-4 h-4 text-primary" />
                   <FormField label="Password" type="password" placeholder="••••••••" value={newFaculty.password} 
                      onChange={(e) => setNewFaculty({...newFaculty, password: e.target.value})} 
                      className="pl-12 rounded-xl h-11 font-black uppercase text-xs" />
                 </div>
               </div>
             </div>
             <div className="flex gap-4 pt-8">
                <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="flex-1 rounded-xl h-12 font-black uppercase text-xs border border-white/5">Cancel</Button>
                <Button type="submit" disabled={addFacultyMutation.isPending} className="flex-1 rounded-xl h-12 font-black uppercase text-xs shadow-xl shadow-primary/20">
                  {addFacultyMutation.isPending ? "Adding..." : "Add Teacher"}
                </Button>
             </div>
          </form>
        </Modal>

        {/* Faculty Detail / Analytics Modal */}
        <Modal 
          isOpen={!!selectedFaculty} 
          onClose={() => setSelectedFaculty(null)}
          title={viewMode === "profile" ? "Teacher Profile" : "Teacher Performance"}
          size={viewMode === "analytics" ? "xl" : "lg"}
        >
          {selectedFaculty && (
            <AnimatePresence mode="wait">
              {viewMode === "profile" ? (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-6 pt-4"
                >
                  <div className="flex items-center gap-6 p-6 rounded-[32px] glass border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-2xl">
                      <AvatarImage src={selectedFaculty.profilePic} />
                      <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">{selectedFaculty.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="relative z-10">
                      <h3 className="text-3xl font-black tracking-tight uppercase italic">{selectedFaculty.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="bg-primary text-primary-foreground text-[10px] font-black rounded-lg uppercase px-3 shadow-lg">{selectedFaculty.employeeId || 'T001'}</Badge>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Teacher account</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-[24px] bg-white/5 border border-white/5 shadow-inner">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                      <p className="font-black flex items-center gap-2 uppercase italic">
                        <Activity className="w-4 h-4 text-emerald-500" /> {selectedFaculty.status}
                      </p>
                    </div>
                    <div className="p-6 rounded-[24px] bg-white/5 border border-white/5 shadow-inner">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Time</p>
                      <p className="font-black flex items-center gap-2 text-xs uppercase italic">
                        <Clock className="w-4 h-4 text-primary" /> {selectedFaculty.lastLogin ? new Date(selectedFaculty.lastLogin).toLocaleTimeString() : 'Recent'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-3">Teacher Roles</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm group hover:border-primary/30 transition-colors">
                        <span className="text-xs font-black uppercase italic italic">Watch Tests</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm group hover:border-primary/30 transition-colors opacity-50">
                        <span className="text-xs font-black uppercase italic italic">Room Management</span>
                        <Terminal className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black uppercase text-xs border-white/10 glass">Email Teacher</Button>
                    <Button 
                      onClick={() => setViewMode("analytics")}
                      className="flex-1 rounded-2xl h-14 font-black uppercase text-xs bg-primary shadow-xl shadow-primary/20 italic"
                    >
                      Teacher Score
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="analytics"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-8 pt-4"
                >
                  <Button variant="ghost" onClick={() => setViewMode("profile")} className="rounded-xl gap-2 font-black uppercase text-[10px] mb-2 border border-white/5">
                    <ChevronLeft className="w-4 h-4" /> Back to Profile
                  </Button>

                  <div className="grid grid-cols-3 gap-6">
                     <div className="p-6 rounded-[32px] glass border border-white/5 text-center shadow-xl">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Power score</p>
                        <p className="text-3xl font-black text-primary italic">92%</p>
                     </div>
                     <div className="p-6 rounded-[32px] glass border border-white/5 text-center shadow-xl">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Work score</p>
                        <p className="text-3xl font-black text-emerald-500 italic">88%</p>
                     </div>
                     <div className="p-6 rounded-[32px] glass border border-white/5 text-center shadow-xl">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Score</p>
                        <p className="text-3xl font-black text-rose-500 italic">95%</p>
                     </div>
                  </div>

                  <div className="h-[320px] w-full p-8 rounded-[40px] glass border border-white/5 shadow-2xl relative overflow-hidden">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Weekly Score
                    </h4>
                    <ResponsiveContainer width="100%" height="75%">
                      <AreaChart data={analyticsData}>
                        <defs>
                          <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} fontWeight="black" />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} fontWeight="black" />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                           itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="engagement" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorEng)" strokeWidth={4} />
                        <Area type="monotone" dataKey="efficiency" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex justify-between items-center p-6 rounded-[32px] bg-primary/5 border border-primary/10 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-primary/20 text-primary shadow-inner"><Sparkles className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Teacher Notes</p>
                        <p className="text-xs font-black uppercase italic text-muted-foreground mt-1">High performance. Promote to head account.</p>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-xl font-black uppercase text-[10px] h-10 border-white/10 glass px-6">Save Result</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </Modal>

      </div>
    </MainLayout>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
