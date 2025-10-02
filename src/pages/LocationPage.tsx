import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Share,
  Navigation,
  Clock,
  AlertCircle,
  RefreshCw,
  Copy,
  History,
  Crosshair,
  Send,
  CheckCircle,
  Zap,
  Activity
} from 'lucide-react';
import useLocation from '../hooks/useLocation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import MapComponent from '../components/MapComponent';

interface LocationHistoryItem {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

const LocationPage: React.FC = () => {
  const { location, error, loading, getCurrentLocation } = useLocation();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [isWatching, setIsWatching] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationHistoryItem[]>([]);
  const [batteryWarning, setBatteryWarning] = useState('');
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [shareNotification, setShareNotification] = useState('');

  useEffect(() => {
    if (location) {
      setLastUpdate(new Date());
      const historyItem: LocationHistoryItem = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || 0,
        timestamp: Date.now()
      };
      setLocationHistory(prev => [historyItem, ...prev.slice(0, 4)]);
    }
  }, [location]);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level < 0.2) {
          setBatteryWarning('Low battery may affect GPS accuracy');
        }
      });
    }
  }, []);

  const handleStartWatching = () => {
    setIsWatching(true);
    getCurrentLocation();
  };

  const handleStopWatching = () => {
    setIsWatching(false);
  };

  const shareLocation = async () => {
    if (!location) return;

    const locationUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    const message = `My current location: ${locationUrl}\nShared at: ${new Date().toLocaleString()}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Current Location',
          text: message,
          url: locationUrl
        });
      } else {
        await navigator.clipboard.writeText(message);
        setShareNotification('Location copied to clipboard!');
        setTimeout(() => setShareNotification(''), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const shareRoute = async () => {
    if (!location) return;

    try {
      const destination = prompt('Enter destination address:');
      if (!destination) return;

      const routeUrl = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${encodeURIComponent(
        destination
      )}&travelmode=walking`;

      if (navigator.share) {
        await navigator.share({
          title: 'My Safety Route',
          text: `I'm going from my current location to ${destination}`,
          url: routeUrl
        });
      } else {
        await navigator.clipboard.writeText(routeUrl);
        setShareNotification('Route copied to clipboard!');
        setTimeout(() => setShareNotification(''), 3000);
      }
    } catch (err) {
      console.error('Error sharing route:', err);
    }
  };

  const copyCoordinates = async () => {
    if (!location) return;
    await navigator.clipboard.writeText(`${location.latitude},${location.longitude}`);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 10) return 'text-green-500';
    if (accuracy <= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy <= 10) return 'bg-green-500';
    if (accuracy <= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} pb-24 transition-all duration-500`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Share Notification */}
      {shareNotification && (
        <div className="fixed top-20 right-4 z-50 backdrop-blur-xl bg-green-500/90 text-white rounded-2xl px-4 py-3 shadow-2xl animate-slideInRight">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{shareNotification}</span>
          </div>
        </div>
      )}

      {/* Copy Notification */}
      {showCopyNotification && (
        <div className="fixed top-20 right-4 z-50 backdrop-blur-xl bg-blue-500/90 text-white rounded-2xl px-4 py-3 shadow-2xl animate-slideInRight">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Coordinates copied!</span>
          </div>
        </div>
      )}

      <div className="relative z-10 p-4 space-y-6">
        {/* Header Card */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/80' : 'bg-white/80'
        } border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <MapPin className="w-7 h-7 mr-2 text-blue-500" />
                Location Tracker
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Real-time location monitoring
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isWatching ? 'bg-green-500 animate-pulse' : 'bg-gray-400'} shadow-lg`}></div>
              <span className={`text-sm font-bold ${isWatching ? 'text-green-500' : 'text-gray-400'}`}>
                {isWatching ? 'LIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>

          {/* Battery Warning */}
          {batteryWarning && (
            <div className="flex items-center p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 rounded-xl mb-4 backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">{batteryWarning}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-700 dark:text-red-400 rounded-xl mb-4 backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className={`group relative overflow-hidden flex items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:scale-95 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40'
              } text-white font-semibold`}
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Crosshair className="w-5 h-5 mr-2" />
                  <span>Get Location</span>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            </button>

            <button
              onClick={isWatching ? handleStopWatching : handleStartWatching}
              className={`group relative overflow-hidden flex items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                isWatching
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40'
              } text-white font-semibold active:scale-95`}
            >
              <Activity className="w-5 h-5 mr-2" />
              <span>{isWatching ? 'Stop' : 'Start'} Tracking</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            </button>
          </div>
        </div>

        {/* Map Card */}
        {location && (
          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-gray-800/80' : 'bg-white/80'
          } border border-white/20 rounded-3xl p-6 shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} text-lg flex items-center`}>
                <Navigation className="w-5 h-5 mr-2 text-blue-500" />
                Live Map View
              </h3>
              <button
                onClick={copyCoordinates}
                className="flex items-center space-x-1 text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
            </div>

            <div className="h-64 rounded-2xl overflow-hidden mb-4 shadow-lg ring-2 ring-white/10">
              <MapComponent
                latitude={location.latitude}
                longitude={location.longitude}
                darkMode={isDark}
                className="h-full w-full"
              />
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between text-sm">
                <span className={`font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </span>
                {isWatching && (
                  <div className="flex items-center space-x-1 text-green-500">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold">LIVE</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Accuracy Card */}
        {location?.accuracy && (
          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-gray-800/80' : 'bg-white/80'
          } border border-white/20 rounded-3xl p-6 shadow-2xl`}>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 text-lg flex items-center`}>
              <Crosshair className="w-5 h-5 mr-2 text-green-500" />
              GPS Accuracy
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Precision Level
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold ${getAccuracyColor(location.accuracy)}`}>
                    ±{location.accuracy.toFixed(0)}m
                  </span>
                  <div className={`w-2 h-2 rounded-full ${getAccuracyBgColor(location.accuracy)} animate-pulse`}></div>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    location.accuracy < 20
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : location.accuracy < 50
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                      : 'bg-gradient-to-r from-red-400 to-pink-500'
                  } shadow-lg`}
                  style={{ width: `${Math.min(100, 500 / location.accuracy)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {lastUpdate?.toLocaleTimeString() || '—'}
                  </span>
                </div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {lastUpdate?.toLocaleDateString() || '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Share Actions */}
        {location && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareLocation}
              className="group relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 font-semibold"
            >
              <Share className="w-5 h-5 mr-2" />
              <span>Share Location</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            </button>

            <button
              onClick={shareRoute}
              className="group relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 active:scale-95 font-semibold"
            >
              <Send className="w-5 h-5 mr-2" />
              <span>Share Route</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            </button>
          </div>
        )}

        {/* Location History */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/80' : 'bg-white/80'
        } border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <History className="w-5 h-5 mr-2 text-purple-500" />
              Location History
            </h3>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
              Last 5 locations
            </span>
          </div>

          <div className="space-y-3">
            {locationHistory.length > 0 ? (
              locationHistory.map((loc, index) => (
                <div
                  key={index}
                  className={`flex items-start p-3 rounded-xl ${
                    isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  } transition-all duration-200`}
                >
                  <div className="relative mr-3 mt-1">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      } shadow-lg`}
                    ></div>
                    {index < locationHistory.length - 1 && (
                      <div className={`absolute left-1/2 top-3 w-px h-6 ${
                        isDark ? 'bg-gray-600' : 'bg-gray-300'
                      } transform -translate-x-1/2`}></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-mono ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                      {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(loc.timestamp).toLocaleString()}
                      </p>
                      {index === 0 && (
                        <span className="text-xs font-bold text-green-500 flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <MapPin className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="font-medium mb-1">No location history available</p>
                <p className="text-sm">Get your location to start tracking</p>
              </div>
            )}
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
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LocationPage;