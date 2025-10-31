const API_BASE = "https://backend.ridervolt.app/api";

export type BillingStatus = "PENDING" | "PAYED" | "CANCELLED" | "RENTING" | "APPROVED" | "COMPLETED";

export interface BillingResponse {
  id: number;
  rentedDay: number;
  bookingTime: string; // ISO
  startTime: string; // ISO
  endTime: string; // ISO
  actualPickupAt?: string; // ISO – thời điểm nhận thực tế (nếu có)
  actualReturnAt?: string; // ISO – thời điểm trả thực tế (nếu có)
  preImage?: string | null;
  finalImage?: string | null;
  status: BillingStatus;
  vehicleId?: number;
  vehicleModel?: string;
  renterId?: number;
  renterName?: string;
  renterEmail?: string;
  renterPhone?: string;
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

// Kiểm tra xe trả về
export async function inspectReturnedVehicle(
  id: number, 
  finalImage: string, 
  penaltyCost: number, 
  note: string
): Promise<BillingResponse> {
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/inspect-return`, {
    method: "POST",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      finalImage,
      penaltyCost,
      note
    }),
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

// Check-in bằng billing ID
export async function checkInByBillingId(id: number): Promise<BillingResponse> {
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/check-in`, {
    method: "POST",
    headers: { ...authHeaders() },
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
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to approve penalty payment (${resp.status})`);
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
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to approve customer payment (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}

// Check-in bằng số điện thoại người thuê
// (Không hỗ trợ check-in theo số điện thoại trong spec BE hiện tại)