import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, TrendingUp, UserCog, MapPin, AlertTriangle, Calendar } from "lucide-react";
import accountService from "@/services/accountService";
import { useEffect, useState } from 'react';
import { 
  getDashboardData, 
  getRentalOrderStatusStats, 
  getTotalStaffCount,
  getTotalRentersCount,
  getCurrentMonthRevenue,
  getCurrentYearRevenue,
  getStationsWithStaff,
  getRiskyCustomers,
  getRevenueByPeriod,
  type RevenuePeriodResult,
  type DashboardData, 
  type RentalOrderStatusStat,
  type StationWithStaff,
  type RiskyCustomer
} from '@/services/adminservice/adminDashboardService';
import SevenDayRevenue from './SevenDayRevenue';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rentalStatusStats, setRentalStatusStats] = useState<RentalOrderStatusStat[]>([]);
  const [loadingRentalStats, setLoadingRentalStats] = useState(true);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [rentersCount, setRentersCount] = useState<number>(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState<number>(0);
  const [currentYearRevenue, setCurrentYearRevenue] = useState<number>(0);
  const [stationsWithStaff, setStationsWithStaff] = useState<StationWithStaff[]>([]);
  const [riskyCustomers, setRiskyCustomers] = useState<RiskyCustomer[]>([]);
  const [loadingAdditional, setLoadingAdditional] = useState(true);
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  const [periodResult, setPeriodResult] = useState<RevenuePeriodResult | null>(null);
  const [loadingPeriod, setLoadingPeriod] = useState<boolean>(false);
  const [periodError, setPeriodError] = useState<string | null>(null);
  
  // Lấy tên user hiện tại từ database
  const user = accountService.getCurrentUser();
  const userName = user?.name || user?.userName || 'Guest';

  useEffect(() => {
    loadDashboardData();
    loadRentalStatusStats();
    loadAdditionalData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const loadAdditionalData = async () => {
    try {
      setLoadingAdditional(true);
      const [staff, renters, monthRev, yearRev, stations, risky] = await Promise.all([
        getTotalStaffCount().catch(() => 0),
        getTotalRentersCount().catch(() => 0),
        getCurrentMonthRevenue().catch(() => 0),
        getCurrentYearRevenue().catch(() => 0),
        getStationsWithStaff().catch(() => []),
        getRiskyCustomers().catch(() => []),
      ]);
      
      setStaffCount(staff);
      setRentersCount(renters);
      setCurrentMonthRevenue(monthRev);
      setCurrentYearRevenue(yearRev);
      setStationsWithStaff(stations);
      setRiskyCustomers(risky);
    } catch (error) {
      console.error('Error loading additional dashboard data:', error);
    } finally {
      setLoadingAdditional(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  const fetchRevenueByPeriod = async () => {
    setPeriodError(null);
    setPeriodResult(null);
    if (!periodStart || !periodEnd) {
      setPeriodError('Vui lòng chọn cả ngày bắt đầu và kết thúc');
      return;
    }

    // Construct ISO strings for the API (start at 00:00:00, end at 23:59:59)
    const startIso = `${periodStart}T00:00:00Z`;
    const endIso = `${periodEnd}T23:59:59Z`;

    try {
      setLoadingPeriod(true);
      const res = await getRevenueByPeriod(startIso, endIso);
      setPeriodResult(res);
    } catch (err: any) {
      console.error('Error fetching revenue by period:', err);
      setPeriodError(err?.message ?? 'Lỗi khi tải doanh thu theo khoảng thời gian');
    } finally {
      setLoadingPeriod(false);
    }
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
            <div className="flex gap-6 justify-between overflow-x-auto py-2">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="flex-1 min-w-[200px] max-w-[260px] bg-white rounded-xl shadow-sm border border-gray-100">
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
            <div className="flex gap-6 justify-between overflow-x-auto py-2">
              {/* Tổng đơn hàng */}
              <Card className="flex-1 min-w-[200px] max-w-[260px] bg-white rounded-xl shadow-sm border border-gray-100">
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

              {/* Doanh thu tổng */}
              <Card className="flex-1 min-w-[200px] max-w-[260px] bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Doanh thu tổng</p>
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
              <Card className="flex-1 min-w-[200px] max-w-[260px] bg-white rounded-xl shadow-sm border border-gray-100">
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

              {/* Nhân viên */}
              <Card className="flex-1 min-w-[200px] max-w-[260px] bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Nhân viên</p>
                      <p className="text-3xl font-bold text-gray-800">{staffCount.toLocaleString()}</p>
                      <p className="text-sm text-purple-600 mt-1">Tổng số nhân viên</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <UserCog className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Người thuê */}
              <Card className="flex-1 min-w-[200px] max-w-[260px] bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Người thuê</p>
                      <p className="text-3xl font-bold text-gray-800">{rentersCount.toLocaleString()}</p>
                      <p className="text-sm text-indigo-600 mt-1">Tổng số người thuê</p>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-full">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Revenue Statistics */}
          <div className="grid gap-6 grid-cols-1">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Doanh thu theo thời gian
                </CardTitle>
                <p className="text-sm text-gray-600">Thống kê doanh thu tháng và năm hiện tại</p>
              </CardHeader>
              <CardContent>
                {loadingAdditional ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Doanh thu tháng này</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {formatCurrency(currentMonthRevenue)}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-200 rounded-full">
                        <Calendar className="h-5 w-5 text-blue-700" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Doanh thu năm này</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {formatCurrency(currentYearRevenue)}
                        </p>
                      </div>
                      <div className="p-3 bg-green-200 rounded-full">
                        <Calendar className="h-5 w-5 text-green-700" />
                      </div>
                    </div>
                   

                    {/* Seven day revenue columns */}
                    <SevenDayRevenue />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Khách hàng rủi ro */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Khách hàng rủi ro
                </CardTitle>
                <p className="text-sm text-gray-600">Danh sách khách hàng có vi phạm hoặc phạt</p>
              </CardHeader>
              <CardContent>
                {loadingAdditional ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : riskyCustomers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Không có khách hàng rủi ro</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {riskyCustomers.slice(0, 5).map((customer) => (
                      <div 
                        key={customer.customerId}
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 mb-1">
                            {customer.customerName}
                          </div>
                          <div className="text-xs text-gray-600">
                            {customer.customerPhone && `SĐT: ${customer.customerPhone}`}
                            {customer.totalViolations !== undefined && ` • ${customer.totalViolations} vi phạm`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-semibold px-2 py-1 rounded ${
                            customer.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                            customer.riskLevel === 'medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {customer.riskLevel === 'high' ? 'Cao' : customer.riskLevel === 'medium' ? 'Trung bình' : 'Thấp'}
                          </div>
                          {customer.totalPenaltyAmount !== undefined && customer.totalPenaltyAmount > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              {formatCurrency(customer.totalPenaltyAmount)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {riskyCustomers.length > 5 && (
                      <p className="text-xs text-center text-gray-500 pt-2">
                        Và {riskyCustomers.length - 5} khách hàng khác...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

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

          {/* Stations with Staff */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Điểm thuê và nhân viên
              </CardTitle>
              <p className="text-sm text-gray-600">Danh sách các điểm thuê kèm thông tin nhân viên</p>
            </CardHeader>
            <CardContent>
              {loadingAdditional ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  ))}
                </div>
              ) : stationsWithStaff.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Không có dữ liệu điểm thuê</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stationsWithStaff.map((station) => (
                    <div 
                      key={station.stationId}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-800 mb-1">
                            {station.stationName}
                          </h3>
                          {station.stationAddress && (
                            <p className="text-sm text-gray-600 mb-2">{station.stationAddress}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                          <UserCog className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">
                            {station.staffCount} nhân viên
                          </span>
                        </div>
                      </div>
                      {station.staffList && station.staffList.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">Danh sách nhân viên:</p>
                          <div className="flex flex-wrap gap-2">
                            {station.staffList.map((staff) => (
                              <div 
                                key={staff.staffId}
                                className="px-2 py-1 bg-white rounded border border-gray-200 text-xs text-gray-700"
                              >
                                {staff.staffName}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
