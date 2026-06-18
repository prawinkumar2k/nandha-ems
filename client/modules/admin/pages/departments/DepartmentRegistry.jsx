import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Building2, Search } from "lucide-react";
import { apiClient } from "@/core/api/client";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAdminNav } from "@/core/constants/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useEffect } from "react";

export default function DepartmentRegistry() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiClient.get("/api/departments"),
  });

  useEffect(() => {
    if (!socket) return;
    const handleDepartmentCreated = () => {
      queryClient.invalidateQueries(["departments"]);
    };
    socket.on("department_created", handleDepartmentCreated);
    return () => {
      socket.off("department_created", handleDepartmentCreated);
    };
  }, [socket, queryClient]);

  const createDepartment = useMutation({
    mutationFn: (newDept) => apiClient.post("/api/departments", newDept),
    onSuccess: () => {
      toast.success("Department added successfully");
      queryClient.invalidateQueries(["departments"]);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add department");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      code: formData.get("code"),
      description: formData.get("description"),
    };
    createDepartment.mutate(data);
  };

  const filteredDepartments = departments.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout navItems={getAdminNav()} title="Department Registry">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search departments by name or code..." 
              className="pl-9 bg-white/5 border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-white/10 bg-background/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-widest text-primary">New Department</DialogTitle>
                <DialogDescription className="sr-only">Fill out the details below to add a new department.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Department Name</Label>
                  <Input name="name" required placeholder="e.g. Computer Science" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Department Code</Label>
                  <Input name="code" required placeholder="e.g. CSE" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input name="description" placeholder="Brief department description..." className="bg-white/5 border-white/10" />
                </div>
                <Button type="submit" disabled={createDepartment.isPending} className="w-full mt-6 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
                  {createDepartment.isPending ? "Creating..." : "Save Department"}
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
            {filteredDepartments.length === 0 ? (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
                <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No departments found matching your criteria.</p>
              </div>
            ) : (
              filteredDepartments.map(dept => (
                <Card key={dept._id} className="glass border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px]">
                          {dept.code}
                        </Badge>
                        <h3 className="text-lg font-bold leading-tight">{dept.name}</h3>
                      </div>
                      <Badge variant="secondary" className={`bg-white/10 ${dept.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {dept.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
                      {dept.description || "No description provided."}
                    </p>
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
