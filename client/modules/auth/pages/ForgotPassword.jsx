import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { FormField } from "@/shared/components/Form/FormField";
import { Button } from "@/components/ui/button";
import { authService } from "@/core/api/services";
import { ROUTES } from "@/core/constants/routes";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Email is required."); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch { setSent(true); /* show success anyway for UX */ }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email to receive a reset OTP">
      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>
          <h3 className="font-bold text-lg">Check your inbox</h3>
          <p className="text-sm text-muted-foreground">A 6-digit OTP was sent to <strong>{email}</strong>.</p>
          <Link to={`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(email)}`}>
            <Button className="w-full mt-2">Enter OTP</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField id="email" name="email" label="Email Address" type="email"
            placeholder="you@example.com" required startIcon={Mail}
            value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
            error={error} touched={!!error} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send OTP"}
          </Button>
        </form>
      )}
      <Link to={ROUTES.LOGIN} className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary mt-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </Link>
    </AuthLayout>
  );
}
