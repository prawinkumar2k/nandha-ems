import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { GuestRoute } from "./ProtectedRoutes";
import { ROUTES } from "@/core/constants/routes";
import { PageLoader } from "@/shared/components/Loader/Loader";

const Login = lazy(() => import("@/modules/auth/pages/Login"));
const ForgotPassword = lazy(() => import("@/modules/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/modules/auth/pages/ResetPassword"));
const Unauthorized = lazy(() => import("@/modules/auth/pages/Unauthorized"));

const S = ({ children }) => <Suspense fallback={<PageLoader />}>{children}</Suspense>;

export function AuthRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.LOGIN} element={<GuestRoute><S><Login /></S></GuestRoute>} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<GuestRoute><S><ForgotPassword /></S></GuestRoute>} />
      <Route path={ROUTES.RESET_PASSWORD} element={<GuestRoute><S><ResetPassword /></S></GuestRoute>} />
      <Route path={ROUTES.UNAUTHORIZED} element={<S><Unauthorized /></S>} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}

export default AuthRoutes;
