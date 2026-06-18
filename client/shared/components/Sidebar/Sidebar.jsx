import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronRight, LogOut, ChevronDown, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_COLORS } from "@/core/constants/roles";
import { cn } from "@/core/utils/helpers";

export function Sidebar({ items = [], isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState({});
  const rc = ROLE_COLORS[user?.role] || {};

  const isActive = (path) =>
    path ? location.pathname === path || location.pathname.startsWith(path + "/") : false;

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  const toggleGroup = (label) =>
    setExpanded((p) => ({ ...p, [label]: !p[label] }));

  const NavItem = ({ item, depth = 0 }) => {
    const hasChildren = item.children?.length > 0;
    const active = isActive(item.path);
    const groupOpen = expanded[item.label];

    return (
      <div className="mb-0.5">
        <button
          onClick={() => hasChildren ? toggleGroup(item.label) : handleNav(item.path)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group text-left relative overflow-hidden",
            depth > 0 && "pl-9 py-1.5",
            active 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/10"
          )}
        >
          {item.icon && (
            <span className={cn(
              "shrink-0 transition-transform group-hover:scale-110",
              depth === 0 ? "w-5 h-5" : "w-4 h-4",
              active ? "text-glow" : ""
            )}>{item.icon}</span>
          )}
          
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex items-center justify-between min-w-0"
            >
              <span className={cn(
                "text-sm truncate",
                depth === 0 ? "font-semibold" : "font-medium"
              )}>
                {item.label}
              </span>
              {hasChildren && (
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  groupOpen ? "rotate-180" : ""
                )} />
              )}
            </motion.div>
          )}

          {active && (
            <motion.div 
              layoutId="nav-active"
              className="absolute left-0 w-1 h-2/3 bg-white rounded-r-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </button>

        <AnimatePresence>
          {hasChildren && groupOpen && isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-1"
            >
              {item.children.map((child) => (
                <NavItem key={child.label} item={child} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <aside className={cn(
      "flex flex-col h-full glass-card border-r border-white/5 relative z-20 overflow-hidden",
      isOpen ? "w-64" : "w-[68px]"
    )}>
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-white/5 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-transparent flex items-center justify-center shrink-0 animate-glow">
          <img src="/logo.png" alt="NEC EMS" className="w-full h-full object-contain" />
        </div>
        {isOpen && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <p className="font-black text-sidebar-foreground text-base tracking-tight flex items-center gap-1.5">
              NEC EMS <Sparkles className="w-3.5 h-3.5 text-accent" />
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Enterprise Campus</p>
          </motion.div>
        )}
      </div>

      {/* User */}
      <div className="px-3 py-6 shrink-0">
        <motion.div 
          className={cn(
            "p-1 rounded-2xl bg-white/5 border border-white/5 transition-all",
            !isOpen && "p-0 bg-transparent border-none"
          )}
        >
          <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
            <div className={cn(
              "w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-white text-base font-black shrink-0 shadow-lg",
              rc.badge || "bg-primary"
            )}>
              {user?.profilePic ? (
                <img src={user.profilePic.startsWith("/api") ? `${user.profilePic}?token=${sessionStorage.getItem("authToken")}` : user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            {isOpen && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-sidebar-foreground truncate">{user?.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", rc.dot || "bg-emerald-500")} />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sidebar-accent-foreground/50">
                    {user?.role} {user?.department?.code ? `• ${user.department.code}` : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        {items.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group",
            !isOpen && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
          {isOpen && <span className="text-sm font-bold">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

