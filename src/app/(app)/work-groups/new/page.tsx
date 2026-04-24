"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdGroup, MdArrowBack } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { TextAreaField } from "@/components/common/TextAreaField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateWorkGroup } from "@/hooks/useWorkGroup";
import { useHrisUsers } from "@/hooks/useHrisUser";
import { useClusters } from "@/hooks/useCluster";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import type { CreateWorkGroupData } from "@/types/workGroup";

interface WorkGroupFormData {
  name: string;
  description: string;
  plucker_rate: number;
  supervisor_rate: number;
}

export default function NewWorkGroupPage() {
  const router = useRouter();
  const createWorkGroup = useCreateWorkGroup();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const { data: usersData, isLoading: usersLoading } = useHrisUsers(
    isAdmin ? {} : (undefined as any),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkGroupFormData>({
    defaultValues: { name: "", description: "", plucker_rate: 0, supervisor_rate: 0 },
  });

  const [ownerId, setOwnerId] = useState("");
  const [clusterId, setClusterId] = useState("");

  const { data: clustersData, isLoading: clustersLoading } = useClusters({ per_page: 100 });

  const ownerOptions =
    usersData?.data?.map((u) => ({
      value: u.id,
      label: u.name,
      description: u.phone,
    })) || [];

  const onSubmit = (data: WorkGroupFormData) => {
    const payload: CreateWorkGroupData = {
      name: data.name,
      description: data.description,
      active: true,
      owner_id: isAdmin ? ownerId : user?.id || "",
      plucker_rate: data.plucker_rate,
      supervisor_rate: data.supervisor_rate,
      cluster_id: clusterId || undefined,
    };

    createWorkGroup.mutate(payload, {
      onSuccess: () => router.push("/work-groups"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href="/work-groups"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdGroup className="w-6 h-6 text-emerald-600" />
                  Create Work Group
                </h1>
                <p className="text-gray-500 mt-1">
                  Create a new work group and assign an owner
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Group Name"
                placeholder="Enter work group name"
                register={register("name", { required: "Name is required" })}
                error={errors.name?.message}
                required
              />

              <SearchableSelect
                label="Cluster"
                options={(clustersData?.data ?? []).map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                value={clusterId}
                onChange={setClusterId}
                placeholder="Select cluster"
                isLoading={clustersLoading}
              />

              {isAdmin && (
                <SearchableSelect
                  label="Owner"
                  options={ownerOptions}
                  value={ownerId}
                  onChange={setOwnerId}
                  placeholder="Select owner"
                  isLoading={usersLoading}
                  required
                />
              )}
            </div>

            <TextAreaField
              label="Description"
              placeholder="Enter description"
              register={register("description")}
              rows={3}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Plucker Rate (per Kg)"
                type="number"
                placeholder="e.g. 9"
                step="0.01"
                register={register("plucker_rate", {
                  required: "Plucker rate is required",
                  min: { value: 0, message: "Rate must be 0 or more" },
                })}
                error={errors.plucker_rate?.message}
                required
              />
              <InputField
                label="Supervisor Rate (per Kg)"
                type="number"
                placeholder="e.g. 2"
                step="0.01"
                register={register("supervisor_rate", {
                  required: "Supervisor rate is required",
                  min: { value: 0, message: "Rate must be 0 or more" },
                })}
                error={errors.supervisor_rate?.message}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to="/work-groups">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={createWorkGroup.isPending}
              >
                {createWorkGroup.isPending
                  ? "Creating..."
                  : "Create Work Group"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
