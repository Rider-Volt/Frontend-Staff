const API_BASE = "https://backend.ridervolt.app/api";

export interface Station {
  id: number;
  name: string;
  address: string;
  staffId: number;
  staffFullName: string;
  totalVehicles: number;
}

export interface CreateStationRequest {
  name: string;
  address: string;
  staffId?: number | null;
}

export interface UpdateStationRequest {
  name?: string;
  address?: string;
  staffId?: number;
}

function authHeaders(): HeadersInit {
  const adminToken = localStorage.getItem("admin_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = adminToken || accessToken || "";
  
  console.log('Auth headers - admin_token:', adminToken);
  console.log('Auth headers - accessToken:', accessToken);
  console.log('Auth headers - using token:', token);
  
  if (!token) {
    console.error('No token found in localStorage');
  }
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Lấy tất cả trạm (public endpoint)
export async function getAllStations(): Promise<Station[]> {
  const resp = await fetch(`${API_BASE}/stations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load stations (${resp.status})`);
  }
  
  return (await resp.json()) as Station[];
}

// Lấy trạm theo ID (public endpoint)
export async function getStationById(stationId: number): Promise<Station> {
  const resp = await fetch(`${API_BASE}/stations/${stationId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!resp.ok) {
    if (resp.status === 404) {
      throw new Error("Không tìm thấy trạm.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load station (${resp.status})`);
  }
  
  return (await resp.json()) as Station;
}

// Tạo trạm mới
export async function createStation(data: CreateStationRequest): Promise<Station> {
  console.log('Creating station with data:', JSON.stringify(data, null, 2));
  
  const headers = authHeaders();
  console.log('Request headers:', headers);
  
  const body = JSON.stringify(data);
  console.log('Request body:', body);
  
  const resp = await fetch(`${API_BASE}/admin/stations`, {
    method: "POST",
    headers: headers,
    body: body,
  });
  
  console.log('Response status:', resp.status);
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền tạo trạm mới.");
    }
    
  // Thử lấy thông báo lỗi chi tiết từ phản hồi
  let errorMessage = 'Validation error';
    try {
      const errorData = await resp.json();
      console.error('Error response:', errorData);
      
      // Kiểm tra xem có lỗi xác thực (validation) hay lỗi chi tiết nào không
      if (errorData.details || errorData.errors) {
        const details = errorData.details || errorData.errors;
        if (Array.isArray(details)) {
          errorMessage = details.map((d: any) => d.message || d.field || d).join(', ');
        } else if (typeof details === 'string') {
          errorMessage = details;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      const text = await resp.text().catch(() => resp.statusText);
      console.error('Failed to create station - Full error:', text);
      errorMessage = text || `Failed to create station (${resp.status})`;
    }
    
    throw new Error(errorMessage);
  }
  
  return (await resp.json()) as Station;
}

// Cập nhật thông tin trạm
export async function updateStation(stationId: number, data: UpdateStationRequest): Promise<Station> {
  console.log('Updating station with data:', JSON.stringify(data, null, 2));
  
  const resp = await fetch(`${API_BASE}/admin/stations/${stationId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  
  console.log('Response status:', resp.status);
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật trạm này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy trạm để cập nhật.");
    }
    
  // Thử lấy thông báo lỗi chi tiết từ phản hồi
  let errorMessage = 'Validation error';
    try {
      const errorData = await resp.json();
      console.error('Error response:', errorData);
      
      // Kiểm tra xem có lỗi xác thực (validation) hay lỗi chi tiết nào không
      if (errorData.details || errorData.errors) {
        const details = errorData.details || errorData.errors;
        if (Array.isArray(details)) {
          errorMessage = details.map((d: any) => d.message || d.field || d).join(', ');
        } else if (typeof details === 'string') {
          errorMessage = details;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      const text = await resp.text().catch(() => resp.statusText);
      console.error('Failed to update station - Full error:', text);
      errorMessage = text || `Failed to update station (${resp.status})`;
    }
    
    throw new Error(errorMessage);
  }
  
  return (await resp.json()) as Station;
}

// Xóa trạm
export async function deleteStation(stationId: number): Promise<void> {
  const resp = await fetch(`${API_BASE}/admin/stations/${stationId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xóa trạm này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy trạm để xóa.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to delete station (${resp.status})`);
  }
}
