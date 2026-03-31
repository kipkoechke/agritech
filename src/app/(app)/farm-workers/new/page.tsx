// app/farm-workers/new/page.tsx (Updated with regular PIN input)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdSave } from "react-icons/md";
import { useCreateWorker } from "@/hooks/useWorkers";
import { useZones } from "@/hooks/useZone";

export default function CreateWorkerPage() {
  const router = useRouter();
  const createWorker = useCreateWorker();
  const { data: zonesData, isLoading: isLoadingZones } = useZones();
  
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

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pin: "",
    zone_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pin.length !== 4) {
      alert("Please enter a 4-digit PIN");
      return;
    }
    if (!/^\d{4}$/.test(formData.pin)) {
      alert("PIN must be exactly 4 digits");
      return;
    }
    await createWorker.mutateAsync(formData);
    router.push("/farm-workers");
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-4">
        <Link
          href="/farm-workers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Farm Workers
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Add New Farm Worker</h1>
            <p className="text-gray-500 mt-1">Create a new farm worker account</p>
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
                    placeholder="Enter worker's full name"
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
                    placeholder="e.g., 0712345678"
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
                  PIN (4 digits) *
                </label>
                <input
                  type="password"
                  value={formData.pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 4) {
                      setFormData({ ...formData, pin: value });
                    }
                  }}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="\d{4}"
                />
                <p className="text-xs text-gray-500 mt-2">
                  PIN must be exactly 4 digits. This will be used for worker authentication.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
              <Link
                href="/farm-workers"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createWorker.isPending || formData.pin.length !== 4 || !formData.zone_id}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <MdSave className="w-5 h-5" />
                {createWorker.isPending ? "Creating..." : "Create Worker"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}