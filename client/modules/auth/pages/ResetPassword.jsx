import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { FormField } from "@/shared/components/Form/FormField";
import { Button } from "@/components/ui/button";
import { useForm } from "@/core/hooks/useForm";
import { isStrongPassword } from "@/core/utils/helpers";
import { ROUTES } from "@/core/constants/routes";
import { Lock, ArrowLeft } from "lucide-react";

const validate = ({ password, confirm }) => {
  const errs = {};
  if (!password) errs.password = "Password is required.";
  else if (!isStrongPassword(password)) errs.password = "Min 8 chars, 1 uppercase, 1 number.";
  if (!confirm) errs.confirm = "Please confirm your password.";
  else if (confirm !== password) errs.confirm = "Passwords do not match.";
  return errs;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm({ password: "", confirm: "" }, validate);

  const onSubmit = handleSubmit(async () => {
    navigate(`${ROUTES.LOGIN}?reset=success`);
  });

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password for your account">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField id="password" name="password" label="New Password" type="password"
          placeholder="••••••••" required startIcon={Lock}
          value={values.password} onChange={handleChange} onBlur={handleBlur}
          error={errors.password} touched={touched.password}
          hint="Minimum 8 characters, 1 uppercase, 1 number" />
        <FormField id="confirm" name="confirm" label="Confirm Password" type="password"
          placeholder="••••••••" required startIcon={Lock}
          value={values.confirm} onChange={handleChange} onBlur={handleBlur}
          error={errors.confirm} touched={touched.confirm} />
        <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Reset Password"}
        </Button>
      </form>
      <Link to={ROUTES.LOGIN} className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary mt-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </Link>
    </AuthLayout>
  );
}
