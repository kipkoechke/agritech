"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { MdAgriculture, MdArrowBack } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useFarm, useUpdateFarm } from "@/hooks/useFarm";
import { useZones } from "@/hooks/useZone";
import { useProducts } from "@/hooks/useProduct";
import { useHrisUsers } from "@/hooks/useHrisUser";
import type { UpdateFarmData } from "@/types/farm";
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

export default function EditFarmPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: farmResponse, isLoading } = useFarm(id);
  const updateFarm = useUpdateFarm();
  const { data: zonesData, isLoading: zonesLoading } = useZones();
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: farmersData, isLoading: farmersLoading } = useHrisUsers({
    role: "farmer",
  });

  const farm = farmResponse?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmFormData>({
    values: farm ? { name: farm.name, size: String(farm.size) } : undefined,
  });

  const [zoneId, setZoneId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const zoneValue = zoneId ?? (farm?.zone?.id || "");
  const productValue = productId ?? (farm?.product?.id || "");
  const ownerValue = ownerId ?? (farm?.farmer?.id || "");

  const existingCoords =
    farm?.coordinates?.latitude && farm?.coordinates?.longitude
      ? {
          lat: Number(farm.coordinates.latitude),
          lng: Number(farm.coordinates.longitude),
        }
      : null;
  const mapCoords = coords || existingCoords;

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
    const payload: UpdateFarmData = {
      name: data.name,
      size: parseFloat(data.size) || undefined,
      coordinates: mapCoords
        ? { lat: mapCoords.lat, lng: mapCoords.lng }
        : undefined,
      zone_id: zoneValue || undefined,
      product_id: productValue || undefined,
      owner_id: ownerValue || undefined,
    };
    updateFarm.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/farms/${id}`) },
    );
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setCoords(e.latlng);
      },
    });
    return mapCoords ? (
      <Marker position={[mapCoords.lat, mapCoords.lng]} />
    ) : null;
  }

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
      <div className="mb-6">
        <Link
          href={`/farms/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Farm Details
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdAgriculture className="w-6 h-6 text-emerald-600" />
              Edit Farm
            </h1>
            <p className="text-gray-500 mt-1">Update farm information</p>
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
              value={zoneValue}
              onChange={setZoneId}
              placeholder="Select a zone"
              isLoading={zonesLoading}
            />

            <SearchableSelect
              label="Product"
              options={productOptions}
              value={productValue}
              onChange={setProductId}
              placeholder="Select a product"
              isLoading={productsLoading}
            />

            <SearchableSelect
              label="Owner (Farmer)"
              options={farmerOptions}
              value={ownerValue}
              onChange={setOwnerId}
              placeholder="Select farm owner"
              isLoading={farmersLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pick Coordinates
              </label>
              <div className="h-72 w-full border border-gray-300 rounded-lg overflow-hidden">
                <MapContainer
                  center={
                    mapCoords
                      ? [mapCoords.lat, mapCoords.lng]
                      : [0.0236, 37.9062]
                  }
                  zoom={mapCoords ? 14 : 6}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker />
                </MapContainer>
              </div>
              {mapCoords && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: Lat {mapCoords.lat.toFixed(5)}, Lng{" "}
                  {mapCoords.lng.toFixed(5)}
                </p>
              )}
              {!mapCoords && (
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
