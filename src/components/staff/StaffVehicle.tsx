import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Battery, MapPin, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StaffVehicleProps {
  id: string;
  name: string;
  status: "available" | "booked" | "rented" | "maintenance";
  batteryLevel: number;
  location: string;
  onHandover?: () => void;
  onUpdateStatus?: () => void;
  onReport?: () => void;
}

const statusConfig = {
  available: { label: "Sẵn sàng", variant: "success" as const },
  booked: { label: "Đã đặt", variant: "warning" as const },
  rented: { label: "Đang thuê", variant: "default" as const },
  maintenance: { label: "Bảo trì", variant: "destructive" as const },
};

export const StaffVehicle = ({
  name,
  status,
  batteryLevel,
  location,
  onHandover,
  onUpdateStatus,
  onReport,
}: StaffVehicleProps) => {
  const statusInfo = statusConfig[status];

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">{name}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onHandover}>Giao xe</DropdownMenuItem>
              <DropdownMenuItem onClick={onUpdateStatus}>Cập nhật trạng thái</DropdownMenuItem>
              <DropdownMenuItem onClick={onReport}>Báo cáo sự cố</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <div className="flex items-center gap-1.5">
              <Battery className={`h-4 w-4 ${batteryLevel > 20 ? 'text-success' : 'text-destructive'}`} />
              <span className="text-sm font-medium">{batteryLevel}%</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
