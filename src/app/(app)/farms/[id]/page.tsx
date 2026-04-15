// app/farms/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import {
  MdArrowBack,
  MdLocationOn,
  MdPerson,
  MdAgriculture,
  MdCalendarToday,
  MdCode,
  MdStore,
  MdEdit,
  MdPinDrop,
  MdScale,
  MdInfo,
  MdSupervisorAccount,
  MdFactory,
  MdCategory,
} from "react-icons/md";
import { useFarm } from "@/hooks/useFarm";
import "leaflet/dist/leaflet.css";

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
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const getCoordinates = (farm: any): { lat: number; lng: number } | null => {
  if (!farm?.coordinates) return null;
  const coords = farm.coordinates;
  if (typeof coords.lat === "number" && typeof coords.lng === "number") {
    return { lat: coords.lat, lng: coords.lng };
  }
  if (
    typeof coords.latitude === "number" &&
    typeof coords.longitude === "number"
  ) {
    return { lat: coords.latitude, lng: coords.longitude };
  }
  return null;
};

const InfoCard = ({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon?: any;
  accent?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
      {label}
    </span>
    <div className="flex items-center gap-1.5">
      {Icon && (
        <Icon
          className={`w-4 h-4 flex-shrink-0 ${accent ? "text-primary" : "text-gray-400"}`}
        />
      )}
      <span
        className={`text-sm font-medium ${accent ? "text-primary" : "text-gray-800"}`}
      >
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
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading farm details…</p>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Farm not found
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This farm doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/farms"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MdArrowBack className="w-4 h-4" /> Back to Farms
          </Link>
        </div>
      </div>
    );
  }

  const coordinates = getCoordinates(farm);
  const size = parseFloat(farm.size as string) || 0;
  const createdDate = new Date(farm.created_at).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedDate = new Date(farm.updated_at).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/farms"
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            >
              <MdArrowBack className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {farm.name}
              </h1>
              {farm.farm_code && (
                <p className="text-[11px] text-gray-400 font-mono leading-none mt-0.5">
                  {farm.farm_code}
                </p>
              )}
            </div>
          </div>
          <Link
            href={`/farms/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <MdEdit className="w-3.5 h-3.5" />
            Edit Farm
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Farm Identity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdAgriculture className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Farm Identity
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <InfoCard label="Farm Name" value={farm.name} icon={MdStore} />
            <InfoCard
              label="Farm Code"
              value={farm.farm_code || "—"}
              icon={MdCode}
            />
            <InfoCard
              label="Size"
              value={`${size.toLocaleString()} Ha`}
              icon={MdScale}
              accent
            />
            <InfoCard
              label="Product Type"
              value={farm.product?.name || "Not specified"}
              icon={MdCategory}
            />
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdLocationOn className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Location
            </h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <InfoCard
                label="Zone"
                value={farm.zone?.name || "Not assigned"}
                icon={MdLocationOn}
              />
              {farm.zone?.code && (
                <InfoCard
                  label="Zone Code"
                  value={farm.zone.code}
                  icon={MdCode}
                />
              )}
              {coordinates && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    Coordinates
                  </span>
                  <div className="flex items-center gap-1.5">
                    <MdPinDrop className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <code className="text-xs text-gray-700">
                      {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                    </code>
                  </div>
                </div>
              )}
            </div>

            {coordinates && isMounted ? (
              <div className="space-y-2">
                <div className="h-64 rounded-xl overflow-hidden border border-gray-100 relative z-0">
                  <MapContainer
                    center={[coordinates.lat, coordinates.lng]}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[coordinates.lat, coordinates.lng]}>
                      <Popup>
                        <div className="text-center py-1">
                          <p className="font-bold text-gray-900 text-sm">
                            {farm.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {farm.farm_code}
                          </p>
                          <p className="text-xs text-primary mt-0.5">
                            {size.toFixed(2)} Ha
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <MdLocationOn className="w-3 h-3" />
                  Open in Google Maps
                </a>
              </div>
            ) : !coordinates ? (
              <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 py-8 text-center">
                <MdLocationOn className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No coordinates set</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Management Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdPerson className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Management
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <InfoCard
              label="Farmer"
              value={farm.farmer?.name || "Not assigned"}
              icon={MdPerson}
            />
            <InfoCard
              label="Supervisor"
              value={farm.supervisor?.name || "Not assigned"}
              icon={MdSupervisorAccount}
            />
            {farm.factory && (
              <InfoCard
                label="Factory"
                value={farm.factory.name}
                icon={MdFactory}
              />
            )}
            {farm.cluster && (
              <InfoCard
                label="Cluster"
                value={farm.cluster.name}
                icon={MdCategory}
              />
            )}
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdCalendarToday className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Timeline
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 gap-6">
            <InfoCard
              label="Created"
              value={createdDate}
              icon={MdCalendarToday}
            />
            <InfoCard
              label="Last Updated"
              value={updatedDate}
              icon={MdCalendarToday}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
