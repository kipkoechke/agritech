"use client";

import Link from "next/link";
import { MdAgriculture, MdAdd } from "react-icons/md";
import { useFarms } from "@/hooks/useFarm";

export default function FarmsPage() {
  const { data: farms, isLoading, error } = useFarms();

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MdAgriculture className="w-6 h-6 text-primary" />
          Farms
        </h1>
        <Link
          href="/farms/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <MdAdd className="w-5 h-5" />
          Add Farm
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Failed to load farms. Please try again later.
        </div>
      )}

      {farms && farms.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <MdAgriculture className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No farms yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first farm.</p>
          <Link
            href="/farms/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MdAdd className="w-5 h-5" />
            Add Farm
          </Link>
        </div>
      )}

      {farms && farms.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {farms.map((farm) => (
                <tr key={farm.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{farm.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{farm.size}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{farm.zone_id || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{farm.product_id || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {farm.created_at ? new Date(farm.created_at).toLocaleDateString() : "-"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
