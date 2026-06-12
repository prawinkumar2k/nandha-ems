import { useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-sm mb-6">
          You ({user?.role}) don't have permission to view this page.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Button onClick={() => { logout(); navigate("/login"); }}>
            Login as different role
          </Button>
        </div>
      </div>
      
      <footer className="w-full text-center py-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          developed by prawinkumar &copy; {new Date().getFullYear()} All rights received
        </p>
      </footer>
    </div>
  );
}
