"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdHub } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateCluster } from "@/hooks/useCluster";
import { useFactories } from "@/hooks/useFactory";
import type { CreateClusterData } from "@/types/cluster";

function SimpleMap({
  onSelect,
}: {
  onSelect: (coords: { lat: number; lng: number }) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (mapRef.current && !mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([-0.3, 35.3], 7);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);

        map.on("click", (e: any) => {
          onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        mapInstanceRef.current = map;
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onSelect]);

  return (
    <div ref={mapRef} className="h-72 w-full border border-gray-300 rounded-lg overflow-hidden" />
  );
}

interface ClusterFormData {
  name: string;
}

export default function NewClusterPage() {
  const router = useRouter();
  const createCluster = useCreateCluster();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClusterFormData>({
    defaultValues: { name: "" },
  });

  const [factoryId, setFactoryId] = useState("");
  const [factorySearch, setFactorySearch] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { data: factoriesData, isLoading: factoriesLoading } = useFactories({
    per_page: 5000,
    search: factorySearch || undefined,
  });

  const factoryOptions = factoriesData?.data?.map((f: any) => ({
    value: f.id,
    label: f.name,
  })) || [];

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

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 relative" style={{ zIndex: 1 }}>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="flex flex-col h-full">
    <InputField
      label="Name"
      placeholder="Cluster name"
      register={register("name", { required: "Name is required" })}
      error={errors.name?.message}
      required
    />
  </div>
  <div className="flex flex-col h-full">
<SearchableSelect
              label="Factory"
              options={factoryOptions}
              value={factoryId}
              onChange={setFactoryId}
              placeholder="Search and select a factory"
              isLoading={factoriesLoading}
              onSearchChange={setFactorySearch}
              searchPlaceholder="Search factories..."
              required
            />
  </div>
</div>

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
              <div className="h-72 rounded-lg overflow-hidden border border-gray-200">
                <SimpleMap onSelect={setCoords} />
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
