import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Kiểm tra xem có token trong localStorage không
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // Nếu không có token hoặc user, redirect về login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token và user, render children
  return <>{children}</>;
};

export default ProtectedRoute;
