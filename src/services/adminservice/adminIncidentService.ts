// API Configuration
const API_CONFIG = {
  BASE_URL: "https://backend.ridervolt.app",
  VERSION: "", // No version in the path
  USE_API_PREFIX: true // Use /api prefix
};

export type IncidentStatus = "REJECTED" | "FORWARDED_TO_ADMIN";
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface IncidentReportResponse {
  id: number;
  billingId?: number;
  renterId?: number;
  vehicleId?: number;
  stationId?: number;
  note?: string;
  imageUrls?: string[];
  severity: IncidentSeverity;
  status: IncidentStatus;
  staffId?: number;
  adminId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  totalPages: number;
  totalElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: Array<{
      direction: string;
      nullHandling: string;
      ascending: boolean;
      property: string;
      ignoreCase: boolean;
    }>;
    paged: boolean;
    unpaged: boolean;
  };
  size: number;
  content: T[];
  number: number;
  sort: Array<{
    direction: string;
    nullHandling: string;
    ascending: boolean;
    property: string;
    ignoreCase: boolean;
  }>;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface UpdateIncidentRequest {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  adminNote?: string;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("admin_token") || "";
  return { 
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// GET /api/admin/incident-reports - Get all incident reports (paginated)
export async function getAllIncidentReports(
  page: number = 0,
  size: number = 10,
  sort: string = "updatedAt,desc"
): Promise<PaginatedResponse<IncidentReportResponse>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: sort,
  });
  
  const basePath = API_CONFIG.USE_API_PREFIX ? '/api' : '';
  const versionPath = API_CONFIG.VERSION ? `/${API_CONFIG.VERSION}` : '';
  const endpoint = `${API_CONFIG.BASE_URL}${basePath}${versionPath}/admin/reports?${params.toString()}`;
  console.log('Fetching from:', endpoint);
  
  const resp = await fetch(endpoint, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("You don't have permission to view incident reports. Please log in again.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load incident reports (${resp.status})`);
  }
  
  return (await resp.json()) as PaginatedResponse<IncidentReportResponse>;
}

// PATCH /api/admin/incident-reports/{id} - Update incident report
export async function updateIncidentReport(
  incidentId: number,
  data: UpdateIncidentRequest
): Promise<IncidentReportResponse> {
  const basePath = API_CONFIG.USE_API_PREFIX ? '/api' : '';
  const versionPath = API_CONFIG.VERSION ? `/${API_CONFIG.VERSION}` : '';
  const endpoint = `${API_CONFIG.BASE_URL}${basePath}${versionPath}/admin/reports/${incidentId}`;
  
  const resp = await fetch(endpoint, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("You don't have permission to update this incident report.");
    }
    if (resp.status === 404) {
      throw new Error("Incident report not found.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to update incident report (${resp.status})`);
  }

  return (await resp.json()) as IncidentReportResponse;
}
