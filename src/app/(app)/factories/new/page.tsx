"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdFactory } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateFactory } from "@/hooks/useFactory";
import { useZones } from "@/hooks/useZone";
import { useHrisUsers } from "@/hooks/useHrisUser";
import type { CreateFactoryData } from "@/types/factory";

interface FactoryFormData {
  name: string;
  code: string;
  lat: string;
  lng: string;
}

export default function NewFactoryPage() {
  const router = useRouter();
  const createFactory = useCreateFactory();

  const { data: zonesData, isLoading: zonesLoading } = useZones();
  const { data: usersData, isLoading: usersLoading } = useHrisUsers({
    role: "admin",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FactoryFormData>({
    defaultValues: { name: "", code: "", lat: "", lng: "" },
  });

  const [zoneId, setZoneId] = useState("");
  const [userId, setUserId] = useState("");

  const zones = zonesData || [];
  const users = usersData?.data || [];

  const zoneOptions = zones.map((z) => ({ value: z.id, label: z.name }));
  const userOptions = [
    { value: "", label: "None" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const onSubmit = (data: FactoryFormData) => {
    if (!zoneId) return;
    const payload: CreateFactoryData = {
      name: data.name,
      code: data.code,
      zone_id: zoneId,
    };
    if (data.lat && data.lng) {
      payload.coordinates = {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
      };
    }
    if (userId) {
      payload.user_id = userId;
    }
    createFactory.mutate(payload, {
      onSuccess: () => router.push("/factories"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href="/factories"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdFactory className="w-6 h-6 text-emerald-600" />
                  Add New Factory
                </h1>
                <p className="text-gray-500 mt-1">
                  Create a new processing factory
                </p>
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
              value={zoneId}
              onChange={setZoneId}
              placeholder="Select zone"
              isLoading={zonesLoading}
              required
            />

            <SearchableSelect
              label="Admin (Optional)"
              options={userOptions}
              value={userId}
              onChange={setUserId}
              placeholder="Select admin user"
              isLoading={usersLoading}
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
              <Button type="secondary" to="/factories">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={createFactory.isPending || !zoneId}
              >
                {createFactory.isPending ? "Creating..." : "Create Factory"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
