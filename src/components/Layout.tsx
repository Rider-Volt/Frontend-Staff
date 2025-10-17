import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Car, 
  ClipboardCheck, 
  CreditCard, 
  AlertCircle,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard },
  { name: "Quản lý xe", href: "/vehicles", icon: Car },
  { name: "Giao/Nhận xe", href: "/handover", icon: ClipboardCheck },
  { name: "Thanh toán", href: "/payment", icon: CreditCard },
  { name: "Báo cáo sự cố", href: "/issues", icon: AlertCircle },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold text-sidebar-foreground">EV Station</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-sidebar-border md:block">
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
        <SheetContent side="left" className="w-64 p-0">
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
