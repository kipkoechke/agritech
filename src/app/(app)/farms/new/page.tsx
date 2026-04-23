"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { MdAgriculture, MdArrowBack } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateFarm } from "@/hooks/useFarm";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { useZones } from "@/hooks/useZone";
import { useProducts } from "@/hooks/useProduct";
import { useHrisUsers } from "@/hooks/useHrisUser";
import { useZoneFactories } from "@/hooks/useFactory";
import { useFactoryClusters } from "@/hooks/useCluster";
import type { CreateFarmData } from "@/types/farm";
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

interface FarmFormData {
  name: string;
  size: string;
}

export default function NewFarmPage() {
  const router = useRouter();
  const createFarm = useCreateFarm();
  const isAdmin = useIsAdmin();
  const { user } = useAuth();

  const { data: zonesData, isLoading: zonesLoading } = useZones();
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const [farmerSearch, setFarmerSearch] = useState("");
  const [supervisorSearch, setSupervisorSearch] = useState("");

  const { data: farmersData, isLoading: farmersLoading } = useHrisUsers({
    role: "farmer",
    search: farmerSearch || undefined,
  });
  const { data: supervisorsData, isLoading: supervisorsLoading } = useHrisUsers(
    { role: "supervisor", search: supervisorSearch || undefined },
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmFormData>({
    defaultValues: { name: "", size: "" },
  });

  const [zoneId, setZoneId] = useState("");
  const [productId, setProductId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [factoryId, setFactoryId] = useState("");
  const [clusterId, setClusterId] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { data: factoriesData, isLoading: factoriesLoading } = useZoneFactories(zoneId);
  const { data: clustersData, isLoading: clustersLoading } = useFactoryClusters(factoryId);

  const zoneOptions = Array.isArray(zonesData)
    ? zonesData.map((z: { id: string; name: string }) => ({ value: z.id, label: z.name }))
    : [];

  const productOptions =
    productsData?.data?.map((p) => ({ value: p.id, label: p.name })) || [];

  const farmerOptions =
    farmersData?.data?.map((u) => ({ value: u.id, label: u.name, description: u.phone })) || [];

  const supervisorOptions =
    supervisorsData?.data?.map((u) => ({ value: u.id, label: u.name, description: u.phone })) || [];

  const factoryOptions =
    factoriesData?.data?.map((f: any) => ({ value: f.id, label: f.name })) || [];

  const clusterOptions =
    clustersData?.data?.map((c: any) => ({ value: c.id, label: c.name })) || [];

  const onSubmit = (data: FarmFormData) => {
    const payload: CreateFarmData = {
      name: data.name,
      size: parseFloat(data.size) || 0,
      coordinates: coords || { lat: 0, lng: 0 },
      zone_id: zoneId,
      product_id: productId,
      owner_id: isAdmin ? ownerId || undefined : user?.id,
      supervisor_id: supervisorId || undefined,
      factory_id: factoryId || undefined,
      cluster_id: clusterId || undefined,
    };

    createFarm.mutate(payload, {
      onSuccess: () => router.push("/farms"),
    });
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setCoords(e.latlng);
      },
    });
    return coords ? <Marker position={coords} /> : null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href="/farms"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdAgriculture className="w-6 h-6 text-emerald-600" />
                  Add New Farm
                </h1>
                <p className="text-gray-500 mt-1">Create a new farm</p>
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
                placeholder="Enter farm size in acres"
                register={register("size", { required: "Size is required" })}
                error={errors.size?.message}
                required
              />
            </div>

            {/* Row 2: Zone | Product */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SearchableSelect
                label="Zone"
                options={zoneOptions}
                value={zoneId}
                onChange={(v) => { setZoneId(v); setFactoryId(""); setClusterId(""); }}
                placeholder="Select a zone"
                isLoading={zonesLoading}
                required
              />
              <SearchableSelect
                label="Product"
                options={productOptions}
                value={productId}
                onChange={setProductId}
                placeholder="Select a product"
                isLoading={productsLoading}
                required
              />
            </div>

            {/* Row 3: Factory | Cluster (cascading from zone) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SearchableSelect
                label="Factory"
                options={factoryOptions}
                value={factoryId}
                onChange={(v) => { setFactoryId(v); setClusterId(""); }}
                placeholder={zoneId ? "Select a factory" : "Select a zone first"}
                isLoading={factoriesLoading}
              />
              <SearchableSelect
                label="Cluster"
                options={clusterOptions}
                value={clusterId}
                onChange={setClusterId}
                placeholder={factoryId ? "Select a cluster" : "Select a factory first"}
                isLoading={clustersLoading}
              />
            </div>

            {/* Row 4: Owner | Supervisor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {isAdmin && (
                <SearchableSelect
                  label="Owner (Farmer)"
                  options={farmerOptions}
                  value={ownerId}
                  onChange={setOwnerId}
                  placeholder="Select farm owner"
                  isLoading={farmersLoading}
                  onSearchChange={setFarmerSearch}
                />
              )}
              <SearchableSelect
                label="Supervisor"
                options={supervisorOptions}
                value={supervisorId}
                onChange={setSupervisorId}
                placeholder="Select supervisor"
                isLoading={supervisorsLoading}
                onSearchChange={setSupervisorSearch}
              />
            </div>

            {/* Map */}
            <div className="relative z-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pick Coordinates (optional)
              </label>
              <div className="h-72 w-full border border-gray-300 rounded-lg overflow-hidden">
                <MapContainer
                  center={[0.0236, 37.9062]}
                  zoom={6}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker />
                </MapContainer>
              </div>
              {coords ? (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: Lat {coords.lat.toFixed(5)}, Lng {coords.lng.toFixed(5)}
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  Click on the map to pick coordinates
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to="/farms">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={createFarm.isPending}
              >
                {createFarm.isPending ? "Creating..." : "Create Farm"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}