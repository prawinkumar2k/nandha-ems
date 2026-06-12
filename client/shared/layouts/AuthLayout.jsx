import { BookOpen } from "lucide-react";

/**
 * AuthLayout – centered card shell for login/register pages.
 */
export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/25">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">EduLearn LMS</h1>
          <p className="text-muted-foreground text-sm mt-1">Learning Management & Lab Control</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          {(title || subtitle) && (
            <div className="px-7 pt-7 pb-5 border-b border-border/60">
              {title && <h2 className="text-xl font-bold">{title}</h2>}
              {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          )}
          <div className="p-7">{children}</div>
        </div>

        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mt-8">
          developed by prawinkumar &copy; {new Date().getFullYear()} All rights received
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
