import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingService } from "@/core/api/services";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/core/constants/routes";
import { Shield, SaveAll, Lock, Zap, RefreshCw } from "lucide-react";
import { getAdminNav } from "@/core/constants/navigation";
import { motion } from "framer-motion";
import { cn } from "@/core/utils/helpers";

const NAV = getAdminNav();

const RULE_LIST = [
  { id: "disableCopyPaste", label: "No Copy/Paste", desc: "Stop students from copying or pasting" },
  { id: "detectTabSwitch", label: "Check Tab Switching", desc: "Know if students switch browser tabs" },
  { id: "requireFullscreen", label: "Full Screen Lock", desc: "Force the test to be in full screen" },
  { id: "blockRightClick", label: "No Right Click", desc: "Stop right clicking during the test" },
  { id: "detectDevTools", label: "Check Inspector Tools", desc: "Know if browser tools are opened" },
  { id: "lockOnViolation", label: "Auto-lock PC", desc: "Lock the computer if rules are broken" },
  { id: "requireWebcam", label: "Need Webcam", desc: "Students must have webcam on" },
  { id: "screenWatermark", label: "Show Name on Screen", desc: "Show student details on the test screen" },
];

export default function SecurityPolicies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localRules, setLocalRules] = useState({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => settingService.get(),
  });

  const mutation = useMutation({
    mutationFn: (data) => settingService.update({ security: data }),
    onSuccess: () => {
      queryClient.invalidateQueries(["system-settings"]);
      toast({ title: "Rules Saved", description: "All security rules have been saved." });
    },
    onError: (err) => {
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (settings?.security) {
      setLocalRules(settings.security);
    }
  }, [settings]);

  const toggle = (id) => setLocalRules((prev) => ({ ...prev, [id]: !prev[id] }));

  if (isLoading) return <MainLayout navItems={NAV} title="Loading...">
    <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
      <RefreshCw className="w-10 h-10 animate-spin mx-auto text-primary/40" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reading rules...</p>
    </div>
  </MainLayout>;

  return (
    <MainLayout navItems={NAV} title="Test Security Rules">
      <div className="max-w-3xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3 text-foreground italic uppercase">
                 Security Rules <Shield className="w-6 h-6 text-rose-500" />
              </h2>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">Settings for all tests</p>
           </div>
           <Button className="rounded-2xl h-14 px-8 shadow-2xl shadow-primary/20 gap-3 font-black text-[10px] uppercase tracking-widest" onClick={() => mutation.mutate(localRules)} disabled={mutation.isPending}>
              {mutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <SaveAll className="w-4 h-4" />} 
              Save Rules
           </Button>
        </div>

        <Card className="rounded-[44px] glass border-white/5 relative overflow-hidden shadow-2xl border-t-primary/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <CardHeader className="p-10 border-b border-white/5 bg-primary/5">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-[24px] bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <Lock className="w-7 h-7 text-rose-500" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black italic uppercase">Test Protection</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60">System rules for security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-3">
            {RULE_LIST.map((p, i) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between p-5 rounded-[28px] border-2 transition-all group ${localRules[p.id] ? "border-primary/20 bg-primary/10 shadow-xl shadow-primary/5" : "border-white/5 bg-white/5 hover:border-white/10"}`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${localRules[p.id] ? "bg-primary text-white scale-110 shadow-lg" : "bg-white/5 text-muted-foreground/40 group-hover:bg-white/10"}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold tracking-tight text-sm uppercase italic">{p.label}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-medium">{p.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(p.id)}
                  className={`relative w-14 h-8 rounded-full shadow-inner transition-all flex items-center p-1 ${localRules[p.id] ? "bg-primary" : "bg-white/5 border border-white/5"}`}>
                  <motion.span 
                    animate={{ x: localRules[p.id] ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-6 h-6 rounded-full bg-white shadow-xl flex items-center justify-center"
                  >
                     <div className={cn("w-1 h-1 rounded-full", localRules[p.id] ? "bg-primary" : "bg-slate-300")} />
                  </motion.span>
                </button>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="glass rounded-[32px] p-8 border border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                 <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-relaxed max-w-sm">Changes here will apply to all tests. Some tests may have their own special rules.</p>
           </div>
        </div>
      </div>
    </MainLayout>
  );
}
