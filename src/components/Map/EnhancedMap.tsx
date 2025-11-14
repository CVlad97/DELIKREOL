import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { supabase } from "../../lib/supabase";
import { deliveryZones } from "../../data/deliveryZones";

interface RelayPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  is_active: boolean;
  opening_hours?: any;
}

interface Driver {
  id: string;
  user_id: string;
  is_available: boolean;
  current_latitude: number | null;
  current_longitude: number | null;
}

interface EnhancedMapProps {
  filter?: 'all' | 'open' | 'available' | 'closed';
  showDrivers?: boolean;
  showZones?: boolean;
  center?: [number, number];
  zoom?: number;
}

const relayIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35]
});

const relayClosedIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3585/3585896.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35]
});

const driverIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048313.png",
  iconSize: [35, 35],
  iconAnchor: [18, 35],
  popupAnchor: [0, -35]
});

const userIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35]
});

export default function EnhancedMap({
  filter = 'all',
  showDrivers = true,
  showZones = true,
  center = [14.6104, -61.0733],
  zoom = 12
}: EnhancedMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polygonsRef = useRef<L.Polygon[]>([]);
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  async function loadRelayPoints() {
    const { data, error } = await supabase
      .from("relay_points")
      .select("*");

    if (!error && data) {
      setRelayPoints(data);
    }
  }

  async function loadDrivers() {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("is_available", true)
      .not("current_latitude", "is", null)
      .not("current_longitude", "is", null);

    if (!error && data) {
      setDrivers(data);
    }
  }

  function clearMarkers() {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  }

  function clearPolygons() {
    polygonsRef.current.forEach(polygon => polygon.remove());
    polygonsRef.current = [];
  }

  function isRelayPointOpen(openingHours: any): boolean {
    if (!openingHours) return true;

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const currentHour = now.getHours();

    const daySchedule = openingHours[currentDay];
    if (!daySchedule || !daySchedule.open || !daySchedule.close) return false;

    const openHour = parseInt(daySchedule.open.split(':')[0]);
    const closeHour = parseInt(daySchedule.close.split(':')[0]);

    return currentHour >= openHour && currentHour < closeHour;
  }

  function filterRelayPoints(points: RelayPoint[]): RelayPoint[] {
    switch (filter) {
      case 'open':
        return points.filter(p => p.is_active && isRelayPointOpen(p.opening_hours));
      case 'available':
        return points.filter(p => p.is_active && p.capacity > 0);
      case 'closed':
        return points.filter(p => !p.is_active || !isRelayPointOpen(p.opening_hours));
      default:
        return points;
    }
  }

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("enhanced-map", {
        center,
        zoom
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapRef.current);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const marker = L.marker([latitude, longitude], { icon: userIcon })
              .addTo(mapRef.current!)
              .bindPopup("<strong>📍 Vous êtes ici</strong>");

            markersRef.current.push(marker);
            mapRef.current!.setView([latitude, longitude], 14);
          },
          (error) => {
            console.log("Géolocalisation non disponible:", error);
          }
        );
      }
    }

    loadRelayPoints();
    if (showDrivers) {
      loadDrivers();
    }

    const interval = setInterval(() => {
      if (showDrivers) {
        loadDrivers();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    clearMarkers();
    clearPolygons();

    if (showZones) {
      deliveryZones.forEach((zone) => {
        const polygon = L.polygon(zone.polygon, {
          color: zone.color,
          weight: 2,
          fillOpacity: 0.1
        })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${zone.name}</h3>
              <p style="margin: 4px 0;"><strong>Frais de livraison :</strong> ${zone.baseDeliveryFee.toFixed(2)}€</p>
              <p style="margin: 4px 0;"><strong>Temps estimé :</strong> ${zone.estimatedTime} min</p>
            </div>
          `);

        polygonsRef.current.push(polygon);
      });
    }

    const filteredPoints = filterRelayPoints(relayPoints);

    filteredPoints.forEach((point) => {
      const isOpen = isRelayPointOpen(point.opening_hours);
      const statusColor = point.is_active && isOpen ? "green" :
                          point.capacity === 0 ? "orange" : "red";
      const statusText = point.is_active && isOpen ? "Ouvert" :
                        point.capacity === 0 ? "Complet" : "Fermé";

      const icon = (point.is_active && isOpen) ? relayIcon : relayClosedIcon;

      const marker = L.marker([point.latitude, point.longitude], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${point.name}</h3>
            <p style="margin: 4px 0; color: #666;">${point.address}</p>
            <div style="margin: 8px 0; padding: 8px; background: #f5f5f5; border-radius: 4px;">
              <p style="margin: 4px 0;"><strong>Statut :</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
              <p style="margin: 4px 0;"><strong>Capacité :</strong> ${point.capacity} places</p>
            </div>
          </div>
        `);

      markersRef.current.push(marker);
    });

    if (showDrivers) {
      drivers.forEach((driver) => {
        if (driver.current_latitude && driver.current_longitude) {
          const marker = L.marker([driver.current_latitude, driver.current_longitude], { icon: driverIcon })
            .addTo(mapRef.current!)
            .bindPopup(`
              <div style="min-width: 150px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold;">🚴 Livreur</h3>
                <p style="margin: 4px 0; color: green; font-weight: bold;">Disponible</p>
              </div>
            `);

          markersRef.current.push(marker);
        }
      });
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const marker = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(mapRef.current!)
            .bindPopup("<strong>📍 Vous êtes ici</strong>");

          markersRef.current.push(marker);
        }
      );
    }

  }, [relayPoints, drivers, filter, showDrivers, showZones]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="enhanced-map"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        borderRadius: "12px"
      }}
    />
  );
}
