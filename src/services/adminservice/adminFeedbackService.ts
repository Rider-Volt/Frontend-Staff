const API_BASE = "https://backend.ridervolt.app/api";

export type FeedbackStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "FORWARDED" | "RESOLVED" | "FORWARDED_TO_ADMIN" | string;

export interface FeedbackItem {
  id: number;
  billingId?: number;
  renterId?: number;
  stationId?: number;
  staffId?: number;
  adminId?: number;
  type?: string;
  rating?: number;
  content?: string;
  imageUrls?: string[];
  status?: FeedbackStatus;
  staffNote?: string;
  adminNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sort {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  offset: number;
  sort: Sort[];
  paged: boolean;
  unpaged: boolean;
}

export interface PageableResponse<T> {
  totalPages: number;
  totalElements: number;
  pageable: Pageable;
  content: T[];
  number: number;
  size: number;
  sort: Sort[];
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

function authHeaders(): HeadersInit {
  const adminToken = localStorage.getItem("admin_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = adminToken || accessToken || "";
  
  if (!token) {
    console.error('No token found in localStorage');
  }
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// GET /api/admin/feedbacks - Get feedbacks forwarded to admin review
export async function getAdminFeedbacks(
  page = 0,
  size = 10,
  sort = "createdAt,desc"
): Promise<PageableResponse<FeedbackItem>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: sort
  });
  
  const resp = await fetch(`${API_BASE}/admin/feedbacks?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập feedbacks.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load feedbacks (${resp.status})`);
  }
  
  return (await resp.json()) as PageableResponse<FeedbackItem>;
}

// PATCH /api/admin/feedbacks/{id} - Admin resolves or rejects a feedback
export interface ResolveFeedbackRequest {
  status: FeedbackStatus;
  adminNote?: string;
  refundAmount?: number;
  penaltyAmount?: number;
}

export async function resolveFeedback(
  id: number,
  action: "RESOLVED" | "REJECTED",
  adminNote?: string,
  refundAmount?: number,
  penaltyAmount?: number
): Promise<FeedbackItem> {
  // Map action to status
  const status: FeedbackStatus = action === "RESOLVED" ? "RESOLVED" : "REJECTED";
  
  const body: ResolveFeedbackRequest = {
    status,
    adminNote: adminNote || "",
    refundAmount: refundAmount || 0,
    penaltyAmount: penaltyAmount || 0,
  };
  
  const resp = await fetch(`${API_BASE}/admin/feedbacks/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xử lý feedback này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy feedback.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to resolve feedback (${resp.status})`);
  }
  
  return (await resp.json()) as FeedbackItem;
}

