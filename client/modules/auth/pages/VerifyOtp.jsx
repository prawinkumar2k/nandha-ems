import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { FormField } from "@/shared/components/Form/FormField";
import { Button } from "@/components/ui/button";
import { authService } from "@/core/api/services";
import { ROUTES } from "@/core/constants/routes";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      navigate(ROUTES.FORGOT_PASSWORD);
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) { setError("OTP is required."); return; }
    if (otp.length !== 6) { setError("OTP must be 6 digits."); return; }
    
    setLoading(true);
    try {
      const res = await authService.verifyOtp(email, otp);
      // Pass the reset token to the ResetPassword page
      navigate(`${ROUTES.RESET_PASSWORD}?token=${res.token}`);
    } catch (err) { 
      setError(err.message || "Invalid or expired OTP"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <AuthLayout title="Verify OTP" subtitle={`Enter the 6-digit code sent to ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField 
          id="otp" 
          name="otp" 
          label="One-Time Password" 
          type="text"
          placeholder="123456" 
          required 
          startIcon={KeyRound}
          value={otp} 
          onChange={(e) => { setOtp(e.target.value.replace(/[^0-9]/g, '')); setError(""); }}
          error={error} 
          touched={!!error} 
          maxLength={6}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying…" : "Verify OTP"}
        </Button>
      </form>
      <Link to={ROUTES.FORGOT_PASSWORD} className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary mt-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Try another email
      </Link>
    </AuthLayout>
  );
}
