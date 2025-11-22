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

export interface RevenuePeriodResult {
  revenue: number;
  totalOrders?: number;
  period?: string;
  description?: string;
}

// Lấy doanh thu cho một ngày (YYYY-MM-DD) - helper tiện ích
export async function getRevenueByDate(dateIsoDay: string): Promise<RevenuePeriodResult> {
  const startIso = `${dateIsoDay}T00:00:00Z`;
  const endIso = `${dateIsoDay}T23:59:59Z`;
  const params = new URLSearchParams({ startDate: startIso, endDate: endIso });

  const resp = await fetch(`${API_BASE}/admin/dashboard/revenue/period?${params}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error('Bạn không có quyền truy cập doanh thu theo ngày.');
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load revenue for ${dateIsoDay} (${resp.status})`);
  }

  const data = await resp.json();
  return {
    revenue: typeof data === 'number' ? data : (data.revenue ?? data.totalRevenue ?? data.total_revenue ?? 0),
    totalOrders: data.totalOrders ?? data.total_orders ?? data.totalOrdersCount ?? 0,
    period: data.period ?? undefined,
    description: data.description ?? undefined,
  };
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

export interface SystemStats {
  totalVehicles: number;
  totalStations: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  totalStaff: number;
  totalRenters: number;
  activeRentals: number;
}

export interface StationWithStaff {
  stationId: number;
  stationName: string;
  stationAddress?: string;
  staffCount: number;
  staffList?: Array<{
    staffId: number;
    staffName: string;
    staffEmail?: string;
  }>;
}

export interface RiskyCustomer {
  customerId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  totalViolations?: number;
  totalPenalties?: number;
  totalPenaltyAmount?: number;
  lastViolationDate?: string;
  riskLevel?: 'low' | 'medium' | 'high';
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

// Lấy tổng số phương tiện
export async function getTotalVehiclesCount(): Promise<number> {
  const resp = await fetch(`${API_BASE}/admin/dashboard/stats/vehicles`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập thống kê phương tiện.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load vehicles count (${resp.status})`);
  }
  
  const data = await resp.json();
  return typeof data === 'number' ? data : data.count || data.totalVehicles || data.total_vehicles || 0;
}

// Lấy thống kê hệ thống đầy đủ
export async function getSystemStats(): Promise<SystemStats> {
  const resp = await fetch(`${API_BASE}/admin/dashboard/stats/system`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập thống kê hệ thống.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load system stats (${resp.status})`);
  }
  
  const rawData = await resp.json();
  return {
    totalVehicles: rawData.totalVehicles ?? rawData.total_vehicles ?? 0,
    totalStations: rawData.totalStations ?? rawData.total_stations ?? 0,
    totalCustomers: rawData.totalCustomers ?? rawData.total_customers ?? 0,
    totalOrders: rawData.totalOrders ?? rawData.total_orders ?? 0,
    totalRevenue: rawData.totalRevenue ?? rawData.total_revenue ?? 0,
    totalStaff: rawData.totalStaff ?? rawData.total_staff ?? 0,
    totalRenters: rawData.totalRenters ?? rawData.total_renters ?? 0,
    activeRentals: rawData.activeRentals ?? rawData.active_rentals ?? 0,
  };
}

// Lấy tổng số nhân viên
export async function getTotalStaffCount(): Promise<number> {
  const resp = await fetch(`${API_BASE}/admin/dashboard/stats/staff`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập thống kê nhân viên.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load staff count (${resp.status})`);
  }
  
  const data = await resp.json();
  return typeof data === 'number' ? data : data.count || data.totalStaff || data.total_staff || 0;
}

// Lấy tổng doanh thu
export async function getTotalRevenue(): Promise<number> {
  const resp = await fetch(`${API_BASE}/admin/dashboard/stats/revenue/total`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập thống kê doanh thu.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load total revenue (${resp.status})`);
  }
  
  const data = await resp.json();
  return typeof data === 'number' ? data : data.revenue || data.totalRevenue || data.total_revenue || 0;
}

