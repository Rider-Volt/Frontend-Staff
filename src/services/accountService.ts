// URL cơ sở của API backend
const API_BASE_URL = "https://backend.ridervolt.app/api";

// Interface cho user data
interface UserData {
  userID: number;
  userName: string;
  name: string;
  stationId?: number;
  accessToken: string;
  role: 'admin' | 'staff';
}

// Interface cho login response
interface LoginResponse {
  staffId?: number;
  adminId?: number;
  staffName?: string;
  adminName?: string;
  stationId?: number;
  accessToken?: string;
  token?: string;
  role?: string;
}

// Hàm helper để thực hiện các request API
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Xử lý lỗi nếu response không thành công
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Nếu không parse được JSON, sử dụng status text
      }
      throw new Error(errorMessage);
    }
    
    return { data: await response.json() };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Lỗi kết nối mạng');
  }
};

const accountService = {
  // Hàm đăng nhập cho nhân viên
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiRequest("/staff/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const { staffId, staffName, stationId, accessToken } = response.data as LoginResponse;
      
      if (!staffId || !accessToken) {
        throw new Error('Thông tin đăng nhập không hợp lệ');
      }

      const userData: UserData = {
        userID: staffId,
        userName: 'staff',
        name: staffName || 'Nhân viên',
        stationId: stationId,
        accessToken: accessToken,
        role: 'staff'
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('staff_token', accessToken);

      return response.data;
    } catch (error) {
      console.error('Staff login error:', error);
      throw error instanceof Error ? error : new Error("Đăng nhập thất bại");
    }
  },

  // Hàm đăng nhập cho admin
  adminLogin: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiRequest("/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const { adminId, adminName, accessToken, role, token } = response.data as LoginResponse;
      const actualToken = accessToken || token;
      
      if (!adminId || !actualToken) {
        throw new Error('Thông tin đăng nhập admin không hợp lệ');
      }
      
      const userData: UserData = {
        userID: adminId,
        userName: 'admin',
        name: adminName || 'Quản trị viên',
        accessToken: actualToken,
        role: 'admin'
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('admin_token', actualToken);

      return response.data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error instanceof Error ? error : new Error("Đăng nhập admin thất bại");
    }
  },

  // Hàm đăng nhập thông minh - tự động phát hiện role
  smartLogin: async (email: string, password: string) => {
    try {
      // Thử đăng nhập admin trước
      try {
        return await accountService.adminLogin(email, password);
      } catch (adminError) {
        // Nếu admin login thất bại, thử staff login
        return await accountService.login(email, password);
      }
    } catch (error) {
      throw error;
    }
  },

  // Hàm đăng xuất - xóa dữ liệu user khỏi localStorage
  logout: () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("staff_token");
    localStorage.removeItem("admin_token");
  },

  // Lấy thông tin user hiện tại từ localStorage
  getCurrentUser: (): UserData | null => {
    try {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) as UserData : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Lấy tên hiển thị của user hiện tại
  getDisplayName: (): string => {
    const user = accountService.getCurrentUser();
    return user?.name || user?.userName || 'Người dùng';
  },

  // Lấy role hiển thị của user hiện tại
  getDisplayRole: (): string => {
    const user = accountService.getCurrentUser();
    return user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên';
  },

  // Lấy role thực tế của user
  getUserRole: (): 'admin' | 'staff' => {
    const user = accountService.getCurrentUser();
    return user?.role || 'staff';
  },

  // Kiểm tra xem user có phải admin không
  isAdmin: (): boolean => {
    const user = accountService.getCurrentUser();
    return user?.role === 'admin';
  },

  // Kiểm tra xem user có phải staff không
  isStaff: (): boolean => {
    const user = accountService.getCurrentUser();
    return user?.role === 'staff';
  },

  // Kiểm tra user đã đăng nhập chưa
  isLoggedIn: (): boolean => {
    const userData = localStorage.getItem("userData");
    return !!userData;
  },

  // Lấy token hiện tại
  getCurrentToken: (): string | null => {
    const user = accountService.getCurrentUser();
    if (user?.role === 'admin') {
      return localStorage.getItem('admin_token');
    } else if (user?.role === 'staff') {
      return localStorage.getItem('staff_token');
    }
    return null;
  },

  // Lấy station ID của staff
  getStationId: (): number | null => {
    const user = accountService.getCurrentUser();
    return user?.stationId || null;
  },

  // Kiểm tra quyền truy cập dựa trên role
  hasRoleAccess: (requiredRole: 'admin' | 'staff'): boolean => {
    const userRole = accountService.getUserRole();
    if (requiredRole === 'admin') {
      return userRole === 'admin';
    }
    return userRole === 'staff' || userRole === 'admin'; // Admin có thể truy cập staff pages
  },

  // Kiểm tra token có hợp lệ không
  isTokenValid: (): boolean => {
    const token = accountService.getCurrentToken();
    return !!token && token.length > 0;
  },

  // Lấy headers cho API calls
  getAuthHeaders: (): HeadersInit => {
    const token = accountService.getCurrentToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  // Làm mới token (chỗ giữ chỗ) - cần triển khai logic làm mới token khi có API
  refreshToken: async (): Promise<boolean> => {
    // TODO: Triển khai logic làm mới token khi có API
    return false;
  }
};

export default accountService;