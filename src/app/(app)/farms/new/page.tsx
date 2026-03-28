"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdAgriculture, MdArrowBack } from "react-icons/md";
import Link from "next/link";
import { useCreateFarm } from "@/hooks/useFarm";
import { useZones } from "@/hooks/useZone";
import { useProducts } from "@/hooks/useProduct";
import type { CreateFarmData } from "@/services/farmService";

export default function NewFarmPage() {
  const router = useRouter();
  const createFarm = useCreateFarm();
  const { data: zones, isLoading: zonesLoading } = useZones();
  const { data: products, isLoading: productsLoading } = useProducts();

  const [formData, setFormData] = useState<CreateFarmData>({
    name: "",
    size: 0,
    coordinates: {},
    zone_id: "",
    product_id: "",
  });

  const [coordinatesText, setCoordinatesText] = useState("{}");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse coordinates from JSON string
    let coordinates = {};
    try {
      coordinates = JSON.parse(coordinatesText);
    } catch {
      coordinates = {};
    }

    const data: CreateFarmData = {
      ...formData,
      coordinates,
    };

    createFarm.mutate(data, {
      onSuccess: () => {
        router.push("/farms");
      },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "size" ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/farms"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Farms
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MdAgriculture className="w-6 h-6 text-primary" />
          Add New Farm
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Farm Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter farm name"
            />
          </div>

          <div>
            <label
              htmlFor="size"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Size *
            </label>
            <input
              type="number"
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter farm size"
            />
          </div>

          <div>
            <label
              htmlFor="coordinates"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Coordinates (JSON)
            </label>
            <textarea
              id="coordinates"
              value={coordinatesText}
              onChange={(e) => setCoordinatesText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder='{"lat": 0, "lng": 0}'
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter coordinates in JSON format (e.g., {"{\"lat\": -1.234, \"lng\": 36.789"})
            </p>
          </div>

          <div>
            <label
              htmlFor="zone_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Zone
            </label>
            <select
              id="zone_id"
              name="zone_id"
              value={formData.zone_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={zonesLoading}
            >
              <option value="">Select a zone</option>
              {zones?.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="product_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product
            </label>
            <select
              id="product_id"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={productsLoading}
            >
              <option value="">Select a product</option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={createFarm.isPending}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createFarm.isPending ? "Saving..." : "Save Farm"}
            </button>
            <Link
              href="/farms"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