// Lấy tổng số người thuê
export async function getTotalRentersCount(): Promise<number> {
  const resp = await fetch(`${API_BASE}/admin/dashboard/stats/renters`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập thống kê người thuê.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load renters count (${resp.status})`);
  }
  
  const data = await resp.json();
  return typeof data === 'number' ? data : data.count || data.totalRenters || data.total_renters || 0;
}

// Lấy danh sách station kèm nhân viên
export async function getStationsWithStaff(): Promise<StationWithStaff[]> {
  const resp = await fetch(`${API_BASE}/admin/dashboard/stations/staff`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập danh sách station với nhân viên.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load stations with staff (${resp.status})`);
  }
  
  const data = await resp.json();
  const stations = Array.isArray(data) ? data : (data.stations || data.data || []);
  
  return stations.map((station: any) => ({
    stationId: station.stationId ?? station.station_id ?? station.id ?? 0,
    stationName: station.stationName ?? station.station_name ?? station.name ?? '',
    stationAddress: station.stationAddress ?? station.station_address ?? station.address,
    staffCount: station.staffCount ?? station.staff_count ?? (station.staffList?.length ?? station.staff_list?.length ?? 0),
    staffList: (station.staffList ?? station.staff_list ?? []).map((staff: any) => ({
      staffId: staff.staffId ?? staff.staff_id ?? staff.id ?? 0,
      staffName: staff.staffName ?? staff.staff_name ?? staff.name ?? '',
      staffEmail: staff.staffEmail ?? staff.staff_email ?? staff.email,
    })),
  }));
}

// Lấy doanh thu theo khoảng thời gian tùy chỉnh
export async function getRevenueByPeriod(startDate: string, endDate: string): Promise<RevenuePeriodResult> {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });
  
  const resp = await fetch(`${API_BASE}/admin/dashboard/revenue/period?${params}`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập doanh thu theo khoảng thời gian.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load revenue by period (${resp.status})`);
  }
  
  const data = await resp.json();
  // Backend may return object like { revenue: 0, totalOrders: 0, period: 'string', description: 'string' }
  return {
    revenue: typeof data === 'number' ? data : (data.revenue ?? data.totalRevenue ?? data.total_revenue ?? 0),
    totalOrders: data.totalOrders ?? data.total_orders ?? data.totalOrdersCount ?? 0,
    period: data.period ?? undefined,
    description: data.description ?? undefined,
  };
}

// Lấy doanh thu năm hiện tại
export async function getCurrentYearRevenue(): Promise<number> {
  const resp = await fetch(`${API_BASE}/admin/dashboard/revenue/current-year`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập doanh thu năm hiện tại.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load current year revenue (${resp.status})`);
  }
  
  const data = await resp.json();
  return typeof data === 'number' ? data : data.revenue || data.totalRevenue || data.total_revenue || 0;
}

// Lấy doanh thu tháng hiện tại
export async function getCurrentMonthRevenue(): Promise<number> {
  const resp = await fetch(`${API_BASE}/admin/dashboard/revenue/current-month`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập doanh thu tháng hiện tại.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load current month revenue (${resp.status})`);
  }
  
  const data = await resp.json();
  return typeof data === 'number' ? data : data.revenue || data.totalRevenue || data.total_revenue || 0;
}

// Lấy danh sách khách hàng rủi ro
export async function getRiskyCustomers(): Promise<RiskyCustomer[]> {
  const resp = await fetch(`${API_BASE}/admin/dashboard/customers/risky`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập danh sách khách hàng rủi ro.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load risky customers (${resp.status})`);
  }
  
  const data = await resp.json();
  const customers = Array.isArray(data) ? data : (data.customers || data.data || []);
  
  return customers.map((customer: any) => ({
    customerId: customer.customerId ?? customer.customer_id ?? customer.id ?? 0,
    customerName: customer.customerName ?? customer.customer_name ?? customer.name ?? '',
    customerEmail: customer.customerEmail ?? customer.customer_email ?? customer.email,
    customerPhone: customer.customerPhone ?? customer.customer_phone ?? customer.phone,
    totalViolations: customer.totalViolations ?? customer.total_violations ?? 0,
    totalPenalties: customer.totalPenalties ?? customer.total_penalties ?? 0,
    totalPenaltyAmount: customer.totalPenaltyAmount ?? customer.total_penalty_amount ?? customer.penaltyAmount ?? 0,
    lastViolationDate: customer.lastViolationDate ?? customer.last_violation_date ?? customer.lastViolation,
    riskLevel: customer.riskLevel ?? customer.risk_level ?? 'medium',
  }));
}

