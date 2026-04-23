"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdSupervisorAccount } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateHrisUser } from "@/hooks/useHrisUser";
import { useFarms } from "@/hooks/useFarm";
import type { CreateHrisUserData } from "@/types/hrisUser";

interface SupervisorFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export default function NewSupervisorPage() {
  const router = useRouter();
  const createUser = useCreateHrisUser();
  const [farmSearch, setFarmSearch] = useState("");
  const { data: farmsData, isLoading: farmsLoading } = useFarms({
    search: farmSearch || undefined,
  });

  const [farmId, setFarmId] = useState("");

  const farmOptions =
    farmsData?.data?.map((f) => ({
      value: f.id,
      label: f.name,
    })) || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupervisorFormData>({
    defaultValues: { name: "", email: "", password: "", phone: "" },
  });

  const onSubmit = (data: SupervisorFormData) => {
    const payload: any = {
      ...data,
      role: "supervisor",
    };
    if (farmId) {
      payload.farm_id = farmId;
    }
    createUser.mutate(payload as CreateHrisUserData, {
      onSuccess: () => router.push("/farm-supervisors"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href="/farm-supervisors"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdSupervisorAccount className="w-6 h-6 text-emerald-600" />
                  Add New Supervisor
                </h1>
                <p className="text-gray-500 mt-1">
                  Register a new farm supervisor in the system
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <InputField
              label="Name"
              placeholder="Full name"
              register={register("name", { required: "Name is required" })}
              error={errors.name?.message}
              required
            />

            <InputField
              label="Email"
              type="email"
              placeholder="supervisor@example.com"
              register={register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              error={errors.email?.message}
              required
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Enter password"
              register={register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              error={errors.password?.message}
              required
            />

            <InputField
              label="Phone"
              placeholder="e.g. 0700000000"
              register={register("phone", { required: "Phone is required" })}
              error={errors.phone?.message}
              required
            />

            <SearchableSelect
              label="Assign to Farm"
              options={farmOptions}
              value={farmId}
              onChange={setFarmId}
              placeholder="Select farm to assign supervisor"
              isLoading={farmsLoading}
              onSearchChange={setFarmSearch}
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to="/farm-supervisors">
                Cancel
              </Button>
              <button
                type="submit"
                disabled={createUser.isPending}
                className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {createUser.isPending ? "Creating..." : "Create Supervisor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
