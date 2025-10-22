import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, User, Lock, Check, Zap } from "lucide-react";
import { toast } from "sonner";



const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Bỏ qua API, cho phép đăng nhập với bất kỳ thông tin nào
      // Lưu thông tin user và token vào localStorage
      const mockUser = {
        id: 1,
        username: formData.username,
        name: formData.username,
        role: "staff"
      };
      
      localStorage.setItem('token', 'mock-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err: any) {
      const errorMessage = err.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="w-[50%] relative bg-[#1A202C] flex items-center justify-center p-12">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#2EE09A]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#2EE09A]/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2EE09A]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center mb-12">
            <div className="w-12 h-12 bg-[#2EE09A] rounded-lg flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="8" width="16" height="8" fill="white"/>
                <rect x="6" y="6" width="12" height="4" fill="white"/>
                <rect x="8" y="4" width="8" height="2" fill="white"/>
                <rect x="10" y="2" width="4" height="2" fill="white"/>
                <rect x="5" y="16" width="2" height="2" fill="white"/>
                <rect x="17" y="16" width="2" height="2" fill="white"/>
                <rect x="6" y="14" width="2" height="2" fill="white"/>
                <rect x="16" y="14" width="2" height="2" fill="white"/>
                <rect x="7" y="12" width="2" height="2" fill="white"/>
                <rect x="15" y="12" width="2" height="2" fill="white"/>
                <rect x="8" y="10" width="8" height="2" fill="white"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">EV Station</h1>
              <p className="text-sm text-gray-400">Hệ thống Quản lý</p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-[#2D3748] backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Đăng nhập</h2>
              <p className="text-gray-400">Nhân viên, Quản lý EV Station</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <label htmlFor="username" className="text-white text-sm font-medium block">Tên đăng nhập</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nhập tên đăng nhập"
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-4 bg-[#2D3748] border border-gray-600 rounded-xl text-white placeholder:text-gray-400 focus:border-[#2EE09A] focus:ring-2 focus:ring-[#2EE09A]/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label htmlFor="password" className="text-white text-sm font-medium block">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu"
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-4 bg-[#2D3748] border border-gray-600 rounded-xl text-white placeholder:text-gray-400 focus:border-[#2EE09A] focus:ring-2 focus:ring-[#2EE09A]/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#2EE09A] hover:bg-[#2EE09A]/90 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !formData.username || !formData.password}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang đăng nhập...
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel - Information */}
      <div className="w-[50%] relative bg-white flex items-center justify-center p-12">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#2EE09A]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#2EE09A]/8 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-[#2EE09A]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-[#1E293B] mb-4">EV STATION</h2>
            <p className="text-2xl font-semibold text-[#2EE09A]">Cổng Điện Tử</p>
          </div>

          <p className="text-[#475569] text-lg leading-relaxed mb-12 text-center">
            Hệ thống quản lý cho thuê xe điện chuyên nghiệp, Góp phần xây dựng môi trường giao thông xanh và bền vững.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-[#2EE09A] rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#475569] font-medium text-lg">Quản lý xe điện thông minh</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-[#2EE09A] rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#475569] font-medium text-lg">Hệ thống giao nhận tự động</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-[#2EE09A] rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#475569] font-medium text-lg">Thanh toán đa dạng và bảo mật</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-[#2EE09A] rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#475569] font-medium text-lg">Báo cáo và thống kê chi tiết</span>
            </div>
          </div>

          {/* Decorative Element */}
          <div className="absolute bottom-8 right-8">
            <div className="w-16 h-16 bg-[#2EE09A] rounded-xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
