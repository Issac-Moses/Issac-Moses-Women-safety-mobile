import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Phone, 
  AlertTriangle, 
  Users, 
  Volume2, 
  VolumeX,
  Video,
  Mic,
  Clock,
  Navigation,
  Siren,
  Flashlight,
  UserCheck,
  FileText,
  Headphones,
  Activity,
  EyeOff,
  CheckCircle,
  XCircle,
  X,
  Square,
  Play
} from 'lucide-react';

// Import your actual contexts
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import useLocation from '../hooks/useLocation';

const EmergencyButton = ({ onPress }) => {
  const [pressed, setPressed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const handlePress = () => {
    setPressed(true);
    setCountdown(3);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPressed(false);
          onPress();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <button 
      onClick={handlePress}
      disabled={pressed}
      className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold shadow-2xl transition-all ${
        pressed ? 'bg-orange-600 scale-110' : 'bg-red-600 hover:bg-red-700 active:scale-95'
      }`}
    >
      <div className="text-center">
        {pressed ? (
          <>
            <div className="text-4xl font-bold mb-1">{countdown}</div>
            <span className="text-xs">Triggering...</span>
          </>
        ) : (
          <>
            <Shield className="w-12 h-12 mx-auto mb-2" />
            <span className="text-sm">SOS</span>
          </>
        )}
      </div>
    </button>
  );
};

const FakeCall = ({ isActive, onEnd }) => {
  if (!isActive) return null;
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8">
      <div className="text-center text-white mb-12">
        <div className="w-32 h-32 bg-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Phone className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Mom calling...</h2>
        <p className="text-gray-400">Mobile</p>
      </div>
      <div className="flex space-x-6">
        <button onClick={onEnd} className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
          <XCircle className="w-10 h-10 text-white" />
        </button>
        <button onClick={onEnd} className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </button>
      </div>
    </div>
  );
};

const SafetyPage = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { location, getCurrentLocation } = useLocation();
  
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [safeMode, setSafeMode] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState('video');
  const [recordingSessions, setRecordingSessions] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Journey tracking state
  const [journeyTracking, setJourneyTracking] = useState({
    active: false,
    destination: '',
    eta: 0,
    startTime: 0
  });
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [journeyForm, setJourneyForm] = useState({ destination: '', minutes: '30' });

  // Check-in state
  const [checkInSchedule, setCheckInSchedule] = useState({
    enabled: false,
    time: '12:00',
    lastCheck: null,
    contacts: []
  });
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInHours, setCheckInHours] = useState('2');

  // Other features
  const [sirenActive, setSirenActive] = useState(false);
  const [flashSOS, setFlashSOS] = useState(false);
  const [walkWithMe, setWalkWithMe] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [environmentalMonitoring, setEnvironmentalMonitoring] = useState(false);
  
  // Decoy info
  const [decoyInfo, setDecoyInfo] = useState({
    name: 'Sarah Johnson',
    phone: '+91 98765 43210',
    address: '123 Main Street'
  });
  const [showDecoyModal, setShowDecoyModal] = useState(false);

  const recordingInterval = useRef(null);

  const SHAKE_THRESHOLD = 10;
  const lastShakeTime = useRef(0);

  // Shake Detection for Safe Mode
  useEffect(() => {
    if (!safeMode) return;

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const { x = 0, y = 0, z = 0 } = acc;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeTime.current > 1000) {
          lastShakeTime.current = now;
          addNotification('🚨 Shake detected! Triggering Emergency SOS...');
          handleEmergencySOS();
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [safeMode, location, user]);

  useEffect(() => {
    const savedSessions = sessionStorage.getItem('recordingSessions');
    if (savedSessions) setRecordingSessions(JSON.parse(savedSessions));

    const savedJourney = sessionStorage.getItem('journeyTracking');
    if (savedJourney) setJourneyTracking(JSON.parse(savedJourney));

    const savedCheckIn = sessionStorage.getItem('checkInSchedule');
    if (savedCheckIn) setCheckInSchedule(JSON.parse(savedCheckIn));

    const savedDecoy = sessionStorage.getItem('decoyInfo');
    if (savedDecoy) setDecoyInfo(JSON.parse(savedDecoy));
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      setRecordingDuration(0);
    }
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, [isRecording]);

  const addNotification = (message) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  // Emergency SOS Handler - Calls police and shares location on WhatsApp
  const handleEmergencySOS = async () => {
    if (!user?.emergencyContacts || user.emergencyContacts.length === 0) {
      addNotification('⚠️ No emergency contacts found!');
      return;
    }

    try {
      // Get current location
      await getCurrentLocation();
      
      addNotification('🚨 EMERGENCY SOS ACTIVATED!');
      
      // Call police immediately
      window.location.href = 'tel:100';
      
      // Wait a moment then share location on WhatsApp to all emergency contacts
      setTimeout(() => {
        const locationUrl = location
          ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
          : 'Location unavailable';

        const emergencyMessage = `🚨 EMERGENCY ALERT! ${user.name} needs immediate help!\n\nLocation: ${locationUrl}\n\nTime: ${new Date().toLocaleString()}\n\nThis is an automated emergency message.`;

        // Share to each emergency contact via WhatsApp
        user.emergencyContacts.forEach((contact, index) => {
          setTimeout(() => {
            // Format phone number for WhatsApp (remove spaces, dashes, and add country code if needed)
            let whatsappNumber = contact.phone.replace(/[\s\-\(\)]/g, '');
            if (!whatsappNumber.startsWith('+')) {
              whatsappNumber = '+91' + whatsappNumber; // Default to India code
            }
            
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(emergencyMessage)}`;
            
            // Open WhatsApp in a new window/tab
            window.open(whatsappUrl, '_blank');
          }, index * 1000); // Stagger by 1 second to avoid browser blocking
        });

        addNotification(`📱 WhatsApp alerts sent to ${user.emergencyContacts.length} contacts`);
      }, 2000);

    } catch (error) {
      console.error('Emergency SOS error:', error);
      addNotification('Error triggering emergency alert');
    }
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
    
    setTimeout(() => {
      const locationUrl = location
        ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
        : 'Location unavailable';

      const message = `EMERGENCY ALERT from ${user.name}! I need help. My location: ${locationUrl}`;

      // Send WhatsApp messages
      user.emergencyContacts.forEach((contact, index) => {
        setTimeout(() => {
          let whatsappNumber = contact.phone.replace(/[\s\-\(\)]/g, '');
          if (!whatsappNumber.startsWith('+')) {
            whatsappNumber = '+91' + whatsappNumber;
          }
          
          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }, index * 1000);
      });

      addNotification(`Group alert sent via WhatsApp to ${user.emergencyContacts.length} contacts`);
    }, 1000);
  };

  const toggleSafeMode = () => {
    const newSafeModeState = !safeMode;
    setSafeMode(newSafeModeState);
    
    if (newSafeModeState) {
      getCurrentLocation();
      
      // Request motion permission for iOS 13+
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              addNotification('Safe Mode ON - Shake phone to trigger SOS');
            } else {
              addNotification('Safe Mode ON - Motion permission denied');
            }
          })
          .catch(() => {
            addNotification('Safe Mode ON - Shake to trigger SOS');
          });
      } else {
        addNotification('Safe Mode ON - Shake phone to trigger SOS');
      }
    } else {
      addNotification('Safe Mode deactivated');
    }
  };

  const startRecording = (type) => {
    setRecordingType(type);
    setIsRecording(true);
    setRecordingDuration(0);
    addNotification(`${type === 'video' ? 'Video' : 'Audio'} recording started`);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    const session = {
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
    
    setTimeout(() => {
      const uploadedSessions = updated.map(s => 
        s.id === session.id ? { ...s, status: 'uploaded' } : s
      );
      setRecordingSessions(uploadedSessions);
      sessionStorage.setItem('recordingSessions', JSON.stringify(uploadedSessions));
      addNotification('Recording uploaded to cloud');
    }, 2000);
  };

  const handleStartJourney = () => {
    if (!journeyForm.destination.trim()) {
      addNotification('Please enter a destination');
      return;
    }

    const minutes = parseInt(journeyForm.minutes) || 30;
    const journey = {
      active: true,
      destination: journeyForm.destination,
      eta: minutes * 60 * 1000,
      startTime: Date.now()
    };

    setJourneyTracking(journey);
    sessionStorage.setItem('journeyTracking', JSON.stringify(journey));
    setShowJourneyModal(false);
    setJourneyForm({ destination: '', minutes: '30' });
    
    getCurrentLocation();
    if (location && user?.emergencyContacts) {
      const message = `I'm traveling to ${journey.destination}. Expected arrival: ${new Date(Date.now() + journey.eta).toLocaleTimeString()}. Track me at: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      console.log('Journey shared:', message);
    }
    
    addNotification(`Journey tracking started to ${journey.destination}`);
  };

  const endJourneyTracking = () => {
    const journey = {
      active: false,
      destination: '',
      eta: 0,
      startTime: 0
    };
    setJourneyTracking(journey);
    sessionStorage.setItem('journeyTracking', JSON.stringify(journey));
    addNotification('Journey completed safely');
  };

  const handleScheduleCheckIn = () => {
    const hours = parseInt(checkInHours) || 2;
    const now = new Date();
    const checkTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    const updated = {
      ...checkInSchedule,
      enabled: true,
      time: `${checkTime.getHours()}:${String(checkTime.getMinutes()).padStart(2, '0')}`,
      contacts: user?.emergencyContacts?.map(c => c.name) || []
    };
    
    setCheckInSchedule(updated);
    sessionStorage.setItem('checkInSchedule', JSON.stringify(updated));
    setShowCheckInModal(false);
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

  const playSiren = () => {
    setSirenActive(!sirenActive);
    if (!sirenActive) {
      addNotification('Siren activated to attract attention');
    } else {
      addNotification('Siren deactivated');
    }
  };

  const triggerFlashSOS = () => {
    setFlashSOS(true);
    addNotification('Camera flash blinking SOS in morse code');
    setTimeout(() => setFlashSOS(false), 3000);
  };

  const startWalkWithMe = () => {
    setWalkWithMe(!walkWithMe);
    
    if (!walkWithMe) {
      getCurrentLocation();
      if (user?.emergencyContacts && location) {
        const message = `🚶‍♀️ Virtual escort active: ${user.name} is walking.\n\nLive location: https://maps.google.com/?q=${location.latitude},${location.longitude}\n\nStarted at: ${new Date().toLocaleString()}`;
        
        user.emergencyContacts.forEach((contact, index) => {
          setTimeout(() => {
            let whatsappNumber = contact.phone.replace(/[\s\-\(\)]/g, '');
            if (!whatsappNumber.startsWith('+')) {
              whatsappNumber = '+91' + whatsappNumber;
            }
            
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          }, index * 1000);
        });
        
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const safetyFeatures = [
    { 
      icon: Phone, 
      title: 'Fake Call', 
      description: 'Simulate incoming call', 
      action: () => setFakeCallActive(true), 
      color: 'bg-blue-500' 
    },
    { 
      icon: AlertTriangle, 
      title: 'Silent Alert', 
      description: 'Send silent emergency alert', 
      action: triggerSilentAlert, 
      color: 'bg-orange-500' 
    },
    { 
      icon: Users, 
      title: 'Group Alert', 
      description: 'Alert all contacts', 
      action: triggerGroupAlert, 
      color: 'bg-green-500' 
    },
    { 
      icon: Shield, 
      title: 'Safe Mode', 
      description: 'Activate all features', 
      action: toggleSafeMode, 
      color: safeMode ? 'bg-green-600' : 'bg-gray-500' 
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'} pb-20 transition-all duration-500`}>
      {/* Notifications */}
      <div className="fixed top-20 right-4 z-40 space-y-2 max-w-sm">
        {notifications.map((notification, index) => (
          <div key={index} className={`p-3 rounded-lg shadow-lg ${isDark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'} border-l-4 border-orange-500 animate-fadeIn`}>
            <p className="text-sm">{notification}</p>
          </div>
        ))}
      </div>

      {/* Stealth Mode */}
      {stealthMode && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={() => setStealthMode(false)}>
          <p className="text-white text-sm">Tap anywhere to exit stealth mode</p>
        </div>
      )}

      <div className="relative z-10 p-4 space-y-6">
        {/* Emergency SOS */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Emergency SOS</h2>
          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Press and hold to call police (100) and alert contacts via WhatsApp
            </p>
            <div className="flex justify-center">
              <EmergencyButton onPress={handleEmergencySOS} />
            </div>
          </div>
        </div>

        {/* Recording Controls */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Video className="w-5 h-5 mr-2 text-red-500" />
            Evidence Recording
          </h3>

          {isRecording ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/20' : 'bg-red-50'} border border-red-500/30`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Recording {recordingType === 'video' ? 'Video' : 'Audio'}
                    </span>
                  </div>
                  <span className="text-red-500 font-bold font-mono">{formatTime(recordingDuration)}</span>
                </div>
              </div>
              <button onClick={stopRecording} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center">
                <Square className="w-5 h-5 mr-2" />
                Stop & Save
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => startRecording('video')} className="py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center">
                <Video className="w-5 h-5 mr-2" />
                Video
              </button>
              <button onClick={() => startRecording('audio')} className="py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center">
                <Mic className="w-5 h-5 mr-2" />
                Audio
              </button>
            </div>
          )}

          {recordingSessions.length > 0 && (
            <div className="mt-4">
              <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Recent ({recordingSessions.length})
              </p>
              <div className="space-y-2">
                {recordingSessions.slice(0, 3).map(session => (
                  <div key={session.id} className={`p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} flex justify-between`}>
                    <span className="text-xs">{formatTime(session.duration)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${session.status === 'uploaded' ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                      {session.status === 'uploaded' ? 'Uploaded' : 'Uploading'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Journey Tracking */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Navigation className="w-5 h-5 mr-2 text-blue-500" />
            Journey Tracking
          </h3>

          {journeyTracking.active ? (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-500/30`}>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  To: {journeyTracking.destination}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  ETA: {new Date(journeyTracking.startTime + journeyTracking.eta).toLocaleTimeString()}
                </p>
              </div>
              <button onClick={endJourneyTracking} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                I've Arrived Safely
              </button>
            </div>
          ) : (
            <button onClick={() => setShowJourneyModal(true)} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center">
              <Navigation className="w-5 h-5 mr-2" />
              Start Journey Tracking
            </button>
          )}
        </div>

        {/* Timed Check-In */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Clock className="w-5 h-5 mr-2 text-purple-500" />
            Timed Check-In
          </h3>

          {checkInSchedule.enabled && (
            <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'} border border-purple-500/30 mb-3`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Next: {checkInSchedule.time}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShowCheckInModal(true)} className="py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold">
              Schedule
            </button>
            <button onClick={performCheckIn} disabled={!checkInSchedule.enabled} className="py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl font-semibold">
              Check-In Now
            </button>
          </div>
        </div>

        {/* Advanced Tools */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Advanced Tools</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button onClick={playSiren} className={`p-4 rounded-xl ${sirenActive ? 'bg-red-500' : isDark ? 'bg-gray-700' : 'bg-gray-100'} transition-all`}>
              <Siren className={`w-6 h-6 ${sirenActive ? 'text-white' : 'text-red-500'} mb-2`} />
              <p className={`text-sm font-semibold ${sirenActive ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>
                {sirenActive ? 'Stop' : 'Siren'}
              </p>
            </button>

            <button onClick={triggerFlashSOS} disabled={flashSOS} className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'} disabled:opacity-50`}>
              <Flashlight className="w-6 h-6 text-yellow-500 mb-2" />
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Flash SOS</p>
            </button>

            <button onClick={startWalkWithMe} className={`p-4 rounded-xl ${walkWithMe ? 'bg-green-500' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <UserCheck className={`w-6 h-6 ${walkWithMe ? 'text-white' : 'text-green-500'} mb-2`} />
              <p className={`text-sm font-semibold ${walkWithMe ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>Walk With Me</p>
            </button>

            <button onClick={() => setStealthMode(true)} className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <EyeOff className="w-6 h-6 text-gray-600 mb-2" />
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Stealth</p>
            </button>

            <button onClick={() => setShowDecoyModal(true)} className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <FileText className="w-6 h-6 text-orange-500 mb-2" />
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Decoy Info</p>
            </button>

            <button onClick={() => { setEnvironmentalMonitoring(!environmentalMonitoring); addNotification(environmentalMonitoring ? 'Monitoring off' : 'Monitoring on'); }} className={`p-4 rounded-xl ${environmentalMonitoring ? 'bg-indigo-500' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Headphones className={`w-6 h-6 ${environmentalMonitoring ? 'text-white' : 'text-indigo-500'} mb-2`} />
              <p className={`text-sm font-semibold ${environmentalMonitoring ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>Audio Monitor</p>
            </button>
          </div>
        </div>

        {/* Core Features */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Core Safety Features</h3>
          <div className="grid grid-cols-2 gap-4">
            {safetyFeatures.map((feature, index) => (
              <button key={index} onClick={feature.action} className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl p-4 active:scale-95 transition-all`}>
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{feature.title}</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className={isDark ? 'text-white' : 'text-gray-900'}>Sound Alerts</span>
              </div>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full ${soundEnabled ? 'bg-purple-600' : 'bg-gray-400'}`}>
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5" />
                <span className={isDark ? 'text-white' : 'text-gray-900'}>Safe Mode</span>
              </div>
              <button onClick={toggleSafeMode} className={`relative inline-flex h-6 w-11 items-center rounded-full ${safeMode ? 'bg-green-600' : 'bg-gray-400'}`}>
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${safeMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Modal */}
      {showJourneyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 w-full max-w-md shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Start Journey Tracking
              </h3>
              <button onClick={() => setShowJourneyModal(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Destination
                </label>
                <input
                  type="text"
                  value={journeyForm.destination}
                  onChange={(e) => setJourneyForm({ ...journeyForm, destination: e.target.value })}
                  placeholder="e.g., Home, Office, Friend's place"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                />
              </div>

              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Expected Journey Time (minutes)
                </label>
                <input
                  type="number"
                  value={journeyForm.minutes}
                  onChange={(e) => setJourneyForm({ ...journeyForm, minutes: e.target.value })}
                  placeholder="30"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                />
              </div>

              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Your emergency contacts will be alerted if you don't arrive on time.
              </p>

              <button
                onClick={handleStartJourney}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold shadow-lg"
              >
                Start Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 w-full max-w-md shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Schedule Check-In
              </h3>
              <button onClick={() => setShowCheckInModal(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Check-in required in how many hours?
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {['1', '2', '3', '4', '6', '8'].map((hour) => (
                    <button
                      key={hour}
                      onClick={() => setCheckInHours(hour)}
                      className={`py-3 rounded-xl font-bold transition-all ${
                        checkInHours === hour
                          ? 'bg-purple-500 text-white'
                          : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {hour}h
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={checkInHours}
                  onChange={(e) => setCheckInHours(e.target.value)}
                  placeholder="Custom hours"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                />
              </div>

              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                You'll be reminded to check-in. Emergency contacts will be alerted if you miss it.
              </p>

              <button
                onClick={handleScheduleCheckIn}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg"
              >
                Schedule Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decoy Info Modal */}
      {showDecoyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 w-full max-w-md shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Decoy Information
              </h3>
              <button onClick={() => setShowDecoyModal(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
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
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
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
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
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
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                />
              </div>

              <button
                onClick={saveDecoyInfo}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold shadow-lg"
              >
                Save Decoy Information
              </button>
            </div>
          </div>
        </div>
      )}

      <FakeCall isActive={fakeCallActive} onEnd={() => setFakeCallActive(false)} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SafetyPage
