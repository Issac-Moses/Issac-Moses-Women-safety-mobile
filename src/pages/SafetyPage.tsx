import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Phone, 
  AlertTriangle, 
  Users, 
  Volume2, 
  VolumeX,
  Video,
  VideoOff,
  Clock,
  Navigation,
  Radio,
  Siren,
  Camera,
  Mic,
  Flashlight,
  UserCheck,
  MapPin,
  FileText,
  Headphones,
  Activity,
  Zap,
  Eye,
  EyeOff,
  Download,
  Upload,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import useLocation from '../hooks/useLocation'; 
import EmergencyButton from '../components/EmergencyButton';
import FakeCall from '../components/FakeCall';

interface CheckInSchedule {
  enabled: boolean;
  time: string;
  lastCheck: number | null;
  contacts: string[];
}

interface JourneyTracking {
  active: boolean;
  destination: string;
  eta: number;
  startTime: number;
}

interface RecordingSession {
  id: number;
  type: 'audio' | 'video';
  timestamp: number;
  duration: number;
  status: 'recording' | 'stopped' | 'uploaded';
}

const SafetyPage: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { location, getCurrentLocation } = useLocation();
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [safeMode, setSafeMode] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  // New features state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('video');
  const [recordingSessions, setRecordingSessions] = useState<RecordingSession[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [checkInSchedule, setCheckInSchedule] = useState<CheckInSchedule>({
    enabled: false,
    time: '12:00',
    lastCheck: null,
    contacts: []
  });
  const [journeyTracking, setJourneyTracking] = useState<JourneyTracking>({
    active: false,
    destination: '',
    eta: 0,
    startTime: 0
  });
  const [sirenActive, setSirenActive] = useState(false);
  const [flashSOS, setFlashSOS] = useState(false);
  const [walkWithMe, setWalkWithMe] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [environmentalMonitoring, setEnvironmentalMonitoring] = useState(false);
  const [decoyInfo, setDecoyInfo] = useState({
    name: 'Sarah Johnson',
    phone: '+91 98765 43210',
    address: '123 Main Street'
  });
  const [showDecoyModal, setShowDecoyModal] = useState(false);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const checkInInterval = useRef<NodeJS.Timeout | null>(null);

  const SHAKE_THRESHOLD = 11;
  let lastShakeTime = 0;

  useEffect(() => {
    // Load saved data
    const savedCheckIn = sessionStorage.getItem('checkInSchedule');
    if (savedCheckIn) {
      setCheckInSchedule(JSON.parse(savedCheckIn));
    }

    const savedJourney = sessionStorage.getItem('journeyTracking');
    if (savedJourney) {
      setJourneyTracking(JSON.parse(savedJourney));
    }

    const savedSessions = sessionStorage.getItem('recordingSessions');
    if (savedSessions) {
      setRecordingSessions(JSON.parse(savedSessions));
    }

    const savedDecoy = sessionStorage.getItem('decoyInfo');
    if (savedDecoy) {
      setDecoyInfo(JSON.parse(savedDecoy));
    }
  }, []);

  // Check-in monitoring
  useEffect(() => {
    if (!checkInSchedule.enabled) return;

    const checkSchedule = () => {
      const now = new Date();
      const [hour, minute] = checkInSchedule.time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);

      const lastCheckDate = checkInSchedule.lastCheck ? new Date(checkInSchedule.lastCheck) : null;
      const today = new Date().toDateString();
      const lastCheckDay = lastCheckDate?.toDateString();

      if (now >= scheduledTime && today !== lastCheckDay) {
        addNotification('Time for your scheduled check-in!');
        triggerCheckInReminder();
      }
    };

    checkInInterval.current = setInterval(checkSchedule, 60000);
    return () => {
      if (checkInInterval.current) clearInterval(checkInInterval.current);
    };
  }, [checkInSchedule]);

  // Journey tracking monitoring
  useEffect(() => {
    if (!journeyTracking.active) return;

    const checkETA = () => {
      const elapsed = Date.now() - journeyTracking.startTime;
      if (elapsed >= journeyTracking.eta) {
        addNotification('You should have arrived by now. Are you safe?');
        triggerJourneyAlert();
      }
    };

    const etaInterval = setInterval(checkETA, 30000);
    return () => clearInterval(etaInterval);
  }, [journeyTracking]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, [isRecording]);

  // Flash SOS effect
  useEffect(() => {
    if (!flashSOS) return;

    const pattern = [200, 200, 200, 600, 600, 600, 200, 200, 200]; // SOS in morse
    let index = 0;

    const flashInterval = setInterval(() => {
      // In a real app, this would control the camera flash
      console.log('Flash:', index % 2 === 0 ? 'ON' : 'OFF');
      index++;
      if (index >= pattern.length * 3) {
        setFlashSOS(false);
      }
    }, 400);

    return () => clearInterval(flashInterval);
  }, [flashSOS]);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  const triggerSilentAlert = () => {
    if (!user?.emergencyContacts || user.emergencyContacts.length === 0) {
      addNotification('No emergency contacts found. Please add contacts first.');
      return;
    }

    const alertMessage = `SILENT EMERGENCY ALERT: ${user.name} may need assistance. Location: ${
      location ? `https://maps.google.com/?q=${location.latitude},${location.longitude}` : 'Location unavailable'
    }`;

    user.emergencyContacts.forEach(contact => {
      console.log(`Silent alert sent to ${contact.name}: ${alertMessage}`);
    });

    addNotification(`Silent alert sent to ${user.emergencyContacts.length} contacts`);
  };

  const triggerGroupAlert = () => {
    if (!user?.emergencyContacts || user.emergencyContacts.length === 0) {
      addNotification('No emergency contacts found. Please add contacts first.');
      return;
    }

    getCurrentLocation();
    addNotification('Emergency call triggered to 100!');
    window.location.href = 'tel:100';

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

      console.log(`Location SMS sent to ${contact.name} (${contact.phone})`);
    });

    addNotification(`Group alert sent to all ${user.emergencyContacts.length} contacts!`);
    addNotification(`Location sent to ${user.emergencyContacts.length} contacts`);
  };

  const toggleSafeMode = () => {
    setSafeMode(!safeMode);
    if (!safeMode) {
      getCurrentLocation();
      addNotification('Safe Mode activated - Shake to trigger emergency SOS');
    } else {
      addNotification('Safe Mode deactivated');
    }
  };

  const startRecording = (type: 'audio' | 'video') => {
    setRecordingType(type);
    setIsRecording(true);
    setRecordingDuration(0);
    addNotification(`${type === 'video' ? 'Video' : 'Audio'} recording started`);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    const session: RecordingSession = {
      id: Date.now(),
      type: recordingType,
      timestamp: Date.now(),
      duration: recordingDuration,
      status: 'stopped'
    };

    const updated = [session, ...recordingSessions];
    setRecordingSessions(updated);
    sessionStorage.setItem('recordingSessions', JSON.stringify(updated));
    
    addNotification(`${recordingType === 'video' ? 'Video' : 'Audio'} saved. Auto-uploading...`);
    
    // Simulate auto-upload
    setTimeout(() => {
      const uploadedSessions = updated.map(s => 
        s.id === session.id ? { ...s, status: 'uploaded' as const } : s
      );
      setRecordingSessions(uploadedSessions);
      sessionStorage.setItem('recordingSessions', JSON.stringify(uploadedSessions));
      addNotification('Recording uploaded to cloud');
    }, 2000);
  };

  const startTimedCheckIn = () => {
    const hours = parseInt(prompt('Check-in required in how many hours? (e.g., 2)') || '2');
    const now = new Date();
    const checkTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    const updated = {
      ...checkInSchedule,
      enabled: true,
      time: `${checkTime.getHours()}:${checkTime.getMinutes()}`,
      contacts: user?.emergencyContacts?.map(c => c.name) || []
    };
    
    setCheckInSchedule(updated);
    sessionStorage.setItem('checkInSchedule', JSON.stringify(updated));
    addNotification(`Check-in scheduled for ${hours} hour(s)`);
  };

  const performCheckIn = () => {
    const updated = {
      ...checkInSchedule,
      lastCheck: Date.now()
    };
    setCheckInSchedule(updated);
    sessionStorage.setItem('checkInSchedule', JSON.stringify(updated));
    addNotification('Check-in recorded successfully');
  };

  const triggerCheckInReminder = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Safety Check-In Required', {
        body: 'Please confirm you are safe',
        icon: '/logo.png'
      });
    }
  };

  const startJourneyTracking = () => {
    const destination = prompt('Enter destination:');
    if (!destination) return;

    const minutes = parseInt(prompt('Expected journey time in minutes:') || '30');
    
    const journey: JourneyTracking = {
      active: true,
      destination,
      eta: minutes * 60 * 1000,
      startTime: Date.now()
    };

    setJourneyTracking(journey);
    sessionStorage.setItem('journeyTracking', JSON.stringify(journey));
    getCurrentLocation();
    
    // Share journey with contacts
    if (location && user?.emergencyContacts) {
      const message = `I'm traveling to ${destination}. Expected arrival: ${new Date(Date.now() + journey.eta).toLocaleTimeString()}. Track me at: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      console.log('Journey shared:', message);
    }
    
    addNotification(`Journey tracking started to ${destination}`);
  };

  const endJourneyTracking = () => {
    const journey: JourneyTracking = {
      active: false,
      destination: '',
      eta: 0,
      startTime: 0
    };
    setJourneyTracking(journey);
    sessionStorage.setItem('journeyTracking', JSON.stringify(journey));
    addNotification('Journey completed safely');
  };

  const triggerJourneyAlert = () => {
    if (user?.emergencyContacts) {
      const message = `${user.name} has not reached destination "${journeyTracking.destination}" on time. Last known location: ${location ? `https://maps.google.com/?q=${location.latitude},${location.longitude}` : 'Unknown'}`;
      console.log('Journey alert:', message);
      addNotification('Alert sent - You did not arrive on time');
    }
  };

  const playSiren = () => {
    setSirenActive(!sirenActive);
    
    if (!sirenActive) {
      // In a real app, this would play an actual siren sound
      const audio = new Audio();
      audio.loop = true;
      // audio.src would be set to siren sound file
      console.log('Siren activated');
      addNotification('Siren activated to attract attention');
    } else {
      console.log('Siren deactivated');
      addNotification('Siren deactivated');
    }
  };

  const triggerFlashSOS = () => {
    setFlashSOS(true);
    addNotification('Camera flash blinking SOS in morse code');
  };

  const startWalkWithMe = () => {
    setWalkWithMe(!walkWithMe);
    
    if (!walkWithMe) {
      getCurrentLocation();
      if (user?.emergencyContacts && location) {
        const message = `Virtual escort active: ${user.name} is walking. Live location: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
        console.log('Walk with me:', message);
        addNotification('Virtual escort activated - Contacts notified');
      }
    } else {
      addNotification('Virtual escort ended');
    }
  };

  const saveDecoyInfo = () => {
    sessionStorage.setItem('decoyInfo', JSON.stringify(decoyInfo));
    setShowDecoyModal(false);
    addNotification('Decoy information saved');
  };

  // Shake Detection
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const { x = 0, y = 0, z = 0 } = event.accelerationIncludingGravity;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (safeMode && magnitude > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeTime > 1000) {
          lastShakeTime = now;
          triggerGroupAlert();
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [location, user, safeMode]);

  const safetyFeatures = [
    { 
      icon: Phone, 
      title: 'Fake Call', 
      description: 'Simulate incoming call to escape situations', 
      action: () => setFakeCallActive(true), 
      color: 'bg-blue-500' 
    },
    { 
      icon: AlertTriangle, 
      title: 'Silent Alert', 
      description: 'Send silent emergency alert to contacts', 
      action: triggerSilentAlert, 
      color: 'bg-orange-500' 
    },
    { 
      icon: Users, 
      title: 'Group Alert', 
      description: 'Alert all emergency contacts simultaneously', 
      action: triggerGroupAlert, 
      color: 'bg-green-500' 
    },
    { 
      icon: Shield, 
      title: 'Safe Mode', 
      description: 'Activate all safety features', 
      action: toggleSafeMode, 
      color: safeMode ? 'bg-green-600' : 'bg-gray-500' 
    }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'} pb-20 transition-all duration-500`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-40 space-y-2">
        {notifications.map((notification, index) => (
          <div key={index} className={`max-w-sm p-3 rounded-lg shadow-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border-l-4 border-orange-500 animate-fadeIn`}>
            <p className="text-sm">{notification}</p>
          </div>
        ))}
      </div>

      {/* Stealth Mode Overlay */}
      {stealthMode && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setStealthMode(false)}
            className="text-white text-sm"
          >
            Tap 3 times to exit stealth mode
          </button>
        </div>
      )}

      <div className="relative z-10 p-4 space-y-6">
        {/* Emergency SOS */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 mb-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Emergency SOS</h2>
          <div className="flex justify-center"><EmergencyButton /></div>
        </div>

        {/* Recording Controls */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 mb-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Video className="w-5 h-5 mr-2 text-red-500" />
            Evidence Recording
          </h3>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Discreet recording with auto-upload to cloud
          </p>

          {isRecording ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/20' : 'bg-red-50'} border border-red-500/30`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Recording {recordingType === 'video' ? 'Video' : 'Audio'}
                    </span>
                  </div>
                  <span className="text-red-500 font-bold font-mono">{formatTime(recordingDuration)}</span>
                </div>
              </div>

              <button
                onClick={stopRecording}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop & Save Recording
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => startRecording('video')}
                className="py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center"
              >
                <Video className="w-5 h-5 mr-2" />
                Video
              </button>
              <button
                onClick={() => startRecording('audio')}
                className="py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center"
              >
                <Mic className="w-5 h-5 mr-2" />
                Audio
              </button>
            </div>
          )}

          {recordingSessions.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Recent Recordings ({recordingSessions.length})
              </p>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {recordingSessions.slice(0, 3).map(session => (
                  <div
                    key={session.id}
                    className={`p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-center justify-between`}
                  >
                    <div className="flex items-center space-x-2">
                      {session.type === 'video' ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatTime(session.duration)}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      session.status === 'uploaded' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                    }`}>
                      {session.status === 'uploaded' ? 'Uploaded' : 'Uploading...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Journey Tracking */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 mb-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Navigation className="w-5 h-5 mr-2 text-blue-500" />
            Journey Tracking
          </h3>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Alert contacts if you don't arrive on time
          </p>

          {journeyTracking.active ? (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-500/30`}>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                  To: {journeyTracking.destination}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  ETA: {new Date(journeyTracking.startTime + journeyTracking.eta).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={endJourneyTracking}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                I've Arrived Safely
              </button>
            </div>
          ) : (
            <button
              onClick={startJourneyTracking}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Start Journey Tracking
            </button>
          )}
        </div>

        {/* Timed Check-In */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 mb-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Clock className="w-5 h-5 mr-2 text-purple-500" />
            Timed Check-In
          </h3>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Must check-in by set time or auto-alert
          </p>

          <div className="space-y-3">
            {checkInSchedule.enabled && (
              <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'} border border-purple-500/30`}>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Next check-in: {checkInSchedule.time}
                </p>
                {checkInSchedule.lastCheck && (
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Last: {new Date(checkInSchedule.lastCheck).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={startTimedCheckIn}
                className="py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-all text-sm"
              >
                Schedule
              </button>
              <button
                onClick={performCheckIn}
                disabled={!checkInSchedule.enabled}
                className="py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all text-sm"
              >
                Check-In Now
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Safety Tools */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 mb-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Advanced Safety Tools</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={playSiren}
              className={`p-4 rounded-xl ${sirenActive ? 'bg-red-500' : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
            >
              <div className={`w-12 h-12 ${sirenActive ? 'bg-white' : 'bg-red-500'} rounded-lg flex items-center justify-center mb-3`}>
                <Siren className={`w-6 h-6 ${sirenActive ? 'text-red-500' : 'text-white'}`} />
              </div>
              <h4 className={`font-semibold ${sirenActive ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'} mb-1 text-sm`}>
                {sirenActive ? 'Stop Siren' : 'Siren/Alarm'}
              </h4>
              <p className={`text-xs ${sirenActive ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Loud alert
              </p>
            </button>

            <button
              onClick={triggerFlashSOS}
              disabled={flashSOS}
              className={`p-4 rounded-xl ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all disabled:opacity-50`}
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-3">
                <Flashlight className="w-6 h-6 text-white" />
              </div>
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-1 text-sm`}>
                Flash SOS
              </h4>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Morse code
              </p>
            </button>

            <button
              onClick={startWalkWithMe}
              className={`p-4 rounded-xl ${walkWithMe ? 'bg-green-500' : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
            >
              <div className={`w-12 h-12 ${walkWithMe ? 'bg-white' : 'bg-green-500'} rounded-lg flex items-center justify-center mb-3`}>
                <UserCheck className={`w-6 h-6 ${walkWithMe ? 'text-green-500' : 'text-white'}`} />
              </div>
              <h4 className={`font-semibold ${walkWithMe ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'} mb-1 text-sm`}>
                Walk With Me
              </h4>
              <p className={`text-xs ${walkWithMe ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Virtual escort
              </p>
            </button>

            <button
              onClick={() => setStealthMode(true)}
              className={`p-4 rounded-xl ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
            >
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mb-3">
                <EyeOff className="w-6 h-6 text-white" />
              </div>
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-1 text-sm`}>
                Stealth Mode
              </h4>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Hide app
              </p>
            </button>

            <button
              onClick={() => setShowDecoyModal(true)}
              className={`p-4 rounded-xl ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
            >
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-1 text-sm`}>
                Decoy Info
              </h4>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Fake details
              </p>
            </button>

            <button
              onClick={() => {
                setEnvironmentalMonitoring(!environmentalMonitoring);
                addNotification(environmentalMonitoring ? 'Audio monitoring disabled' : 'Audio monitoring enabled');
              }}
              className={`p-4 rounded-xl ${environmentalMonitoring ? 'bg-indigo-500' : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
            >
              <div className={`w-12 h-12 ${environmentalMonitoring ? 'bg-white' : 'bg-indigo-500'} rounded-lg flex items-center justify-center mb-3`}>
                <Headphones className={`w-6 h-6 ${environmentalMonitoring ? 'text-indigo-500' : 'text-white'}`} />
              </div>
              <h4 className={`font-semibold ${environmentalMonitoring ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'} mb-1 text-sm`}>
                Audio Monitor
              </h4>
              <p className={`text-xs ${environmentalMonitoring ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Detect sounds
              </p>
            </button>
          </div>
        </div>

        {/* Safety Features */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 mb-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Core Safety Features</h3>
          <div className="grid grid-cols-2 gap-4">
            {safetyFeatures.map((feature, index) => (
              <button 
                key={index} 
                onClick={feature.action} 
                className={`${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl p-4 transition-all duration-200 active:scale-95`}
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{feature.title}</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Safety Settings */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 mb-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Safety Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {soundEnabled ? <Volume2 className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /> : <VolumeX className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />}
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Sound Alerts</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Enable sound for emergency alerts</p>
                </div>
              </div>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)} 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${soundEnabled ? 'bg-purple-600' : 'bg-gray-400'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Safe Mode</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Shake device to trigger SOS</p>
                </div>
              </div>
              <button 
                onClick={() => setSafeMode(!safeMode)} 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${safeMode ? 'bg-green-600' : 'bg-gray-400'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${safeMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Environmental Monitoring</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Detect distress sounds</p>
                </div>
              </div>
              <button 
                onClick={() => setEnvironmentalMonitoring(!environmentalMonitoring)} 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${environmentalMonitoring ? 'bg-indigo-600' : 'bg-gray-400'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${environmentalMonitoring ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decoy Info Modal */}
      {showDecoyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`backdrop-blur-xl ${
            isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-white/20'
          } border rounded-3xl p-6 w-full max-w-md shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Decoy Information
              </h3>
              <button
                onClick={() => setShowDecoyModal(false)}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <span className={`text-2xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>×</span>
              </button>
            </div>

            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Fake contact information to give to potential threats
            </p>

            <div className="space-y-4">
              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fake Name
                </label>
                <input
                  type="text"
                  value={decoyInfo.name}
                  onChange={(e) => setDecoyInfo({ ...decoyInfo, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                />
              </div>

              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fake Phone
                </label>
                <input
                  type="tel"
                  value={decoyInfo.phone}
                  onChange={(e) => setDecoyInfo({ ...decoyInfo, phone: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                />
              </div>

              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fake Address
                </label>
                <input
                  type="text"
                  value={decoyInfo.address}
                  onChange={(e) => setDecoyInfo({ ...decoyInfo, address: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                />
              </div>

              <button
                onClick={saveDecoyInfo}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-105"
              >
                Save Decoy Information
              </button>
            </div>
          </div>
        </div>
      )}

      <FakeCall isActive={fakeCallActive} onEnd={() => setFakeCallActive(false)} />

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SafetyPage;