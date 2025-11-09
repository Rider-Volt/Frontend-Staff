const API_BASE = "https://backend.ridervolt.app/api";

export type BillingStatus = "PENDING" | "PAYED" | "CANCELLED" | "RENTING" | "APPROVED" | "COMPLETED" | "WAITING";

export interface BillingResponse {
  id: number;
  renterId: number;
  renterName: string;
  renterEmail: string;
  vehicleId: number;
  vehicleModel: string;
  vehicleLicensePlate: string;
  modelId: number;
  stationId: number;
  stationName: string;
  rentedDay: number;
  bookingTime: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualPickupAt?: string;
  actualReturnAt?: string;
  preImage?: string | null;
  finalImage?: string | null;
  contractBeforeImage?: string | null;
  contractAfterImage?: string | null;
  status: BillingStatus;
  penaltyCost?: number;
  note?: string;
  // Optional nested objects for backward compatibility
  renter?: {
    id?: number;
    name?: string;
    phone?: string;
    email?: string;
  } | null;
  vehicle?: {
    id?: number;
    code?: string;
    station?: { id?: number; name?: string } | null;
    model?: { id?: number; name?: string; photoUrl?: string; type?: string; pricePerDay?: number | string } | null;
  } | null;
  // Legacy fields for backward compatibility (may be computed from plannedStartDate/plannedEndDate)
  startTime?: string;
  endTime?: string;
  renterPhone?: string;
}

