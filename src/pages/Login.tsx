import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService from '@/services/accountService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Car, Zap, Shield, CheckCircle, MapPin, Clock, Users, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  // Các state để quản lý form đăng nhập
  const [username, setUsername] = useState(''); // Tên đăng nhập
  const [password, setPassword] = useState(''); // Mật khẩu
  const [showPassword, setShowPassword] = useState(false); // Hiển thị/ẩn mật khẩu
  const [error, setError] = useState(''); // Thông báo lỗi
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const navigate = useNavigate(); // Hook để điều hướng trang

  // Hàm xử lý khi submit form đăng nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn chặn reload trang
    setError(''); // Xóa lỗi cũ
    
    // Kiểm tra validation - phải nhập đầy đủ thông tin
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true); // Bắt đầu loading
    try {
      // Sử dụng smart login để tự động phát hiện role (admin hoặc staff)
      await accountService.smartLogin(username, password);
      
      // Kiểm tra role và chuyển hướng phù hợp
      const userRole = accountService.getUserRole();
      if (userRole === 'admin') {
        navigate('/admin'); // Chuyển đến admin dashboard
      } else {
        navigate('/'); // Chuyển đến staff dashboard
      }
    } catch (error: any) {
      // Hiển thị lỗi nếu đăng nhập thất bại
      setError(error.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Bên trái - Form đăng nhập */}
      <div className="flex-1 bg-slate-900 relative overflow-hidden">
        {/* Các hình tròn trang trí tạo hiệu ứng background */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-emerald-400/30 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-emerald-600/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-emerald-500/25 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex items-center justify-center h-full p-8">
          <div className="w-full max-w-xl">
            {/* Logo và tên hệ thống */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">EV Station</h1>
                <p className="text-emerald-400 text-sm">Management System</p>
              </div>
            </div>

            {/* Form đăng nhập */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 w-[600px] aspect-square">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-white mb-3">Đăng nhập</h2>
                <p className="text-slate-400 text-base">Nhân viên & Quản lý EV Station</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                    <AlertDescription className="text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="username" className="text-slate-300 text-sm font-medium">
                      Tên đăng nhập
                    </Label>
                    <div className="relative mt-2">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nhập tên đăng nhập"
                        disabled={isLoading}
                        className="pl-12 h-14 bg-slate-700/50 border-slate-600 text-white text-lg placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                      Mật khẩu
                    </Label>
                    <div className="relative mt-2">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        disabled={isLoading}
                        className="pl-12 pr-12 h-14 bg-slate-700/50 border-slate-600 text-white text-lg placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-5 h-16 text-xl rounded-xl transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng nhập'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bên phải - Nội dung giới thiệu hệ thống */}
      <div className="flex-1 bg-slate-50 relative overflow-hidden">
        {/* Các hình tròn trang trí cho phần bên phải */}
        <div className="absolute top-16 right-16 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl"></div>
        <div className="absolute top-32 left-20 w-32 h-32 bg-emerald-400/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-24 right-32 w-36 h-36 bg-emerald-600/25 rounded-full blur-2xl"></div>
        <div className="absolute bottom-16 left-16 w-28 h-28 bg-emerald-500/30 rounded-full blur-lg"></div>
        
        <div className="relative z-10 flex flex-col justify-center h-full p-12">
          <div className="max-w-lg">
            {/* Tiêu đề chính */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-slate-900 mb-4">EV STATION</h1>
              <p className="text-2xl text-emerald-600 font-semibold">Electric Portal</p>
            </div>

            {/* Mô tả về hệ thống */}
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Hệ thống quản lý cho thuê xe điện chuyên nghiệp, 
              Góp phần xây dựng môi trường giao thông xanh và bền vững.
            </p>

            {/* Danh sách các tính năng chính */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 font-medium">Quản lý xe điện thông minh</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 font-medium">Hệ thống giao nhận tự động</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 font-medium">Thanh toán đa dạng và bảo mật</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 font-medium">Báo cáo và thống kê chi tiết</span>
              </div>
            </div>
          </div>

          {/* Logo ở góc dưới bên phải */}
          <div className="absolute bottom-8 right-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
