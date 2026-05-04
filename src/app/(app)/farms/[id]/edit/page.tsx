"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdAgriculture, MdArrowBack } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useFarm, useUpdateFarm } from "@/hooks/useFarm";
import { useProducts } from "@/hooks/useProduct";
import { useHrisUsers } from "@/hooks/useHrisUser";
import { useFactoryClusters } from "@/hooks/useCluster";
import { useFactories } from "@/hooks/useFactory";
import type { UpdateFarmData } from "@/types/farm";

function SimpleMap({
  initialCoords,
  onSelect,
}: {
  initialCoords?: { lat: number; lng: number } | null;
  onSelect: (coords: { lat: number; lng: number }) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (mapRef.current && !mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView(
          initialCoords ? [initialCoords.lat, initialCoords.lng] : [0.0236, 37.9062],
          initialCoords ? 14 : 6
        );

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);

        if (initialCoords) {
          markerRef.current = L.marker([initialCoords.lat, initialCoords.lng]).addTo(map);
        }

        map.on("click", (e: any) => {
          onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
          if (markerRef.current) {
            markerRef.current.setLatLng([e.latlng.lat, e.latlng.lng]);
          } else {
            markerRef.current = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
          }
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
  }, [initialCoords, onSelect]);

  return (
    <div ref={mapRef} className="h-72 w-full border border-gray-300 rounded-lg overflow-hidden" />
  );
}

interface FarmFormData {
  name: string;
  size: string;
}

export default function EditFarmPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: farmResponse, isLoading } = useFarm(id);
  const updateFarm = useUpdateFarm();
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: farmersData, isLoading: farmersLoading } = useHrisUsers({
    role: "farmer",
  });
  const { data: supervisorsData, isLoading: supervisorsLoading } = useHrisUsers({
    role: "supervisor",
    per_page: 100,
  });

  const farm = farmResponse?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmFormData>({
    values: farm ? { name: farm.name, size: String(parseFloat(farm.size) * 2.471) } : undefined,
  });

  const [productId, setProductId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [supervisorId, setSupervisorId] = useState<string | null>(null);
  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [clusterId, setClusterId] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [factorySearch, setFactorySearch] = useState("");

  const productValue = productId ?? (farm?.product?.id || "");
  const ownerValue = ownerId ?? (farm?.farmer?.id || "");
  const supervisorValue = supervisorId ?? (farm?.supervisor?.id || "");
  const factoryValue = factoryId ?? (farm?.factory?.id || "");
  const clusterValue = clusterId ?? (farm?.cluster?.id || "");

  const { data: clustersData, isLoading: clustersLoading } = useFactoryClusters(factoryValue);
  const { data: allFactoriesData, isLoading: allFactoriesLoading } = useFactories({
    per_page: 5000,
    search: factorySearch || undefined,
  });

  const existingCoords =
    farm?.coordinates?.latitude && farm?.coordinates?.longitude
      ? {
          lat: Number(farm.coordinates.latitude),
          lng: Number(farm.coordinates.longitude),
        }
      : null;
  const mapCoords = coords || existingCoords;

  const productOptions =
    productsData?.data?.map((p) => ({ value: p.id, label: p.name })) || [];

  const farmerOptions =
    farmersData?.data?.map((u) => ({
      value: u.id,
      label: u.name,
      description: u.phone,
    })) || [];

  const supervisorOptions =
    supervisorsData?.data?.map((u) => ({
      value: u.id,
      label: u.name,
      description: u.phone,
    })) || [];

  const factoryOptions =
    allFactoriesData?.data?.map((f: any) => ({ value: f.id, label: f.name })) || [];

  const clusterOptions =
    clustersData?.data?.map((c: any) => ({ value: c.id, label: c.name })) || [];

  const onSubmit = (data: FarmFormData) => {
    const acresToHectares = parseFloat(data.size) / 2.471;
    const payload: UpdateFarmData = {
      name: data.name,
      size: isNaN(acresToHectares) ? undefined : acresToHectares,
      coordinates: mapCoords ? { lat: mapCoords.lat, lng: mapCoords.lng } : undefined,
      product_id: productValue || undefined,
      owner_id: ownerValue || undefined,
      supervisor_id: supervisorValue || undefined,
      factory_id: factoryValue || undefined,
      cluster_id: clusterValue || undefined,
    };
    updateFarm.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/farms/${id}`) },
    );
  };

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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href={`/farms/${id}`}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdAgriculture className="w-6 h-6 text-emerald-600" />
                  Edit Farm
                </h1>
                <p className="text-gray-500 mt-1">Update farm information</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Row 1: Farm Name | Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Farm Name"
                placeholder="Enter farm name"
                register={register("name", { required: "Name is required" })}
                error={errors.name?.message}
                required
              />
              <InputField
                label="Size (Acres)"
                type="number"
                step="any"
                placeholder="Enter farm size"
                register={register("size", { required: "Size is required" })}
                error={errors.size?.message}
                required
              />
            </div>

            {/* Row 2: Factory | Product */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SearchableSelect
                label="Factory"
                options={factoryOptions}
                value={factoryValue}
                onChange={(v) => {
                  setFactoryId(v);
                  setClusterId("");
                }}
                placeholder="Search and select a factory"
                isLoading={allFactoriesLoading}
                onSearchChange={setFactorySearch}
                searchPlaceholder="Search factories..."
                required
              />
              <SearchableSelect
                label="Product"
                options={productOptions}
                value={productValue}
                onChange={setProductId}
                placeholder="Select a product"
                isLoading={productsLoading}
                required
              />
            </div>

            {/* Row 3: Cluster */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SearchableSelect
                label="Cluster"
                options={clusterOptions}
                value={clusterValue}
                onChange={setClusterId}
                placeholder={factoryValue ? "Select a cluster" : "Select a factory first"}
                isLoading={clustersLoading}
              />
            </div>

            {/* Row 4: Owner | Supervisor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SearchableSelect
                label="Owner (Farmer)"
                options={farmerOptions}
                value={ownerValue}
                onChange={setOwnerId}
                placeholder="Select farm owner"
                isLoading={farmersLoading}
              />
              <SearchableSelect
                label="Supervisor"
                options={supervisorOptions}
                value={supervisorValue}
                onChange={setSupervisorId}
                placeholder="Select supervisor"
                isLoading={supervisorsLoading}
              />
            </div>

            {/* Map */}
            <div className="relative z-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pick Coordinates
              </label>
              <SimpleMap initialCoords={mapCoords} onSelect={setCoords} />
              {mapCoords ? (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Selected: Lat {mapCoords.lat.toFixed(5)}, Lng {mapCoords.lng.toFixed(5)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCoords(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  Click on the map to pick coordinates
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to={`/farms/${id}`}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={updateFarm.isPending}
              >
                {updateFarm.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}