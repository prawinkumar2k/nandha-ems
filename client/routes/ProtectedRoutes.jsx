import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_HOME } from "@/core/constants/roles";
import { ROUTES } from "@/core/constants/routes";
import { PageLoader } from "@/shared/components/Loader/Loader";

/**
 * ProtectedRoute – guards a route by auth + optional role check.
 *
 * @param {string|string[]} allowedRoles – if omitted, any authenticated user may pass
 * @param {string} redirectTo            – fallback path (default: /login)
 */
export function ProtectedRoute({ children, allowedRoles, redirectTo = ROUTES.LOGIN }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader message="Authenticating…" />;

  if (!isAuthenticated)
    return <Navigate to={redirectTo} state={{ from: location }} replace />;

  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(user?.role))
      return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <>{children}</>;
}

/**
 * GuestRoute – only accessible when NOT logged in (e.g. login page)
 */
export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader message="Loading…" />;
  if (isAuthenticated) return <Navigate to={ROLE_HOME[user?.role] ?? "/"} replace />;
  return <>{children}</>;
}

export default ProtectedRoute;
