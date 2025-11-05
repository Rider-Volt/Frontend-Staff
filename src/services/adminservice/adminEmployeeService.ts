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
  stationName?: string; 
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
    const headers = authHeaders();
    const uniqueStaffMap = new Map<number, Staff>();

   
    const candidateEndpoints = [
      `${API_BASE}/admin/accounts/staff`,           
      `${API_BASE}/admin/accounts?role=STAFF`,      
    ];

    for (const url of candidateEndpoints) {
      try {
        const respAccounts = await fetch(url, { method: 'GET', headers });
        if (respAccounts.ok) {
          const accounts = (await respAccounts.json()) as Staff[];
          accounts
            .filter(acc => acc && acc.id && acc.role === 'STAFF')
            .forEach(acc => {
              // Không có tên trạm thì để trống hoặc giữ nguyên nếu có
              uniqueStaffMap.set(acc.id, { ...acc });
            });
          break; // đã lấy được thì dừng thử các endpoint còn lại
        }
      } catch (e) {
        // Bỏ qua và thử endpoint tiếp theo
      }
    }

    // 2) Fallback: Lấy nhân viên từ danh sách trạm (chỉ gồm nhân viên đã gán trạm)
    try {
      const respStations = await fetch(`${API_BASE}/admin/stations/staff`, {
        method: 'GET',
        headers,
      });
      if (respStations.ok) {
        const stationStaffList = (await respStations.json()) as StationStaff[];
        stationStaffList.forEach(station => {
          if (station.staff && station.staff.id && station.staff.role === 'STAFF') {
            const staffWithStation = {
              ...station.staff,
              stationName: station.name,
            };
            uniqueStaffMap.set(station.staff.id, staffWithStation);
          }
        });
      } else if (respStations.status === 401 || respStations.status === 403) {
        throw new Error('Bạn không có quyền quản lý nhân viên.');
      }
    } catch (e) {
      // Nếu cả fallback cũng lỗi hoàn toàn và chưa có dữ liệu nào, ném lỗi
      if (uniqueStaffMap.size === 0) {
        throw e instanceof Error ? e : new Error('Failed to load staff');
      }
    }

    const staffList = Array.from(uniqueStaffMap.values());
    console.log('Staff loaded (merged):', staffList);
    return staffList;
  } catch (error) {
    console.error('Error in getAllStaff:', error);
    throw error;
  }
}
