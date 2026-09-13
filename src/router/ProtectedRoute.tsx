import { Navigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole | UserRole[];
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
