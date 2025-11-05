const API_BASE = "https://backend.ridervolt.app/api";

export interface DashboardStats {
  totalVehicles: number;
  totalStations: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeRentals: number;
  totalPenalty: number;
  revenueGrowth: number;
  customerGrowth: number;
  vehicleGrowth: number;
}

export interface VehicleStatus {
  active: number;
  charging: number;
  maintenance: number;
  total: number;
}

export interface RevenueData {
  month?: string; // Dữ liệu theo tháng
  day?: string; // Dữ liệu theo ngày
  revenue: number;
}

export interface UsageData {
  hour: string;
  usage: number;
}

export interface RentalOrderStatusStat {
  status: string;
  displayName: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DashboardData {
  stats: DashboardStats;
  vehicleStatus: VehicleStatus;
  revenueData: RevenueData[];
  usageData: UsageData[];
}

function authHeaders(): HeadersInit {
  const adminToken = localStorage.getItem("admin_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = adminToken || accessToken || "";
  
  if (!token) {
    console.error('No token found in localStorage');
  }
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Hàm trợ giúp chuyển đổi snake_case sang camelCase
function transformStats(data: any): DashboardStats {
  return {
    totalVehicles: data.totalVehicles ?? data.total_vehicles ?? 0,
    totalStations: data.totalStations ?? data.total_stations ?? 0,
    totalCustomers: data.totalCustomers ?? data.total_customers ?? 0,
    totalOrders: data.totalOrders ?? data.total_orders ?? 0,
    totalRevenue: data.totalRevenue ?? data.total_revenue ?? 0,
    monthlyRevenue: data.monthlyRevenue ?? data.monthly_revenue ?? 0,
    activeRentals: data.activeRentals ?? data.total_rentals_in_progress ?? data.totalRentalsInProgress ?? 0,
    totalPenalty: data.totalPenalty ?? data.total_penalty_cost ?? data.totalPenaltyCost ?? 0,
    revenueGrowth: data.revenueGrowth ?? data.revenue_growth ?? 0,
    customerGrowth: data.customerGrowth ?? data.customer_growth ?? 0,
    vehicleGrowth: data.vehicleGrowth ?? data.vehicle_growth ?? 0,
  };
}

// Lấy dữ liệu dashboard
export async function getDashboardData(): Promise<DashboardData> {
  const resp = await fetch(`${API_BASE}/admin/dashboard`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập dashboard admin.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load dashboard data (${resp.status})`);
  }
  
  const rawData = await resp.json();
  console.log('Dashboard API Response:', rawData);
  
  // Chuyển đổi phản hồi để phù hợp với interface của chúng ta
  // Xử lý trường hợp backend trả dữ liệu trực tiếp hoặc lồng trong trường stats
  const transformedData: DashboardData = {
    stats: transformStats(rawData.stats || rawData),
    vehicleStatus: rawData.vehicleStatus || rawData.vehicle_status || {
      active: 0,
      charging: 0,
      maintenance: 0,
      total: 0,
    },
    revenueData: rawData.revenueData || rawData.revenue_data || [],
    usageData: rawData.usageData || rawData.usage_data || [],
  };
  
  console.log('Transformed Dashboard Data:', transformedData);
  return transformedData;
}

// Lấy thống kê đơn thuê theo trạng thái
export async function getRentalOrderStatusStats(): Promise<RentalOrderStatusStat[]> {
  try {
  // Import động `getAllBillings` để tránh phụ thuộc vòng (circular dependency)
  const { getAllBillings } = await import('./adminBillingService');
    const billings = await getAllBillings();
    
  // Ánh xạ trạng thái backend sang nhóm hiển thị (gộp các trạng thái tương tự)
    const statusToGroup: Record<string, { displayName: string; color: string }> = {
      'COMPLETED': { displayName: 'hoàn thành', color: 'bg-gray-500' },
      'DONE': { displayName: 'hoàn thành', color: 'bg-gray-500' },
      'FINISHED': { displayName: 'hoàn thành', color: 'bg-gray-500' },
      'PAYED': { displayName: 'Đã thanh toán', color: 'bg-green-500' },
      'APPROVED': { displayName: 'Đã thanh toán', color: 'bg-green-500' },
      'CANCELLED': { displayName: 'Đã hủy', color: 'bg-red-500' },
      'PENDING': { displayName: 'Chờ xử lý', color: 'bg-yellow-500' },
      'WAITING': { displayName: 'Chờ xử lý', color: 'bg-yellow-500' },
      'RENTING': { displayName: 'Đang thuê', color: 'bg-blue-500' },
    };
    
  // Gom nhóm theo tên hiển thị (không phải trạng thái thô) để kết hợp các trạng thái tương tự
    const groupCounts: Record<string, { count: number; color: string; displayName: string }> = {};
    billings.forEach(billing => {
      const rawStatus = billing.status || 'UNKNOWN';
      const group = statusToGroup[rawStatus] || { displayName: rawStatus, color: 'bg-gray-400' };
      
      if (!groupCounts[group.displayName]) {
        groupCounts[group.displayName] = {
          count: 0,
          color: group.color,
          displayName: group.displayName,
        };
      }
      groupCounts[group.displayName].count += 1;
    });
    
    // Tính tổng
    const total = billings.length;
    
    // Chuyển thành mảng kèm phần trăm
    const stats: RentalOrderStatusStat[] = Object.values(groupCounts)
      .map((group) => ({
        status: group.displayName,
        displayName: group.displayName,
        count: group.count,
        percentage: total > 0 ? (group.count / total) * 100 : 0,
          color: group.color,
      }))
      // Sắp xếp theo số lượng giảm dần
      .sort((a, b) => b.count - a.count);
    
    return stats;
  } catch (error) {
    console.error('Error loading rental order status stats:', error);
    // Trả về mảng rỗng khi có lỗi
    return [];
  }
}

