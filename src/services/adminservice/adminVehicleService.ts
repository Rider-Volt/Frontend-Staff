const API_BASE = "https://backend.ridervolt.app/api";

export interface Vehicle {
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
  stationLatitude: number;
  stationLongitude: number;
  currentPin: number;
}

export interface CreateVehicleRequest {
  code: string;
  modelId: number;
  stationId: number;
  pricePerDay: number;
  photoUrl: string;
}

export interface UpdateVehicleRequest {
  code?: string;
  modelId?: number;
  stationId?: number;
  pricePerDay?: number;
  photoUrl?: string;
  status?: string;
  currentPin?: number;
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

// Lấy tất cả xe
export async function getAllVehicles(): Promise<Vehicle[]> {
  const resp = await fetch(`${API_BASE}/admin/vehicles`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền quản lý xe. Vui lòng đăng nhập admin.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load vehicles (${resp.status})`);
  }
  
  return (await resp.json()) as Vehicle[];
}

// Lấy xe theo ID
export async function getVehicleById(vehicleId: number): Promise<Vehicle> {
  const resp = await fetch(`${API_BASE}/admin/vehicles/vehicles/${vehicleId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem chi tiết xe này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy xe.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load vehicle (${resp.status})`);
  }
  
  return (await resp.json()) as Vehicle;
}

// Lấy xe theo trạm
export async function getVehiclesByStation(stationId: number): Promise<Vehicle[]> {
  const resp = await fetch(`${API_BASE}/admin/vehicles/station/${stationId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách xe tại trạm này.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load vehicles by station (${resp.status})`);
  }
  
  return (await resp.json()) as Vehicle[];
}

// Tạo xe mới
export async function createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
  console.log('Creating vehicle with data:', JSON.stringify(data, null, 2));
  
  // Tách stationId ra khỏi body và thêm vào query parameter
  const { stationId, ...bodyData } = data;
  const url = `${API_BASE}/admin/vehicles${stationId ? `?stationId=${stationId}` : ''}`;
  
  console.log('Request URL:', url);
  console.log('Request body:', JSON.stringify(bodyData, null, 2));
  
  const resp = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(bodyData),
  });
  
  console.log('Response status:', resp.status);
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền tạo xe mới.");
    }
    
    let errorMessage = 'Failed to create vehicle';
    try {
      const errorData = await resp.json();
      console.error('Error response:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const text = await resp.text().catch(() => resp.statusText);
      console.error('Failed to create vehicle:', text);
      errorMessage = text || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return (await resp.json()) as Vehicle;
}

// Cập nhật thông tin xe
export async function updateVehicle(vehicleId: number, data: UpdateVehicleRequest): Promise<Vehicle> {
  console.log('Updating vehicle - ID:', vehicleId);
  console.log('Update data:', JSON.stringify(data, null, 2));
  
  // Tách stationId và status ra khỏi body và thêm vào query parameter (nếu có)
  const { stationId, status, ...bodyData } = data;
  let url = `${API_BASE}/admin/vehicles/${vehicleId}`;
  
  // Tạo query parameters
  const queryParams = [];
  if (stationId) {
    queryParams.push(`stationId=${stationId}`);
  }
  if (status) {
    queryParams.push(`status=${status}`);
  }
  
  if (queryParams.length > 0) {
    url += '?' + queryParams.join('&');
  }
  
  console.log('Update request URL:', url);
  console.log('Update request body:', JSON.stringify(bodyData, null, 2));
  
  const resp = await fetch(url, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(bodyData),
  });
  
  console.log('Update response status:', resp.status);
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật xe này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy xe để cập nhật.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    console.error('Update error response:', text);
    throw new Error(text || `Failed to update vehicle (${resp.status})`);
  }
  
  const updated = await resp.json();
  console.log('Updated vehicle response:', updated);
  
  return updated as Vehicle;
}

// Gán xe vào trạm
export async function assignVehicleToStation(vehicleId: number, stationId: number): Promise<Vehicle> {
  const resp = await fetch(`${API_BASE}/admin/vehicles/${vehicleId}/station/${stationId}`, {
    method: "PUT",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền gán xe vào trạm.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy xe hoặc trạm.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to assign vehicle to station (${resp.status})`);
  }
  
  return (await resp.json()) as Vehicle;
}

// Xóa xe
export async function deleteVehicle(vehicleId: number): Promise<void> {
  const resp = await fetch(`${API_BASE}/admin/vehicles/${vehicleId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xóa xe này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy xe để xóa.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to delete vehicle (${resp.status})`);
  }
}

