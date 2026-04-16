"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdGroup } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useHrisUser, useUpdateHrisUser } from "@/hooks/useHrisUser";
import type { UpdateHrisUserData } from "@/types/hrisUser";

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export default function EditHrisUserPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: userResponse, isLoading } = useHrisUser(id);
  const updateUser = useUpdateHrisUser();
  const user = userResponse?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    values: user
      ? { name: user.name, email: user.email, phone: user.phone, password: "" }
      : undefined,
  });

  const [role, setRole] = useState<string | null>(null);

  const roleValue = role ?? (user ? user.role : "");

  const onSubmit = (data: UserFormData) => {
    const payload: UpdateHrisUserData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: roleValue as UpdateHrisUserData["role"],
    };
    if (data.password) {
      payload.password = data.password;
    }
    updateUser.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/hris/users/${id}`) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          User not found
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
                href={`/hris/users/${id}`}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdGroup className="w-6 h-6 text-emerald-600" />
                  Edit User
                </h1>
                <p className="text-gray-500 mt-1">Update user information</p>
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
              placeholder="user@example.com"
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
              placeholder="Leave blank to keep current password"
              register={register("password")}
            />

            <InputField
              label="Phone"
              placeholder="e.g. +254700000000"
              register={register("phone", { required: "Phone is required" })}
              error={errors.phone?.message}
              required
            />

            <SearchableSelect
              label="Role"
              options={[
                { value: "admin", label: "Admin" },
                { value: "farmer", label: "Farmer" },
                { value: "supervisor", label: "Supervisor" },
                { value: "farm_worker", label: "Farm Worker" },
              ]}
              value={roleValue}
              onChange={setRole}
              placeholder="Select role"
              required
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to={`/hris/users/${id}`}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
