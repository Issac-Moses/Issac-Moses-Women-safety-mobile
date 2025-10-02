// src/hooks/useLocation.ts
import { useState, useEffect, useCallback } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface UseLocationReturn {
  location: Location | null;
  error: string | null;
  loading: boolean;
  getCurrentLocation: () => Promise<void>;
}

const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
      setLocation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    location,
    error,
    loading,
    getCurrentLocation
  };
};

export default useLocation;