const API_BASE = "https://backend.ridervolt.app/api";

export interface StationStaff {
  id: number;
  name: string;
  staff: Staff;
  address: string;
  vehicles: Array<{
    id: number;
    code: string;
    model: {
      id: number;
      name: string;
      pricePerDay: number;
      photoUrl: string;
      type: string;
    };
    status: string;
  }>;
}

export interface Staff {
  id: number;
  email: string;
  password: string;
  avatar: string;
  cccdUrl: string;
  gplxUrl: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  phoneVerified: boolean;
  riskScore: number;
  stationName?: string; // Tên trạm gán cho staff
}

function authHeaders(): HeadersInit {
  const adminToken = localStorage.getItem("admin_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = adminToken || accessToken || "";
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Lấy danh sách nhân viên từ stations
export async function getAllStaff(): Promise<Staff[]> {
  try {
    const resp = await fetch(`${API_BASE}/admin/stations/staff`, {
      method: "GET",
      headers: authHeaders(),
    });
    
    if (!resp.ok) {
      if (resp.status === 401 || resp.status === 403) {
        throw new Error("Bạn không có quyền quản lý nhân viên.");
      }
      const text = await resp.text().catch(() => resp.statusText);
      console.error('Error loading staff:', text);
      throw new Error(text || `Failed to load staff (${resp.status})`);
    }
    
    const stationStaffList = (await resp.json()) as StationStaff[];
    
    // Lọc ra danh sách staff từ các station và gán tên trạm
    const uniqueStaffMap = new Map<number, Staff>();
    
    stationStaffList.forEach(station => {
      if (station.staff && station.staff.id && station.staff.role === 'STAFF') {
        // Chỉ lấy nhân viên có role STAFF và gán tên trạm
        const staffWithStation = {
          ...station.staff,
          stationName: station.name
        };
        uniqueStaffMap.set(station.staff.id, staffWithStation);
      }
    });
    
    const staffList = Array.from(uniqueStaffMap.values());
    console.log('Staff loaded from stations:', staffList);
    
    return staffList;
  } catch (error) {
    console.error('Error in getAllStaff:', error);
    throw error;
  }
}
