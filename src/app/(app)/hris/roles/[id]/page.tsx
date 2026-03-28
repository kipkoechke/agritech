"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRole, useUpdateRole } from "@/hooks/useRole";
import { HRISLayout } from "@/components/hris";
import { InputField } from "@/components/common/InputField";
import { MdArrowBack } from "react-icons/md";
import Link from "next/link";
import { roleRankSchema, RoleRankFormData } from "../../schema";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id as string;

  const { data: role, isLoading } = useRole(roleId);
  const updateRoleMutation = useUpdateRole();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleRankFormData>({
    resolver: zodResolver(roleRankSchema),
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name || "",
      });
    }
  }, [role, reset]);

  const onSubmit = (data: RoleRankFormData) => {
    updateRoleMutation.mutate(
      { id: roleId, payload: data },
      {
        onSuccess: () => {
          router.push("/hris/roles");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <HRISLayout
        title={
          <div className="flex items-center gap-3">
            <Link
              href="/hris/roles"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MdArrowBack className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Role</h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Update role information
              </p>
            </div>
          </div>
        }
        description=""
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 text-sm">Loading role data...</div>
        </div>
      </HRISLayout>
    );
  }

  if (!role) {
    return (
      <HRISLayout
        title={
          <div className="flex items-center gap-3">
            <Link
              href="/hris/roles"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MdArrowBack className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Role</h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Update role information
              </p>
            </div>
          </div>
        }
        description=""
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 mb-4 text-sm">Role not found</div>
          <Link
            href="/hris/roles"
            className="text-accent hover:underline text-sm"
          >
            Back to Roles
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
            href="/hris/roles"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Role</h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Update role information
            </p>
          </div>
        </div>
      }
      description=""
    >
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <InputField
            label="Role Name"
            type="text"
            placeholder="Enter role name"
            register={register("name")}
            error={errors.name?.message}
            required
          />

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Link
              href="/hris/roles"
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateRoleMutation.isPending}
              className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </HRISLayout>
  );
}
