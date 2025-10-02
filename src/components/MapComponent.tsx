import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet icons in production/Android builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  latitude: number;
  longitude: number;
  darkMode?: boolean;
  className?: string;
}

const MapComponent: React.FC<MapProps> = ({ 
  latitude, 
  longitude, 
  darkMode = false, 
  className = '' 
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string>('');
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMapReady(true);
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const isValidCoordinate = (lat: number, lng: number) => {
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  };

  if (!mapReady) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${darkMode ? 'bg-gray-700' : ''} ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading map...</p>
        </div>
      </div>
    );
  }

  if (!isValidCoordinate(latitude, longitude)) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${darkMode ? 'bg-gray-700' : ''} ${className}`}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.767 0L3.047 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Invalid coordinates: {latitude}, {longitude}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`${className} relative z-0`}
      style={{ 
        height: '100%', 
        width: '100%',
        minHeight: '200px'
      }}
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ 
          height: '100%', 
          width: '100%',
          minHeight: '200px',
          borderRadius: '0.5rem'
        }}
        whenCreated={(map) => {
          mapRef.current = map;
          // Force a resize after a short delay to ensure proper rendering
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }}
      >
        <TileLayer
          url={darkMode ? 
            'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          attribution={
            darkMode 
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
          maxZoom={19}
          detectRetina={true}
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-center">
              <strong>Your Current Location</strong>
              <br />
              <small>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </small>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;