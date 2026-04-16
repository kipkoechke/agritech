// app/farm-workers/[id]/edit/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdPerson } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useWorker, useUpdateWorker } from "@/hooks/useWorkers";
import { useZones } from "@/hooks/useZone";

interface WorkerFormData {
  name: string;
  phone: string;
}

export default function EditWorkerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: workerResponse, isLoading: isLoadingWorker } = useWorker(id);
  const updateWorker = useUpdateWorker();
  const { data: zonesData, isLoading: isLoadingZones } = useZones();

  const worker = workerResponse?.data;
  const zonesList = Array.isArray(zonesData) ? zonesData : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkerFormData>({
    values: worker ? { name: worker.name, phone: worker.phone } : undefined,
  });

  const [zoneId, setZoneId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [isPinChanged, setIsPinChanged] = useState(false);

  const zoneValue = zoneId ?? (worker?.zone?.id || "");

  const zoneOptions = zonesList.map((zone: any) => ({
    value: zone.id,
    label: zone.name,
  }));

  const onSubmit = (data: WorkerFormData) => {
    const updateData: any = {
      name: data.name,
      phone: data.phone,
      zone_id: zoneValue || undefined,
    };

    if (isPinChanged && pin.length === 4) {
      updateData.pin = pin;
    }

    updateWorker.mutate(
      { id, data: updateData },
      { onSuccess: () => router.push(`/farm-workers/${id}`) },
    );
  };

  if (isLoadingWorker) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href={`/farm-workers/${id}`}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdPerson className="w-6 h-6 text-emerald-600" />
                  Edit Farm Worker
                </h1>
                <p className="text-gray-500 mt-1">
                  Update farm worker information
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <InputField
              label="Full Name"
              placeholder="Enter worker's full name"
              register={register("name", { required: "Name is required" })}
              error={errors.name?.message}
              required
            />

            <InputField
              label="Phone Number"
              placeholder="e.g. 0712345678"
              register={register("phone", { required: "Phone is required" })}
              error={errors.phone?.message}
              required
            />

            <SearchableSelect
              label="Zone"
              options={zoneOptions}
              value={zoneValue}
              onChange={setZoneId}
              placeholder={isLoadingZones ? "Loading zones..." : "Select Zone"}
              required
            />

            <div>
              <label className="text-gray-700 mb-2 flex text-xs sm:text-sm font-semibold">
                PIN (Leave blank to keep current)
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 4) {
                    setPin(value);
                    setIsPinChanged(true);
                  }
                }}
                className="border-gray-300 focus:border-emerald-500 text-gray-900 focus:ring-emerald-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-4 py-3 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                inputMode="numeric"
              />
              {!isPinChanged && (
                <p className="text-xs text-blue-600 mt-2">
                  Current PIN is hidden for security. Enter a new 4-digit PIN to
                  change it.
                </p>
              )}
              {isPinChanged && pin.length === 4 && (
                <p className="text-xs text-green-600 mt-2">
                  New PIN will be updated when you save changes.
                </p>
              )}
              {isPinChanged && pin.length > 0 && pin.length !== 4 && (
                <p className="text-xs text-yellow-600 mt-2">
                  PIN must be exactly 4 digits. Current length: {pin.length}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to={`/farm-workers/${id}`}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={
                  updateWorker.isPending || (isPinChanged && pin.length !== 4)
                }
              >
                {updateWorker.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
