import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  User,
  Car
} from "lucide-react";
import { toast } from "sonner";

// Mock data cho đơn thuê xe
const mockOrders = [
  {
    id: "ORD001",
    customerName: "Nguyễn Văn A",
    customerPhone: "0912345678",
    vehiclePlate: "29A-123.45",
    vehicleModel: "VinFast Klara S",
    startDate: "2024-01-15",
    endDate: "2024-01-18",
    status: "active",
    totalAmount: 1500000,
    deposit: 500000,
    createdAt: "2024-01-15T08:00:00Z"
  },
  {
    id: "ORD002", 
    customerName: "Trần Thị B",
    customerPhone: "0987654321",
    vehiclePlate: "29A-456.78",
    vehicleModel: "VinFast VF8",
    startDate: "2024-01-16",
    endDate: "2024-01-20",
    status: "completed",
    totalAmount: 2000000,
    deposit: 800000,
    createdAt: "2024-01-16T09:30:00Z"
  },
  {
    id: "ORD003",
    customerName: "Lê Văn C",
    customerPhone: "0123456789",
    vehiclePlate: "29A-789.01",
    vehicleModel: "VinFast Klara S",
    startDate: "2024-01-17",
    endDate: "2024-01-19",
    status: "cancelled",
    totalAmount: 1200000,
    deposit: 400000,
    createdAt: "2024-01-17T10:15:00Z"
  }
];

const StationStaffOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [orders] = useState(mockOrders);

  // Lọc đơn hàng theo tìm kiếm và trạng thái
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Thống kê
  const stats = {
    total: orders.length,
    active: orders.filter(o => o.status === "active").length,
    completed: orders.filter(o => o.status === "completed").length,
    cancelled: orders.filter(o => o.status === "cancelled").length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-blue-500">Đang thuê</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500">Hoàn thành</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewOrder = (orderId: string) => {
    toast.info(`Xem chi tiết đơn hàng ${orderId}`);
  };

  const handleCompleteOrder = (orderId: string) => {
    toast.success(`Hoàn thành đơn hàng ${orderId}`);
  };

  const handleCancelOrder = (orderId: string) => {
    toast.error(`Hủy đơn hàng ${orderId}`);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quản lý đơn thuê</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý các đơn thuê xe</p>
        </div>

        {/* Thống kê */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang thuê</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tìm kiếm và lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Tìm theo ID, tên khách hàng, biển số xe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang thuê</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danh sách đơn hàng */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Xe</TableHead>
                    <TableHead>Ngày thuê</TableHead>
                    <TableHead>Ngày trả</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.vehiclePlate}</div>
                          <div className="text-sm text-muted-foreground">{order.vehicleModel}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.startDate}</TableCell>
                      <TableCell>{order.endDate}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.totalAmount.toLocaleString()} VNĐ</div>
                          <div className="text-sm text-muted-foreground">
                            Cọc: {order.deposit.toLocaleString()} VNĐ
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === "active" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteOrder(order.id)}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Không tìm thấy đơn hàng nào
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StationStaffOrders;
