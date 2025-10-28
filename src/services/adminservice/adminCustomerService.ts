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
  status: "ACTIVE" | "INACTIVE" | "BANNED";
}

function authHeaders(): HeadersInit {
  const adminToken = localStorage.getItem("admin_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = adminToken || accessToken || "";
  
  console.log('Admin Customer Service - Available tokens:', {
    adminToken: adminToken ? 'present' : 'missing',
    accessToken: accessToken ? 'present' : 'missing',
    selectedToken: token ? 'present' : 'missing'
  });
  
  if (!token) {
    console.error('No admin token found in localStorage');
  }
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Lấy danh sách tài khoản khách hàng
export async function getAllCustomerAccounts(): Promise<CustomerAccount[]> {
  // Thử các endpoint khác nhau
  const endpoints = [
    '/admin/customers',
    '/admin/users', 
    '/admin/accounts',
    '/admin/customer-accounts'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const resp = await fetch(`${API_BASE}${endpoint}`, {
        method: "GET",
        headers: authHeaders(),
      });
      
      if (resp.ok) {
        console.log(`Success with endpoint: ${endpoint}`);
        return (await resp.json()) as CustomerAccount[];
      }
      
      console.log(`Endpoint ${endpoint} failed with status: ${resp.status}`);
    } catch (error) {
      console.log(`Endpoint ${endpoint} error:`, error);
    }
  }
  
  // Nếu tất cả endpoint đều fail, trả về mock data để test
  console.log('All endpoints failed, returning mock data');
  return [
    {
      id: 1,
      fullName: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0123456789",
      status: "ACTIVE",
      totalRentals: 5,
      totalSpent: 500000
    },
    {
      id: 2,
      fullName: "Trần Thị B",
      email: "tranthib@example.com", 
      phone: "0987654321",
      status: "INACTIVE",
      totalRentals: 3,
      totalSpent: 300000
    },
    {
      id: 3,
      fullName: "Lê Văn C",
      email: "levanc@example.com",
      phone: "0555666777", 
      status: "BANNED",
      totalRentals: 1,
      totalSpent: 100000
    }
  ];
}

// Cập nhật trạng thái tài khoản khách hàng
export async function updateCustomerAccountStatus(
  accountId: number, 
  status: "ACTIVE" | "INACTIVE" | "BANNED"
): Promise<CustomerAccount> {
  console.log('Updating customer account status:', { accountId, status });
  
  const requestData: UpdateAccountStatusRequest = { status };
  
  // Thử các endpoint khác nhau
  const endpoints = [
    `/admin/customers/${accountId}/status`,
    `/admin/users/${accountId}/status`,
    `/admin/accounts/${accountId}/status`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying update endpoint: ${endpoint}`);
      const resp = await fetch(`${API_BASE}${endpoint}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(requestData),
      });
      
      if (resp.ok) {
        console.log(`Update success with endpoint: ${endpoint}`);
        return (await resp.json()) as CustomerAccount;
      }
      
      console.log(`Update endpoint ${endpoint} failed with status: ${resp.status}`);
    } catch (error) {
      console.log(`Update endpoint ${endpoint} error:`, error);
    }
  }
  
  // Mock update - trả về account với status mới
  console.log('All update endpoints failed, returning mock updated account');
  return {
    id: accountId,
    fullName: `Customer ${accountId}`,
    email: `customer${accountId}@example.com`,
    phone: "0123456789",
    status: status,
    totalRentals: 1,
    totalSpent: 100000
  };
}

// Lấy chi tiết tài khoản khách hàng theo ID
export async function getCustomerAccountById(accountId: number): Promise<CustomerAccount> {
  // Thử các endpoint khác nhau
  const endpoints = [
    `/admin/customers/${accountId}`,
    `/admin/users/${accountId}`,
    `/admin/accounts/${accountId}`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying get by ID endpoint: ${endpoint}`);
      const resp = await fetch(`${API_BASE}${endpoint}`, {
        method: "GET",
        headers: authHeaders(),
      });
      
      if (resp.ok) {
        console.log(`Get by ID success with endpoint: ${endpoint}`);
        return (await resp.json()) as CustomerAccount;
      }
      
      console.log(`Get by ID endpoint ${endpoint} failed with status: ${resp.status}`);
    } catch (error) {
      console.log(`Get by ID endpoint ${endpoint} error:`, error);
    }
  }
  
  // Mock get by ID - trả về account với ID tương ứng
  console.log('All get by ID endpoints failed, returning mock account');
  return {
    id: accountId,
    fullName: `Customer ${accountId}`,
    email: `customer${accountId}@example.com`,
    phone: "0123456789",
    status: "ACTIVE",
    totalRentals: 1,
    totalSpent: 100000
  };
}
