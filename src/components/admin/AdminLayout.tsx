import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import accountService from "@/services/accountService";
import { 
  LayoutDashboard, 
  CarIcon, 
  MapPin, 
  UserCog, 
  Menu,
  LogOut,
  User,
  PackageSearch,
  Clock,
  Brain,
  ReceiptText,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: "Tổng quan", url: "/admin", icon: LayoutDashboard },
  { title: "Quản lý xe", url: "/admin/vehicles", icon: CarIcon },
  { title: "Models xe", url: "/admin/models", icon: PackageSearch },
  { title: "Đơn thuê", url: "/admin/billings", icon: ReceiptText },
  { title: "Điểm thuê", url: "/admin/stations", icon: MapPin },
  { title: "Nhân viên", url: "/admin/employees", icon: UserCog },
  // { title: "Báo cáo & Phân tích", url: "/admin/reports-analytics", icon: BarChart3 },
  // { title: "Dự báo AI", url: "/admin/ai-forecast", icon: Brain },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy thông tin người dùng từ localStorage
  const user = accountService.getCurrentUser();
  const displayName = user?.name || user?.userName || 'Khách';
  const displayRole = user?.userName || 'admin';
  
  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    accountService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-8">
        <h1 className="text-2xl font-bold text-sidebar-foreground">EV Station Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-6 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      
      {/* Thông tin người dùng và đăng xuất */}
      <div className="border-t border-sidebar-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="h-4 w-4 text-sidebar-accent-foreground" />
            </div>
            <div>
              <p className="text-base font-medium text-sidebar-foreground">{displayName}</p>
              <p className="text-sm text-sidebar-foreground/70 capitalize">{displayRole}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent/50"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Thanh bên màn hình Desktop */}
      <aside className="hidden w-80 border-r border-sidebar-border md:block">
        <Sidebar />
      </aside>

      {/* Thanh bên màn hình Di động */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Nội dung chính */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
};
