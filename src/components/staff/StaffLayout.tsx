import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import accountService from "@/services/accountService";
import { 
  LayoutDashboard, 
  Car, 
  ClipboardCheck, 
  CreditCard, 
  AlertCircle,
  Menu,
  Calendar,
  LogOut,
  User,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface StaffLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard },
  { name: "Quản lý xe", href: "/vehicles", icon: Car },
  { name: "Giao/Trả xe", href: "/handover", icon: ClipboardCheck },
  // { name: "Thanh toán", href: "/payment", icon: CreditCard },
  { name: "Báo cáo sự cố", href: "/issues", icon: AlertCircle },
  { name: 'Quản lý đơn thuê', href: '/orders', icon: Calendar },
  { name: 'Quản lý khách hàng', href: '/accounts', icon: Users },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy thông tin user từ localStorage
  const user = accountService.getCurrentUser();
  const displayName = user?.name || user?.userName || 'Guest';
  const displayRole = user?.userName || 'staff';
  
  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    accountService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-8">
        <h1 className="text-2xl font-bold text-sidebar-foreground">EV Station Staff</h1>
      </div>
      <nav className="flex-1 space-y-1 px-6 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* User info and logout */}
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

export const StaffLayout = ({ children }: StaffLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden w-80 border-r border-sidebar-border md:block">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
};
