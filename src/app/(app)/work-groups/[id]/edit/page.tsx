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
import type { UpdateWorkGroupData } from "@/types/workGroup";

interface WorkGroupFormData {
  name: string;
  description: string;
}

export default function EditWorkGroupPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: groupResponse, isLoading } = useWorkGroup(id);
  const updateWorkGroup = useUpdateWorkGroup();
  const { data: usersData, isLoading: usersLoading } = useHrisUsers({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkGroupFormData>({
    defaultValues: { name: "", description: "" },
  });

  const [ownerId, setOwnerId] = useState("");
  const [active, setActive] = useState(true);

  const group = groupResponse?.data;

  useEffect(() => {
    if (group) {
      reset({ name: group.name, description: group.description });
      setOwnerId(group.owner_id || "");
      setActive(group.active);
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
      active,
      owner_id: ownerId || undefined,
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
      <div className="mb-6">
        <Link
          href={`/work-groups/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Work Group
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdGroup className="w-6 h-6 text-emerald-600" />
              Edit Work Group
            </h1>
            <p className="text-gray-500 mt-1">Update work group details</p>
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

            <SearchableSelect
              label="Owner"
              options={ownerOptions}
              value={ownerId}
              onChange={setOwnerId}
              placeholder="Select owner"
              isLoading={usersLoading}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>

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
