import { Link } from "react-router-dom";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/core/constants/routes";
import { Monitor, CheckCircle2 } from "lucide-react";

export default function DeviceRegistration() {
  return (
    <AuthLayout title="Register Lab Device" subtitle="Set up this computer as a lab exam client">
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border">
          <Monitor className="w-6 h-6 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold">Device ID</p>
            <p className="text-xs text-muted-foreground font-mono">PC-LAB-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
          </div>
        </div>
        {["Device fingerprint detected", "Lab network verified", "Admin approval pending"].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${i < 2 ? "text-success" : "text-muted-foreground"}`} />
            <span className={`text-sm ${i < 2 ? "text-foreground" : "text-muted-foreground"}`}>{step}</span>
          </div>
        ))}
        <Button className="w-full">Request Registration</Button>
      </div>
      <Link to={ROUTES.LOGIN} className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary mt-5 transition-colors">
        Back to Login
      </Link>
    </AuthLayout>
  );
}
