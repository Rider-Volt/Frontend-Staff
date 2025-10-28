import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, MapPin, Users, TrendingUp, Battery, Wrench } from "lucide-react";
import accountService from "@/services/accountService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useEffect, useState } from 'react';
import { getDashboardData, type DashboardData } from '@/services/adminservice/adminDashboardService';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Lấy tên user hiện tại từ database
  const user = accountService.getCurrentUser();
  const userName = user?.name || user?.userName || 'Guest';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Không hiển thị lỗi, chỉ dùng hardcode data
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fallback to mock data if API not available
  const revenueData = dashboardData?.revenueData || [
    { month: 'T7', revenue: 42000000 },
    { month: 'T8', revenue: 50000000 },
    { month: 'T9', revenue: 48000000 },
    { month: 'T10', revenue: 62000000 },
    { month: 'T11', revenue: 55000000 },
    { month: 'T12', revenue: 70000000 },
  ];

  const usageData = dashboardData?.usageData || [
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
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Tổng đơn hàng */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Tổng đơn hàng</p>
                      <p className="text-3xl font-bold text-gray-800">{dashboardData?.stats?.totalOrders?.toLocaleString() ?? '0'}</p>
                      <p className="text-sm text-gray-600 mt-1">Tất cả đơn hàng</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Doanh thu */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Doanh thu</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {dashboardData?.stats?.totalRevenue 
                          ? formatCurrency(dashboardData.stats.totalRevenue)
                          : '0₫'}
                      </p>
                      <p className="text-sm text-teal-600 mt-1">Tổng doanh thu hệ thống</p>
                    </div>
                    <div className="p-3 bg-teal-100 rounded-full">
                      <TrendingUp className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Số đơn đang thuê */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Đơn đang thuê</p>
                      <p className="text-3xl font-bold text-gray-800">{dashboardData?.stats?.activeRentals ?? '0'}</p>
                      <p className="text-sm text-orange-600 mt-1">Đang trong quá trình thuê</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Car className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tổng phí phạt */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Tổng phí phạt</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {dashboardData?.stats?.totalPenalty 
                          ? formatCurrency(dashboardData.stats.totalPenalty)
                          : '0₫'}
                      </p>
                      <p className="text-sm text-red-600 mt-1">Tiền phạt từ khách hàng</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <Wrench className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Số khách hàng */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Khách hàng</p>
                      <p className="text-3xl font-bold text-gray-800">{dashboardData?.stats?.totalCustomers?.toLocaleString() ?? '0'}</p>
                      <p className="text-sm text-teal-600 mt-1">Tổng số khách hàng</p>
                    </div>
                    <div className="p-3 bg-teal-100 rounded-full">
                      <Users className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phương tiện */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Phương tiện</p>
                      <p className="text-3xl font-bold text-gray-800">{dashboardData?.stats?.totalVehicles ?? '0'}</p>
                      <p className="text-sm text-gray-600 mt-1">Tổng số xe trong hệ thống</p>
                    </div>
                    <div className="p-3 bg-teal-100 rounded-full">
                      <Car className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
                <div className="text-3xl font-bold text-gray-800 mb-2">{dashboardData?.vehicleStatus?.active ?? 186}</div>
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
                <div className="text-3xl font-bold text-gray-800 mb-2">{dashboardData?.vehicleStatus?.charging ?? 42}</div>
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
                <div className="text-3xl font-bold text-red-500 mb-2">{dashboardData?.vehicleStatus?.maintenance ?? 20}</div>
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
