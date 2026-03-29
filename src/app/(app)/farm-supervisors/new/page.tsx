"use client";

import { useState } from "react";
import { useZones } from "@/hooks/useZone";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";

// Only dynamic import components that break SSR
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

// Hooks can be imported normally
import { useMapEvents } from "react-leaflet";

export default function NewSupervisorPage() {
  const { data: zonesResponse, isLoading, error } = useZones();
  const zones = zonesResponse || [];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Map click marker
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setCoords(e.latlng);
      },
    });

    return coords ? <Marker position={coords} /> : null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !zoneId || !coords) {
      toast.error("Please fill all fields and pick coordinates on the map");
      return;
    }

    console.log({
      name,
      email,
      phone,
      zoneId,
      latitude: coords.lat,
      longitude: coords.lng,
    });

    toast.success("Supervisor saved! (console logged for now)");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Supervisor</h1>

      {isLoading && <p>Loading zones...</p>}
      {error && <p className="text-red-500">Failed to load zones</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Supervisor Name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Supervisor Email"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Supervisor Phone"
          />
        </div>

        {/* Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Zone</label>
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select Zone</option>
            {zones.map((zone: any) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        {/* Map */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pick Coordinates (click on map)
          </label>
          <div className="h-64 w-full border rounded-md overflow-hidden">
            <MapContainer center={[0, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker />
            </MapContainer>
          </div>
          {coords && (
            <p className="mt-2 text-sm text-gray-700">
              Selected: Lat {coords.lat.toFixed(5)}, Lng {coords.lng.toFixed(5)}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Save Supervisor
        </button>
      </form>
    </div>
  );
}