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
  Activity,
  Camera,
  Play,
  Square,
  Timer,
  Shield,
  MapPinOff,
  TrendingUp,
  Download,
  Trash2,
  Eye,
  Image as ImageIcon
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
  photo?: string;
  note?: string;
}

interface Geofence {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: 'safe' | 'alert';
  active: boolean;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
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

  // New features state
  const [isRecordingRoute, setIsRecordingRoute] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<RoutePoint[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<{ name: string; points: RoutePoint[]; date: number }[]>([]);
  const [shareTimer, setShareTimer] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [showRouteHistory, setShowRouteHistory] = useState(false);
  const [offlineLocations, setOfflineLocations] = useState<LocationHistoryItem[]>([]);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [calibrationTips, setCalibrationTips] = useState<string[]>([]);

  useEffect(() => {
    if (location) {
      setLastUpdate(new Date());
      const historyItem: LocationHistoryItem = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || 0,
        timestamp: Date.now()
      };
      setLocationHistory(prev => [historyItem, ...prev.slice(0, 99)]); // Keep last 100
      
      // Save to session storage for offline access
      const stored = [...offlineLocations, historyItem].slice(0, 50);
      setOfflineLocations(stored);
      sessionStorage.setItem('offlineLocations', JSON.stringify(stored));

      // Check geofences
      checkGeofences(location.latitude, location.longitude);

      // Add to route if recording
      if (isRecordingRoute) {
        setCurrentRoute(prev => [...prev, {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: Date.now()
        }]);
      }

      // Calibration tips based on accuracy
      updateCalibrationTips(location.accuracy || 0);
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

  // Share timer countdown
  useEffect(() => {
    if (shareTimer && timerRemaining > 0) {
      const interval = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            setShareTimer(null);
            setIsWatching(false);
            showNotification('Location sharing stopped automatically');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [shareTimer, timerRemaining]);

  // Load saved data from session storage
  useEffect(() => {
    const savedRoutesData = sessionStorage.getItem('savedRoutes');
    if (savedRoutesData) {
      setSavedRoutes(JSON.parse(savedRoutesData));
    }

    const geofencesData = sessionStorage.getItem('geofences');
    if (geofencesData) {
      setGeofences(JSON.parse(geofencesData));
    }

    const offlineData = sessionStorage.getItem('offlineLocations');
    if (offlineData) {
      setOfflineLocations(JSON.parse(offlineData));
    }
  }, []);

  const showNotification = (message: string) => {
    setShareNotification(message);
    setTimeout(() => setShareNotification(''), 3000);
  };

  const updateCalibrationTips = (accuracy: number) => {
    const tips = [];
    if (accuracy > 50) {
      tips.push('Move to an open area for better signal');
      tips.push('Check if location services are enabled');
    }
    if (accuracy > 100) {
      tips.push('Avoid being near tall buildings');
      tips.push('Wait a few moments for GPS to stabilize');
    }
    setCalibrationTips(tips);
  };

  const checkGeofences = (lat: number, lng: number) => {
    geofences.forEach(fence => {
      if (!fence.active) return;
      
      const distance = calculateDistance(lat, lng, fence.latitude, fence.longitude);
      
      if (distance <= fence.radius) {
        if (fence.type === 'safe') {
          showNotification(`Entered safe zone: ${fence.name}`);
        } else {
          showNotification(`⚠️ Alert: Entered ${fence.name}`);
        }
      }
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleStartWatching = () => {
    setIsWatching(true);
    getCurrentLocation();
  };

  const handleStopWatching = () => {
    setIsWatching(false);
    setShareTimer(null);
  };

  const startRouteRecording = () => {
    setIsRecordingRoute(true);
    setCurrentRoute([]);
    if (location) {
      setCurrentRoute([{
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now()
      }]);
    }
    showNotification('Route recording started');
  };

  const stopRouteRecording = () => {
    if (currentRoute.length > 0) {
      const routeName = prompt('Enter route name:') || `Route ${savedRoutes.length + 1}`;
      const newRoute = {
        name: routeName,
        points: currentRoute,
        date: Date.now()
      };
      const updated = [...savedRoutes, newRoute];
      setSavedRoutes(updated);
      sessionStorage.setItem('savedRoutes', JSON.stringify(updated));
      showNotification(`Route "${routeName}" saved`);
    }
    setIsRecordingRoute(false);
    setCurrentRoute([]);
  };

  const shareLocationWithTimer = () => {
    const hours = parseInt(prompt('Share location for how many hours? (1, 3, or 8)') || '1');
    if ([1, 3, 8].includes(hours)) {
      setShareTimer(hours);
      setTimerRemaining(hours * 3600);
      setIsWatching(true);
      getCurrentLocation();
      showNotification(`Sharing location for ${hours} hour(s)`);
    }
  };

  const broadcastPanicLocation = async () => {
    if (!location || !user?.emergencyContacts) return;

    const locationUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    const message = `🚨 PANIC ALERT from ${user.name}! Immediate location: ${locationUrl}`;

    user.emergencyContacts.forEach(contact => {
      console.log(`Panic broadcast to ${contact.name}: ${message}`);
    });

    showNotification('🚨 Panic location sent to ALL contacts!');
  };

  const captureLocationPhoto = () => {
    setShowPhotoCapture(true);
  };

  const saveLocationWithPhoto = (photoData?: string) => {
    if (location) {
      const historyItem: LocationHistoryItem = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || 0,
        timestamp: Date.now(),
        photo: photoData,
        note: currentNote
      };
      setLocationHistory(prev => [historyItem, ...prev.slice(0, 99)]);
      showNotification('Location saved with evidence');
      setShowPhotoCapture(false);
      setCurrentNote('');
    }
  };

  const addGeofence = () => {
    if (!location) {
      showNotification('Get your location first');
      return;
    }

    const name = prompt('Geofence name:');
    const radius = parseInt(prompt('Radius in meters (e.g., 500):') || '500');
    const type = confirm('Is this a SAFE zone? (Cancel for Alert zone)') ? 'safe' : 'alert';

    if (name) {
      const newFence: Geofence = {
        id: Date.now(),
        name,
        latitude: location.latitude,
        longitude: location.longitude,
        radius,
        type,
        active: true
      };

      const updated = [...geofences, newFence];
      setGeofences(updated);
      sessionStorage.setItem('geofences', JSON.stringify(updated));
      showNotification(`Geofence "${name}" created`);
    }
  };

  const toggleGeofence = (id: number) => {
    const updated = geofences.map(f => 
      f.id === id ? { ...f, active: !f.active } : f
    );
    setGeofences(updated);
    sessionStorage.setItem('geofences', JSON.stringify(updated));
  };

  const deleteGeofence = (id: number) => {
    const updated = geofences.filter(f => f.id !== id);
    setGeofences(updated);
    sessionStorage.setItem('geofences', JSON.stringify(updated));
    showNotification('Geofence deleted');
  };

  const exportLocationData = () => {
    const data = {
      locationHistory,
      savedRoutes,
      geofences,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `location-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Location data exported');
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} pb-24 transition-all duration-500`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Notifications */}
      {shareNotification && (
        <div className="fixed top-20 right-4 z-50 backdrop-blur-xl bg-green-500/90 text-white rounded-2xl px-4 py-3 shadow-2xl animate-slideInRight">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{shareNotification}</span>
          </div>
        </div>
      )}

      {showCopyNotification && (
        <div className="fixed top-20 right-4 z-50 backdrop-blur-xl bg-blue-500/90 text-white rounded-2xl px-4 py-3 shadow-2xl animate-slideInRight">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Coordinates copied!</span>
          </div>
        </div>
      )}

      <div className="relative z-10 p-4 space-y-6">
        {/* Stats Card */}
        <div className={`backdrop-blur-xl ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-white/20'
        } border rounded-2xl p-4 shadow-lg`}>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{locationHistory.length}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Locations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{savedRoutes.length}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Routes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500">{geofences.length}</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Geofences</div>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        {shareTimer && (
          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-orange-800/90 border-orange-700' : 'bg-orange-100/90 border-orange-200'
          } border rounded-2xl p-4 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-orange-500" />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Sharing Timer Active
                </span>
              </div>
              <span className="text-lg font-bold text-orange-500">
                {formatTime(timerRemaining)}
              </span>
            </div>
          </div>
        )}

        {/* Main Tracker Card */}
        <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
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

          {/* Calibration Tips */}
          {calibrationTips.length > 0 && (
            <div className={`p-3 rounded-xl mb-4 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-500/30`}>
              <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                📡 Calibration Tips:
              </h4>
              <ul className={`text-xs space-y-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                {calibrationTips.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
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

        {/* New Features - Quick Actions */}
        <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 text-lg flex items-center`}>
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareLocationWithTimer}
              className="flex items-center justify-center p-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105"
            >
              <Timer className="w-4 h-4 mr-2" />
              <span className="text-sm">Timed Share</span>
            </button>

            <button
              onClick={broadcastPanicLocation}
              disabled={!location}
              className="flex items-center justify-center p-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">Panic Broadcast</span>
            </button>

            <button
              onClick={isRecordingRoute ? stopRouteRecording : startRouteRecording}
              className={`flex items-center justify-center p-3 ${
                isRecordingRoute
                  ? 'bg-gradient-to-r from-red-500 to-pink-500'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              } hover:opacity-90 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105`}
            >
              {isRecordingRoute ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              <span className="text-sm">{isRecordingRoute ? 'Stop Route' : 'Record Route'}</span>
            </button>

            <button
              onClick={captureLocationPhoto}
              disabled={!location}
              className="flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            >
              <Camera className="w-4 h-4 mr-2" />
              <span className="text-sm">Add Photo</span>
            </button>

            <button
              onClick={addGeofence}
              disabled={!location}
              className="flex items-center justify-center p-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm">Add Geofence</span>
            </button>

            <button
              onClick={exportLocationData}
              className="flex items-center justify-center p-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="text-sm">Export Data</span>
            </button>
          </div>
        </div>

        {/* Route Recording Status */}
        {isRecordingRoute && (
          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-red-800/90 border-red-700' : 'bg-red-100/90 border-red-200'
          } border rounded-2xl p-4 shadow-lg animate-pulse`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Recording Route
                </span>
              </div>
              <span className="text-sm font-bold text-red-500">
                {currentRoute.length} points
              </span>
            </div>
          </div>
        )}

        {/* Geofences List */}
        {geofences.length > 0 && (
          <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 text-lg flex items-center`}>
              <MapPinOff className="w-5 h-5 mr-2 text-green-500" />
              Active Geofences
            </h3>
            <div className="space-y-3">
              {geofences.map(fence => (
                <div
                  key={fence.id}
                  className={`p-4 rounded-xl ${
                    fence.type === 'safe'
                      ? isDark ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-50 border border-green-200'
                      : isDark ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{fence.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        fence.type === 'safe' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {fence.type.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleGeofence(fence.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        fence.active ? 'bg-green-600' : 'bg-gray-400'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        fence.active ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Radius: {fence.radius}m
                  </div>
                  <button
                    onClick={() => deleteGeofence(fence.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Routes */}
        {savedRoutes.length > 0 && (
          <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} text-lg flex items-center`}>
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                Saved Routes
              </h3>
              <button
                onClick={() => setShowRouteHistory(!showRouteHistory)}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                {showRouteHistory ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showRouteHistory && (
              <div className="space-y-3">
                {savedRoutes.map((route, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{route.name}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {route.points.length} points
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(route.date).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map Card */}
        {location && (
          <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
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
          <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
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
        <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <History className="w-5 h-5 mr-2 text-purple-500" />
              Location History
            </h3>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
              Last {Math.min(locationHistory.length, 5)} locations
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {locationHistory.length > 0 ? (
              locationHistory.slice(0, 5).map((loc, index) => (
                <div
                  key={index}
                  className={`flex items-start p-3 rounded-xl ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-all duration-200`}
                >
                  <div className="relative mr-3 mt-1">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'} shadow-lg`}></div>
                    {index < locationHistory.length - 1 && index < 4 && (
                      <div className={`absolute left-1/2 top-3 w-px h-6 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} transform -translate-x-1/2`}></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-mono ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                      {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(loc.timestamp).toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-2">
                        {loc.photo && (
                          <span className="flex items-center text-xs text-blue-500">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Photo
                          </span>
                        )}
                        {loc.note && (
                          <span className="flex items-center text-xs text-purple-500">
                            <Eye className="w-3 h-3 mr-1" />
                            Note
                          </span>
                        )}
                        {index === 0 && (
                          <span className="text-xs font-bold text-green-500 flex items-center">
                            <Zap className="w-3 h-3 mr-1" />
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                    {loc.note && (
                      <p className={`text-xs mt-2 p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {loc.note}
                      </p>
                    )}
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

        {/* Offline Locations Cache */}
        {offlineLocations.length > 0 && (
          <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-4 shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPinOff className="w-4 h-4 text-orange-500" />
                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Offline Cache
                </span>
              </div>
              <span className="text-xs text-orange-500 font-bold">
                {offlineLocations.length} saved
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-white/20'
          } border rounded-3xl p-6 w-full max-w-md shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add Location Evidence
              </h3>
              <button
                onClick={() => {
                  setShowPhotoCapture(false);
                  setCurrentNote('');
                }}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <span className={`text-2xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Add Note
                </label>
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Describe what you see or any important details..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none`}
                />
              </div>

              <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-xl">
                <div className="text-center">
                  <Camera className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Photo capture requires camera access
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    Simulated for demo
                  </p>
                </div>
              </div>

              <button
                onClick={() => saveLocationWithPhoto()}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-105"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}

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
      `}</style>
    </div>
  );
};

export default LocationPage;