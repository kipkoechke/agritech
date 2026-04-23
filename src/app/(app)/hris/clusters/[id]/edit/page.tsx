"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdHub } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCluster, useUpdateCluster } from "@/hooks/useCluster";
import { useFactories } from "@/hooks/useFactory";
import type { UpdateClusterData } from "@/types/cluster";
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
  code: string;
}

export default function EditClusterPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: clusterResponse, isLoading } = useCluster(id);
  const updateCluster = useUpdateCluster();
  const cluster = clusterResponse?.data;

  const [factorySearch, setFactorySearch] = useState("");

  const { data: factoriesData, isLoading: factoriesLoading } = useFactories({ search: factorySearch || undefined });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClusterFormData>({
    values: cluster
      ? {
          name: cluster.name,
          code: cluster.code,
        }
      : undefined,
  });

  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    cluster?.coordinates
      ? { lat: cluster.coordinates[0], lng: cluster.coordinates[1] }
      : null,
  );

  // Update coords when cluster loads
  if (cluster?.coordinates && !coords) {
    setCoords({ lat: cluster.coordinates[0], lng: cluster.coordinates[1] });
  }

  const factoryValue = factoryId ?? (cluster?.factory?.id || "");

  const factories = factoriesData?.data || [];

  const factoryOptions = factories.map((f) => ({
    value: f.id,
    label: f.name,
  }));

  const onSubmit = (data: ClusterFormData) => {
    const payload: UpdateClusterData = {
      name: data.name,
      code: data.code,
      factory_id: factoryValue,
    };
    if (coords) {
      payload.coordinates = coords;
    }
    updateCluster.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/hris/clusters/${id}`) },
    );
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setCoords(e.latlng);
      },
    });
    return coords ? <Marker position={coords} /> : null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!cluster) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Cluster not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href={`/hris/clusters/${id}`}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdHub className="w-6 h-6 text-emerald-600" />
                  Edit Cluster
                </h1>
                <p className="text-gray-500 mt-1">Update cluster information</p>
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

            <InputField
              label="Code"
              placeholder="e.g. CLU-001"
              register={register("code", { required: "Code is required" })}
              error={errors.code?.message}
              required
            />

            <SearchableSelect
              label="Factory"
              options={factoryOptions}
              value={factoryValue}
              onChange={setFactoryId}
              placeholder="Select factory"
              isLoading={factoriesLoading}
              onSearchChange={setFactorySearch}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location{" "}
                <span className="text-gray-400 font-normal">
                  (click map to set)
                </span>
              </label>
              {coords && (
                <p className="text-sm text-gray-600 mb-2">
                  Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
                </p>
              )}
              <div className="h-[300px] rounded-lg overflow-hidden border border-gray-200">
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
              <Button type="secondary" to={`/hris/clusters/${id}`}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={updateCluster.isPending}
              >
                {updateCluster.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
