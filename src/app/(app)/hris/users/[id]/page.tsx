"use client";

import React, { useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser, useUpdateUser, useUserRoles } from "@/hooks/useUser";
import { useRegions } from "@/hooks/useRegion";
import { useZones } from "@/hooks/useZone";
import type { UpdateUserPayload } from "@/types/user";
import { HRISLayout } from "@/components/hris";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { MdArrowBack } from "react-icons/md";
import Link from "next/link";
import { updateUserSchema, UpdateUserFormData } from "../schema";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const isInitialLoad = useRef(true);

  const { data: user, isLoading: userLoading } = useUser(userId);
  const updateUserMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  // Watch region for cascading zones dropdown
  const selectedRegionId = watch("region_id");

  // Fetch data for dropdowns
  const { data: rolesData } = useUserRoles();
  const { data: regionsData } = useRegions();
  const { data: zonesData } = useZones(
    selectedRegionId ? { region_id: selectedRegionId } : {},
  );

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

  // Populate form when user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        role_id: user.role?.id || "",
        region_id: user.region?.id || "",
        zone_id: user.zone?.id || "",
        status: user.status,
      });
      isInitialLoad.current = false;
    }
  }, [user, reset]);

  // Reset zone when region changes (only after initial load)
  useEffect(() => {
    if (!isInitialLoad.current && selectedRegionId !== user?.region?.id) {
      setValue("zone_id", "");
    }
  }, [selectedRegionId, setValue, user?.region?.id]);

  const onSubmit = (data: UpdateUserFormData) => {
    const payload: UpdateUserPayload = {
      name: data.name,
      email: data.email,
      role_id: data.role_id,
      region_id: data.region_id || undefined,
      zone_id: data.zone_id || undefined,
      status: data.status,
      phone: data.phone || undefined,
    };

    // Add password only if provided
    if (data.password && data.password.length > 0) {
      payload.password = data.password;
    }

    updateUserMutation.mutate(
      { id: userId, payload },
      {
        onSuccess: () => {
          router.push("/hris/users");
        },
      },
    );
  };

  if (userLoading) {
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
              <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Update user information
              </p>
            </div>
          </div>
        }
        description=""
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 text-sm">Loading user data...</div>
        </div>
      </HRISLayout>
    );
  }

  if (!user) {
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
              <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Update user information
              </p>
            </div>
          </div>
        }
        description=""
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 mb-4 text-sm">User not found</div>
          <Link
            href="/hris/users"
            className="text-accent hover:underline text-sm"
          >
            Back to Users
          </Link>
        </div>
      </HRISLayout>
    );
  }

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
            <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Update user information
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
                placeholder="Leave blank to keep current"
                register={register("password")}
                error={errors.password?.message}
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
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={errors.role_id?.message}
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
                disabled={updateUserMutation.isPending}
                className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {updateUserMutation.isPending ? "Updating..." : "Update User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </HRISLayout>
  );
}
