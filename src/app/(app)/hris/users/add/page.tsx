"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUser, useUserRoles } from "@/hooks/useUser";
import { useRegions } from "@/hooks/useRegion";
import { useZones } from "@/hooks/useZone";
import type { CreateUserPayload } from "@/types/user";
import { HRISLayout } from "@/components/hris";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { MdArrowBack } from "react-icons/md";
import Link from "next/link";
import { userSchema, UserFormData } from "../schema";

export default function AddUserPage() {
  const router = useRouter();
  const { createAUser, isCreating } = useCreateUser();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      status: true,
    },
  });

  // Watch region for cascading zones dropdown
  const selectedRegionId = watch("region_id");

  // Fetch data for dropdowns
  const { data: rolesData } = useUserRoles();
  const { data: regionsData } = useRegions();
  const { data: zonesData } = useZones(
    selectedRegionId ? { region_id: selectedRegionId } : {},
  );

  // Reset zone when region changes
  useEffect(() => {
    setValue("zone_id", "");
  }, [selectedRegionId, setValue]);

  // Role options from API
  const roleOptions =
    rolesData?.map((role) => ({
      value: String(role.id),
      label: role.name,
    })) || [];

  // Region options from API
  const regionOptions =
    regionsData?.data?.map((region) => ({
      value: region.id,
      label: region.name,
    })) || [];

  // Zone options filtered by region
  const zoneOptions =
    zonesData?.data?.map((zone) => ({
      value: zone.id,
      label: zone.name,
    })) || [];

  // Status options
  const statusOptions = [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  const onSubmit = (data: UserFormData) => {
    const payload: CreateUserPayload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role_id: data.role_id,
      region_id: data.region_id || undefined,
      zone_id: data.zone_id || undefined,
      status: data.status,
      phone: data.phone || undefined,
    };

    createAUser(payload, {
      onSuccess: () => {
        router.push("/hris/users");
      },
    });
  };

  return (
    <HRISLayout
      title={
        <div className="flex items-center gap-3">
          <Link
            href="/hris/users"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Add New User</h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Create a new system user
            </p>
          </div>
        </div>
      }
      description=""
    >
      <div className="h-full overflow-y-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Full Name"
                type="text"
                placeholder="Enter full name"
                register={register("name")}
                error={errors.name?.message}
                required
              />

              <InputField
                label="Email Address"
                type="email"
                placeholder="email@example.com"
                register={register("email")}
                error={errors.email?.message}
                required
              />
            </div>

            {/* Password and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Password"
                type="password"
                placeholder="Enter password"
                register={register("password")}
                error={errors.password?.message}
                required
              />

              <InputField
                label="Phone Number"
                type="tel"
                placeholder="254712345678"
                register={register("phone")}
                error={errors.phone?.message}
              />
            </div>

            {/* Role and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="role_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    label="Role"
                    options={roleOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.role_id?.message}
                    required
                    placeholder="Select role"
                    searchPlaceholder="Search roles..."
                  />
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    label="Status"
                    options={statusOptions}
                    value={String(field.value)}
                    onChange={(val) => field.onChange(val === "true")}
                    error={errors.status?.message}
                    placeholder="Select status"
                    searchPlaceholder="Search..."
                  />
                )}
              />
            </div>

            {/* Region and Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="region_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    label="Region"
                    options={regionOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={errors.region_id?.message}
                    placeholder="Select region"
                    searchPlaceholder="Search regions..."
                  />
                )}
              />

              <Controller
                name="zone_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    label="Zone"
                    options={zoneOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={errors.zone_id?.message}
                    placeholder="Select zone"
                    searchPlaceholder="Search zones..."
                    disabled={!selectedRegionId}
                  />
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Link
                href="/hris/users"
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isCreating ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </HRISLayout>
  );
}
