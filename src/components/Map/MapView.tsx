import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RelayPoint, Vendor, Location } from '../../types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  center: Location;
  relayPoints?: RelayPoint[];
  vendors?: Vendor[];
  userLocation?: Location;
  onRelayPointClick?: (relayPoint: RelayPoint) => void;
  onVendorClick?: (vendor: Vendor) => void;
  zoom?: number;
  className?: string;
}

function MapController({ center }: { center: Location }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.latitude, center.longitude]);
  }, [center, map]);

  return null;
}

const relayPointIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const vendorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448653.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export function MapView({
  center,
  relayPoints = [],
  vendors = [],
  userLocation,
  onRelayPointClick,
  onVendorClick,
  zoom = 13,
  className = 'h-96 w-full rounded-lg',
}: MapViewProps) {
  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={zoom}
      className={className}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} />

      {userLocation && (
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={userIcon}
        >
          <Popup>
            <div className="text-center">
              <p className="font-semibold">Votre position</p>
              {userLocation.address && <p className="text-sm">{userLocation.address}</p>}
            </div>
          </Popup>
        </Marker>
      )}

      {relayPoints.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          icon={relayPointIcon}
          eventHandlers={{
            click: () => onRelayPointClick?.(point),
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-lg mb-1">{point.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{point.address}</p>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium">{point.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({point.total_pickups} retraits)</span>
              </div>

              {point.storage_capacities && point.storage_capacities.length > 0 && (
                <div className="text-xs space-y-1 mb-2">
                  {point.storage_capacities.map((cap) => (
                    <div key={cap.id} className="flex justify-between">
                      <span className="capitalize">{cap.storage_type}:</span>
                      <span className="font-medium">
                        {cap.total_capacity - cap.current_usage}/{cap.total_capacity}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 text-xs">
                {point.parking_available && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">🅿️ Parking</span>
                )}
                {point.pmr_accessible && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">♿ PMR</span>
                )}
              </div>

              {point.distance && (
                <p className="text-sm text-gray-600 mt-2">
                  📍 {point.distance.toFixed(1)} km
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {vendors.map((vendor) => (
        <Marker
          key={vendor.id}
          position={[vendor.latitude || 0, vendor.longitude || 0]}
          icon={vendorIcon}
          eventHandlers={{
            click: () => onVendorClick?.(vendor),
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-lg mb-1">{vendor.business_name}</h3>
              <p className="text-xs text-gray-500 mb-1 capitalize">{vendor.business_type}</p>
              <p className="text-sm text-gray-600 mb-2">{vendor.address}</p>
              {vendor.description && (
                <p className="text-sm">{vendor.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
