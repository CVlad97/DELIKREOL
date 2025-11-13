import { useEffect, useRef } from "react";
import L from "leaflet";
import { pointsRelais } from "../pointsRelais";

const customIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35]
});

const userIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35]
});

export default function Map() {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: [14.6104, -61.0733],
        zoom: 12
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    pointsRelais.forEach((relai) => {
      const statusColor = relai.statut === "Ouvert" ? "green" :
                          relai.statut === "Complet" ? "orange" : "red";

      L.marker([relai.lat, relai.lng], { icon: customIcon })
        .addTo(map!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${relai.name}</h3>
            <p style="margin: 4px 0; color: #666;">${relai.adresse}</p>
            <div style="margin: 8px 0; padding: 8px; background: #f5f5f5; border-radius: 4px;">
              <p style="margin: 4px 0;"><strong>Statut :</strong> <span style="color: ${statusColor}; font-weight: bold;">${relai.statut}</span></p>
              <p style="margin: 4px 0;"><strong>Capacité :</strong> ${relai.capacite} places</p>
              <p style="margin: 4px 0;"><strong>Horaires :</strong> ${relai.horaires}</p>
            </div>
          </div>
        `);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map!)
            .bindPopup("<strong>📍 Vous êtes ici</strong>")
            .openPopup();

          map!.setView([latitude, longitude], 14);
        },
        (error) => {
          console.log("Géolocalisation non disponible:", error);
        }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100vh",
        borderRadius: "12px"
      }}
    />
  );
}
