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
} from "react-icons/md";
import Button from "@/components/common/Button";
import { useFarm } from "@/hooks/useFarm";
import "leaflet/dist/leaflet.css";

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

export default function FarmDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: farmResponse, isLoading } = useFarm(id);

  const farm = farmResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Farm not found
        </div>
      </div>
    );
  }

  const hasCoords =
    farm.coordinates &&
    (farm.coordinates.latitude || farm.coordinates.longitude);

  return (
    <div className="min-h-screen p-4">
      <div className="mb-4">
        <Link
          href="/farms"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Farms
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MdAgriculture className="w-6 h-6 text-emerald-600" />
                {farm.name}
              </h1>
              <p className="text-gray-500 mt-1">
                Farm Code: {farm.farm_code || "—"}
              </p>
            </div>
            <Button type="small" to={`/farms/${id}/edit`}>
              Edit
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <MdAgriculture className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Size</p>
                <p className="text-sm text-gray-900 font-medium">
                  {parseFloat(farm.size).toLocaleString()} Ha
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MdFactory className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Zone</p>
                <p className="text-sm text-gray-900 font-medium">
                  {farm.zone?.name || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MdAgriculture className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Product</p>
                <p className="text-sm text-gray-900 font-medium">
                  {farm.product?.name || "—"}
                </p>
              </div>
            </div>

            {farm.factory && (
              <div className="flex items-center gap-2">
                <MdFactory className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Factory</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {farm.factory.name}
                  </p>
                </div>
              </div>
            )}

            {farm.cluster && (
              <div className="flex items-center gap-2">
                <MdFactory className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Cluster</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {farm.cluster.name}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <MdPerson className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Farmer</p>
                <p className="text-sm text-gray-900 font-medium">
                  {farm.farmer?.name || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MdPerson className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Supervisor</p>
                <p className="text-sm text-gray-900 font-medium">
                  {farm.supervisor?.name || "—"}
                </p>
              </div>
            </div>

            {hasCoords && (
              <div className="flex items-center gap-2">
                <MdLocationOn className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Coordinates</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {farm.coordinates!.latitude}, {farm.coordinates!.longitude}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <MdCalendarToday className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm text-gray-900 font-medium">
                  {new Date(farm.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {farm.updated_at !== farm.created_at && (
              <div className="flex items-center gap-2">
                <MdCalendarToday className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Updated</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {new Date(farm.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {hasCoords && (
            <div className="mt-4">
              <div className="h-[350px] rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={[
                    Number(farm.coordinates!.latitude),
                    Number(farm.coordinates!.longitude),
                  ]}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[
                      Number(farm.coordinates!.latitude),
                      Number(farm.coordinates!.longitude),
                    ]}
                  />
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}