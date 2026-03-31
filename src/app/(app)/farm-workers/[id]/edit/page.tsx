// app/farm-workers/[id]/edit/page.tsx (Updated with regular PIN input)
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdSave } from "react-icons/md";
import { useWorker, useUpdateWorker } from "@/hooks/useWorkers";
import { useZones } from "@/hooks/useZone";

export default function EditWorkerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: workerResponse, isLoading: isLoadingWorker } = useWorker(id);
  const updateWorker = useUpdateWorker();
  const { data: zonesData, isLoading: isLoadingZones } = useZones();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pin: "",
    zone_id: "",
  });
  const [isPinChanged, setIsPinChanged] = useState(false);

  const worker = workerResponse?.data;
  
  const getZonesArray = () => {
    const data = zonesData as
      | { data?: unknown[] }
      | unknown[]
      | null
      | undefined;

    if (!data) return [];

    if (Array.isArray(data)) return data;

    if ("data" in data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  };
  
  const zonesList = getZonesArray();

  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name || "",
        phone: worker.phone || "",
        pin: "",
        zone_id: worker.zone?.id || "",
      });
    }
  }, [worker]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      setFormData({ ...formData, pin: value });
      setIsPinChanged(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: any = {
      name: formData.name,
      phone: formData.phone,
      zone_id: formData.zone_id,
    };
    
    if (isPinChanged && formData.pin.length === 4) {
      updateData.pin = formData.pin;
    }
    
    await updateWorker.mutateAsync({ id, data: updateData });
    router.push(`/farm-workers/${id}`);
  };

  if (isLoadingWorker) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Farm worker not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-4">
        <Link
          href={`/farm-workers/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Worker Details
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Farm Worker</h1>
            <p className="text-gray-500 mt-1">Update farm worker information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone *
                  </label>
                  <select
                    value={formData.zone_id}
                    onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                    disabled={isLoadingZones}
                  >
                    <option value="">Select Zone</option>
                    {zonesList.map((zone: any) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                  {isLoadingZones && (
                    <p className="text-xs text-gray-500 mt-1">Loading zones...</p>
                  )}
                  {!isLoadingZones && zonesList.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No zones available. Please create a zone first.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.pin}
                  onChange={handlePinChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="\d{4}"
                />
                {!isPinChanged && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      Current PIN is hidden for security. Enter a new 4-digit PIN above to change it.
                    </p>
                  </div>
                )}
                {isPinChanged && formData.pin.length === 4 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">
                      New PIN will be updated when you save changes.
                    </p>
                  </div>
                )}
                {isPinChanged && formData.pin.length > 0 && formData.pin.length !== 4 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      PIN must be exactly 4 digits. Current length: {formData.pin.length}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
              <Link
                href={`/farm-workers/${id}`}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updateWorker.isPending || (isPinChanged && formData.pin.length !== 4)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <MdSave className="w-5 h-5" />
                {updateWorker.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}