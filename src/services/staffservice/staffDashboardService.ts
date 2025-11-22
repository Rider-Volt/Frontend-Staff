const API_BASE = "https://backend.ridervolt.app/api";

// Interface cho Return Today
export interface ReturnToday {
  id: number;
  billingId: number;
  vehicleId: number;
  vehicleName?: string;
  licensePlate?: string;
  customerName?: string;
  customerPhone?: string;
  returnTime: string;
  stationId?: number;
  stationName?: string;
  status?: string;
}

// Interface cho Pickup Today
export interface PickupToday {
  id: number;
  billingId: number;
  vehicleId: number;
  vehicleName?: string;
  licensePlate?: string;
  customerName?: string;
  customerPhone?: string;
  pickupTime: string;
  stationId?: number;
  stationName?: string;
  status?: string;
}

// Interface cho Overdue Billing
export interface OverdueBilling {
  id: number;
  billingId: number;
  vehicleId: number;
  vehicleName?: string;
  licensePlate?: string;
  customerName?: string;
  customerPhone?: string;
  dueDate: string;
  overdueDays?: number;
  amount?: number;
  stationId?: number;
  stationName?: string;
  status?: string;
}

// Interface cho Maintenance Vehicle
export interface MaintenanceVehicle {
  vehicleId: number;
  stationId: number;
  vehicleType: string;
  model: string;
  licensePlate: string;
  status: string;
  pricePerDay: number;
  imageUrl: string;
  stationName: string;
  stationAddress: string;
  currentPin: number;
  currentKm: number;
}

function authHeaders(): HeadersInit {
  const staffToken = localStorage.getItem("staff_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = staffToken || accessToken || "";
  
  if (!token) {
    console.error('No token found in localStorage for staff');
  }
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Lấy danh sách scheduled returns cho hôm nay
export async function getReturnsToday(): Promise<ReturnToday[]> {
  const resp = await fetch(`${API_BASE}/staff/dashboard/returns-today`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách trả xe hôm nay.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load returns today (${resp.status})`);
  }
  
  return (await resp.json()) as ReturnToday[];
}

// Lấy số lượng scheduled returns cho hôm nay
export async function getReturnsTodayCount(): Promise<number> {
  const resp = await fetch(`${API_BASE}/staff/dashboard/returns-today/count`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem số lượng trả xe hôm nay.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load returns today count (${resp.status})`);
  }
  
  const data = await resp.json();
  return typeof data === 'number' ? data : data.count || data.total || 0;
}

// Lấy danh sách scheduled pickups cho hôm nay
export async function getPickupsToday(): Promise<PickupToday[]> {
  const resp = await fetch(`${API_BASE}/staff/dashboard/pickups-today`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách nhận xe hôm nay.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load pickups today (${resp.status})`);
  }
  
  return (await resp.json()) as PickupToday[];
}

// Lấy số lượng scheduled pickups cho hôm nay
export async function getPickupsTodayCount(): Promise<number> {
  const resp = await fetch(`${API_BASE}/staff/dashboard/pickups-today/count`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem số lượng nhận xe hôm nay.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load pickups today count (${resp.status})`);
  }
  
  const data = await resp.json();
  return typeof data === 'number' ? data : data.count || data.total || 0;
}

// Lấy danh sách overdue rentals
export async function getOverdueBillings(): Promise<OverdueBilling[]> {
  const resp = await fetch(`${API_BASE}/staff/dashboard/overdue-billings`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách đơn thuê quá hạn.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load overdue billings (${resp.status})`);
  }
  
  return (await resp.json()) as OverdueBilling[];
}

// Lấy số lượng overdue rentals
export async function getOverdueBillingsCount(): Promise<number> {
  const resp = await fetch(`${API_BASE}/staff/dashboard/overdue-billings/count`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem số lượng đơn thuê quá hạn.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load overdue billings count (${resp.status})`);
  }
  
  const data = await resp.json();
  return typeof data === 'number' ? data : data.count || data.total || 0;
}

// Lấy danh sách vehicles under maintenance
export async function getMaintenanceVehicles(): Promise<MaintenanceVehicle[]> {
  const resp = await fetch(`${API_BASE}/staff/dashboard/maintenance-vehicles`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách xe đang bảo trì.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load maintenance vehicles (${resp.status})`);
  }
  
  return (await resp.json()) as MaintenanceVehicle[];
}

// Lấy số lượng vehicles under maintenance
export async function getMaintenanceVehiclesCount(): Promise<number> {
  const resp = await fetch(`${API_BASE}/staff/dashboard/maintenance-vehicles/count`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem số lượng xe đang bảo trì.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load maintenance vehicles count (${resp.status})`);
  }
  
  const data = await resp.json();
  return typeof data === 'number' ? data : data.count || data.total || 0;
}

