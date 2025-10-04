import React, { useState, useEffect } from 'react';
import {
  Phone,
  MapPin,
  Users,
  Shield,
  AlertTriangle,
  Zap,
  Lock,
  Bell,
  Clock,
  TrendingUp,
  Battery,
  Cloud,
  Navigation,
  Heart,
  Activity,
  Map,
  Store,
  Plus,
  MapPinned,
  Lightbulb,
  Radio,
  Wind,
  Sun,
  CloudRain,
  Volume2,
  Smartphone,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import useLocation from '../hooks/useLocation';

const SHAKE_THRESHOLD = 12;
let lastShakeTime = 0;

interface SafetyTip {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
}

interface Activity {
  action: string;
  timestamp: number;
  type: 'location' | 'alert' | 'contact' | 'safety';
}

interface SafeSpace {
  name: string;
  type: string;
  distance: string;
  icon: any;
}

interface CommunityAlert {
  id: number;
  message: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  distance: string;
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { location, getCurrentLocation } = useLocation();
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [safeMode, setSafeMode] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [currentTip, setCurrentTip] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [weatherInfo, setWeatherInfo] = useState({ temp: 28, condition: 'Clear', icon: Sun });
  const [safeSpaces, setSafeSpaces] = useState<SafeSpace[]>([]);
  const [communityAlerts, setCommunityAlerts] = useState<CommunityAlert[]>([]);
  const [voiceCommandEnabled, setVoiceCommandEnabled] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [savedNotes, setSavedNotes] = useState<{ text: string; timestamp: number }[]>([]);

  const safetyTips: SafetyTip[] = [
    { id: 1, title: 'Stay Alert', description: 'Keep your phone charged and location services on', icon: Smartphone, color: 'blue' },
    { id: 2, title: 'Trust Your Instincts', description: 'If something feels wrong, remove yourself from the situation', icon: Heart, color: 'red' },
    { id: 3, title: 'Share Your Location', description: 'Let trusted contacts know where you are going', icon: MapPin, color: 'green' },
    { id: 4, title: 'Stay in Well-Lit Areas', description: 'Avoid isolated or poorly lit areas, especially at night', icon: Sun, color: 'yellow' },
    { id: 5, title: 'Keep Emergency Contacts Updated', description: 'Ensure your emergency contacts are current', icon: Users, color: 'purple' },
    { id: 6, title: 'Be Aware of Surroundings', description: 'Stay off your phone when walking alone', icon: Eye, color: 'orange' }
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 17) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');

    // Calculate risk level based on time
    if (hour >= 22 || hour < 6) {
      setRiskLevel('high');
    } else if (hour >= 18 || hour < 8) {
      setRiskLevel('medium');
    } else {
      setRiskLevel('low');
    }
  }, []);

  // Battery monitoring
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, []);

  // Load saved data
  useEffect(() => {
    const activities = JSON.parse(sessionStorage.getItem('recentActivities') || '[]');
    setRecentActivities(activities.slice(0, 5));

    const notes = JSON.parse(sessionStorage.getItem('quickNotes') || '[]');
    setSavedNotes(notes);

    // Simulate nearby safe spaces
    if (location) {
      setSafeSpaces([
        { name: 'City Police Station', type: 'Police', distance: '0.8 km', icon: Shield },
        { name: 'Apollo Hospital', type: 'Hospital', distance: '1.2 km', icon: Plus },
        { name: '24/7 Supermarket', type: 'Store', distance: '0.3 km', icon: Store },
        { name: 'Cafe Coffee Day', type: 'Cafe', distance: '0.5 km', icon: Store }
      ]);
    }

    // Simulate community alerts
    setCommunityAlerts([
      { id: 1, message: 'Increased traffic near Main Road', location: 'Main Road Junction', severity: 'low', timestamp: Date.now() - 1800000, distance: '2.3 km' },
      { id: 2, message: 'Poor street lighting reported', location: 'Park Avenue', severity: 'medium', timestamp: Date.now() - 3600000, distance: '1.8 km' }
    ]);
  }, [location]);

  // Safety tips carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % safetyTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Voice command setup
  useEffect(() => {
    if (!voiceCommandEnabled) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        if (transcript.includes('trigger sos') || transcript.includes('emergency')) {
          triggerSOS();
        } else if (transcript.includes('share location')) {
          shareLocation();
        }
      };

      recognition.start();
      return () => recognition.stop();
    }
  }, [voiceCommandEnabled]);

  // Shake Detection
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const { x = 0, y = 0, z = 0 } = acc;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (safeMode && magnitude > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeTime > 1000) {
          lastShakeTime = now;
          triggerSOS();
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [safeMode, user, location]);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  const logActivity = (action: string, type: Activity['type']) => {
    const activity: Activity = { action, timestamp: Date.now(), type };
    const updated = [activity, ...recentActivities].slice(0, 20);
    setRecentActivities(updated);
    sessionStorage.setItem('recentActivities', JSON.stringify(updated));
  };

  const triggerSOS = () => {
    getCurrentLocation();
    addNotification('Emergency call triggered to 100!');
    window.location.href = 'tel:100';
    logActivity('Emergency SOS triggered', 'alert');

    setTimeout(() => {
      sendLocationToContacts();
    }, 100);
  };

  const sendLocationToContacts = () => {
    if (!user?.emergencyContacts || user.emergencyContacts.length === 0) {
      return;
    }

    const locationUrl = location
      ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : 'Location unavailable';

    const message = `EMERGENCY ALERT from ${user.name}! I need help. My location: ${locationUrl}`;

    user.emergencyContacts.forEach(contact => {
      const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = smsUrl;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    });

    addNotification(`Location sent to ${user.emergencyContacts.length} contacts`);
    logActivity('Location shared with emergency contacts', 'location');
  };

  const shareLocation = async () => {
    getCurrentLocation();
    addNotification('Location shared with emergency contacts');
    logActivity('Location shared', 'location');
  };

  const alertContacts = () => {
    addNotification(`Emergency alert sent to ${user?.emergencyContacts?.length || 0} contacts!`);
    logActivity('Alert sent to contacts', 'alert');
  };

  const toggleSafeMode = () => {
    setSafeMode(!safeMode);
    addNotification(
      safeMode
        ? 'Safe Mode deactivated'
        : 'Safe Mode activated - Shake to trigger emergency SOS'
    );
    logActivity(safeMode ? 'Safe Mode deactivated' : 'Safe Mode activated', 'safety');
  };

  const saveQuickNote = () => {
    if (quickNote.trim()) {
      const note = { text: quickNote, timestamp: Date.now() };
      const updated = [note, ...savedNotes].slice(0, 10);
      setSavedNotes(updated);
      sessionStorage.setItem('quickNotes', JSON.stringify(updated));
      setQuickNote('');
      setShowQuickNote(false);
      addNotification('Note saved for emergency contacts');
      logActivity('Quick note saved', 'safety');
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
    }
  };

  const getRiskBgColor = () => {
    switch (riskLevel) {
      case 'low': return 'from-green-500 to-emerald-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'high': return 'from-red-500 to-pink-500';
    }
  };

  const quickActions = [
    {
      icon: Phone,
      title: 'Fake Call',
      description: 'Simulate incoming call',
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      onClick: () => {
        setFakeCallActive(true);
        logActivity('Fake call initiated', 'safety');
      },
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

  const emergencyServices = [
    { name: 'Police', number: '100', icon: Shield, color: 'blue' },
    { name: 'Ambulance', number: '108', icon: Plus, color: 'red' },
    { name: 'Women Helpline', number: '1091', icon: Heart, color: 'pink' },
    { name: 'Fire', number: '101', icon: AlertTriangle, color: 'orange' }
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'location': return MapPin;
      case 'alert': return AlertTriangle;
      case 'contact': return Users;
      case 'safety': return Shield;
    }
  };

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

        {/* Daily Safety Briefing */}
        <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            Daily Safety Briefing
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Weather */}
            <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
              <div className="flex items-center space-x-2 mb-1">
                <weatherInfo.icon className="w-5 h-5 text-blue-500" />
                <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Weather</span>
              </div>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{weatherInfo.temp}°C</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{weatherInfo.condition}</p>
            </div>

            {/* Risk Level */}
            <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-5 h-5 text-purple-500" />
                <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Risk Level</span>
              </div>
              <p className={`text-lg font-bold ${getRiskColor()} uppercase`}>{riskLevel}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Based on time</p>
            </div>

            {/* Battery */}
            <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-green-50'}`}>
              <div className="flex items-center space-x-2 mb-1">
                <Battery className="w-5 h-5 text-green-500" />
                <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Battery</span>
              </div>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{batteryLevel}%</p>
              <p className={`text-xs ${batteryLevel < 20 ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {batteryLevel < 20 ? 'Charge soon!' : 'Good'}
              </p>
            </div>

            {/* Contacts */}
            <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-pink-50'}`}>
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-5 h-5 text-pink-500" />
                <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Contacts</span>
              </div>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.emergencyContacts?.length || 0}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Emergency</p>
            </div>
          </div>
        </div>

        {/* Risk Assessment Widget */}
        <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
              Current Threat Assessment
            </h3>
            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRiskBgColor()}`}>
              {riskLevel.toUpperCase()}
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 bg-gradient-to-r ${getRiskBgColor()} transition-all duration-500`}
                style={{ width: riskLevel === 'low' ? '33%' : riskLevel === 'medium' ? '66%' : '100%' }}
              ></div>
            </div>
            
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {riskLevel === 'low' && 'Current conditions are safe. Stay alert and aware.'}
              {riskLevel === 'medium' && 'Exercise caution. Avoid isolated areas.'}
              {riskLevel === 'high' && 'High risk period. Stay in well-lit areas and inform contacts of your location.'}
            </p>
          </div>
        </div>

        {/* Safety Tips Carousel */}
        <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            Safety Tip of the Moment
          </h3>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50 to-pink-50'} transition-all duration-500`}>
            <div className="flex items-start space-x-3">
              {React.createElement(safetyTips[currentTip].icon, {
                className: `w-8 h-8 text-${safetyTips[currentTip].color}-500 flex-shrink-0`
              })}
              <div className="flex-1">
                <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {safetyTips[currentTip].title}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                  {safetyTips[currentTip].description}
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-2 mt-4">
              {safetyTips.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTip(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentTip ? 'bg-purple-500 w-6' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
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

        {/* Emergency Service Directory */}
        <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Phone className="w-5 h-5 mr-2 text-red-500" />
            Emergency Services
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {emergencyServices.map((service, idx) => (
              <button
                key={idx}
                onClick={() => {
                  window.location.href = `tel:${service.number}`;
                  logActivity(`Called ${service.name}`, 'alert');
                }}
                className={`p-4 rounded-xl ${
                  isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                } transition-all hover:scale-105`}
              >
                <service.icon className={`w-6 h-6 text-${service.color}-500 mb-2`} />
                <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{service.name}</p>
                <p className={`text-lg font-bold text-${service.color}-500`}>{service.number}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Nearby Safe Spaces */}
        {safeSpaces.length > 0 && (
          <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              <Map className="w-5 h-5 mr-2 text-green-500" />
              Nearby Safe Spaces
            </h3>

            <div className="space-y-3">
              {safeSpaces.map((space, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (location) {
                      window.open(`https://www.google.com/maps/search/${encodeURIComponent(space.name)}/@${location.latitude},${location.longitude},15z`);
                    }
                  }}
                  className={`w-full p-4 rounded-xl ${
                    isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  } transition-all flex items-center justify-between`}
                >
                  <div className="flex items-center space-x-3">
                    <space.icon className="w-6 h-6 text-green-500" />
                    <div className="text-left">
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{space.name}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{space.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-500">{space.distance}</p>
                    <Navigation className="w-4 h-4 text-gray-400 ml-auto mt-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Community Alerts Feed */}
        {communityAlerts.length > 0 && (
          <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              <Radio className="w-5 h-5 mr-2 text-orange-500" />
              Community Alerts
            </h3>

            <div className="space-y-3">
              {communityAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.severity === 'high'
                      ? isDark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'
                      : alert.severity === 'medium'
                      ? isDark ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
                      : isDark ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                        {alert.message}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {alert.location} • {alert.distance}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      alert.severity === 'high' ? 'bg-red-500 text-white'
                      : alert.severity === 'medium' ? 'bg-yellow-500 text-white'
                      : 'bg-blue-500 text-white'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Command Control */}
        <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <Volume2 className="w-5 h-5 mr-2 text-blue-500" />
              Voice Commands
            </h3>
            <button
              onClick={() => {
                setVoiceCommandEnabled(!voiceCommandEnabled);
                addNotification(voiceCommandEnabled ? 'Voice commands disabled' : 'Voice commands enabled');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                voiceCommandEnabled ? 'bg-blue-600' : 'bg-gray-400'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                voiceCommandEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              Say commands like:
            </p>
            <ul className={`text-xs space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                "Trigger SOS" - Emergency alert
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                "Share location" - Send location to contacts
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Note Feature */}
        <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <Clock className="w-5 h-5 mr-2 text-purple-500" />
              Quick Notes
            </h3>
            <button
              onClick={() => setShowQuickNote(!showQuickNote)}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition-all"
            >
              New Note
            </button>
          </div>

          {showQuickNote && (
            <div className="mb-4">
              <textarea
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Leave a timestamped note visible to emergency contacts..."
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none mb-2`}
              />
              <div className="flex space-x-2">
                <button
                  onClick={saveQuickNote}
                  className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all"
                >
                  Save Note
                </button>
                <button
                  onClick={() => {
                    setShowQuickNote(false);
                    setQuickNote('');
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  } transition-all`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedNotes.length > 0 ? (
              savedNotes.map((note, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-purple-50'}`}
                >
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{note.text}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(note.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No notes yet. Create one for emergency contacts.
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        {recentActivities.length > 0 && (
          <div className={`backdrop-blur-xl ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border border-white/20 rounded-3xl p-6 shadow-2xl`}>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              <Activity className="w-5 h-5 mr-2 text-indigo-500" />
              Recent Activity
            </h3>

            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((activity, idx) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={idx}
                    className={`flex items-start p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                  >
                    <div className="relative mr-3 mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'alert' ? 'bg-red-500/20' :
                        activity.type === 'location' ? 'bg-green-500/20' :
                        activity.type === 'contact' ? 'bg-blue-500/20' :
                        'bg-purple-500/20'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          activity.type === 'alert' ? 'text-red-500' :
                          activity.type === 'location' ? 'text-green-500' :
                          activity.type === 'contact' ? 'text-blue-500' :
                          'text-purple-500'
                        }`} />
                      </div>
                      {idx < recentActivities.length - 1 && idx < 4 && (
                        <div className={`absolute left-1/2 top-8 w-px h-6 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} transform -translate-x-1/2`}></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {activity.action}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Battery Saver Mode */}
        {batteryLevel < 20 && (
          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-orange-800/90 border-orange-700' : 'bg-orange-100/90 border-orange-200'
          } border rounded-2xl p-4 shadow-lg animate-pulse`}>
            <div className="flex items-center space-x-3">
              <Battery className="w-6 h-6 text-orange-500" />
              <div className="flex-1">
                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Low Battery Mode
                </p>
                <p className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                  Battery at {batteryLevel}%. Essential features only.
                </p>
              </div>
            </div>
          </div>
        )}
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
      `}</style>
    </div>
  );
};

export default HomePage;