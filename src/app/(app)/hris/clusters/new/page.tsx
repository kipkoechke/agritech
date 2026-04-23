"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdHub } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateCluster } from "@/hooks/useCluster";
import { useFactories } from "@/hooks/useFactory";
import type { CreateClusterData } from "@/types/cluster";
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

import { useMapEvents } from "react-leaflet";

interface ClusterFormData {
  name: string;
}

export default function NewClusterPage() {
  const router = useRouter();
  const createCluster = useCreateCluster();

  const { data: factoriesData, isLoading: factoriesLoading } = useFactories({ per_page: 100 });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClusterFormData>({
    defaultValues: { name: "" },
  });

  const [factoryId, setFactoryId] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const factories = factoriesData?.data || [];

  const factoryOptions = factories.map((f) => ({
    value: f.id,
    label: f.name,
  }));

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setCoords(e.latlng);
      },
    });
    return coords ? <Marker position={coords} /> : null;
  }

  const onSubmit = (data: ClusterFormData) => {
    if (!factoryId) return;
    const payload: CreateClusterData = {
      name: data.name,
      factory_id: factoryId,
    };
    if (coords) {
      payload.coordinates = { lat: coords.lat, lng: coords.lng };
    }
    createCluster.mutate(payload, {
      onSuccess: () => router.push("/hris/clusters"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href="/hris/clusters"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdHub className="w-6 h-6 text-emerald-600" />
                  Add New Cluster
                </h1>
                <p className="text-gray-500 mt-1">Create a new farm cluster</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <InputField
              label="Name"
              placeholder="Cluster name"
              register={register("name", { required: "Name is required" })}
              error={errors.name?.message}
              required
            />

            <SearchableSelect
              label="Factory"
              options={factoryOptions}
              value={factoryId}
              onChange={setFactoryId}
              placeholder="Select factory"
              isLoading={factoriesLoading}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location{" "}
                <span className="text-gray-400 font-normal">
                  (click map to set)
                </span>
              </label>
              {coords ? (
                <p className="text-sm text-gray-600 mb-2">
                  Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
                  <button
                    type="button"
                    onClick={() => setCoords(null)}
                    className="ml-3 text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Clear
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-400 mb-2">
                  No location set — click on the map to pick a point
                </p>
              )}
              <div className="h-75 rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={coords ? [coords.lat, coords.lng] : [-0.3, 35.3]}
                  zoom={coords ? 13 : 7}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker />
                </MapContainer>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to="/hris/clusters">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={createCluster.isPending || !factoryId}
              >
                {createCluster.isPending ? "Creating..." : "Create Cluster"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
