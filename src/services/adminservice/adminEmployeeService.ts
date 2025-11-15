const API_BASE = "https://backend.ridervolt.app/api";

export interface StaffAssignment {
  stationId: number;
  stationName?: string;
  assignedAt: string;
  endedAt: string | null;
}

export interface StationStaffMember {
  stationId: number;
  stationName?: string;
  accountId: number;
  accountName: string;
  accountEmail: string;
  roleAtStation: string;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
}

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  fallback: string;
  overrides?: Record<number, string>;
}

function authHeaders(): HeadersInit {
  const adminToken = localStorage.getItem("admin_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = adminToken || accessToken || "";

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleErrorResponse(
  resp: Response,
  fallback: string,
  overrides?: Record<number, string>
): Promise<never> {
  if (overrides && overrides[resp.status]) {
    throw new Error(overrides[resp.status]);
  }

  try {
    const contentType = resp.headers.get("content-type") || "";
    const raw = await resp.text();
    if (contentType.includes("application/json")) {
      try {
        const json = JSON.parse(raw);
        const msg =
          json?.message ||
          json?.error ||
          json?.detail ||
          json?.errors?.[0] ||
          fallback;
        throw new Error(msg);
      } catch {
        throw new Error(raw || fallback);
      }
    }
    throw new Error(raw || fallback);
  } catch {
    throw new Error(resp.statusText || fallback);
  }
}

async function apiFetch<T = void>(
  path: string,
  { method = "GET", body, fallback, overrides }: ApiRequestOptions
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: authHeaders(),
    ...(body !== undefined
      ? { body: typeof body === "string" ? body : JSON.stringify(body) }
      : {}),
  });

  if (!response.ok) {
    await handleErrorResponse(
      response,
      `${fallback} (${response.status})`,
      overrides
    );
  }

  const contentType = response.headers.get("content-type") || "";

  if (
    response.status === 204 ||
    !contentType.includes("application/json")
  ) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

// GET /admin/stations/{stationId}/staff  -> Lấy tất cả nhân viên tại trạm
export async function getStationStaff(
  stationId: number
): Promise<StationStaffMember[]> {
  return apiFetch<StationStaffMember[]>(
    `/admin/stations/${stationId}/staff`,
    {
      fallback: `Không thể tải nhân viên của trạm`,
      overrides: {
        401: "Bạn không có quyền xem danh sách nhân viên.",
        403: "Bạn không có quyền xem danh sách nhân viên.",
        404: "Không tìm thấy trạm.",
      },
    }
  );
}

// GET /admin/stations/staff/{accountId}/current-station
export async function getStaffCurrentStation(
  accountId: number
): Promise<{ stationId: number; stationName?: string } | null> {
  return apiFetch<{ stationId: number; stationName?: string } | null>(
    `/admin/stations/staff/${accountId}/current-station`,
    {
      fallback: "Không thể tải trạm hiện tại của nhân viên",
      overrides: {
        401: "Bạn không có quyền xem thông tin này.",
        403: "Bạn không có quyền xem thông tin này.",
        404: "Không tìm thấy nhân viên hoặc chưa được gán trạm.",
      },
    }
  );
}

// GET /admin/stations/staff/{accountId}/assignments
export async function getStaffAssignments(
  accountId: number
): Promise<StaffAssignment[]> {
  return apiFetch<StaffAssignment[]>(
    `/admin/stations/staff/${accountId}/assignments`,
    {
      fallback: "Không thể tải lịch sử phân công",
      overrides: {
        401: "Bạn không có quyền xem lịch sử phân công.",
        403: "Bạn không có quyền xem lịch sử phân công.",
        404: "Không tìm thấy nhân viên.",
      },
    }
  );
}

// POST /admin/stations/{stationId}/staff  -> Gán nhân viên vào trạm
export async function assignStaffToStation(
  stationId: number,
  accountId: number,
  startedAt?: string
): Promise<StaffAssignment> {
  return apiFetch<StaffAssignment>(`/admin/stations/${stationId}/staff`, {
    method: "POST",
    body: startedAt ? { accountId, startedAt } : { accountId },
    fallback: "Không thể gán nhân viên vào trạm",
    overrides: {
      401: "Bạn không có quyền gán nhân viên.",
      403: "Bạn không có quyền gán nhân viên.",
      404: "Không tìm thấy trạm hoặc nhân viên.",
      409: "Nhân viên đã được gán tại trạm khác.",
    },
  });
}

// POST /admin/stations/staff/{accountId}/transfer  -> Chuyển nhân viên giữa các trạm
export async function transferStaff(
  accountId: number,
  toStationId: number
): Promise<StaffAssignment> {
  return apiFetch<StaffAssignment>(
    `/admin/stations/staff/${accountId}/transfer`,
    {
      method: "POST",
      body: { toStationId },
      fallback: "Không thể chuyển nhân viên",
      overrides: {
        401: "Bạn không có quyền chuyển nhân viên.",
        403: "Bạn không có quyền chuyển nhân viên.",
        404: "Không tìm thấy nhân viên hoặc trạm đích.",
      },
    }
  );
}

// DELETE /admin/stations/{stationId}/staff/{accountId}  -> Kết thúc phân công
export async function endStaffAssignment(
  stationId: number,
  accountId: number
): Promise<void> {
  await apiFetch(`/admin/stations/${stationId}/staff/${accountId}`, {
    method: "DELETE",
    fallback: "Không thể kết thúc phân công",
    overrides: {
      401: "Bạn không có quyền thao tác.",
      403: "Bạn không có quyền thao tác.",
      404: "Không tìm thấy phân công.",
    },
  });
}


