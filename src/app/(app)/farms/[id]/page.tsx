"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MdArrowBack,
  MdDelete,
  MdLocationOn,
  MdPerson,
  MdFactory,
  MdAgriculture,
  MdCalendarToday,
} from "react-icons/md";
import { useFarm, useDeleteFarm } from "@/hooks/useFarm";

export default function FarmDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: farmResponse, isLoading } = useFarm(id);
  const deleteFarm = useDeleteFarm();

  const farm = farmResponse?.data;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this farm?")) {
      await deleteFarm.mutateAsync(id);
      router.push("/farms");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
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
      <div className="mb-4">
        <Link
          href="/farms"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Farms
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{farm.name}</h1>
              <p className="text-gray-500 mt-1">Farm ID: {farm.id}</p>
            </div>
            <div className="flex gap-2">
             
              <button
                onClick={handleDelete}
                disabled={deleteFarm.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <MdDelete className="w-5 h-5" />
                {deleteFarm.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Farm Information</h2>
              
              <div className="flex items-start gap-3">
                <MdAgriculture className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="text-gray-900 font-medium">{parseFloat(farm.size).toLocaleString()} Hectares</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MdFactory className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Zone</p>
                  <p className="text-gray-900 font-medium">{farm.zone?.name || "Not assigned"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MdAgriculture className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="text-gray-900 font-medium">{farm.product?.name || "Not assigned"}</p>
                </div>
              </div>

              {farm.coordinates && (
                <div className="flex items-start gap-3">
                  <MdLocationOn className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Coordinates</p>
                    <p className="text-gray-900 font-medium">
                      Lat: {farm.coordinates.latitude}, Lng: {farm.coordinates.longitude}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">People</h2>
              
              <div className="flex items-start gap-3">
                <MdPerson className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="text-gray-900 font-medium">{farm.owner?.name || "Not assigned"}</p>
                  {farm.owner?.id && (
                    <p className="text-xs text-gray-400 mt-1">ID: {farm.owner.id}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MdPerson className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Supervisor</p>
                  <p className="text-gray-900 font-medium">{farm.supervisor?.name || "Not assigned"}</p>
                  {farm.supervisor?.id && (
                    <p className="text-xs text-gray-400 mt-1">ID: {farm.supervisor.id}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MdCalendarToday className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(farm.created_at).toLocaleDateString()} at {new Date(farm.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {farm.updated_at !== farm.created_at && (
                <div className="flex items-start gap-3">
                  <MdCalendarToday className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(farm.updated_at).toLocaleDateString()} at {new Date(farm.updated_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {farm.coordinates && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Location Map</h2>
              <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Map view coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}