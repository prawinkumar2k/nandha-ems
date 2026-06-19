import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { FormField } from "@/shared/components/Form/FormField";
import { Alert } from "@/shared/components/Alerts/Alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_HOME } from "@/core/constants/roles";
import { ROUTES } from "@/core/constants/routes";
import { validateLoginForm, cn } from "@/core/utils/helpers";
import { Mail, Lock, Eye, EyeOff, Sparkles, LogOut, Download } from "lucide-react";
import { useForm } from "@/core/hooks/useForm";

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const resetOk = params.get("reset") === "success";

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm({ email: "", password: "" }, validateLoginForm);

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setServerError("");
    try {
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role] ?? "/dashboard");
    } catch (err) {
      setServerError(err.message || "Invalid credentials.");
    }
  });

  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden flex items-center justify-center p-4">
      {window.electronAPI && (
        <button 
          onClick={() => window.electronAPI.exitApp()}
          className="fixed top-6 right-6 z-50 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl transition-all duration-300 flex items-center gap-2 group font-bold tracking-widest text-xs uppercase backdrop-blur-md border border-rose-500/20"
          title="Exit Application"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Kiosk</span>
        </button>
      )}

      <div className="noise" />
      
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="glass-card rounded-[32px] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-transparent mb-6 animate-glow">
              <img src="/logo.png" alt="NEC EMS Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground mb-2 flex items-center justify-center gap-2">
              NEC EMS <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            </h1>
            <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">Enterprise Campus Platform</p>
          </div>

          {resetOk && <Alert variant="success" title="Success" message="Password updated!" className="mb-6 rounded-2xl" />}
          {serverError && <Alert variant="error" message={serverError} className="mb-6 rounded-2xl" />}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                <input
                  id="email" name="email" type="email" placeholder="name@university.edu"
                  autoComplete="off"
                  className="w-full bg-white/5 dark:bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/40"
                  value={values.email} onChange={handleChange} onBlur={handleBlur}
                />
              </div>
              {errors.email && touched.email && <p className="text-[10px] text-destructive font-bold ml-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                <input
                  id="password" name="password" type={showPw ? "text" : "password"} placeholder="••••••••"
                  autoComplete="off"
                  className="w-full bg-white/5 dark:bg-black/20 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/40"
                  value={values.password} onChange={handleChange} onBlur={handleBlur}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full py-7 rounded-2xl text-base font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.01] active:scale-[0.99] group overflow-hidden relative">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? "Signing In..." : "Sign In"}
                {!isSubmitting && <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><Sparkles className="w-4 h-4" /></motion.span>}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
            </Button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-white/5 space-y-5">
            {!window.electronAPI && (
              <a 
                href="https://github.com/prawinkumar2k/nandha-ems/releases/latest/download/NEC_EMS_Secure_Browser.zip" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-black tracking-widest uppercase rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 transition-all w-full"
              >
                <Download className="w-4 h-4" />
                Download Secure Browser
              </a>
            )}

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              developed by Prawinkumar N &copy; {new Date().getFullYear()} All rights received
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

