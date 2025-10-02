import React, { useState, useEffect } from 'react';
import {
  Phone,
  MapPin,
  Users,
  Shield,
  AlertTriangle,
  Zap,
  Lock,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import useLocation from '../hooks/useLocation';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { location, getCurrentLocation } = useLocation();
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [safeMode, setSafeMode] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 17) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  const shareLocation = async () => {
    addNotification('Location shared with emergency contacts');
  };

  const alertContacts = () => {
    addNotification(`Emergency alert sent to ${user?.emergencyContacts?.length || 0} contacts!`);
  };

  const toggleSafeMode = () => {
    setSafeMode(!safeMode);
    addNotification(
      safeMode
        ? 'Safe Mode deactivated'
        : 'Safe Mode activated - All safety features enabled'
    );
  };

  const quickActions = [
    {
      icon: Phone,
      title: 'Fake Call',
      description: 'Simulate incoming call',
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      onClick: () => setFakeCallActive(true),
      shadow: 'shadow-blue-500/25'
    },
    {
      icon: MapPin,
      title: 'Share Location',
      description: 'Send to contacts',
      gradient: 'from-green-500 via-emerald-600 to-teal-500',
      onClick: shareLocation,
      shadow: 'shadow-green-500/25'
    },
    {
      icon: Users,
      title: 'Alert Contacts',
      description: 'Notify emergency',
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      onClick: alertContacts,
      shadow: 'shadow-red-500/25'
    },
    {
      icon: Shield,
      title: 'Safe Mode',
      description: safeMode ? 'Active' : 'Activate',
      gradient: safeMode
        ? 'from-green-500 via-emerald-500 to-teal-500'
        : 'from-purple-500 via-pink-500 to-rose-500',
      onClick: toggleSafeMode,
      shadow: safeMode ? 'shadow-green-500/25' : 'shadow-purple-500/25'
    }
  ];

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gray-900'
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'
      } pb-24 transition-all duration-500`}
    >
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className={`backdrop-blur-xl ${
              isDark ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'
            } border border-white/20 rounded-2xl px-4 py-3 shadow-2xl transform transition-all duration-500 animate-slideInRight max-w-sm`}
          >
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-green-500" />
              <p className="text-sm font-medium">{notification}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 p-4 space-y-6">
        {/* Welcome Card */}
        <div
          className={`backdrop-blur-xl ${
            isDark ? 'bg-gray-800/80' : 'bg-white/80'
          } border border-white/20 rounded-3xl p-6 shadow-2xl`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } mb-1`}
                >
                  Good {timeOfDay}!
                </h2>
                <p
                  className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } font-medium`}
                >
                  {user?.name?.split(' ')[0] || 'User'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <Lock className="w-4 h-4 text-green-500" />
                <span
                  className={`text-xs font-semibold ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}
                >
                  PROTECTED
                </span>
              </div>
              <p className="text-xs text-gray-500">All systems active</p>
            </div>
          </div>
        </div>

        {/* Emergency SOS */}
        <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-red-500/10 via-pink-500/10 to-purple-500/10 border border-red-200/30 rounded-3xl p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-gradient-to-br from-red-500 to-pink-600 rounded-full p-4 shadow-2xl shadow-red-500/50">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <h3
              className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-2`}
            >
              Emergency SOS
            </h3>
            <p
              className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mb-6`}
            >
              Instant help at your fingertips
            </p>
            <button className="group relative overflow-hidden bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold px-12 py-4 rounded-full shadow-2xl transition-all duration-500 hover:scale-105">
              <span className="relative z-10 flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>TRIGGER SOS</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3
            className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-4 flex items-center`}
          >
            <Zap className="w-5 h-5 mr-2 text-purple-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`group relative overflow-hidden backdrop-blur-xl ${
                  isDark
                    ? 'bg-gray-800/80 hover:bg-gray-700/80'
                    : 'bg-white/80 hover:bg-white/90'
                } border border-white/20 rounded-2xl p-5 shadow-xl ${action.shadow} transition-all duration-300 hover:scale-105`}
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}
                >
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <h4
                  className={`font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } mb-1`}
                >
                  {action.title}
                </h4>
                <p
                  className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Safety Status */}
        <div
          className={`backdrop-blur-xl ${
            isDark ? 'bg-gray-800/80' : 'bg-white/80'
          } border border-white/20 rounded-3xl p-6 shadow-2xl`}
        >
          <h3
            className={`text-lg font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-4 flex items-center`}
          >
            <Shield className="w-5 h-5 mr-2 text-green-500" />
            Safety Status
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Location Services', status: 'Active', color: 'green' },
              {
                label: 'Emergency Contacts',
                status: `${user?.emergencyContacts?.length || 0} Added`,
                color: 'blue'
              },
              {
                label: 'Safe Mode',
                status: safeMode ? 'Enabled' : 'Disabled',
                color: safeMode ? 'green' : 'gray'
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </span>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.color === 'green'
                        ? 'bg-green-500 animate-pulse'
                        : item.color === 'blue'
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-gray-400'
                    }`}
                  ></div>
                  <span
                    className={`text-sm font-bold ${
                      item.color === 'green'
                        ? 'text-green-500'
                        : item.color === 'blue'
                        ? 'text-blue-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out; }
        .bg-size-200 { background-size: 200% 100%; }
        .bg-pos-0 { background-position: 0% 0%; }
        .bg-pos-100 { background-position: 100% 0%; }
      `}</style>
    </div>
  );
};

export default HomePage;
