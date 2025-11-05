const API_BASE = "https://backend.ridervolt.app/api";

export interface CustomerAccount {
  id: number;
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  fullName: string;
  email: string;
  phone: string;
  totalRentals: number;
  totalSpent: number;
}

export interface UpdateAccountStatusRequest {
  status: string;
}

export type StaffAccountStatus = "ACTIVE" | "INACTIVE" | "VERIFIED";

// Renter (khách hàng) dành cho staff
export interface RenterAccount {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar?: string | null;
  cccdUrl?: string | null;
  gplxUrl?: string | null;
  status: StaffAccountStatus | "BANNED" | string;
  phoneVerified?: boolean;
  riskScore?: number;
}

function authHeaders(): HeadersInit {
  const staffToken = localStorage.getItem("staff_token");
  const adminToken = localStorage.getItem("admin_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = staffToken || adminToken || accessToken || "";
  
  console.log('Available tokens:', {
    staffToken: staffToken ? 'present' : 'missing',
    adminToken: adminToken ? 'present' : 'missing', 
    accessToken: accessToken ? 'present' : 'missing',
    selectedToken: token ? 'present' : 'missing'
  });
  
  if (!token) {
    console.error('No token found in localStorage');
  }
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Lấy danh sách tài khoản khách hàng
export async function getAllCustomerAccounts(): Promise<CustomerAccount[]> {
  const resp = await fetch(`${API_BASE}/staff/accounts`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách tài khoản khách hàng.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load customer accounts (${resp.status})`);
  }
  
  return (await resp.json()) as CustomerAccount[];
}

// Cập nhật trạng thái tài khoản khách hàng
export async function updateCustomerAccountStatus(
  accountId: number, 
  status: "ACTIVE" | "INACTIVE" | "BANNED"
): Promise<CustomerAccount> {
  console.log('Updating customer account status:', { accountId, status });
  
  // Gửi đối tượng JSON với trường `status`
  const requestData = JSON.stringify({ status });
  
  const resp = await fetch(`${API_BASE}/staff/accounts/${accountId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: requestData,
  });
  
  console.log('Response status:', resp.status);
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật trạng thái tài khoản này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy tài khoản khách hàng.");
    }
    
    let errorMessage = 'Failed to update account status';
    try {
      const errorData = await resp.json();
      console.error('Error response:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const text = await resp.text().catch(() => resp.statusText);
      console.error('Failed to update account status:', text);
      errorMessage = text || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return (await resp.json()) as CustomerAccount;
}

// Lấy chi tiết tài khoản khách hàng theo ID
export async function getCustomerAccountById(accountId: number): Promise<CustomerAccount> {
  const resp = await fetch(`${API_BASE}/staff/accounts/${accountId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem chi tiết tài khoản này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy tài khoản khách hàng.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load customer account (${resp.status})`);
  }
  
  return (await resp.json()) as CustomerAccount;
}

// Lấy danh sách renter (khách hàng) cho staff
export async function getRenters(): Promise<RenterAccount[]> {
  const resp = await fetch(`${API_BASE}/staff/accounts/renters`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách khách hàng.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load renters (${resp.status})`);
  }
  return (await resp.json()) as RenterAccount[];
}

// Cập nhật trạng thái tài khoản khách hàng (renter) cho staff
export async function updateRenterStatus(
  accountId: number,
  status: StaffAccountStatus
): Promise<RenterAccount> {
  // Gửi đối tượng JSON với trường `status`
  const requestBody = JSON.stringify({ status });
  console.log('Updating renter status:', { accountId, status, requestBody });
  const resp = await fetch(`${API_BASE}/staff/accounts/${accountId}/status`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: requestBody,
  });
  console.log('Update renter status response status:', resp.status);
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật trạng thái khách hàng.");
    }
    let errorMessage = 'Failed to update renter status';
    try {
      const errorData = await resp.json();
      console.error('Update renter status error response (json):', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const text = await resp.text().catch(() => resp.statusText);
      console.error('Update renter status error response (text):', text);
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return (await resp.json()) as RenterAccount;
}
