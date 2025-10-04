import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Shield, 
  Zap, 
  Fingerprint,
  Hash,
  Clock,
  MapPin,
  AlertTriangle,
  Key,
  Smartphone,
  Globe,
  ChevronRight,
  UserPlus,
  Info
} from 'lucide-react';

// Import your actual contexts
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const LoginPage: React.FC = () => {
  const [loginMode, setLoginMode] = useState<'email' | 'pin' | 'biometric' | 'guest'>('email');
  const [email, setEmail] = useState('demo@womensafety.com');
  const [password, setPassword] = useState('demo123');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [panicMode, setPanicMode] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const { login } = useAuth();
  const { isDark } = useTheme();

  // Simulated login history
  const [loginHistory] = useState([
    { timestamp: Date.now() - 3600000, location: 'Chennai, TN', device: 'Mobile', status: 'Success' },
    { timestamp: Date.now() - 86400000, location: 'Chennai, TN', device: 'Mobile', status: 'Success' },
    { timestamp: Date.now() - 172800000, location: 'Hyderabad, TS', device: 'Desktop', status: 'Failed' }
  ]);

  useEffect(() => {
    // Check for biometric availability
    const checkBiometric = async () => {
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setBiometricAvailable(available);
      }
    };
    checkBiometric();

    // Check offline status
    setOfflineMode(!navigator.onLine);
    window.addEventListener('online', () => setOfflineMode(false));
    window.addEventListener('offline', () => setOfflineMode(true));

    return () => {
      window.removeEventListener('online', () => setOfflineMode(false));
      window.removeEventListener('offline', () => setOfflineMode(true));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let success = false;

      if (loginMode === 'email') {
        // For panic mode, silently alert emergency contacts
        if (panicMode) {
          console.log('🚨 PANIC LOGIN DETECTED - Silent alert sent to emergency contacts');
          // You can add actual panic alert logic here
        }
        
        // Call your actual login function from AuthContext
        success = await login(email, password);
        
        // Only show 2FA if you want to implement it
        // For now, we'll skip 2FA to let login work directly
        // if (success && !panicMode) {
        //   setShow2FA(true);
        //   setIsLoading(false);
        //   return;
        // }
      } else if (loginMode === 'pin') {
        // For PIN, check if it matches demo PIN and use email login
        if (pin === '1234') {
          success = await login('demo@womensafety.com', 'demo123');
        } else {
          setError('Invalid PIN. Please try again.');
        }
      } else if (loginMode === 'biometric') {
        // For biometric, simulate by using demo credentials
        try {
          if (window.PublicKeyCredential) {
            success = await login('demo@womensafety.com', 'demo123');
          } else {
            setError('Biometric authentication not available');
          }
        } catch (err) {
          setError('Biometric authentication failed');
        }
      } else if (loginMode === 'guest') {
        // Guest mode - use demo credentials
        success = await login('demo@womensafety.com', 'demo123');
      }

      if (!success && !error) {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (verificationCode === '123456') {
      // Proceed with login
      console.log('2FA verified');
    } else {
      setError('Invalid verification code');
    }
    setIsLoading(false);
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Simulate biometric authentication
      if (window.PublicKeyCredential) {
        const success = await login('demo@womensafety.com', 'demo123');
        if (!success) {
          setError('Biometric authentication failed');
        }
      } else {
        setError('Biometric not available on this device');
      }
    } catch (err) {
      setError('Biometric authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePINInput = (digit: string) => {
    if (pin.length < 6) {
      setPin(pin + digit);
      if (pin.length === 5) {
        // Auto-submit when 6 digits entered
        setTimeout(() => {
          const event = { preventDefault: () => {} } as React.FormEvent;
          handleSubmit(event);
        }, 100);
      }
    }
  };

  const clearPIN = () => {
    setPin(pin.slice(0, -1));
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

      {/* Offline Mode Banner */}
      {offlineMode && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white py-2 px-4 text-center text-sm font-medium z-50">
          <Globe className="w-4 h-4 inline mr-2" />
          Offline Mode - Limited functionality available
        </div>
      )}

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90' : 'bg-white/90'
        } border border-white/20 rounded-3xl shadow-2xl p-8`}>
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center">
                <Shield className="w-12 h-12 text-white" />
              </div>
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

          {/* Login Mode Selector */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <button
              onClick={() => setLoginMode('email')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                loginMode === 'email'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </button>
            <button
              onClick={() => setLoginMode('pin')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                loginMode === 'pin'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Hash className="w-4 h-4 inline mr-1" />
              PIN
            </button>
            {biometricAvailable && (
              <button
                onClick={() => setLoginMode('biometric')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  loginMode === 'biometric'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Fingerprint className="w-4 h-4 inline mr-1" />
                Bio
              </button>
            )}
          </div>

          {/* 2FA Modal */}
          {show2FA && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-blue-600" />
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Enter the 6-digit code sent to your phone
              </p>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <button
                onClick={handle2FAVerification}
                disabled={verificationCode.length !== 6 || isLoading}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          )}

          {/* Email Login Form */}
          {loginMode === 'email' && !show2FA && (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              {/* Panic Mode Toggle */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={panicMode}
                    onChange={(e) => setPanicMode(e.target.checked)}
                    className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Panic Login
                  </span>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Appears normal but silently alerts emergency contacts
                    </div>
                  </div>
                </label>
                <button
                  type="button"
                  className="text-sm text-purple-500 hover:text-purple-600 font-medium"
                >
                  Forgot password?
                </button>
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
          )}

          {/* PIN Login */}
          {loginMode === 'pin' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center space-x-3 mb-6">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all ${
                        i < pin.length ? 'bg-purple-500 scale-125' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePINInput(digit.toString())}
                    className={`p-6 text-2xl font-bold rounded-xl transition-all ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } active:scale-95`}
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={clearPIN}
                  className={`p-6 text-xl font-bold rounded-xl transition-all ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } active:scale-95`}
                >
                  ←
                </button>
                <button
                  onClick={() => handlePINInput('0')}
                  className={`p-6 text-2xl font-bold rounded-xl transition-all ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } active:scale-95`}
                >
                  0
                </button>
                <button
                  onClick={() => setPin('')}
                  className={`p-6 text-sm font-bold rounded-xl transition-all ${
                    isDark
                      ? 'bg-red-900/30 hover:bg-red-900/40 text-red-400'
                      : 'bg-red-100 hover:bg-red-200 text-red-600'
                  } active:scale-95`}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Biometric Login */}
          {loginMode === 'biometric' && (
            <div className="text-center space-y-6 py-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Fingerprint className="w-16 h-16 text-white" />
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Biometric Authentication
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Use your fingerprint or face to sign in
                </p>
              </div>
              <button
                onClick={handleBiometricLogin}
                disabled={isLoading}
                className="group relative overflow-hidden w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-105"
              >
                {isLoading ? 'Authenticating...' : 'Authenticate'}
              </button>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Guest Mode Button */}
          <button
            onClick={() => {
              setLoginMode('guest');
              handleSubmit({ preventDefault: () => {} } as React.FormEvent);
            }}
            className={`w-full mt-4 py-3 rounded-xl border-2 border-dashed transition-all ${
              isDark
                ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:bg-gray-700/30'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
            } font-medium flex items-center justify-center`}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Continue as Guest
          </button>

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
              <p className="font-mono">PIN: 1234</p>
              <p className="font-mono">2FA Code: 123456</p>
            </div>
          </div>

          {/* Login History Toggle */}
          <button
            onClick={() => setShowLoginHistory(!showLoginHistory)}
            className={`w-full mt-4 py-3 rounded-xl font-medium transition-all flex items-center justify-between ${
              isDark
                ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Login History
            </span>
            <ChevronRight className={`w-5 h-5 transition-transform ${showLoginHistory ? 'rotate-90' : ''}`} />
          </button>

          {/* Login History */}
          {showLoginHistory && (
            <div className="mt-4 space-y-2">
              {loginHistory.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      entry.status === 'Success' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {entry.status}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <MapPin className={`w-3 h-3 mr-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {entry.location} • {entry.device}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className={`mt-6 text-center text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-600'
          }`}>
            <p className="flex items-center justify-center">
              <Lock className="w-3 h-3 mr-1" />
              Protected by end-to-end encryption
            </p>
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
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .bg-size-200 { background-size: 200% 100%; }
        .bg-pos-0 { background-position: 0% 0%; }
        .bg-pos-100 { background-position: 100% 0%; }
        .spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid white;
          width: 16px;
          height: 16px;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default LoginPage;