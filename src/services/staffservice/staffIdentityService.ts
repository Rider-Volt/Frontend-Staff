const API_BASE = "https://backend.ridervolt.app/api";

// Interface cho Asset (ảnh giấy tờ)
export interface IdentityAsset {
  id: number;
  type: "CCCD_FRONT" | "CCCD_BACK" | "GPLX_FRONT" | "GPLX_BACK" | string;
  url: string;
  note?: string;
  takenAt?: string;
  takenBy?: number;
}

// Interface cho Identity Set
export interface IdentitySet {
  id: number;
  cccdNumber?: string;
  gplxNumber?: string;
  note?: string;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "APPROVED" | string;
  reviewNote?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  assets: IdentityAsset[];
}

// Interface cho Verify Request
export interface VerifyIdentitySetRequest {
  status: "PENDING" | "VERIFIED" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

function authHeaders(): HeadersInit {
  const staffToken = localStorage.getItem("staff_token");
  const adminToken = localStorage.getItem("admin_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = staffToken || adminToken || accessToken || "";
  
  if (!token) {
    console.error('No token found in localStorage');
  }
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// GET /api/staff/identity-sets/{id} - Get identity set details
export async function getIdentitySetById(id: number): Promise<IdentitySet> {
  const resp = await fetch(`${API_BASE}/staff/identity-sets/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem chi tiết identity set này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy identity set.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load identity set (${resp.status})`);
  }
  
  return (await resp.json()) as IdentitySet;
}

// GET /api/staff/identity-sets/pending - Get all pending identity sets
export async function getPendingIdentitySets(): Promise<IdentitySet[]> {
  const resp = await fetch(`${API_BASE}/staff/identity-sets/pending`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách identity sets đang chờ.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load pending identity sets (${resp.status})`);
  }
  
  const data = await resp.json();
  return Array.isArray(data) ? data : [data];
}

// GET /api/staff/identity-sets/history - Get verification history
// Returns IdentitySet[] with status VERIFIED, APPROVED, or REJECTED verified by the current staff member
export async function getVerificationHistory(): Promise<IdentitySet[]> {
  const resp = await fetch(`${API_BASE}/staff/identity-sets/history`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem lịch sử xác minh.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load verification history (${resp.status})`);
  }
  
  const data = await resp.json();
  return Array.isArray(data) ? data : [data];
}

// POST /api/staff/identity-sets/{id}/verify - Verify identity set
export async function verifyIdentitySet(
  id: number,
  request: VerifyIdentitySetRequest
): Promise<IdentitySet> {
  const requestBody = JSON.stringify(request);
  console.log('Verifying identity set:', { id, request, requestBody });
  
  const resp = await fetch(`${API_BASE}/staff/identity-sets/${id}/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: requestBody,
  });
  
  console.log('Verify identity set response status:', resp.status);
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xác minh identity set này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy identity set.");
    }
    
    let errorMessage = 'Failed to verify identity set';
    try {
      const errorData = await resp.json();
      console.error('Verify identity set error response:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const text = await resp.text().catch(() => resp.statusText);
      console.error('Failed to verify identity set:', text);
      errorMessage = text || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return (await resp.json()) as IdentitySet;
}

