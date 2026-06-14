import { useParams, useNavigate } from "react-router-dom";
import { Monitor, Cpu, Network, Info, ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { getAdminNav } from "@/core/constants/navigation";
import { Button } from "@/components/ui/button";

const NAV = getAdminNav();

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DeviceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <MainLayout navItems={NAV} title="Device Details">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-10"
      >
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 uppercase italic text-foreground">
               Hardware Profile <Shield className="w-6 h-6 text-accent animate-pulse" />
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground/50 mt-1">Device {id}</p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button variant="outline" className="rounded-xl h-12 px-6 border-white/10 hover:bg-white/5 font-black text-xs uppercase tracking-widest" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="glass border border-white/10 p-16 text-center rounded-[40px] shadow-2xl shadow-black/10 flex flex-col items-center justify-center min-h-[400px]">
          <Monitor className="w-16 h-16 text-primary/30 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-black uppercase tracking-widest text-white italic">Hardware Configuration Loading...</h2>
          <p className="text-sm font-medium text-muted-foreground/60 mt-3 max-w-md mx-auto">
            Fetching secure hardware fingerprint, CPU telemetry, and networking details for device <span className="font-mono text-primary/80">{id}</span>.
          </p>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
