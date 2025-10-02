import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Shield, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../assets/logo.png';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@womensafety.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'
    }`}>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90' : 'bg-white/90'
        } border border-white/20 rounded-3xl shadow-2xl p-8`}>
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              <img
                src={logo}
                alt="Women Safety App"
                className="relative w-24 h-24 mx-auto object-contain rounded-2xl shadow-lg"
              />
            </div>
            <h1 className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-2`}>
              Andhra Mahila Samraksha
            </h1>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } flex items-center justify-center`}>
              <Shield className="w-4 h-4 mr-1 text-purple-500" />
              Your safety is our priority
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isDark
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-sm animate-fadeIn">
                <Zap className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative overflow-hidden w-full py-4 px-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 active:scale-95'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <span className="relative z-10 flex items-center justify-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Sign In Securely
                </span>
              )}
              {!isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className={`mt-6 p-4 rounded-xl ${
            isDark ? 'bg-purple-900/20 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'
          }`}>
            <div className="flex items-center mb-2">
              <Zap className={`w-4 h-4 mr-2 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <h3 className={`text-sm font-bold ${
                isDark ? 'text-purple-300' : 'text-purple-800'
              }`}>
                Demo Credentials
              </h3>
            </div>
            <div className={`text-xs space-y-1 ${
              isDark ? 'text-purple-400' : 'text-purple-700'
            }`}>
              <p className="font-mono">Email: demo@womensafety.com</p>
              <p className="font-mono">Password: demo123</p>
            </div>
          </div>

          {/* Footer */}
          <div className={`mt-6 text-center text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-600'
          }`}>
            <p>Protected by end-to-end encryption</p>
          </div>
        </div>

        {/* Extra Security Badge */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-sm">
          <Lock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            SSL Secured Connection
          </span>
        </div>
      </div>

      <style>{`
        .bg-size-200 {
          background-size: 200% 100%;
        }
        .bg-pos-0 {
          background-position: 0% 0%;
        }
        .bg-pos-100 {
          background-position: 100% 0%;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;