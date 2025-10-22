import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Battery, 
  MapPin, 
  Wrench, 
  Eye,
  Edit,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VehicleCardProps {
  id: string;
  licensePlate: string;
  model: string;
  brand: string;
  batteryLevel: number;
  status: 'available' | 'rented' | 'maintenance' | 'damaged';
  location: string;
  lastMaintenance?: string;
  rentalPrice: number;
  imageUrl?: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onMaintenance?: (id: string) => void;
  onRent?: (id: string) => void;
}

const VehicleCard = ({
  id,
  licensePlate,
  model,
  brand,
  batteryLevel,
  status,
  location,
  lastMaintenance,
  rentalPrice,
  imageUrl,
  onView,
  onEdit,
  onMaintenance,
  onRent
}: VehicleCardProps) => {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="default" className="bg-green-500">Sẵn sàng</Badge>;
      case "rented":
        return <Badge variant="default" className="bg-blue-500">Đang thuê</Badge>;
      case "maintenance":
        return <Badge variant="default" className="bg-yellow-500">Bảo trì</Badge>;
      case "damaged":
        return <Badge variant="destructive">Hư hỏng</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 80) return "text-green-600";
    if (level >= 50) return "text-yellow-600";
    if (level >= 20) return "text-orange-600";
    return "text-red-600";
  };

  const getBatteryIcon = (level: number) => {
    if (level >= 80) return "🔋";
    if (level >= 50) return "🔋";
    if (level >= 20) return "🔋";
    return "🔋";
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{licensePlate}</CardTitle>
              <p className="text-sm text-muted-foreground">{brand} {model}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                )}
                {onMaintenance && (
                  <DropdownMenuItem onClick={() => onMaintenance(id)}>
                    <Wrench className="mr-2 h-4 w-4" />
                    Bảo trì
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hình ảnh xe */}
        {imageUrl ? (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <img 
              src={imageUrl} 
              alt={`${brand} ${model}`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
            <Car className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Thông tin chi tiết */}
        <div className="space-y-3">
          {/* Mức pin */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Mức pin</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${getBatteryColor(batteryLevel)}`}>
                {batteryLevel}%
              </span>
              <div className="w-16 bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    batteryLevel >= 80 ? 'bg-green-500' :
                    batteryLevel >= 50 ? 'bg-yellow-500' :
                    batteryLevel >= 20 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Vị trí */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Vị trí:</span>
            <span className="text-sm font-medium">{location}</span>
          </div>

          {/* Giá thuê */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Giá thuê/ngày:</span>
            <span className="text-sm font-bold text-primary">
              {rentalPrice.toLocaleString()} VNĐ
            </span>
          </div>

          {/* Lần bảo trì cuối */}
          {lastMaintenance && (
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Bảo trì cuối:</span>
              <span className="text-sm font-medium">{lastMaintenance}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {status === 'available' && onRent && (
            <Button 
              onClick={() => onRent(id)}
              className="flex-1"
              size="sm"
            >
              Thuê xe
            </Button>
          )}
          {onView && (
            <Button 
              variant="outline" 
              onClick={() => onView(id)}
              className="flex-1"
              size="sm"
            >
              Chi tiết
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;
