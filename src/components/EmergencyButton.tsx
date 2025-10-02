import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, MapPin, Phone, Headphones } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useLocation from '../hooks/useLocation';
import { useTheme } from '../contexts/ThemeContext';
import { HeadsetButton } from '../plugins/headsetButton';

const EmergencyButton: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { location, getCurrentLocation } = useLocation();

  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [headsetConnected, setHeadsetConnected] = useState(false);
  const countdownRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Call police number (100)
  const callPolice = () => {
    try {
      window.open('tel:100');
      addNotification('Calling police (100)...');
    } catch {
      addNotification('Failed to call police. Please dial 100 manually.');
    }
  };

  // Add notification helper
  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 5));
  };

  // Send emergency alerts to contacts
  const sendEmergencyAlerts = async () => {
    try { 
      await getCurrentLocation();
      
      if (user?.emergencyContacts?.length) {
        const locationUrl = location 
          ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
          : 'Location unavailable';
        
        const message = `EMERGENCY: ${user.name} needs help! Location: ${locationUrl}`;
        
        user.emergencyContacts.forEach(contact => {
          console.log(`Alerting ${contact.name} at ${contact.phone}: ${message}`);
          // Here you would actually send the alert (SMS/API call/etc)
        });
        
        addNotification(`Alerted ${user.emergencyContacts.length} contacts`);
      }
    } catch (e) {
      console.error('Error getting location:', e);
      addNotification('Error getting location');
    }
  };

  // Trigger emergency sequence
  const triggerEmergency = async () => {
    if (countdownRef.current > 0) return;
    
    setIsActivated(true);
    setCountdown(5);
    countdownRef.current = 5;
    addNotification('Emergency sequence initiated!');

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          countdownRef.current = 0;
          setIsActivated(false);
          
          // 1. Call police
          callPolice();
          
          // 2. Notify emergency contacts
          sendEmergencyAlerts();
          
          return 0;
        }
        countdownRef.current = prev - 1;
        return prev - 1;
      });
    }, 1000);
  };

  const cancelEmergency = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(0);
    countdownRef.current = 0;
    setIsActivated(false);
    addNotification('Emergency cancelled');
  };

  // Headset button listener
  useEffect(() => {
    let listener: { remove: () => void } | null = null;

    const setupListener = async () => {
      try {
        // Start the headset button service
        await HeadsetButton.start();
        
        // Add listener for button presses
        listener = await HeadsetButton.addListener('headsetButtonPress', (data: { keyCode: number }) => {
          // Common key codes for play/pause buttons across devices
          const emergencyButtons = [79, 85, 127, 87, 88];
          if (emergencyButtons.includes(data.keyCode)) {
            addNotification('Headset button pressed - triggering emergency');
            triggerEmergency();
          }
        });

        // Check if headset is connected
        if (navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasHeadset = devices.some(device => 
            device.kind === 'audioinput' && 
            (device.label.toLowerCase().includes('headset') ||
             device.label.toLowerCase().includes('bluetooth'))
          );
          setHeadsetConnected(hasHeadset);
        }
      } catch (error) {
        console.error('HeadsetButton error:', error);
        addNotification('Headset service error - using button only');
      }
    };

    setupListener();
    return () => {
      if (listener) {
        listener.remove();
      }
      HeadsetButton.stop().catch(console.error);
    };
  }, []);

  // Media key fallback for browsers (development/testing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['MediaPlayPause', 'MediaTrackNext', 'MediaTrackPrevious'].includes(e.code)) {
        e.preventDefault();
        addNotification('Media key pressed - triggering emergency');
        triggerEmergency();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className={`w-full max-w-md p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <div className="mx-auto p-4 rounded-full bg-red-600/10 inline-flex">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className={`mt-3 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Emergency SOS
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {headsetConnected 
              ? 'Press headset button or tap below to trigger' 
              : 'Press button below to trigger'}
          </p>
          
          {headsetConnected && (
            <div className="flex items-center justify-center mt-2">
              <Headphones className="w-4 h-4 mr-1" />
              <span className="text-xs text-green-600">Headset connected</span>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={triggerEmergency}
            disabled={countdown > 0}
            className={`px-6 py-3 rounded-full text-white ${
              countdown > 0 ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
            } transition-colors shadow-lg`}
          >
            {countdown > 0 ? `Calling police in ${countdown}...` : 'Trigger Emergency'}
          </button>
        </div>

        {countdown > 0 && (
          <button 
            onClick={cancelEmergency}
            className="text-sm text-blue-500 hover:text-blue-600 underline"
          >
            Cancel Emergency
          </button>
        )}

        {location && (
          <div className={`w-full p-3 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <div>
                <div className="text-xs">Location</div>
                <div className="text-sm font-medium">
                  {location?.latitude?.toFixed(4) || 'N/A'}, {location?.longitude?.toFixed(4) || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="w-full mt-3 space-y-1">
            {notifications.map((n, i) => (
              <div 
                key={i} 
                className={`text-xs p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                {n}
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t w-full text-center">
          <button
            onClick={callPolice}
            className={`flex items-center justify-center w-full py-2 rounded-lg ${
              isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/40' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call Police (100) Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyButton;