import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Car, Zap, Shield, CheckCircle, MapPin, Clock, Users } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 bg-slate-900 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-emerald-400/30 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-emerald-600/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-emerald-500/25 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex items-center justify-center h-full p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">EV Station</h1>
                <p className="text-emerald-400 text-sm">Management System</p>
              </div>
            </div>

            {/* Login Form */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Đăng nhập</h2>
                <p className="text-slate-400 text-sm">Nhân viên, Quản lý EV Station</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                    <AlertDescription className="text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
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
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
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
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        disabled={isLoading}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-colors"
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

      {/* Right Side - Promotional Content */}
      <div className="flex-1 bg-slate-50 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-16 right-16 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl"></div>
        <div className="absolute top-32 left-20 w-32 h-32 bg-emerald-400/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-24 right-32 w-36 h-36 bg-emerald-600/25 rounded-full blur-2xl"></div>
        <div className="absolute bottom-16 left-16 w-28 h-28 bg-emerald-500/30 rounded-full blur-lg"></div>
        
        <div className="relative z-10 flex flex-col justify-center h-full p-12">
          <div className="max-w-lg">
            {/* Main Title */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-slate-900 mb-4">EV STATION</h1>
              <p className="text-2xl text-emerald-600 font-semibold">Electric Portal</p>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Hệ thống quản lý cho thuê xe điện chuyên nghiệp, 
              Góp phần xây dựng môi trường giao thông xanh và bền vững.
            </p>

            {/* Features */}
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

          {/* Bottom logo */}
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
