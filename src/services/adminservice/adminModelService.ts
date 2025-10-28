const API_BASE = "https://backend.ridervolt.app/api";

export interface Model {
  id: number;
  name: string;
  pricePerDay: number;
  photoUrl: string;
  type: "CAR" | "BIKE";
}

export interface CreateModelRequest {
  name: string;
  pricePerDay: number;
  photoUrl: string;
  type: "CAR" | "BIKE";
}

export interface UpdateModelRequest {
  name?: string;
  pricePerDay?: number;
  photoUrl?: string;
  type?: "CAR" | "BIKE";
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

// Lấy tất cả models
export async function getAllModels(): Promise<Model[]> {
  console.log('Fetching models from:', `${API_BASE}/models`);
  const headers = authHeaders();
  console.log('Auth headers:', headers);
  
  const resp = await fetch(`${API_BASE}/models`, {
    method: "GET",
    headers: headers,
  });
  
  console.log('Response status:', resp.status);
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách model.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    console.error('Error loading models:', text);
    throw new Error(text || `Failed to load models (${resp.status})`);
  }
  
  const data = await resp.json();
  console.log('Models data received:', data);
  
  return data as Model[];
}

// Lấy model theo ID
export async function getModelById(modelId: number): Promise<Model> {
  const resp = await fetch(`${API_BASE}/models/${modelId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem chi tiết model này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy model.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load model (${resp.status})`);
  }
  
  return (await resp.json()) as Model;
}

// Kiểm tra tính khả dụng của xe theo model
export async function checkModelAvailability(modelId: number): Promise<any> {
  const resp = await fetch(`${API_BASE}/models/availability?id=${modelId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền kiểm tra tính khả dụng.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to check availability (${resp.status})`);
  }
  
  return await resp.json();
}

// Tạo model mới
export async function createModel(data: CreateModelRequest): Promise<Model> {
  console.log('Creating model with data:', JSON.stringify(data, null, 2));
  
  const resp = await fetch(`${API_BASE}/admin/models`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  
  console.log('Response status:', resp.status);
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền tạo model mới.");
    }
    
    let errorMessage = 'Failed to create model';
    try {
      const errorData = await resp.json();
      console.error('Error response:', errorData);
      
      // Handle specific backend validation errors
      if (errorData.message && errorData.message.includes('HV000030')) {
        errorMessage = 'Lỗi backend: Enum ModelType không thể validate với @NotBlank. Vui lòng liên hệ admin để sửa lỗi backend.';
      } else if (errorData.message && errorData.message.includes('jakarta.validation')) {
        errorMessage = 'Lỗi validation backend: ' + errorData.message;
      } else {
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
    } catch {
      const text = await resp.text().catch(() => resp.statusText);
      console.error('Failed to create model:', text);
      errorMessage = text || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return (await resp.json()) as Model;
}

// Cập nhật thông tin model
export async function updateModel(modelId: number, data: UpdateModelRequest): Promise<Model> {
  const resp = await fetch(`${API_BASE}/admin/models/${modelId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật model này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy model để cập nhật.");
    }
    
    let errorMessage = 'Failed to update model';
    try {
      const errorData = await resp.json();
      console.error('Error response:', errorData);
      
      // Handle specific backend validation errors
      if (errorData.message && errorData.message.includes('HV000030')) {
        errorMessage = 'Lỗi backend: Enum ModelType không thể validate với @NotBlank. Vui lòng liên hệ admin để sửa lỗi backend.';
      } else if (errorData.message && errorData.message.includes('jakarta.validation')) {
        errorMessage = 'Lỗi validation backend: ' + errorData.message;
      } else {
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
    } catch {
      const text = await resp.text().catch(() => resp.statusText);
      console.error('Failed to update model:', text);
      errorMessage = text || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return (await resp.json()) as Model;
}

// Xóa model
export async function deleteModel(modelId: number): Promise<void> {
  const resp = await fetch(`${API_BASE}/admin/models/${modelId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xóa model này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy model để xóa.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to delete model (${resp.status})`);
  }
}
