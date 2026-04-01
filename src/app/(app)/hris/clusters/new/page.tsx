"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdHub } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateCluster } from "@/hooks/useCluster";
import { useFactories } from "@/hooks/useFactory";
import type { CreateClusterData } from "@/types/cluster";

interface ClusterFormData {
  name: string;
  code: string;
  lat: string;
  lng: string;
}

export default function NewClusterPage() {
  const router = useRouter();
  const createCluster = useCreateCluster();

  const { data: factoriesData, isLoading: factoriesLoading } = useFactories();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClusterFormData>({
    defaultValues: { name: "", code: "", lat: "", lng: "" },
  });

  const [factoryId, setFactoryId] = useState("");

  const factories = factoriesData?.data || [];

  const factoryOptions = factories.map((f) => ({
    value: f.id,
    label: f.name,
  }));

  const onSubmit = (data: ClusterFormData) => {
    if (!factoryId) return;
    const payload: CreateClusterData = {
      name: data.name,
      code: data.code,
      factory_id: factoryId,
    };
    if (data.lat && data.lng) {
      payload.coordinates = {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
      };
    }
    createCluster.mutate(payload, {
      onSuccess: () => router.push("/hris/clusters"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/hris/clusters"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Clusters
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdHub className="w-6 h-6 text-emerald-600" />
              Add New Cluster
            </h1>
            <p className="text-gray-500 mt-1">Create a new farm cluster</p>
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
              value={factoryId}
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
              <Button type="secondary" to="/hris/clusters">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={createCluster.isPending || !factoryId}
              >
                {createCluster.isPending ? "Creating..." : "Create Cluster"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
