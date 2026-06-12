import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  ChevronRight,
  User,
} from "lucide-react";

const ROLE_COLORS = {
  admin: "bg-red-500",
  hod: "bg-purple-500",
  faculty: "bg-blue-500",
  student: "bg-emerald-500",
};

export const DashboardLayout = ({
  title,
  navItems,
  children,
  activeTab,
  onNavClick,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  // Close mobile sidebar on resize
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = (item) => {
    onNavClick?.(item.label.toLowerCase());
    setMobileOpen(false);
  };

  const activeLabel = activeTab?.toLowerCase();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border shrink-0">
        <div className="bg-sidebar-primary p-2 rounded-lg shrink-0">
          <BookOpen className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {(sidebarOpen || mobileOpen) && (
          <div>
            <p className="font-bold text-sidebar-foreground text-sm leading-none">
              EduLearn
            </p>
            <p className="text-xs text-sidebar-accent-foreground">LMS</p>
          </div>
        )}
      </div>

      {/* User Role Badge */}
      {(sidebarOpen || mobileOpen) && (
        <div className="mx-4 mt-4 mb-2 p-3 rounded-xl bg-sidebar-accent/10 border border-sidebar-border">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                ROLE_COLORS[user?.role] || "bg-primary"
              }`}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-accent-foreground capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item, index) => {
          const isActive = activeLabel === item.label.toLowerCase();
          return (
            <button
              key={index}
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20"
              }`}
            >
              <span className="w-5 h-5 shrink-0">{item.icon}</span>
              {(sidebarOpen || mobileOpen) && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">
                    {item.label}
                  </span>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(sidebarOpen || mobileOpen) && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${
          sidebarOpen ? "w-64" : "w-[72px]"
        } transition-all duration-300 bg-sidebar border-r border-sidebar-border flex-col shrink-0`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 bg-sidebar flex flex-col h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 gap-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-foreground truncate">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      <button
                        onClick={markAllRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-border">
                      {notifications.length === 0 ? (
                        <p className="text-center text-muted-foreground text-sm p-6">
                          No notifications
                        </p>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`w-full text-left p-3 hover:bg-secondary/50 transition-colors ${
                              !n.read ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && (
                                <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                              )}
                              <div className={!n.read ? "" : "ml-4"}>
                                <p className="text-xs font-semibold text-foreground">
                                  {n.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground leading-none">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  {user?.role}
                </p>
              </div>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  ROLE_COLORS[user?.role] || "bg-primary"
                }`}
              >
                {user?.name?.charAt(0)?.toUpperCase() || (
                  <User className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-secondary/20 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
