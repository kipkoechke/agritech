"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdGroup, MdArrowBack } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useWorkGroup, useUpdateWorkGroup } from "@/hooks/useWorkGroup";
import { useHrisUsers } from "@/hooks/useHrisUser";
import { useIsAdmin } from "@/hooks/useAuth";
import type { UpdateWorkGroupData } from "@/types/workGroup";

interface WorkGroupFormData {
  name: string;
  description: string;
  plucker_rate: number;
  supervisor_rate: number;
}

export default function EditWorkGroupPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: groupResponse, isLoading } = useWorkGroup(id);
  const updateWorkGroup = useUpdateWorkGroup();
  const isAdmin = useIsAdmin();
  const [ownerSearch, setOwnerSearch] = useState("");

  const { data: usersData, isLoading: usersLoading } = useHrisUsers(
    isAdmin ? { search: ownerSearch || undefined } : (undefined as any),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkGroupFormData>({
    defaultValues: { name: "", description: "", plucker_rate: 0, supervisor_rate: 0 },
  });

  const [ownerId, setOwnerId] = useState("");

  const group = groupResponse?.data;

  useEffect(() => {
    if (group) {
      reset({
        name: group.name,
        description: group.description,
        plucker_rate: group.plucker_rate ?? 0,
        supervisor_rate: group.supervisor_rate ?? 0,
      });
      setOwnerId(group.owner_id || "");
    }
  }, [group, reset]);

  const ownerOptions =
    usersData?.data?.map((u) => ({
      value: u.id,
      label: u.name,
      description: u.phone,
    })) || [];

  const onSubmit = (data: WorkGroupFormData) => {
    const payload: UpdateWorkGroupData = {
      name: data.name,
      description: data.description,
      active: true,
      owner_id: isAdmin ? ownerId || undefined : undefined,
      plucker_rate: data.plucker_rate,
      supervisor_rate: data.supervisor_rate,
    };

    updateWorkGroup.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/work-groups/${id}`) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Work group not found
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
                href={`/work-groups/${id}`}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdGroup className="w-6 h-6 text-emerald-600" />
                  Edit Work Group
                </h1>
                <p className="text-gray-500 mt-1">Update work group details</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <InputField
              label="Group Name"
              placeholder="Enter work group name"
              register={register("name", { required: "Name is required" })}
              error={errors.name?.message}
              required
            />

            <InputField
              label="Description"
              placeholder="Enter description"
              register={register("description")}
              error={errors.description?.message}
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

            {isAdmin && (
              <SearchableSelect
                label="Owner"
                options={ownerOptions}
                value={ownerId}
                onChange={setOwnerId}
                placeholder="Select owner"
                isLoading={usersLoading}
                onSearchChange={setOwnerSearch}
                required
              />
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to={`/work-groups/${id}`}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={updateWorkGroup.isPending}
              >
                {updateWorkGroup.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
