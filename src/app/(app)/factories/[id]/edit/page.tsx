"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdFactory } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useFactory, useUpdateFactory } from "@/hooks/useFactory";
import { useZones } from "@/hooks/useZone";
import { useHrisUsers } from "@/hooks/useHrisUser";
import type { UpdateFactoryData } from "@/types/factory";

interface FactoryFormData {
  name: string;
  code: string;
}

export default function EditFactoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: factoryResponse, isLoading } = useFactory(id);
  const updateFactory = useUpdateFactory();
  const factory = factoryResponse?.data;

  const [adminSearch, setAdminSearch] = useState("");

  const { data: zonesData, isLoading: zonesLoading } = useZones();
  const { data: usersData, isLoading: usersLoading } = useHrisUsers({
    role: "admin",
    search: adminSearch || undefined,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FactoryFormData>({
    values: factory
      ? {
          name: factory.name,
          code: factory.code,
        }
      : undefined,
  });

  const [zoneId, setZoneId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const zoneValue = zoneId ?? (factory?.zone?.id || "");
  const userValue = userId ?? (factory?.admin?.id || "");

  const zones = zonesData || [];
  const users = usersData?.data || [];

  const zoneOptions = zones.map((z) => ({ value: z.id, label: z.name }));
  const userOptions = [
    { value: "", label: "None" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const onSubmit = (data: FactoryFormData) => {
    const payload: UpdateFactoryData = {
      name: data.name,
      code: data.code,
      zone_id: zoneValue,
    };
    if (userValue) {
      payload.user_id = userValue;
    }
    updateFactory.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/factories/${id}`) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!factory) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Factory not found
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
                href={`/factories/${id}`}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdFactory className="w-6 h-6 text-emerald-600" />
                  Edit Factory
                </h1>
                <p className="text-gray-500 mt-1">Update factory information</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <InputField
              label="Name"
              placeholder="Factory name"
              register={register("name", { required: "Name is required" })}
              error={errors.name?.message}
              required
            />

            <InputField
              label="Code"
              placeholder="e.g. FAC-001"
              register={register("code", { required: "Code is required" })}
              error={errors.code?.message}
              required
            />

            <SearchableSelect
              label="Zone"
              options={zoneOptions}
              value={zoneValue}
              onChange={setZoneId}
              placeholder="Select zone"
              isLoading={zonesLoading}
              required
            />

            <SearchableSelect
              label="Admin (Optional)"
              options={userOptions}
              value={userValue}
              onChange={setUserId}
              placeholder="Select admin user"
              isLoading={usersLoading}
              onSearchChange={setAdminSearch}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to={`/factories/${id}`}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={updateFactory.isPending}
              >
                {updateFactory.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
