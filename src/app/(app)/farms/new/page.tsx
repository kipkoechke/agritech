"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdAgriculture, MdArrowBack, MdAdd } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateFarm } from "@/hooks/useFarm";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProduct";
import { useHrisUsers, useCreateHrisUser } from "@/hooks/useHrisUser";
import { useFactoryClusters, useCreateCluster, useClusters } from "@/hooks/useCluster";
import { useFactories } from "@/hooks/useFactory";
import type { CreateFarmData } from "@/types/farm";

function SimpleMap({ onSelect }: { onSelect: (coords: { lat: number; lng: number }) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      
      if (mapRef.current && !mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([0.0236, 37.9062], 6);
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);
        
        map.on('click', (e: any) => {
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
  
  return <div ref={mapRef} className="h-72 w-full border border-gray-300 rounded-lg overflow-hidden" />;
}

interface FarmFormData {
  name: string;
  size: string;
}

interface NewSupervisorData {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface NewClusterData {
  name: string;
  code: string;
}

export default function NewFarmPage() {
  const router = useRouter();
  const createFarm = useCreateFarm();
  const createSupervisor = useCreateHrisUser();
  const createCluster = useCreateCluster();
  const isAdmin = useIsAdmin();
  const { user } = useAuth();

  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: farmersData, isLoading: farmersLoading } = useHrisUsers({
    role: "farmer",
    per_page: 100,
  });
  const { data: supervisorsData, isLoading: supervisorsLoading } = useHrisUsers({
    role: "supervisor",
    per_page: 500,
  });
  const { data: clustersData, isLoading: clustersLoading } = useClusters({
    per_page: 500,
  } as any);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmFormData>({
    defaultValues: { name: "", size: "" },
  });

  const [productId, setProductId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [factoryId, setFactoryId] = useState("");
  const [clusterId, setClusterId] = useState("");
  const [factorySearch, setFactorySearch] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Supervisor mode: 'select' | 'new'
  const [supervisorMode, setSupervisorMode] = useState<"select" | "new">("select");
  const [supervisorId, setSupervisorId] = useState("");
  const [newSupervisor, setNewSupervisor] = useState<NewSupervisorData>({ name: "", phone: "", email: "", password: "" });

  // Cluster mode: 'select' | 'new'
  const [clusterMode, setClusterMode] = useState<"select" | "new">("select");
  const [newCluster, setNewCluster] = useState<NewClusterData>({ name: "", code: "" });

  const { data: allFactoriesData, isLoading: allFactoriesLoading } = useFactories({ 
    per_page: 5000,
    search: factorySearch || undefined,
  });

  const productOptions =
    productsData?.data?.map((p) => ({ value: p.id, label: p.name })) || [];

  const farmerOptions =
    farmersData?.data?.map((u) => ({ value: u.id, label: u.name, description: u.phone })) || [];

  const supervisorOptions =
    supervisorsData?.data?.map((u) => ({ value: u.id, label: u.name, description: u.phone })) || [];

  const clusterOptions =
    clustersData?.data?.map((c: any) => ({ value: c.id, label: c.name, description: c.code })) || [];

  const factoryOptions = allFactoriesData?.data?.map((f: any) => ({ value: f.id, label: f.name })) || [];

  const onFormSubmit = async (data: FarmFormData) => {
    let finalSupervisorId = supervisorId;
    let finalClusterId = clusterId;

    // Create new supervisor if needed
    if (supervisorMode === "new" && newSupervisor.name && newSupervisor.phone && newSupervisor.password) {
      try {
        const supRes = await createSupervisor.mutateAsync({
          name: newSupervisor.name,
          phone: newSupervisor.phone,
          email: newSupervisor.email || undefined,
          password: newSupervisor.password,
          role: "supervisor",
        } as any);
        finalSupervisorId = supRes.data.id;
      } catch (err) {
        console.error("Failed to create supervisor:", err);
        return;
      }
    }

    // Create new cluster if needed
    if (clusterMode === "new" && newCluster.name) {
      try {
        const cRes = await createCluster.mutateAsync({
          name: newCluster.name,
          code: newCluster.code || undefined,
          factory_id: factoryId,
        } as any);
        finalClusterId = cRes.data.id;
      } catch (err) {
        console.error("Failed to create cluster:", err);
        return;
      }
    }

    const payload: CreateFarmData = {
      name: data.name,
      size: parseFloat(data.size) || 0,
      coordinates: coords || { lat: 0, lng: 0 },
      product_id: productId,
      owner_id: isAdmin ? ownerId || undefined : user?.id,
      supervisor_id: finalSupervisorId || undefined,
      factory_id: factoryId || undefined,
      cluster_id: finalClusterId || undefined,
    };

    createFarm.mutate(payload, {
      onSuccess: () => router.push("/farms"),
    });
  };

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

          <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
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

            {/* Row 2: Factory | Product */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SearchableSelect
                label="Factory"
                options={factoryOptions}
                value={factoryId}
                onChange={(v) => { setFactoryId(v); setClusterId(""); }}
                placeholder="Search and select a factory"
                isLoading={allFactoriesLoading}
                onSearchChange={setFactorySearch}
                searchPlaceholder="Search factories..."
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

            {/* Row 3: Cluster (Work Group) */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Work Group</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setClusterMode("select")}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      clusterMode === "select"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setClusterMode("new")}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      clusterMode === "new"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <MdAdd className="w-3 h-3 inline mr-1" />
                    Register New
                  </button>
                </div>
              </div>

              {clusterMode === "select" ? (
                <SearchableSelect
                  label=""
                  options={clusterOptions}
                  value={clusterId}
                  onChange={setClusterId}
                  placeholder={factoryId ? "Select a work group" : "Select a factory first"}
                  isLoading={clustersLoading}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Work Group Name"
                    placeholder="Enter work group name"
                    value={newCluster.name}
                    onChange={(e) => setNewCluster({ ...newCluster, name: e.target.value })}
                    required
                  />
                  <InputField
                    label="Code (Optional)"
                    placeholder="e.g. WG-001"
                    value={newCluster.code}
                    onChange={(e) => setNewCluster({ ...newCluster, code: e.target.value })}
                  />
                </div>
              )}
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
                />
              )}

              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Supervisor</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSupervisorMode("select")}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        supervisorMode === "select"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Select Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupervisorMode("new")}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        supervisorMode === "new"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <MdAdd className="w-3 h-3 inline mr-1" />
                      Register New
                    </button>
                  </div>
                </div>

                {supervisorMode === "select" ? (
                  <SearchableSelect
                    label=""
                    options={supervisorOptions}
                    value={supervisorId}
                    onChange={setSupervisorId}
                    placeholder="Select supervisor"
                    isLoading={supervisorsLoading}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Supervisor Name"
                      placeholder="Enter name"
                      value={newSupervisor.name}
                      onChange={(e) => setNewSupervisor({ ...newSupervisor, name: e.target.value })}
                      required
                    />
                    <InputField
                      label="Phone"
                      placeholder="e.g. +254700000000"
                      value={newSupervisor.phone}
                      onChange={(e) => setNewSupervisor({ ...newSupervisor, phone: e.target.value })}
                      required
                    />
                    <InputField
                      label="Password"
                      type="password"
                      placeholder="Enter password"
                      value={newSupervisor.password}
                      onChange={(e) => setNewSupervisor({ ...newSupervisor, password: e.target.value })}
                      required
                    />
                    <div className="sm:col-span-2">
                      <InputField
                        label="Email (Optional)"
                        placeholder="email@example.com"
                        value={newSupervisor.email}
                        onChange={(e) => setNewSupervisor({ ...newSupervisor, email: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="relative z-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pick Coordinates (optional)
              </label>
              <SimpleMap onSelect={setCoords} />
              {coords ? (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Selected: Lat {coords.lat.toFixed(5)}, Lng {coords.lng.toFixed(5)}
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
                  Click on the map to select coordinates
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
                disabled={createFarm.isPending || createSupervisor.isPending || createCluster.isPending}
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