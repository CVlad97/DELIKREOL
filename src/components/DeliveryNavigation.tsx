import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, AlertCircle } from 'lucide-react';

interface DeliveryNavigationProps {
  destination: {
    address: string;
    lat?: number;
    lng?: number;
  };
  origin?: {
    lat: number;
    lng: number;
  };
  driverName?: string;
}

export const DeliveryNavigation: React.FC<DeliveryNavigationProps> = ({
  destination,
  origin,
  driverName = 'Livreur'
}) => {
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Géolocalisation en temps réel
  useEffect(() => {
    if (!isTracking) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation(position);
        setLocationError(null);
      },
      (error) => {
        setLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking]);

  // Gérer l'activation du tracking
  const handleStartTracking = () => {
    if ('geolocation' in navigator) {
      setIsTracking(true);
    } else {
      setLocationError('Géolocalisation non supportée par votre navigateur');
    }
  };

  // Générer URL Waze
  const getWazeUrl = () => {
    if (destination.lat && destination.lng) {
      return `https://waze.com/ul?ll=${destination.lat},${destination.lng}&navigate=yes&z=10`;
    }
    // Fallback sur adresse texte
    return `https://waze.com/ul?q=${encodeURIComponent(destination.address)}&navigate=yes`;
  };

  // Générer URL Google Maps
  const getGoogleMapsUrl = () => {
    const dest = destination.lat && destination.lng
      ? `${destination.lat},${destination.lng}`
      : encodeURIComponent(destination.address);
    
    if (currentLocation) {
      const orig = `${currentLocation.coords.latitude},${currentLocation.coords.longitude}`;
      return `https://www.google.com/maps/dir/?api=1&origin=${orig}&destination=${dest}&travelmode=driving`;
    }
    
    return `https://www.google.com/maps/search/?api=1&query=${dest}`;
  };

  // Calculer distance approximative
  const calculateDistance = (): number | null => {
    if (!currentLocation || !destination.lat || !destination.lng) return null;

    const R = 6371; // Rayon de la Terre en km
    const dLat = ((destination.lat - currentLocation.coords.latitude) * Math.PI) / 180;
    const dLon = ((destination.lng - currentLocation.coords.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((currentLocation.coords.latitude * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = calculateDistance();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          Navigation {driverName}
        </h3>
        {distance && (
          <span className="text-sm text-gray-600">
            ~{distance.toFixed(1)} km
          </span>
        )}
      </div>

      {/* Destination */}
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
        <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-700">Destination</p>
          <p className="text-sm text-gray-600">{destination.address}</p>
          {destination.lat && destination.lng && (
            <p className="text-xs text-gray-500 mt-1">
              {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
            </p>
          )}
        </div>
      </div>

      {/* Position actuelle */}
      {currentLocation && (
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
          <Navigation className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Position actuelle</p>
            <p className="text-xs text-gray-600">
              {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Précision: {currentLocation.coords.accuracy.toFixed(0)}m
            </p>
          </div>
        </div>
      )}

      {/* Erreur géolocalisation */}
      {locationError && (
        <div className="flex items-start gap-3 p-3 bg-red-50 rounded-md">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">Erreur de géolocalisation</p>
            <p className="text-xs text-red-600">{locationError}</p>
          </div>
        </div>
      )}

      {/* Boutons de tracking */}
      {!isTracking && !currentLocation && (
        <button
          onClick={handleStartTracking}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Activer la géolocalisation
        </button>
      )}

      {/* Boutons navigation */}
      <div className="grid grid-cols-2 gap-3">
        {/* Waze */}
        <a
          href={getWazeUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-4 bg-[#33CCFF] text-white rounded-md hover:bg-[#00B8FF] transition-colors font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Waze
        </a>

        {/* Google Maps */}
        <a
          href={getGoogleMapsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Google Maps
        </a>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t">
        Cliquez sur l'application de votre choix pour démarrer la navigation en temps réel
      </div>
    </div>
  );
};

export default DeliveryNavigation;
