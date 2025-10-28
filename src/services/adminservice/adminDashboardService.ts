const API_BASE = "https://backend.ridervolt.app/api";

export interface DashboardStats {
  totalVehicles: number;
  totalStations: number;
  totalCustomers: number;
  monthlyRevenue: number;
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
  month: string;
  revenue: number;
}

export interface UsageData {
  hour: string;
  usage: number;
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
  
  return (await resp.json()) as DashboardData;
}

