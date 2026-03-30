"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MdAgriculture, MdArrowBack } from "react-icons/md";
import { useCreateFarm } from "@/hooks/useFarm";
import { useZones } from "@/hooks/useZone";
import { useProducts } from "@/hooks/useProduct";
import type { CreateFarmData } from "@/types/farm";
import "leaflet/dist/leaflet.css";

// Only dynamic-import components that need SSR off
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

// Hook can be used normally, no dynamic
import { useMapEvents } from "react-leaflet";

export default function NewFarmPage() {
  const router = useRouter();
  const createFarm = useCreateFarm();
  const { data: zones, isLoading: zonesLoading } = useZones();
  const { data: products, isLoading: productsLoading } = useProducts();

  const [formData, setFormData] = useState<CreateFarmData>({
    name: "",
    size: 0,
    coordinates: {},
    zone_id: "",
    product_id: "",
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "size" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) {
      alert("Please pick coordinates on the map");
      return;
    }

    const data: CreateFarmData = {
      ...formData,
      coordinates: coords,
    };

    createFarm.mutate(data, {
      onSuccess: () => {
        router.push("/farms");
      },
      onError: (err: any) => {
        alert(err.message || "Failed to create farm");
      },
    });
  };

  // Component for picking coordinates
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setCoords(e.latlng);
      },
    });

    return coords ? <Marker position={coords} /> : null;
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="mb-6">
        <Link
          href="/farms"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Farms
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MdAgriculture className="w-6 h-6 text-primary" />
          Add New Farm
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Farm Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter farm name"
            />
          </div>

          {/* Farm Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
            <input
              type="number"
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter farm size"
            />
          </div>

          {/* Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
            <select
              name="zone_id"
              value={formData.zone_id}
              onChange={handleChange}
              disabled={zonesLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a zone</option>
              {zones?.map(zone => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              disabled={productsLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              
            </select>
          </div>

          {/* Map for picking coordinates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pick Coordinates</label>
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

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={createFarm.isPending}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createFarm.isPending ? "Saving..." : "Save Farm"}
            </button>
            <Link
              href="/farms"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}