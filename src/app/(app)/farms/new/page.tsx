// app/farms/new/page.tsx (Fixed with Farmer Users)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MdAgriculture, MdArrowBack } from "react-icons/md";
import { useCreateFarm } from "@/hooks/useFarm";
import { useZones } from "@/hooks/useZone";
import { useProducts } from "@/hooks/useProduct";
import { useUsers } from "@/hooks/useUser";
import type { CreateFarmData } from "@/types/farm";
import "leaflet/dist/leaflet.css";

// Dynamic imports for Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

// Location marker component
function LocationMarker({ 
  position, 
  onLocationSelect 
}: { 
  position: { lat: number; lng: number } | null;
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
}) {
  const { useMapEvents } = require("react-leaflet");
  
  useMapEvents({
    click(e: any) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function NewFarmPage() {
  const router = useRouter();
  const createFarm = useCreateFarm();
  const { data: zones, isLoading: zonesLoading } = useZones();
  const { data: productsResponse, isLoading: productsLoading } = useProducts();
  const { data: usersResponse, isLoading: usersLoading } = useUsers({ 
    role: "farmer",
    per_page: 100 
  });

  const products = productsResponse?.data || [];
  const zonesList = zones || [];
  const farmers = usersResponse?.data || [];

  const [formData, setFormData] = useState({
    name: "",
    size: 0,
    zone_id: "",
    product_id: "",
    owner_id: "",
  });

  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "size" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleLocationSelect = (coords: { lat: number; lng: number }) => {
    setCoordinates(coords);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert("Please enter farm name");
      return;
    }

    if (formData.size <= 0) {
      alert("Please enter a valid farm size");
      return;
    }

    if (!formData.zone_id) {
      alert("Please select a zone");
      return;
    }

    if (!formData.product_id) {
      alert("Please select a product");
      return;
    }

    if (!formData.owner_id) {
      alert("Please select an owner");
      return;
    }

    if (!coordinates) {
      alert("Please pick coordinates on the map");
      return;
    }

    // Prepare data for API - exactly matching the required format
    const data: CreateFarmData = {
      name: formData.name,
      size: formData.size,
      zone_id: formData.zone_id,
      product_id: formData.product_id,
      owner_id: formData.owner_id,
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng
      }
    };

    try {
      await createFarm.mutateAsync(data);
      router.push("/farms");
    } catch (error: any) {
      console.error("Error creating farm:", error);
      alert(error.message || "Failed to create farm");
    }
  };

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

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Farm Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farm Name *
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size (Hectares) *
            </label>
            <input
              type="number"
              name="size"
              value={formData.size || ""}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter farm size"
            />
          </div>

          {/* Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zone *
            </label>
            <select
              name="zone_id"
              value={formData.zone_id}
              onChange={handleChange}
              disabled={zonesLoading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a zone</option>
              {zonesList.map((zone: any) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
            {zonesLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading zones...</p>
            )}
            {!zonesLoading && zonesList.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No zones available. Please create a zone first.
              </p>
            )}
          </div>

          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product *
            </label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              disabled={productsLoading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a product</option>
              {products.map((product: any) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            {productsLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading products...</p>
            )}
            {!productsLoading && products.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No products available. Please create a product first.
              </p>
            )}
          </div>

          {/* Owner - Farmer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner (Farmer) *
            </label>
            <select
              name="owner_id"
              value={formData.owner_id}
              onChange={handleChange}
              disabled={usersLoading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a farmer</option>
              {farmers.map((farmer: any) => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.name} {farmer.email ? `(${farmer.email})` : ""}
                </option>
              ))}
            </select>
            {usersLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading farmers...</p>
            )}
            {!usersLoading && farmers.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No farmers available. Please create a farmer user first.
              </p>
            )}
          </div>

          {/* Map for picking coordinates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farm Location *
            </label>
            <div className="h-64 w-full border rounded-md overflow-hidden bg-gray-100">
              <MapContainer
                center={[-1.2921, 36.8219]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker
                  position={coordinates}
                  onLocationSelect={handleLocationSelect}
                />
              </MapContainer>
            </div>
            {coordinates && (
              <p className="mt-2 text-sm text-gray-700">
                Selected location: {coordinates.lat.toFixed(5)}° N,{" "}
                {coordinates.lng.toFixed(5)}° E
              </p>
            )}
            {!coordinates && (
              <p className="mt-2 text-xs text-gray-500">
                Click on the map to select farm location
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
              {createFarm.isPending ? "Creating..." : "Create Farm"}
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