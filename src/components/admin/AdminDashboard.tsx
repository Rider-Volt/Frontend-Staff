import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, MapPin, Users, TrendingUp, Battery, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import accountService from "@/services/accountService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Lấy tên user hiện tại từ database
  const user = accountService.getCurrentUser();
  const userName = user?.name || user?.userName || 'Guest';

  // Mock data cho charts
  const revenueData = [
    { month: 'T7', revenue: 42000000 },
    { month: 'T8', revenue: 50000000 },
    { month: 'T9', revenue: 48000000 },
    { month: 'T10', revenue: 62000000 },
    { month: 'T11', revenue: 55000000 },
    { month: 'T12', revenue: 70000000 },
  ];

  const usageData = [
    { hour: '6h', usage: 45 },
    { hour: '9h', usage: 120 },
    { hour: '12h', usage: 95 },
    { hour: '15h', usage: 80 },
    { hour: '18h', usage: 155 },
    { hour: '21h', usage: 70 },
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B₫`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M₫`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K₫`;
    }
    return `${amount.toLocaleString()}₫`;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Chào mừng trở lại, {userName}!
            </h1>
            <p className="text-gray-600">Dashboard tổng quan hệ thống thuê xe điện</p>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Tổng số xe</p>
                    <p className="text-3xl font-bold text-gray-800">248</p>
                    <p className="text-sm text-teal-600 mt-1">+12% so với tháng trước</p>
                  </div>
                  <div className="p-3 bg-teal-100 rounded-full">
                    <Car className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Điểm thuê</p>
                    <p className="text-3xl font-bold text-gray-800">15</p>
                    <p className="text-sm text-gray-600 mt-1">Đang hoạt động</p>
                  </div>
                  <div className="p-3 bg-teal-100 rounded-full">
                    <MapPin className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Khách hàng</p>
                    <p className="text-3xl font-bold text-gray-800">1,234</p>
                    <p className="text-sm text-teal-600 mt-1">+8% so với tháng trước</p>
                  </div>
                  <div className="p-3 bg-teal-100 rounded-full">
                    <Users className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Doanh thu tháng</p>
                    <p className="text-3xl font-bold text-gray-800">67tr</p>
                    <p className="text-sm text-teal-600 mt-1">+23% so với tháng trước</p>
                  </div>
                  <div className="p-3 bg-teal-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Chart */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-800">
                  Doanh thu 6 tháng gần nhất
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="#666" />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Doanh Thu']}
                      labelStyle={{ color: '#333' }}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                    />
                    <Bar dataKey="revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Usage Chart */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-800">
                  Tỷ lệ sử dụng xe theo giờ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      formatter={(value) => [value, 'Lượt sử dụng']}
                      labelStyle={{ color: '#333' }}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="usage" 
                      stroke="#14b8a6" 
                      strokeWidth={3}
                      dot={{ fill: '#14b8a6', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, fill: '#0d9488' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Status Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Xe đang hoạt động</h3>
                  <Battery className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">186</div>
                <div className="text-sm text-gray-600 mb-3">75% tổng số xe</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Xe đang sạc</h3>
                  <Battery className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">42</div>
                <div className="text-sm text-gray-600 mb-3">17% tổng số xe</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: '17%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Cần bảo trì</h3>
                  <Wrench className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-500 mb-2">20</div>
                <div className="text-sm text-gray-600 mb-3">8% tổng số xe</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
