import { Navigate, useLocation } from 'react-router-dom';
import accountService from '@/services/accountService';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'staff';
  fallbackPath?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/login' 
}: ProtectedRouteProps) => {
  const location = useLocation();
  const isLoggedIn = accountService.isLoggedIn();

  // Nếu chưa đăng nhập, chuyển về trang login
  if (!isLoggedIn) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Nếu có yêu cầu role cụ thể, kiểm tra quyền truy cập
  if (requiredRole) {
    const hasAccess = accountService.hasRoleAccess(requiredRole);
    
    if (!hasAccess) {
      // Nếu không có quyền, chuyển về trang phù hợp với role
      const userRole = accountService.getUserRole();
      const redirectPath = userRole === 'admin' ? '/admin' : '/';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
