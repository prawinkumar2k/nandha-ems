import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingService } from "@/core/api/services";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/core/constants/routes";
import { Settings, SaveAll, RefreshCw, Building2, School, Contact } from "lucide-react";
import { getAdminNav } from "@/core/constants/navigation";

const NAV = getAdminNav();

export default function SystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => settingService.get(),
  });

  const mutation = useMutation({
    mutationFn: (data) => settingService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["system-settings"]);
      toast({ title: "Settings Saved", description: "All system rules have been updated." });
    },
    onError: (err) => {
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (settings) {
      setForm({
        institutionName: settings.institutionName,
        institutionEmail: settings.institutionEmail,
        institutionPhone: settings.institutionPhone,
        currentAcademicYear: settings.currentAcademicYear,
        currentSemester: settings.currentSemester,
        maxStudentsPerCourse: settings.maxStudentsPerCourse,
        notificationEmail: settings.notificationEmail,
        smtpHost: settings.smtpHost,
      });
    }
  }, [settings]);

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  if (isLoading) return <MainLayout navItems={NAV} title="Loading...">
    <div className="max-w-2xl mx-auto py-40 text-center space-y-4">
      <RefreshCw className="w-10 h-10 animate-spin mx-auto text-primary/40" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reading settings...</p>
    </div>
  </MainLayout>;

  return (
    <MainLayout navItems={NAV} title="System Settings">
      <div className="max-w-3xl mx-auto space-y-10 pb-20">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
            <div>
               <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3 text-foreground italic uppercase">
                  System Settings <Settings className="w-6 h-6 text-primary" />
               </h2>
               <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">General rules for the platform</p>
            </div>
            <Button className="rounded-2xl h-14 px-8 shadow-2xl shadow-primary/20 gap-3 font-black text-[10px] uppercase tracking-widest" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
               {mutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <SaveAll className="w-4 h-4" />} 
               Save Settings
            </Button>
         </div>

         <div className="grid grid-cols-1 gap-8">
            <Card className="rounded-[44px] glass border-white/5 relative overflow-hidden shadow-2xl">
               <CardHeader className="p-10 border-b border-white/5 bg-primary/5">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[24px] bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black italic uppercase">College Details</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60">Info about the college</CardDescription>
                    </div>
                  </div>
               </CardHeader>
               <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">College Name</Label>
                     <Input id="institutionName" value={form.institutionName || ""} onChange={handleChange} className="rounded-2xl h-12 border-white/5 bg-black/20 font-bold" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Email</Label>
                     <Input id="institutionEmail" value={form.institutionEmail || ""} onChange={handleChange} className="rounded-2xl h-12 border-white/5 bg-black/20 font-bold" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                     <Input id="institutionPhone" value={form.institutionPhone || ""} onChange={handleChange} className="rounded-2xl h-12 border-white/5 bg-black/20 font-bold" />
                  </div>
               </CardContent>
            </Card>

            <Card className="rounded-[44px] glass border-white/5 relative overflow-hidden shadow-2xl">
               <CardHeader className="p-10 border-b border-white/5 bg-emerald-500/5">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[24px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <School className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black italic uppercase italic">Term Details</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Manage current term rules</CardDescription>
                    </div>
                  </div>
               </CardHeader>
               <CardContent className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Academic Year</Label>
                     <Input id="currentAcademicYear" value={form.currentAcademicYear || ""} onChange={handleChange} className="rounded-2xl h-12 border-white/5 bg-black/20 font-bold" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Semester</Label>
                     <Input id="currentSemester" type="number" value={form.currentSemester || ""} onChange={handleChange} className="rounded-2xl h-12 border-white/5 bg-black/20 font-bold" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Student Limit</Label>
                     <Input id="maxStudentsPerCourse" type="number" value={form.maxStudentsPerCourse || ""} onChange={handleChange} className="rounded-2xl h-12 border-white/5 bg-black/20 font-bold" />
                  </div>
               </CardContent>
            </Card>

            <Card className="rounded-[44px] glass border-white/5 relative overflow-hidden shadow-2xl">
               <CardHeader className="p-10 border-b border-white/5 bg-amber-500/5">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[24px] bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Contact className="w-7 h-7 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black italic uppercase">Email Server</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">Settings for sending emails</CardDescription>
                    </div>
                  </div>
               </CardHeader>
               <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Alert Email</Label>
                     <Input id="notificationEmail" value={form.notificationEmail || ""} onChange={handleChange} className="rounded-2xl h-12 border-white/5 bg-black/20 font-bold" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Server (SMTP)</Label>
                     <Input id="smtpHost" value={form.smtpHost || ""} onChange={handleChange} className="rounded-2xl h-12 border-white/5 bg-black/20 font-bold" />
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </MainLayout>
  );
}
