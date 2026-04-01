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
import { useZones } from "@/hooks/useZone";
import { useProducts } from "@/hooks/useProduct";
import { useHrisUsers } from "@/hooks/useHrisUser";
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
  const { data: zonesData, isLoading: zonesLoading } = useZones();
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: farmersData, isLoading: farmersLoading } = useHrisUsers({
    role: "farmer",
  });

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
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const zoneOptions = Array.isArray(zonesData)
    ? zonesData.map((z: { id: string; name: string }) => ({
        value: z.id,
        label: z.name,
      }))
    : [];

  const productOptions =
    productsData?.data?.map((p) => ({ value: p.id, label: p.name })) || [];

  const farmerOptions =
    farmersData?.data?.map((u) => ({
      value: u.id,
      label: u.name,
      description: u.phone,
    })) || [];

  const onSubmit = (data: FarmFormData) => {
    if (!coords) {
      alert("Please pick coordinates on the map");
      return;
    }

    const payload: CreateFarmData = {
      name: data.name,
      size: parseFloat(data.size) || 0,
      coordinates: coords,
      zone_id: zoneId,
      product_id: productId,
    };
    if (ownerId) {
      payload.owner_id = ownerId;
    }

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
      <div className="mb-6">
        <Link
          href="/farms"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Farms
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdAgriculture className="w-6 h-6 text-emerald-600" />
              Add New Farm
            </h1>
            <p className="text-gray-500 mt-1">Create a new farm</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <InputField
              label="Farm Name"
              placeholder="Enter farm name"
              register={register("name", { required: "Name is required" })}
              error={errors.name?.message}
              required
            />

            <InputField
              label="Size (Ha)"
              type="number"
              placeholder="Enter farm size"
              register={register("size", { required: "Size is required" })}
              error={errors.size?.message}
              required
            />

            <SearchableSelect
              label="Zone"
              options={zoneOptions}
              value={zoneId}
              onChange={setZoneId}
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

            <SearchableSelect
              label="Owner (Farmer)"
              options={farmerOptions}
              value={ownerId}
              onChange={setOwnerId}
              placeholder="Select farm owner"
              isLoading={farmersLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pick Coordinates <span className="text-red-500">*</span>
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
              {coords && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: Lat {coords.lat.toFixed(5)}, Lng{" "}
                  {coords.lng.toFixed(5)}
                </p>
              )}
              {!coords && (
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
