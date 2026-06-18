import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/core/constants/routes";
import { Monitor, CheckCircle2, AlertTriangle } from "lucide-react";
import { deviceService } from "@/core/api/services";
import { toast } from "sonner";

export default function DeviceRegistration() {
  const [deviceData, setDeviceData] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, registering, pending, success
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mocking hardware data that would normally come from Electron IPC
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    setDeviceData({
      deviceId: `PC-LAB-${rand}`,
      macAddress: `00:11:22:33:44:${Math.floor(Math.random() * 99).toString().padStart(2, "0")}`,
      cpuId: `INTEL-${rand}`,
      motherboardSerial: `MB-SN-${rand}`,
      machineFingerprint: `FINGERPRINT-${rand}`
    });
  }, []);

  const handleRegister = async () => {
    if (!deviceData) return;
    setStatus("registering");
    setError(null);
    try {
      const res = await deviceService.register(deviceData);
      if (res.status === "pending") {
        setStatus("pending");
        toast.info("Registration request sent", { description: "Waiting for admin approval." });
      } else if (res.status === "approved") {
        setStatus("success");
        toast.success("Device Registered", { description: "You can now use this device for exams." });
        // Save token if approved immediately (rare but possible)
        if (res.deviceToken) {
           localStorage.setItem("deviceToken", res.deviceToken);
        }
      }
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Failed to register device.");
      toast.error("Registration Failed", { description: err.message });
    }
  };

  return (
    <AuthLayout title="Register Lab Device" subtitle="Set up this computer as a lab exam client">
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border">
          <Monitor className="w-6 h-6 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold">Device ID</p>
            <p className="text-xs text-muted-foreground font-mono">{deviceData?.deviceId || "Loading..."}</p>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-3">
          {[
            { label: "Hardware Fingerprint Extracted", active: !!deviceData },
            { label: "Network Verified", active: !!deviceData },
            { label: "Admin Approval", active: status === "success", pending: status === "pending" }
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              {step.pending ? (
                 <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
              ) : (
                 <CheckCircle2 className={`w-5 h-5 shrink-0 ${step.active ? "text-success" : "text-muted-foreground/30"}`} />
              )}
              <span className={`text-sm ${step.active || step.pending ? "text-foreground" : "text-muted-foreground/50"}`}>{step.label}</span>
            </div>
          ))}
        </div>

        <Button 
          className="w-full" 
          onClick={handleRegister} 
          disabled={!deviceData || status === "registering" || status === "pending" || status === "success"}
        >
          {status === "registering" ? "Requesting..." : status === "pending" ? "Waiting for Approval..." : status === "success" ? "Registered Successfully" : "Request Registration"}
        </Button>
      </div>
      <Link to={ROUTES.LOGIN} className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary mt-5 transition-colors">
        Back to Login
      </Link>
    </AuthLayout>
  );
}
