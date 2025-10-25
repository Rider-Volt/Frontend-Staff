import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Ticket, Bus, Users,Calendar,Filter,Loader2} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from '@/components/ui/table';
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,LineChart,Line} from 'recharts';

interface DashboardStats {
  bookings: {
    total: number;
    totalRevenue: number;
  };
  schedules: {
    total: number;
  };
  users: {
    total: number;
  };
}
interface TopRoute {
  routeId: string;
  departureProvince: string;
  arrivalProvince: string;
  bookingCount: number;
  revenue: number;
}
interface MonthlyStats {
  months: {
    monthName: string;
    revenue: number;
    totalBookings: number;
  }[];
}

const AdminRevenue = () => {
  const [timeFilter, setTimeFilter] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcode dữ liệu cho hệ thống thuê xe điện
  const dashboardStats: DashboardStats = {
    bookings: {
      total: 320,
      totalRevenue: 125000000,
    },
    schedules: {
      total: 48,
    },
    users: {
      total: 2100,
    },
  };

  // Bảng doanh thu theo dòng xe (hard code)
  const topRoutes: TopRoute[] = [
    {
      routeId: 'VF8',
      departureProvince: 'VinFast VF8',
      arrivalProvince: 'SUV 5+2',
      bookingCount: 120,
      revenue: 42000000,
    },
    {
      routeId: 'VF7',
      departureProvince: 'VinFast VF7',
      arrivalProvince: 'Crossover',
      bookingCount: 96,
      revenue: 31500000,
    },
    {
      routeId: 'VF6',
      departureProvince: 'VinFast VF6',
      arrivalProvince: 'Crossover',
      bookingCount: 78,
      revenue: 24500000,
    },
    {
      routeId: 'Klara',
      departureProvince: 'VinFast Klara',
      arrivalProvince: 'E-Scooter',
      bookingCount: 54,
      revenue: 9800000,
    },
    {
      routeId: 'EVO200',
      departureProvince: 'VinFast Evo 200',
      arrivalProvince: 'E-Scooter',
      bookingCount: 41,
      revenue: 7600000,
    },
  ];

  const monthlyStats: MonthlyStats = {
    months: [
      { monthName: 'Th1', revenue: 7200000, totalBookings: 38 },
      { monthName: 'Th2', revenue: 9400000, totalBookings: 47 },
      { monthName: 'Th3', revenue: 11800000, totalBookings: 59 },
      { monthName: 'Th4', revenue: 15200000, totalBookings: 72 },
      { monthName: 'Th5', revenue: 17600000, totalBookings: 81 },
      { monthName: 'Th6', revenue: 19800000, totalBookings: 88 },
      { monthName: 'Th7', revenue: 22500000, totalBookings: 101 },
      { monthName: 'Th8', revenue: 24800000, totalBookings: 108 },
      { monthName: 'Th9', revenue: 27100000, totalBookings: 119 },
      { monthName: 'Th10', revenue: 29600000, totalBookings: 128 },
      { monthName: 'Th11', revenue: 31800000, totalBookings: 139 },
      { monthName: 'Th12', revenue: 34600000, totalBookings: 149 },
    ],
  };

  const adminFullName = "Nguyen Van Admin";

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

  const monthlyChartData = monthlyStats.months.map(month => ({
    month: month.monthName,
    revenue: month.revenue,
    tickets: month.totalBookings
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
          <span className="text-lg text-gray-600">Đang tải dữ liệu thống kê...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-green-500 hover:bg-green-600">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Time Filter */}
      <div className="flex justify-between items-center pt-1">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Doanh Thu Thuê Xe</h2>
        <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm">
          <Button
            variant={timeFilter === 'week' ? 'default' : 'ghost'}
            onClick={() => setTimeFilter('week')}
            className={`rounded-full px-4 ${timeFilter === 'week' ? 'bg-green-500 hover:bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Tuần Này
          </Button>
          <Button
            variant={timeFilter === 'month' ? 'default' : 'ghost'}
            onClick={() => setTimeFilter('month')}
            className={`rounded-full px-4 ${timeFilter === 'month' ? 'bg-green-500 hover:bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Tháng Này
          </Button>
          <Button
            variant={timeFilter === 'year' ? 'default' : 'ghost'}
            onClick={() => setTimeFilter('year')}
            className={`rounded-full px-4 ${timeFilter === 'year' ? 'bg-green-500 hover:bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Năm Này
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl bg-gradient-to-br from-green-50 to-green-100 min-h-[132px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Tổng Doanh Thu</p>
                <p className="text-3xl font-bold text-green-800">
                  {dashboardStats ? formatCurrency(dashboardStats.bookings.totalRevenue) : '0₫'}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
              <span className="text-sm text-green-700 ml-2">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 min-h-[132px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Tổng Lượt Thuê</p>
                <p className="text-3xl font-bold text-blue-800">
                  {dashboardStats ? dashboardStats.bookings.total.toLocaleString() : '0'}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <Ticket className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+8.3%</span>
              <span className="text-sm text-blue-700 ml-2">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 min-h-[132px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Tổng Xe Khả Dụng</p>
                <p className="text-3xl font-bold text-purple-800">
                  {dashboardStats ? dashboardStats.schedules.total.toLocaleString() : '0'}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Bus className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+5.2%</span>
              <span className="text-sm text-purple-700 ml-2">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 min-h-[132px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Tổng Khách Hàng</p>
                <p className="text-3xl font-bold text-orange-800">
                  {dashboardStats ? dashboardStats.users.total.toLocaleString() : '0'}
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+15.7%</span>
              <span className="text-sm text-orange-700 ml-2">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue Chart */}
        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
              Xu Hướng Doanh Thu Theo Tháng (Thuê xe)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="#666" />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Doanh Thu']}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#16a34a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>


      </div>

      {/* Bảng doanh thu theo dòng xe */}
      <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <Bus className="h-5 w-5 text-green-500 mr-2" />
              Dòng Xe Top Doanh Thu
            </CardTitle>
            <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
              Xem Tất Cả Dòng Xe
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Dòng xe</TableHead>
                  <TableHead className="font-semibold">Phân khúc</TableHead>
                  <TableHead className="font-semibold">Lượt thuê</TableHead>
                  <TableHead className="font-semibold">Doanh thu</TableHead>
                  <TableHead className="font-semibold">Xếp hạng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRoutes.map((route, index) => (
                  <TableRow key={route.routeId} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{route.departureProvince}</TableCell>
                    <TableCell className="text-gray-600">{route.arrivalProvince}</TableCell>
                    <TableCell className="font-semibold">{route.bookingCount.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-green-600">{formatCurrency(route.revenue)}</TableCell>
                    <TableCell>
                      <Badge className={index < 3 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        #{index + 1}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default AdminRevenue;