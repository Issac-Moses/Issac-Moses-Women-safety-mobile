import React, { useState } from 'react';
import {
  User,
  Edit,
  Camera,
  Phone,
  Mail,
  MapPin,
  Shield,
  LogOut,
  Upload,
  Save,
  X,
  Award,
  Heart,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface FormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { isDark } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || ''
  });

  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.profileImage || '');
  const [selectedThemeColor, setSelectedThemeColor] = useState(user?.themeColor || 'purple');

  const avatarOptions = ['♕', '☂', '𓆉', '༒', '☤', '☸', '☾', '⚚', '✬', '☫', 'ஐ', '♥', '✞', '☪', '♘', '☬'];

  const themeColors = [
    { name: 'Purple', value: 'purple', gradient: 'from-purple-500 to-pink-500' },
    { name: 'Blue', value: 'blue', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Green', value: 'green', gradient: 'from-green-500 to-emerald-500' },
    { name: 'Orange', value: 'orange', gradient: 'from-orange-500 to-red-500' },
    { name: 'Indigo', value: 'indigo', gradient: 'from-indigo-500 to-purple-500' },
    { name: 'Pink', value: 'pink', gradient: 'from-pink-500 to-rose-500' }
  ];

  const getThemeGradient = (color: string) => {
    return themeColors.find(t => t.value === color)?.gradient || 'from-purple-500 to-pink-500';
  };

  const profileStats = [
    { label: 'Emergency Contacts', value: user?.emergencyContacts?.length || 0, icon: Phone, color: 'from-red-500 to-pink-500' },
    { label: 'Safety Score', value: '98%', icon: Shield, color: 'from-green-500 to-emerald-500' },
    { label: 'Days Active', value: '127', icon: Award, color: 'from-blue-500 to-cyan-500' }
  ];

  const handleSave = () => {
    updateProfile({
      ...formData,
      profileImage: selectedAvatar,
      themeColor: selectedThemeColor
    });
    setIsEditing(false);
    setShowImageUpload(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || ''
    });
    setSelectedAvatar(user?.profileImage || '');
    setSelectedThemeColor(user?.themeColor || 'purple');
    setIsEditing(false);
    setShowImageUpload(false);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'} pb-20 transition-all duration-500`}>
      {/* Animated Background */}
      {!isDark && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      )}

      <div className="relative z-10 p-4">
        {/* Profile Header Card */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-white/20'
        } border rounded-3xl p-6 mb-6 shadow-2xl transform transition-all duration-300 hover:shadow-3xl`}>
          {/* Header with Edit Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <User className="w-6 h-6 mr-2 text-purple-500" />
              My Profile
            </h2>
            <button
              onClick={() => setIsEditing(prev => !prev)}
              className={`group relative overflow-hidden p-3 rounded-xl transition-all duration-300 ${
                isDark
                  ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
              } shadow-lg hover:scale-110 active:scale-95`}
            >
              <Edit className="w-5 h-5" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            </button>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              <div
                className={`relative w-32 h-32 bg-gradient-to-br ${getThemeGradient(
                  selectedThemeColor
                )} rounded-full flex items-center justify-center shadow-2xl transform transition-transform duration-300 group-hover:scale-105`}
              >
                {selectedAvatar ? (
                  <span className="text-5xl">{selectedAvatar}</span>
                ) : (
                  <span className="text-white font-bold text-4xl">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                )}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <button
                onClick={() => setShowImageUpload(true)}
                className={`absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-br ${getThemeGradient(
                  selectedThemeColor
                )} rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform border-4 border-white`}
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="text-center mt-4">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`text-center text-2xl font-bold px-4 py-2 rounded-xl border ${
                    isDark ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
                />
              ) : (
                <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {user?.name || 'User'}
                </h3>
              )}
              <div className="flex items-center justify-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <p className={`text-sm font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  Premium Member
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            {/* Email */}
            <div className={`flex items-center space-x-4 p-4 rounded-xl ${
              isDark ? 'bg-gray-700/30' : 'bg-purple-50'
            } transition-all duration-300 hover:scale-[1.02]`}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Email Address
                </span>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full p-2 rounded-lg border mt-1 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  />
                ) : (
                  <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user?.email || 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className={`flex items-center space-x-4 p-4 rounded-xl ${
              isDark ? 'bg-gray-700/30' : 'bg-purple-50'
            } transition-all duration-300 hover:scale-[1.02]`}>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Phone Number
                </span>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full p-2 rounded-lg border mt-1 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  />
                ) : (
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user?.phone || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCancel}
                className={`flex-1 py-3 rounded-xl border-2 transition-all duration-300 font-semibold ${
                  isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`group relative overflow-hidden flex-1 py-3 bg-gradient-to-r ${getThemeGradient(
                  selectedThemeColor
                )} hover:scale-105 text-white rounded-xl transition-all duration-300 shadow-lg font-semibold`}
              >
                <span className="flex items-center justify-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-white/20'
        } border rounded-3xl p-6 mb-6 shadow-2xl`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 flex items-center`}>
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Account Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {profileStats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`relative w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  <stat.icon className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{stat.value}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Theme Color Picker */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-white/20'
        } border rounded-3xl p-6 mb-6 shadow-2xl`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Heart className="w-5 h-5 mr-2 text-pink-500" />
            Theme Colors
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {themeColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedThemeColor(color.value)}
                className={`group relative overflow-hidden p-4 rounded-2xl transition-all duration-300 ${
                  selectedThemeColor === color.value
                    ? 'scale-105 shadow-xl'
                    : 'hover:scale-105 shadow-lg'
                }`}
              >
                <div className={`w-full h-16 bg-gradient-to-br ${color.gradient} rounded-xl mb-2 flex items-center justify-center shadow-lg`}>
                  {selectedThemeColor === color.value && (
                    <Shield className="w-8 h-8 text-white animate-pulse" />
                  )}
                </div>
                <p className={`text-xs font-semibold text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {color.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Logout Section */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-white/20'
        } border rounded-3xl p-6 shadow-2xl`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Account Actions
          </h3>
          <button
            onClick={logout}
            className={`group relative overflow-hidden w-full flex items-center justify-center p-4 rounded-xl transition-all duration-300 ${
              isDark
                ? 'bg-red-900/30 hover:bg-red-900/40 text-red-400 border border-red-800'
                : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
            } shadow-lg hover:scale-[1.02] active:scale-95 font-semibold`}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          </button>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-white/20'
          } border rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl animate-scaleIn`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <Camera className="w-6 h-6 mr-2 text-purple-500" />
                Choose Avatar
              </h3>
              <button
                onClick={() => setShowImageUpload(false)}
                className={`p-2 rounded-xl transition-colors ${
                  isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {avatarOptions.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-full aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all duration-200 ${
                    selectedAvatar === avatar
                      ? `bg-gradient-to-br ${getThemeGradient(selectedThemeColor)} scale-110 shadow-2xl ring-4 ring-white/50`
                      : isDark
                      ? 'bg-gray-700/50 hover:bg-gray-600 shadow-lg'
                      : 'bg-purple-50 hover:bg-purple-100 shadow-lg'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>

            {/* Default Avatar Option */}
            <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-6 mb-6`}>
              <button
                onClick={() => setSelectedAvatar('')}
                className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                  isDark
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                } hover:scale-[1.02]`}
              >
                <Upload className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Use Default (First Letter)
                </span>
              </button>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setShowImageUpload(false)}
              className={`group relative overflow-hidden w-full py-4 bg-gradient-to-r ${getThemeGradient(
                selectedThemeColor
              )} hover:scale-105 text-white rounded-xl transition-all duration-300 shadow-2xl font-bold`}
            >
              <span className="flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" />
                Apply Avatar
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;