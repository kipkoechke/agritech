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
import { useFarms } from "@/hooks/useFarm";
import { useAuth, useIsFarmer } from "@/hooks/useAuth";
import type { CreateWorkGroupData } from "@/types/workGroup";

interface WorkGroupFormData {
  name: string;
  description: string;
}

export default function NewWorkGroupPage() {
  const router = useRouter();
  const createWorkGroup = useCreateWorkGroup();
  const { user } = useAuth();
  const isFarmer = useIsFarmer();
  const { data: usersData, isLoading: usersLoading } = useHrisUsers(
    !isFarmer ? {} : (undefined as any),
  );
  const { data: farmsData, isLoading: farmsLoading } = useFarms({
    per_page: 100,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkGroupFormData>({
    defaultValues: { name: "", description: "" },
  });

  const [ownerId, setOwnerId] = useState("");
  const [farmId, setFarmId] = useState("");
  const [date, setDate] = useState("");

  const ownerOptions =
    usersData?.data?.map((u) => ({
      value: u.id,
      label: u.name,
      description: u.phone,
    })) || [];

  const farmOptions =
    farmsData?.data?.map((f) => ({
      value: f.id,
      label: f.name,
    })) || [];

  const onSubmit = (data: WorkGroupFormData) => {
    const payload: CreateWorkGroupData = {
      name: data.name,
      description: data.description,
      active: true,
      owner_id: !isFarmer ? ownerId : user?.id || "",
      farm_id: farmId || undefined,
      date: date || undefined,
    };

    createWorkGroup.mutate(payload, {
      onSuccess: () => router.push("/work-groups"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/work-groups"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Work Groups
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdGroup className="w-6 h-6 text-emerald-600" />
              Create Work Group
            </h1>
            <p className="text-gray-500 mt-1">
              Create a new work group and assign an owner
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Row 1: Group Name | Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Group Name"
                placeholder="Enter work group name"
                register={register("name", { required: "Name is required" })}
                error={errors.name?.message}
                required
              />

              {!isFarmer && (
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

            {/* Row 2: Linked Farm | Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SearchableSelect
                label="Linked Farm"
                options={farmOptions}
                value={farmId}
                onChange={setFarmId}
                placeholder="Select farm (optional)"
                isLoading={farmsLoading}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-gray-300 focus:border-emerald-500 text-gray-900 focus:ring-emerald-500 hover:border-gray-400 w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 3: Description (Full Width) */}
            <TextAreaField
              label="Description"
              placeholder="Enter description"
              register={register("description")}
              rows={3}
            />

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