function authHeaders(): HeadersInit {
  // Use dedicated staff token, not renter token
  const token = localStorage.getItem("staff_token") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getStationBillings(): Promise<BillingResponse[]> {
  const resp = await fetch(`${API_BASE}/staff/billings/station`, {
    method: "GET",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền hoặc chưa đăng nhập nhân viên. Vui lòng đăng nhập lại.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load station billings (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse[];
}

export async function updateBillingStatus(
  id: number,
  status: BillingStatus
): Promise<BillingResponse> {
  const url = new URL(`${API_BASE}/staff/billings/${id}/status`);
  url.searchParams.set("status", status);
  const resp = await fetch(url.toString(), {
    method: "PATCH",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật. Vui lòng đăng nhập nhân viên.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to update billing status (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Lấy chi tiết đơn hàng theo ID
export async function getBillingById(id: number): Promise<BillingResponse> {
  const resp = await fetch(`${API_BASE}/staff/billings/${id}`, {
    method: "GET",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem chi tiết đơn hàng.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy đơn hàng.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load billing (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Lấy danh sách đơn hàng theo trạng thái
export async function getBillingsByStatus(status: BillingStatus): Promise<BillingResponse[]> {
  const resp = await fetch(`${API_BASE}/staff/billings?status=${status}`, {
    method: "GET",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách đơn hàng.");
    }
    
    if (resp.status === 404) {
      return [] as BillingResponse[];
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load billings (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse[];
}

// Lấy đầy đủ danh sách billings theo số điện thoại người thuê
export async function getBillingsByPhone(phone: string): Promise<BillingResponse[]> {
  const url = new URL(`${API_BASE}/staff/billings/by-phone`);
  url.searchParams.set("phone", phone);
  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem đơn hàng theo số điện thoại.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load billings by phone (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse[];
}

// Lấy đầy đủ danh sách billings theo email người thuê
export async function getBillingsByEmail(email: string): Promise<BillingResponse[]> {
  const url = new URL(`${API_BASE}/staff/billings/by-email`);
  url.searchParams.set("email", email);
  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem đơn hàng theo email.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load billings by email (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse[];
}

// Cập nhật hình ảnh xe trước khi thuê (preImage) - expects JSON with PreImage URL
export async function updatePreImage(id: number, imageUrl: string): Promise<BillingResponse> {
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/pre-image`, {
    method: "PATCH",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ preImage: imageUrl }),
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật hình ảnh.");
    }
    if (resp.status === 400) {
      throw new Error("URL ảnh không hợp lệ.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to update pre-image (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Cập nhật hình ảnh xe trước khi thuê bằng file (multipart/form-data)
export async function updatePreImageFile(id: number, file: File): Promise<BillingResponse> {
  const form = new FormData();
  form.append("preImage", file);
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/pre-image`, {
    method: "PATCH",
    headers: { 
      ...authHeaders(),
      // KHÔNG đặt Content-Type cho FormData để trình duyệt tự set boundary
    },
    body: form,
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật hình ảnh.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to upload pre-image (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Cập nhật hình ảnh xe sau khi trả (finalImage) - expects JSON with FinalImage URL
export async function updateFinalImage(id: number, imageUrl: string): Promise<BillingResponse> {
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/final-image`, {
    method: "PATCH",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ finalImage: imageUrl }),
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật hình ảnh.");
    }
    if (resp.status === 400) {
      throw new Error("URL ảnh không hợp lệ.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to update final-image (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Cập nhật hình ảnh xe khi trả bằng file (multipart/form-data)
export async function updateFinalImageFile(id: number, file: File): Promise<BillingResponse> {
  const form = new FormData();
  form.append("finalImage", file);
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/final-image`, {
    method: "PATCH",
    headers: { 
      ...authHeaders(),
    },
    body: form,
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật hình ảnh.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to upload final-image (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Upload ảnh hợp đồng trước khi ký (multipart/form-data)
export async function uploadContractBeforeImage(id: number, file: File): Promise<BillingResponse> {
  const form = new FormData();
  form.append("contractBeforeImage", file);
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/contract-before-image`, {
    method: "PATCH",
    headers: { 
      ...authHeaders(),
    },
    body: form,
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền upload ảnh hợp đồng.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to upload contract before image (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Upload ảnh hợp đồng sau khi ký (multipart/form-data)
export async function uploadContractAfterImage(id: number, file: File): Promise<BillingResponse> {
  const form = new FormData();
  form.append("contractAfterImage", file);
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/contract-after-image`, {
    method: "PATCH",
    headers: { 
      ...authHeaders(),
    },
    body: form,
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền upload ảnh hợp đồng.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to upload contract after image (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Lấy thống kê đơn hàng tại trạm
export async function getBillingStatistics() {
  const resp = await fetch(`${API_BASE}/staff/billings/statistics`, {
    method: "GET",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem thống kê.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load statistics (${resp.status})`);
  }
  return (await resp.json());
}

// Tìm kiếm đơn hàng theo từ khóa
export async function searchBillings(query: string): Promise<BillingResponse[]> {
  const resp = await fetch(`${API_BASE}/staff/billings/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền tìm kiếm đơn hàng.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to search billings (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse[];
}

// Ghi chú cho đơn hàng
export async function addBillingNote(id: number, note: string): Promise<BillingResponse> {
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/note`, {
    method: "POST",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ note }),
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền thêm ghi chú.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to add note (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Xác nhận đơn hàng (chuyển PENDING -> APPROVED)
export async function approveBilling(id: number): Promise<BillingResponse> {
  return updateBillingStatus(id, "APPROVED");
}

// Hoàn thành đơn hàng (chuyển RENTING/APPROVED -> COMPLETED)
export async function completeBilling(id: number): Promise<BillingResponse> {
  return updateBillingStatus(id, "COMPLETED");
}

// Hủy đơn hàng
export async function cancelBilling(id: number): Promise<BillingResponse> {
  return updateBillingStatus(id, "CANCELLED");
}

// Kiểm tra xe trả về (multipart/form-data)
export async function inspectReturnedVehicle(
  id: number, 
  finalImageFile: File, 
  penaltyCost: number, 
  note: string
): Promise<BillingResponse> {
  const form = new FormData();
  form.append("finalImage", finalImageFile);
  form.append("penaltyCost", String(penaltyCost));
  if (note.trim()) {
    form.append("note", note.trim());
  }
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/inspect-return`, {
    method: "POST",
    headers: { 
      ...authHeaders(),
    },
    body: form,
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền kiểm tra xe trả về.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to inspect returned vehicle (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Check-in bằng billing ID (có thể kèm preImage và ảnh hợp đồng)
export async function checkInByBillingId(
  id: number, 
  preImageFile?: File,
  contractBeforeImageFile?: File,
  contractAfterImageFile?: File
): Promise<BillingResponse> {
  const form = new FormData();
  if (preImageFile) {
    form.append("preImage", preImageFile);
  }
  if (contractBeforeImageFile) {
    form.append("contractBeforeImage", contractBeforeImageFile);
  }
  if (contractAfterImageFile) {
    form.append("contractAfterImage", contractAfterImageFile);
  }
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/check-in`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền check-in.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to check-in (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Phê duyệt thanh toán phạt
export async function approvePenaltyPayment(id: number): Promise<BillingResponse> {
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/approve-penalty`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền phê duyệt thanh toán phạt.");
    }
    // Thử parse JSON error message
    let errorMessage = `Lỗi phê duyệt thanh toán phạt (${resp.status})`;
    try {
      const contentType = resp.headers.get("content-type");
      const responseText = await resp.text();
      
      if (contentType && contentType.includes("application/json")) {
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson?.message || errorJson?.error || errorJson?.detail || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
      } else {
        errorMessage = responseText || errorMessage;
      }
    } catch (parseError) {
      errorMessage = resp.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return (await resp.json()) as BillingResponse;
}

// Phê duyệt thanh toán khách hàng (thủ công)
export async function approveCustomerPayment(id: number): Promise<BillingResponse> {
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/approve-payment`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền phê duyệt thanh toán khách hàng.");
    }
    // Thử parse JSON error message
    let errorMessage = `Lỗi phê duyệt thanh toán (${resp.status})`;
    try {
      const contentType = resp.headers.get("content-type");
      const responseText = await resp.text();
      
      if (contentType && contentType.includes("application/json")) {
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson?.message || errorJson?.error || errorJson?.detail || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
      } else {
        errorMessage = responseText || errorMessage;
      }
    } catch (parseError) {
      errorMessage = resp.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return (await resp.json()) as BillingResponse;
}

// Check-in bằng số điện thoại người thuê
// (Không hỗ trợ check-in theo số điện thoại trong spec BE hiện tại)