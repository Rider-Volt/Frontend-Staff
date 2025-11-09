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
