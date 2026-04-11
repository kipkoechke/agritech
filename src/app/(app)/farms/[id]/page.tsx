// app/farms/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  MdArrowBack,
  MdLocationOn,
  MdPerson,
  MdFactory,
  MdAgriculture,
  MdCalendarToday,
  MdCode,
  MdCategory,
  MdStore,
  MdEdit,
  MdPinDrop,
  MdScale,
  MdVerified,
  MdInfo,
} from "react-icons/md";
import Button from "@/components/common/Button";
import { useFarm } from "@/hooks/useFarm";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false },
);

// Helper to get coordinates in consistent format
const getCoordinates = (farm: any): { lat: number; lng: number } | null => {
  if (!farm?.coordinates) return null;
  
  const coords = farm.coordinates;
  
  // Handle { lat, lng } format
  if (typeof coords.lat === "number" && typeof coords.lng === "number") {
    return { lat: coords.lat, lng: coords.lng };
  }
  
  // Handle { latitude, longitude } format
  if (typeof coords.latitude === "number" && typeof coords.longitude === "number") {
    return { lat: coords.latitude, lng: coords.longitude };
  }
  
  return null;
};

// Info Card Component
const InfoCard = ({ icon: Icon, label, value, highlight = false }: any) => (
  <div className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
    highlight ? "border-primary/30 bg-primary/5" : "border-gray-200"
  }`}>
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${
        highlight ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-500"
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-base font-semibold ${
          highlight ? "text-primary" : "text-gray-900"
        }`}>
          {value || "—"}
        </p>
      </div>
    </div>
  </div>
);

// Section Component
const Section = ({ title, icon: Icon, children }: any) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-5 h-5 text-primary" />
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="pl-7">
      {children}
    </div>
  </div>
);

export default function FarmDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: farmResponse, isLoading } = useFarm(id);
  const [isMounted, setIsMounted] = useState(false);

  const farm = farmResponse?.data;

  useEffect(() => {
    setIsMounted(true);
    // Fix Leaflet marker icons
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading farm details...</p>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <MdInfo className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Farm Not Found</h2>
            <p className="text-red-600">The farm you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/farms"
              className="inline-flex items-center gap-2 mt-4 text-red-600 hover:text-red-700 font-medium"
            >
              <MdArrowBack className="w-4 h-4" />
              Back to Farms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const coordinates = getCoordinates(farm);
  const size = parseFloat(farm.size as string) || 0;
  const createdDate = new Date(farm.created_at);
  const updatedDate = new Date(farm.updated_at);
  const isUpdated = farm.created_at !== farm.updated_at;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/farms"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <MdStore className="w-6 h-6 text-primary" />
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {farm.name}
                  </h1>
                  {farm.product?.name && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {farm.product.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <MdCode className="w-3 h-3 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Farm Code: {farm.farm_code || "—"}
                  </p>
                </div>
              </div>
            </div>
            <Button type="small" to={`/farms/${id}/edit`} className="flex items-center gap-2">
              <MdEdit className="w-4 h-4" />
              Edit Farm
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Farm Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MdInfo className="w-5 h-5 text-primary" />
                  Farm Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard
                    icon={MdAgriculture}
                    label="Farm Size"
                    value={`${size.toLocaleString()} Hectares`}
                    highlight
                  />
                  <InfoCard
                    icon={MdLocationOn}
                    label="Zone"
                    value={farm.zone?.name || "Not Assigned"}
                  />
                  <InfoCard
                    icon={MdPerson}
                    label="Farmer"
                    value={farm.farmer?.name || "Not Assigned"}
                  />
                  <InfoCard
                    icon={MdPerson}
                    label="Supervisor"
                    value={farm.supervisor?.name || "Not Assigned"}
                  />
                  {farm.factory && (
                    <InfoCard
                      icon={MdFactory}
                      label="Factory"
                      value={farm.factory.name}
                    />
                  )}
                  {farm.cluster && (
                    <InfoCard
                      icon={MdFactory}
                      label="Cluster"
                      value={farm.cluster.name}
                    />
                  )}
                  <InfoCard
                    icon={MdCalendarToday}
                    label="Created"
                    value={createdDate.toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  />
                  {isUpdated && (
                    <InfoCard
                      icon={MdCalendarToday}
                      label="Last Updated"
                      value={updatedDate.toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {(farm.product || farm.zone?.code) && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MdCategory className="w-5 h-5 text-primary" />
                    Product & Classification
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {farm.product && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MdAgriculture className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Product Type</p>
                          <p className="text-sm font-semibold text-gray-900">{farm.product.name}</p>
                        </div>
                      </div>
                    )}
                    {farm.zone?.code && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MdVerified className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Zone Code</p>
                          <p className="text-sm font-semibold text-gray-900">{farm.zone.code}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Location Map */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MdPinDrop className="w-5 h-5 text-primary" />
                  Farm Location
                </h2>
              </div>
              <div className="p-6">
                {coordinates ? (
                  <>
                    <div className="mb-4">
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-gray-500 mb-1">Coordinates</p>
                        <div className="flex items-center gap-2">
                          <MdLocationOn className="w-4 h-4 text-primary" />
                          <code className="text-sm text-gray-700">
                            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                          </code>
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-[300px] rounded-lg overflow-hidden border border-gray-200">
                      {isMounted && (
                        <MapContainer
                          center={[coordinates.lat, coordinates.lng]}
                          zoom={15}
                          style={{ height: "100%", width: "100%" }}
                          scrollWheelZoom={true}
                          zoomControl={true}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={[coordinates.lat, coordinates.lng]}>
                            <Popup>
                              <div className="text-center">
                                <p className="font-bold text-gray-900">{farm.name}</p>
                                <p className="text-xs text-gray-500">{farm.farm_code}</p>
                                <p className="text-xs text-primary mt-1">{size.toFixed(2)} Ha</p>
                              </div>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      )}
                    </div>
                    
                    <div className="mt-4 text-center">
                      <a
                        href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        <MdLocationOn className="w-4 h-4" />
                        Open in Google Maps
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MdLocationOn className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No location coordinates available</p>
                    <p className="text-xs text-gray-400 mt-2">This farm doesn't have coordinates set</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}