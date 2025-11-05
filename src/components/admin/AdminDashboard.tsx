import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, TrendingUp } from "lucide-react";
import accountService from "@/services/accountService";
import { useEffect, useState } from 'react';
import { getDashboardData, getRentalOrderStatusStats, type DashboardData, type RentalOrderStatusStat } from '@/services/adminservice/adminDashboardService';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rentalStatusStats, setRentalStatusStats] = useState<RentalOrderStatusStat[]>([]);
  const [loadingRentalStats, setLoadingRentalStats] = useState(true);
  
  // Lấy tên user hiện tại từ database
  const user = accountService.getCurrentUser();
  const userName = user?.name || user?.userName || 'Guest';

  useEffect(() => {
    loadDashboardData();
    loadRentalStatusStats();
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

  const loadRentalStatusStats = async () => {
    try {
      setLoadingRentalStats(true);
      const stats = await getRentalOrderStatusStats();
      setRentalStatusStats(stats);
    } catch (error) {
      console.error('Error loading rental status stats:', error);
      setRentalStatusStats([]);
    } finally {
      setLoadingRentalStats(false);
    }
  };

  // Định dạng ngày để hiển thị (ví dụ: "Th 5, 30 thg 10")
  const formatDateForDisplay = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });
    const dayNumber = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    return `${dayName}, ${dayNumber} thg ${month}`;
  };

  // Tạo dữ liệu doanh thu trong 7 ngày (dự phòng nếu API không khả dụng)
  const getLast7DaysData = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date,
        revenue: Math.floor(Math.random() * 5000000) + 1000000, // Random revenue between 1M and 6M
      });
    }
    return days;
  };

 // Xử lý dữ liệu doanh thu từ API hoặc dự phòng
  const processedRevenueData = dashboardData?.revenueData && dashboardData.revenueData.length > 0
    ? dashboardData.revenueData.map(item => {
        let date: Date;
        if (item.day) {
          date = typeof item.day === 'string' ? new Date(item.day) : new Date(item.day);
        } else if (item.month) {
          
          date = new Date();
        } else {
        
          date = new Date();
        }
       
        if (isNaN(date.getTime())) {
          date = new Date();
        }
        return {
          date: date,
          revenue: item.revenue || 0
        };
      })
    : getLast7DaysData();

  const revenueData = processedRevenueData;

  // Tính tổng doanh thu
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  
  // Tìm doanh thu tối đa để tính toán thanh tiến trình
  const maxRevenue = Math.max(...revenueData.map(item => item.revenue || 0), 1);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}₫`;
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
              {[...Array(4)].map((_, i) => (
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Tổng đơn hàng */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Tổng đơn thuê</p>
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

              {/* Khách hàng */}
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
            </div>
          )}

          {/* Revenue Section */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                    Doanh thu 7 ngày gần nhất
                  </CardTitle>
                  <p className="text-sm text-gray-600">Theo dõi xu hướng doanh thu hàng ngày</p>
                </div>
                <div className="bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold">
                  Tổng: {formatCurrency(totalRevenue)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((item, index) => {
                  const revenue = item.revenue || 0;
                  const percentage = (revenue / maxRevenue) * 100;
                  const displayDate = formatDateForDisplay(item.date);
                  
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-36 text-sm text-gray-700 font-medium">
                        {displayDate}
                      </div>
                      <div className="flex-1 relative">
                        <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 rounded-full flex items-center justify-end pr-3 transition-all duration-300"
                            style={{ width: `${percentage}%`, minWidth: revenue > 0 ? '60px' : '0' }}
                          >
                            {revenue > 0 && (
                              <span className="text-white text-xs font-semibold">
                                {formatCurrency(revenue)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-28 text-right text-sm font-semibold text-gray-800">
                        {formatCurrency(revenue)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Đơn thuê theo trạng thái */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                Đơn thuê theo trạng thái
              </CardTitle>
              <p className="text-sm text-gray-600">Phân tích trạng thái đơn thuê</p>
            </CardHeader>
            <CardContent>
              {loadingRentalStats ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="animate-pulse">
                        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : rentalStatusStats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Không có dữ liệu đơn thuê</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rentalStatusStats.map((stat, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 mb-1">
                          {stat.displayName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stat.count} {stat.count === 1 ? 'đơn thuê' : 'đơn thuê'}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-base font-bold text-gray-800">
                            {stat.count}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-600">
                            {stat.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          
          
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
