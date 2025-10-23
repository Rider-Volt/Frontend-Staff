// URL cơ sở của API backend
const API_BASE_URL = "https://backend.ridervolt.app/api";

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

  const response = await fetch(url, config);
  
  // Xử lý lỗi nếu response không thành công
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { response: { data: errorData } };
  }
  
  return { data: await response.json() };
};

const accountService = {
  // Hàm đăng nhập cho nhân viên
  login: async (email: string, password: string) => {
    try {
      const response = await apiRequest("/staff/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Lưu thông tin user vào localStorage để sử dụng sau này
      const { staffId, staffName, stationId, accessToken } = response.data;
      const userData = {
        userID: staffId,
        userName: 'staff',
        name: staffName, // Sử dụng staffName từ API response
        stationId: stationId,
        accessToken: accessToken
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Log để debug (có thể xóa sau)
      console.log('API Response:', response.data);
      console.log('User data saved:', userData);
      console.log('Display name will be:', userData.name || userData.userName || 'Guest');

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Đăng nhập thất bại" };
    }
  },

  // Hàm đăng xuất - xóa dữ liệu user khỏi localStorage
  logout: () => {
    localStorage.removeItem("userData");
  },

  // Lấy thông tin user hiện tại từ localStorage
  getCurrentUser: () => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  // Lấy tên hiển thị của user hiện tại
  getDisplayName: () => {
    const user = accountService.getCurrentUser();
    return user?.name || user?.userName || 'user name';
  },

  // Lấy role hiển thị của user hiện tại
  getDisplayRole: () => {
    const user = accountService.getCurrentUser();
    return user?.userName || 'staff';
  },

  // Kiểm tra user đã đăng nhập chưa
  isLoggedIn: () => {
    const userData = localStorage.getItem("userData");
    return !!userData;
  },

  // Debug: In ra thông tin user hiện tại
  debugUserInfo: () => {
    const user = accountService.getCurrentUser();
    const rawData = localStorage.getItem('userData');
    console.log('Raw localStorage data:', rawData);
    console.log('Current user data:', user);
    console.log('Display name:', user?.name || user?.userName || 'Guest');
    console.log('Display role:', user?.userName || 'staff');
    return user;
  },

  // Test: Tạo dữ liệu user mẫu để test
  createTestUser: () => {
    const testUserData = {
      userID: 1,
      userName: 'staff',
      name: 'Nguyễn Văn A', // staffName từ API sẽ được lưu vào trường name
      stationId: 1,
      accessToken: 'test-token'
    };
    localStorage.setItem('userData', JSON.stringify(testUserData));
    console.log('Test user created:', testUserData);
    return testUserData;
  },

  // Kiểm tra quyền admin của user hiện tại
  hasAdminAccess: () => {
    const userData = localStorage.getItem('userData');
    if (!userData) return false;
    
    try {
      const parsedUserData = JSON.parse(userData);
      // Kiểm tra nếu userName là 'admin' hoặc 'staff'
      return parsedUserData.userName === 'admin' || parsedUserData.userName === 'staff';
    } catch (error) {
      console.error('Lỗi khi parse userData:', error);
      return false;
    }
  }
};

export default accountService;