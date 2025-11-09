const API_BASE = "https://backend.ridervolt.app/api";

export interface StaffVehicle {
  vehicleId: number;
  stationId: number;
  vehicleType: string;
  model: string;
  modelId?: number;
  licensePlate: string;
  status: string;
  pricePerDay: number;
  imageUrl: string;
  stationName: string;
  stationAddress: string;
  stationLatitude?: number;
  stationLongitude?: number;
  currentPin: number;
}

export interface UpdateVehicleStatusRequest {
  status: string;
}

function authHeaders(): HeadersInit {
  const staffToken = localStorage.getItem("staff_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = staffToken || accessToken || "";
  
  console.log('Staff auth headers - staff_token:', staffToken);
  console.log('Staff auth headers - accessToken:', accessToken);
  console.log('Staff auth headers - using token:', token);
  
  if (!token) {
    console.error('No token found in localStorage for staff');
  }
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Lấy tất cả xe trong trạm của staff
export async function getStaffVehicles(): Promise<StaffVehicle[]> {
  const resp = await fetch(`${API_BASE}/staff/vehicles`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách xe trong trạm.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load staff vehicles (${resp.status})`);
  }
  
  return (await resp.json()) as StaffVehicle[];
}

// Lấy xe theo trạng thái trong trạm của staff
export async function getStaffVehiclesByStatus(status: string): Promise<StaffVehicle[]> {
  const resp = await fetch(`${API_BASE}/staff/vehicles/status/${status}`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem xe theo trạng thái trong trạm.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load vehicles by status (${resp.status})`);
  }
  
  return (await resp.json()) as StaffVehicle[];
}

// Cập nhật trạng thái xe
export async function updateVehicleStatus(vehicleId: number, status: string): Promise<StaffVehicle> {
  // Validate status
  const validStatuses: VehicleStatus[] = ['AVAILABLE', 'BOOKED', 'RENTED', 'MAINTENANCE', 'RESERVED', 'LOCKED'];
  const normalizedStatus = status.toUpperCase() as VehicleStatus;
  
  if (!validStatuses.includes(normalizedStatus)) {
    throw new Error(`Trạng thái không hợp lệ. Các trạng thái hợp lệ: ${validStatuses.join(', ')}`);
  }
  
  const updateData: UpdateVehicleStatusRequest = {
    status: normalizedStatus
  };
  
  console.log('Staff updating vehicle status - ID:', vehicleId);
  console.log('Staff update data:', JSON.stringify(updateData, null, 2));
  console.log('Staff request URL:', `${API_BASE}/staff/vehicles/${vehicleId}/status`);
  
  const resp = await fetch(`${API_BASE}/staff/vehicles/${vehicleId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(updateData),
  });
  
  console.log('Staff update response status:', resp.status);
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật trạng thái xe này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy xe để cập nhật.");
    }
    
    let errorMessage = 'Failed to update vehicle status';
    try {
      const errorData = await resp.json();
      console.error('Staff error response:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const text = await resp.text().catch(() => resp.statusText);
      console.error('Staff failed to update vehicle status:', text);
      errorMessage = text || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  const updated = await resp.json();
  console.log('Staff updated vehicle response:', updated);
  
  return updated as StaffVehicle;
}

// Helper function to get status badge info
export function getVehicleStatusInfo(status: string) {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE':
      return { 
        variant: 'default' as const, 
        className: 'bg-green-100 text-green-800', 
        text: 'Sẵn sàng' 
      };
    case 'BOOKED':
      return { 
        variant: 'secondary' as const, 
        className: 'bg-orange-100 text-orange-800', 
        text: 'Đã đặt' 
      };
    case 'RENTED':
      return { 
        variant: 'secondary' as const, 
        className: 'bg-blue-100 text-blue-800', 
        text: 'Đang thuê' 
      };
    case 'MAINTENANCE':
      return { 
        variant: 'destructive' as const, 
        className: 'bg-yellow-100 text-yellow-800', 
        text: 'Bảo trì' 
      };
    case 'RESERVED':
      return { 
        variant: 'secondary' as const, 
        className: 'bg-purple-100 text-purple-800', 
        text: 'Đã đặt trước' 
      };
    case 'LOCKED':
      return { 
        variant: 'destructive' as const, 
        className: 'bg-red-100 text-red-800', 
        text: 'Đã khóa' 
      };
   
    default:
      return { 
        variant: 'secondary' as const, 
        className: 'bg-gray-100 text-gray-800', 
        text: status || 'Không xác định' 
      };
  }
}

// Loại trạng thái xe dựa trên tài liệu API
export type VehicleStatus = 'AVAILABLE' | 'BOOKED' | 'RENTED' | 'MAINTENANCE' | 'RESERVED' | 'LOCKED';
