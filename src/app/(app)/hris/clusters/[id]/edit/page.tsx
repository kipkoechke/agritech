"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdHub } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCluster, useUpdateCluster } from "@/hooks/useCluster";
import { useFactories } from "@/hooks/useFactory";
import type { UpdateClusterData } from "@/types/cluster";

interface ClusterFormData {
  name: string;
  code: string;
  lat: string;
  lng: string;
}

export default function EditClusterPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: clusterResponse, isLoading } = useCluster(id);
  const updateCluster = useUpdateCluster();
  const cluster = clusterResponse?.data;

  const { data: factoriesData, isLoading: factoriesLoading } = useFactories();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClusterFormData>({
    values: cluster
      ? {
          name: cluster.name,
          code: cluster.code,
          lat: cluster.coordinates ? String(cluster.coordinates[0]) : "",
          lng: cluster.coordinates ? String(cluster.coordinates[1]) : "",
        }
      : undefined,
  });

  const [factoryId, setFactoryId] = useState<string | null>(null);

  const factoryValue =
    factoryId ?? (cluster?.factory?.id || "");

  const factories = factoriesData?.data || [];

  const factoryOptions = factories.map((f) => ({
    value: f.id,
    label: f.name,
  }));

  const onSubmit = (data: ClusterFormData) => {
    const payload: UpdateClusterData = {
      name: data.name,
      code: data.code,
      factory_id: factoryValue,
    };
    if (data.lat && data.lng) {
      payload.coordinates = {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
      };
    }
    updateCluster.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/hris/clusters/${id}`) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!cluster) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Cluster not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href={`/hris/clusters/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Cluster Details
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdHub className="w-6 h-6 text-emerald-600" />
              Edit Cluster
            </h1>
            <p className="text-gray-500 mt-1">Update cluster information</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <InputField
              label="Name"
              placeholder="Cluster name"
              register={register("name", { required: "Name is required" })}
              error={errors.name?.message}
              required
            />

            <InputField
              label="Code"
              placeholder="e.g. CLU-001"
              register={register("code", { required: "Code is required" })}
              error={errors.code?.message}
              required
            />

            <SearchableSelect
              label="Factory"
              options={factoryOptions}
              value={factoryValue}
              onChange={setFactoryId}
              placeholder="Select factory"
              isLoading={factoriesLoading}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Latitude"
                type="number"
                placeholder="e.g. -1.2921"
                register={register("lat")}
              />
              <InputField
                label="Longitude"
                type="number"
                placeholder="e.g. 36.8219"
                register={register("lng")}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to={`/hris/clusters/${id}`}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={updateCluster.isPending}
              >
                {updateCluster.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
