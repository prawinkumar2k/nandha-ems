import { Bell, Sun, Moon, Menu, User, LogOut, Settings, ChevronDown} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { ROLE_COLORS } from "@/core/constants/roles";
import { timeAgo } from "@/core/utils/helpers";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/contexts/SocketContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const getImageSrc = (url) => {
  if (!url) return "";
  return url.startsWith("/api") ? `${url}?token=${sessionStorage.getItem("authToken")}` : url;
};

export function Navbar({ onMenuToggle, title }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead, addNotification } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();
  const rc = ROLE_COLORS[user?.role] || ROLE_COLORS.student;

  useEffect(() => {
    if (!socket) return;
    const handleViolation = (data) => {
      // 1. Show a high-priority toast with image if available
      toast.error(`SECURITY ALERT: ${data.studentName || "Student"}`, {
        description: (
          <div className="space-y-3 mt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
              Triggered {data.type?.replace('_', ' ')?.toUpperCase() || "VIOLATION"}
            </p>
            {data.screenshot && (
              <div className="aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={getImageSrc(data.screenshot)} alt="Evidence" className="w-full h-full object-contain bg-black" />
              </div>
            )}
            <p className="text-[9px] opacity-40 font-mono tracking-tighter">Event logged at {new Date(data.timestamp || Date.now()).toLocaleTimeString()}</p>
          </div>
        ),
        duration: 10000,
      });

      // 2. Add to bell notifications
      addNotification({
        title: "Security Violation",
        message: `${data.studentName || "A student"} triggered a ${data.type?.replace('_', ' ')} alert.`,
        type: "error",
      });
    };

    socket.on("new-violation", handleViolation);
    return () => {
      socket.off("new-violation", handleViolation);
    };
  }, [socket, addNotification]);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <header className="h-16 md:h-20 glass border-b border-white/5 flex items-center justify-between px-4 md:px-6 lg:px-8 gap-2 md:gap-4 shrink-0 z-40 relative shadow-2xl shadow-black/5">
      {/* Left */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button onClick={onMenuToggle} className="p-2 md:p-2.5 hover:bg-white/5 rounded-xl transition-all active:scale-95 group" aria-label="Toggle menu">
          <Menu className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
        {title && (
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl lg:text-2xl font-black text-foreground tracking-tight italic flex items-center gap-2">
              {title}
            </h1>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="p-2 md:p-3 hover:bg-white/5 rounded-xl transition-all active:scale-95 group" title={isDark ? "Light mode" : "Dark mode"}>
          {isDark ? <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 animate-spin-slow" /> : <Moon className="w-4 h-4 md:w-5 md:h-5 text-primary" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }} 
            className="relative p-2 md:p-3 hover:bg-white/5 rounded-xl transition-all active:scale-95 group">
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 md:top-2.5 right-1.5 md:right-2.5 w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full flex items-center justify-center text-[8px] text-primary-foreground font-black ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          
          <AnimatePresence>
            {notifOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} 
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 md:top-14 z-50 w-[90vw] sm:w-80 max-w-[320px] bg-background/95 backdrop-blur-3xl border border-white/5 rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-white/5">
                    <p className="font-black text-[10px] md:text-xs uppercase tracking-widest italic flex items-center gap-2">
                      Alerts 
                    </p>
                    <button onClick={markAllRead} className="text-[10px] font-black uppercase text-primary hover:text-primary/80 transition-colors">Clear All</button>
                  </div>
                  <div className="max-h-[60vh] md:max-h-80 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 md:py-12 opacity-30">
                        <Bell className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2" />
                        <p className="font-bold text-[10px] md:text-xs">All Synchronized</p>
                      </div>
                    ) : notifications.slice(0, 8).map(n => (
                      <button key={n.id} onClick={() => { markRead(n.id); setNotifOpen(false); }}
                        className={`w-full text-left px-4 md:px-6 py-3 md:py-4 hover:bg-white/5 transition-all flex items-start gap-3 md:gap-4 ${!n.read ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                        <div className="flex-1">
                          <p className="text-[10px] md:text-xs font-black tracking-tight mb-0.5">{n.title}</p>
                          <p className="text-[9px] md:text-[10px] text-muted-foreground/80 leading-relaxed line-clamp-2">{n.message}</p>
                          <p className="text-[8px] md:text-[9px] font-black text-primary uppercase mt-1.5 md:mt-2">{timeAgo(n.time)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 ml-1 md:ml-2 border-l border-white/5 hover:bg-white/5 rounded-xl md:rounded-2xl px-2 md:px-3 py-1.5 transition-all active:scale-95 group">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] md:text-xs font-black text-foreground tracking-tight leading-none italic">{user?.name}</p>
              <p className="text-[8px] md:text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1 group-hover:text-primary transition-colors">{user?.role}</p>
            </div>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden flex items-center justify-center text-white text-[10px] md:text-xs font-black shadow-xl ring-1 ring-white/10 ${rc.badge}`}>
              {user?.profilePic ? (
                <img src={getImageSrc(user.profilePic)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || <User className="w-3 h-3 md:w-4 md:h-4" />
              )}
            </div>
            <ChevronDown className={`w-3 h-3 md:w-3.5 md:h-3.5 text-muted-foreground group-hover:text-primary transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {profileOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} 
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 md:top-14 z-50 w-[90vw] sm:w-56 max-w-[240px] bg-background/95 backdrop-blur-3xl border border-white/5 rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden py-2"
                >
                  <div className="px-4 md:px-5 py-3 md:py-4 border-b border-white/5 mb-1 md:mb-2 bg-white/5">
                    <p className="text-[10px] md:text-xs font-black italic">{user?.name}</p>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground/60 truncate">{user?.email}</p>
                  </div>
                  <button className="w-full flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-3 text-[10px] md:text-xs font-bold hover:bg-white/5 transition-all group" onClick={() => { navigate(`/${user?.role}/profile`); setProfileOpen(false); }}>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform"><User className="w-3 h-3 md:w-4 md:h-4 text-primary" /></div> My Identity
                  </button>
                  <button className="w-full flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-3 text-[10px] md:text-xs font-bold hover:bg-white/5 transition-all group" onClick={() => { navigate(`/${user?.role}/settings`); setProfileOpen(false); }}>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"><Settings className="w-3 h-3 md:w-4 md:h-4 text-orange-500" /></div> System Prefs
                  </button>
                  <div className="border-t border-white/5 mt-1 md:mt-2 pt-1 md:pt-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-3 text-[10px] md:text-xs font-black text-rose-500 hover:bg-rose-500/10 transition-all group">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"><LogOut className="w-3 h-3 md:w-4 md:h-4" /></div> Terminate Session
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
