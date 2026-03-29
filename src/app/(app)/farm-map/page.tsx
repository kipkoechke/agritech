"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

export default function FarmMapPage() {
  // 10 dummy farms with coordinates
  const farms = [
    { id: 1, name: "Highland Farm", owner: "John Doe", size: 12, zone: "Highland", lat: -1.2921, lng: 36.8219 },
    { id: 2, name: "Lowland Farm", owner: "Jane Smith", size: 8, zone: "Lowland", lat: -1.3000, lng: 36.8200 },
    { id: 3, name: "Midland Farm", owner: "Peter Mwangi", size: 15, zone: "Midland", lat: -1.2950, lng: 36.8250 },
    { id: 4, name: "Riverside Farm", owner: "Alice Wanjiku", size: 20, zone: "Lowland", lat: -1.2880, lng: 36.8300 },
    { id: 5, name: "Sunset Farm", owner: "Michael Kariuki", size: 10, zone: "Highland", lat: -1.2980, lng: 36.8100 },
    { id: 6, name: "Valley Farm", owner: "Grace Njeri", size: 18, zone: "Midland", lat: -1.2935, lng: 36.8280 },
    { id: 7, name: "Forest Farm", owner: "David Otieno", size: 14, zone: "Highland", lat: -1.2900, lng: 36.8150 },
    { id: 8, name: "Meadow Farm", owner: "Lilian Achieng", size: 9, zone: "Lowland", lat: -1.2960, lng: 36.8180 },
    { id: 9, name: "Hilltop Farm", owner: "Kevin Mworia", size: 11, zone: "Highland", lat: -1.2890, lng: 36.8230 },
    { id: 10, name: "Lakeside Farm", owner: "Sarah Wambui", size: 16, zone: "Midland", lat: -1.2975, lng: 36.8275 },
  ];

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Farm Map</h1>

      <MapContainer
        center={[-1.2921, 36.8219]}
        zoom={14}
        style={{ height: "50vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {farms.map((farm) => (
          <Marker key={farm.id} position={[farm.lat, farm.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>{farm.name}</strong>
                <p>Owner: {farm.owner}</p>
                <p>Size: {farm.size} Ha</p>
                <p>Zone: {farm.zone}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}