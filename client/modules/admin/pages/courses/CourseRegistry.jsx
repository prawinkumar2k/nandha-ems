import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, BookOpen, Search } from "lucide-react";
import { apiClient } from "@/core/api/client";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAdminNav, getHODNav, getFacultyNav } from "@/core/constants/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useEffect } from "react";

export default function CourseRegistry() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiClient.get("/api/courses"),
  });

  useEffect(() => {
    if (!socket) return;
    const handleCourseCreated = () => {
      queryClient.invalidateQueries(["courses"]);
    };
    socket.on("course_created", handleCourseCreated);
    return () => {
      socket.off("course_created", handleCourseCreated);
    };
  }, [socket, queryClient]);

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiClient.get("/api/departments"),
  });

  const { data: faculties = [] } = useQuery({
    queryKey: ["faculties"],
    queryFn: async () => {
      const res = await apiClient.get("/api/users?role=faculty&limit=100");
      return res.data || [];
    },
  });

  const createCourse = useMutation({
    mutationFn: (newCourse) => apiClient.post("/api/courses", newCourse),
    onSuccess: () => {
      toast.success("Course added successfully");
      queryClient.invalidateQueries(["courses"]);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add course");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get("title"),
      code: formData.get("code"),
      description: formData.get("description"),
      department: formData.get("department"),
      credits: Number(formData.get("credits")),
      semester: Number(formData.get("semester")),
    };
    createCourse.mutate(data);
  };

  const filteredCourses = courses.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navItems = user?.role === "faculty" ? getFacultyNav() : user?.role === "hod" ? getHODNav() : getAdminNav();

  return (
    <MainLayout navItems={navItems} title="Course Registry">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search courses by name or code..." 
              className="pl-9 bg-white/5 border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-white/10 bg-background/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-widest text-primary">New Course</DialogTitle>
                <DialogDescription className="sr-only">Fill out the details below to add a new course.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Course Title</Label>
                  <Input name="title" required placeholder="e.g. Data Structures" className="bg-white/5 border-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course Code</Label>
                    <Input name="code" required placeholder="e.g. CS201" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Credits</Label>
                    <Input name="credits" type="number" min="1" max="10" required placeholder="4" className="bg-white/5 border-white/10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Input name="semester" type="number" min="1" max="8" required placeholder="3" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <select name="department" required className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <option value="" className="bg-background text-foreground">Select Dept</option>
                      {departments.map(d => (
                        <option key={d._id} value={d._id} className="bg-background text-foreground">{d.code}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assigned Faculty</Label>
                  <select name="faculty" required className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <option value="" className="bg-background text-foreground">Select Faculty Coordinator</option>
                    {faculties.map(f => (
                      <option key={f._id} value={f._id} className="bg-background text-foreground">{f.name} ({f.email})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input name="description" placeholder="Brief course description..." className="bg-white/5 border-white/10" />
                </div>
                <Button type="submit" disabled={createCourse.isPending} className="w-full mt-6 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
                  {createCourse.isPending ? "Creating..." : "Save Course"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5 border border-white/10" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No courses found matching your criteria.</p>
              </div>
            ) : (
              filteredCourses.map(course => (
                <Card key={course._id} className="glass border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px]">
                          {course.code}
                        </Badge>
                        <h3 className="text-lg font-bold leading-tight">{course.title}</h3>
                      </div>
                      <Badge variant="secondary" className="bg-white/10">Sem {course.semester}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
                      {course.description || "No description provided."}
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
                      <span>{course.department?.name || 'N/A'}</span>
                      <span>{course.credits} Credits</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
