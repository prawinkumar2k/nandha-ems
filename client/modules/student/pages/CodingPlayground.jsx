import React from "react";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { OfflineCodeEditor } from "@/shared/components/Coding/OfflineCodeEditor";
import { getStudentNav } from "@/core/constants/navigation";
import { Monitor, Code2, Zap } from "lucide-react";

const NAV = getStudentNav();

export default function CodingPlayground() {
  return (
    <MainLayout navItems={NAV} title="Coding Labs">
       <div className="min-h-[calc(100vh-160px)] flex flex-col space-y-6 md:space-y-8 pb-8 md:pb-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black italic uppercase tracking-tighter flex items-center gap-2 md:gap-3">
                <Code2 className="text-primary w-6 h-6 md:w-8 md:h-8" /> 
                System Terminal
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> Local Host: 127.0.0.1</span>
                <span className="flex items-center gap-1 text-emerald-500"><Zap className="w-3 h-3" /> Low Latency Mode</span>
              </div>
            </div>
            
            <div className="text-left md:text-right w-full md:w-auto p-3 md:p-0 bg-white/5 md:bg-transparent rounded-lg md:rounded-none">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Lab Environment</p>
              <p className="font-black italic text-base md:text-lg uppercase">Offline Execution Node</p>
            </div>
          </div>

          {/* Main Editor Section */}
          <div className="flex-1 min-h-0 bg-white/5 rounded-[24px] md:rounded-[40px] border border-white/5 p-4 md:p-6 lg:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden md:block">
              <Code2 className="w-64 h-64" />
            </div>
            <OfflineCodeEditor />
          </div>
       </div>
    </MainLayout>
  );
}
