// app/farms/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useState } from "react";
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
  MdExpandMore,
  MdExpandLess,
  MdInfo,
  MdPhone,
  MdEmail,
} from "react-icons/md";
import Button from "@/components/common/Button";
import { useFarm } from "@/hooks/useFarm";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

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
  
  if (typeof coords.lat === "number" && typeof coords.lng === "number") {
    return { lat: coords.lat, lng: coords.lng };
  }
  
  if (typeof coords.latitude === "number" && typeof coords.longitude === "number") {
    return { lat: coords.latitude, lng: coords.longitude };
  }
  
  return null;
};

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? (
          <MdExpandLess className="w-5 h-5 text-gray-400" />
        ) : (
          <MdExpandMore className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Detail Row Component
const DetailRow = ({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) => (
  <div className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
    <div className="w-32 flex-shrink-0">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex-1">
      <span className={`text-sm ${highlight ? "text-primary font-semibold" : "text-gray-800"}`}>
        {value || "—"}
      </span>
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
        <div className="max-w-3xl mx-auto">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
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
                  <h1 className="text-xl font-bold text-gray-900">{farm.name}</h1>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <MdCode className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500">Code: {farm.farm_code || "—"}</p>
                </div>
              </div>
            </div>
            <Button type="small" to={`/farms/${id}/edit`} className="flex items-center gap-2">
              <MdEdit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Single Form Layout */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Farm Details Section */}
          <CollapsibleSection title="Farm Details" icon={MdAgriculture} defaultOpen={true}>
            <div className="space-y-1">
              <DetailRow label="Farm Name" value={farm.name} />
              <DetailRow label="Farm Code" value={farm.farm_code} />
              <DetailRow label="Size" value={`${size.toLocaleString()} Hectares`} highlight />
              <DetailRow label="Product Type" value={farm.product?.name || "Not specified"} />
            </div>
          </CollapsibleSection>

          {/* Location & Zone Section */}
          <CollapsibleSection title="Location & Zone" icon={MdLocationOn} defaultOpen={true}>
            <div className="space-y-1">
              <DetailRow label="Zone" value={farm.zone?.name || "Not assigned"} />
              {farm.zone?.code && <DetailRow label="Zone Code" value={farm.zone.code} />}
              
              {/* Map Section */}
              {coordinates && (
                <div className="mt-4">
                  <div className="mb-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MdPinDrop className="w-4 h-4 text-primary" />
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Coordinates</span>
                      </div>
                      <code className="text-xs text-gray-700">
                        {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                      </code>
                    </div>
                  </div>
                  
                  <div className="h-[280px] rounded-lg overflow-hidden border border-gray-200">
                    {isMounted && (
                      <MapContainer
                        center={[coordinates.lat, coordinates.lng]}
                        zoom={14}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={true}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                  
                  <div className="mt-3 text-center">
                    <a
                      href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      <MdLocationOn className="w-3 h-3" />
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              )}
              
              {!coordinates && (
                <div className="mt-4 text-center py-6 bg-gray-50 rounded-lg">
                  <MdLocationOn className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No location coordinates available</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Farm Management Section */}
          <CollapsibleSection title="Farm Management" icon={MdPerson}>
            <div className="space-y-1">
              <DetailRow label="Farmer" value={farm.farmer?.name || "Not assigned"} />
              <DetailRow label="Supervisor" value={farm.supervisor?.name || "Not assigned"} />
              {farm.factory && <DetailRow label="Factory" value={farm.factory.name} />}
              {farm.cluster && <DetailRow label="Cluster" value={farm.cluster.name} />}
            </div>
          </CollapsibleSection>

          {/* Dates Section */}
          <CollapsibleSection title="Timeline" icon={MdCalendarToday}>
            <div className="space-y-1">
              <DetailRow 
                label="Created" 
                value={createdDate.toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} 
              />
              {isUpdated && (
                <DetailRow 
                  label="Last Updated" 
                  value={updatedDate.toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })} 
                />
              )}
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}