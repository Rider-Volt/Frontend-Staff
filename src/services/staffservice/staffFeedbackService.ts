const API_BASE = "https://backend.ridervolt.app/api";

export type FeedbackStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | string;

export interface FeedbackItem {
  id: number;
  billingId?: number;
  renterId?: number;
  staffId?: number;
  adminId?: number;
  type?: string;
  rating?: number;
  content?: string;
  imageUrls?: string[];
  // For backward compatibility
  imageUrl?: string;
  status?: FeedbackStatus;
  staffNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageableResponse<T> {
  totalPages: number;
  totalElements: number;
  content: T[];
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("staff_token") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getPendingFeedbacks(
  page = 0,
  size = 10,
  sort = "createdAt,desc"
): Promise<PageableResponse<FeedbackItem>> {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort });
  const url = `${API_BASE}/staff/feedbacks/pending?${params.toString()}`;
  const headers = {
    ...authHeaders(),
    "Content-Type": "application/json",
  };
  // Debug logs to help diagnose empty responses
  // Open browser console to see these logs
  // eslint-disable-next-line no-console
  console.log("GET pending feedbacks ->", url, headers);
  const resp = await fetch(url, {
    method: "GET",
    headers,
  });
  // eslint-disable-next-line no-console
  console.log("GET pending feedbacks status:", resp.status);
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem feedbacks.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    // eslint-disable-next-line no-console
    console.error("GET pending feedbacks error body:", text);
    throw new Error(text || `Failed to load feedbacks (${resp.status})`);
  }
  const json = await resp.json();
  // eslint-disable-next-line no-console
  console.log("GET pending feedbacks body:", json);
  return json as PageableResponse<FeedbackItem>;
}

export async function forwardFeedback(id: number, staffNote?: string): Promise<FeedbackItem> {
  const body = { staffNote: staffNote || "" };
  const resp = await fetch(`${API_BASE}/staff/feedbacks/${id}/forward`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to forward feedback (${resp.status})`);
  }
  return (await resp.json()) as FeedbackItem;
}

export async function approveFeedback(id: number, staffNote?: string): Promise<FeedbackItem> {
  const body = { staffNote: staffNote || "" };
  const resp = await fetch(`${API_BASE}/staff/feedbacks/${id}/approve`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to approve feedback (${resp.status})`);
  }
  return (await resp.json()) as FeedbackItem;
}

export async function rejectFeedback(id: number, staffNote?: string): Promise<FeedbackItem> {
  const body = { staffNote: staffNote || "" };
  const resp = await fetch(`${API_BASE}/staff/feedbacks/${id}/reject`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to reject feedback (${resp.status})`);
  }
  return (await resp.json()) as FeedbackItem;
}
