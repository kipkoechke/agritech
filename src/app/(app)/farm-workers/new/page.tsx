// app/farm-workers/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdPerson } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateWorker } from "@/hooks/useWorkers";
import { useZones } from "@/hooks/useZone";
import { useFactories } from "@/hooks/useFactory";
import { useClusters } from "@/hooks/useCluster";

interface WorkerFormData {
  name: string;
  phone: string;
}

export default function CreateWorkerPage() {
  const router = useRouter();
  const createWorker = useCreateWorker();
  const { data: zonesData, isLoading: isLoadingZones } = useZones();
  const { data: factoriesData, isLoading: isLoadingFactories } = useFactories({
    per_page: 100,
  });
  const { data: clustersData, isLoading: isLoadingClusters } = useClusters({
    per_page: 100,
  });

  const zonesList = Array.isArray(zonesData) ? zonesData : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkerFormData>({
    defaultValues: { name: "", phone: "" },
  });

  const [pin, setPin] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [factoryId, setFactoryId] = useState("");
  const [clusterId, setClusterId] = useState("");

  const zoneOptions = zonesList.map((zone: any) => ({
    value: zone.id,
    label: zone.name,
  }));

  const factoryOptions =
    factoriesData?.data?.map((f) => ({
      value: f.id,
      label: `${f.name} (${f.code})`,
    })) || [];

  const clusterOptions =
    clustersData?.data?.map((c) => ({
      value: c.id,
      label: c.name,
    })) || [];

  const onSubmit = (data: WorkerFormData) => {
    if (pin.length !== 4) return;
    createWorker.mutate(
      {
        name: data.name,
        phone: data.phone,
        pin,
        zone_id: zoneId || undefined,
        factory_id: factoryId || undefined,
        cluster_id: clusterId || undefined,
      } as any,
      { onSuccess: () => router.push("/farm-workers") },
    );
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/farm-workers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Farm Workers
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdPerson className="w-6 h-6 text-emerald-600" />
              Add New Farm Worker
            </h1>
            <p className="text-gray-500 mt-1">
              Create a new farm worker account
            </p>
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
              value={zoneId}
              onChange={setZoneId}
              placeholder={isLoadingZones ? "Loading zones..." : "Select Zone"}
              required
            />

            <SearchableSelect
              label="Factory"
              options={factoryOptions}
              value={factoryId}
              onChange={setFactoryId}
              placeholder={
                isLoadingFactories ? "Loading factories..." : "Select Factory"
              }
              isLoading={isLoadingFactories}
              required
            />

            <SearchableSelect
              label="Cluster"
              options={clusterOptions}
              value={clusterId}
              onChange={setClusterId}
              placeholder={
                isLoadingClusters ? "Loading clusters..." : "Select Cluster"
              }
              isLoading={isLoadingClusters}
              required
            />

            <div>
              <label className="text-gray-700 mb-2 flex text-xs sm:text-sm font-semibold">
                PIN (4 digits) <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 4) setPin(value);
                }}
                className="border-gray-300 focus:border-emerald-500 text-gray-900 focus:ring-emerald-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-4 py-3 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                required
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                inputMode="numeric"
              />
              <p className="text-xs text-gray-500 mt-2">
                PIN must be exactly 4 digits. Used for worker authentication.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to="/farm-workers">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={
                  createWorker.isPending ||
                  pin.length !== 4 ||
                  !zoneId ||
                  !factoryId ||
                  !clusterId
                }
              >
                {createWorker.isPending ? "Creating..." : "Create Worker"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
