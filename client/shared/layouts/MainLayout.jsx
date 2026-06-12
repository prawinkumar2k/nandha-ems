import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/shared/components/Navbar/Navbar";
import { Sidebar } from "@/shared/components/Sidebar/Sidebar";
import { useMediaQuery } from "@/core/hooks/useUtils";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminNav, getHODNav, getFacultyNav, getStudentNav } from "@/core/constants/navigation";

export function MainLayout({ children, navItems = [], title }) {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  // Globally enforce role-based navigation so shared components don't display the wrong sidebar
  const getResolvedNav = () => {
    switch (user?.role) {
      case 'admin': return getAdminNav();
      case 'hod': return getHODNav();
      case 'faculty': return getFacultyNav();
      case 'student': return getStudentNav();
      default: return navItems;
    }
  };

  const resolvedNavItems = getResolvedNav();

  return (
    <div className="flex h-screen bg-background bg-mesh text-foreground relative overflow-hidden font-inter">
      <div className="noise" />
      
      {/* Desktop sidebar */}
      <motion.div 
        className="hidden lg:flex shrink-0 z-20"
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 68 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Sidebar items={resolvedNavItems} isOpen={sidebarOpen} />
      </motion.div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 z-[100] flex lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-72 h-full shadow-2xl"
            >
              <Sidebar items={resolvedNavItems} isOpen={true} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Navbar onMenuToggle={toggleSidebar} title={title} />
        <main className="flex-1 overflow-auto bg-transparent relative flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={title} // Trigger animation on navigation
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="p-4 lg:p-6 flex-1"
          >
            {children}
          </motion.div>
          
          <footer className="p-6 text-center border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
              developed by prawinkumar &copy; {new Date().getFullYear()} All rights received
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
