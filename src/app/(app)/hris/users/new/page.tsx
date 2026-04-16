"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdGroup } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateHrisUser } from "@/hooks/useHrisUser";
import type { CreateHrisUserData } from "@/types/hrisUser";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export default function NewHrisUserPage() {
  const router = useRouter();
  const createUser = useCreateHrisUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: { name: "", email: "", password: "", phone: "" },
  });

  const [role, setRole] = useState("");

  const onSubmit = (data: UserFormData) => {
    if (!role) return;
    const payload: CreateHrisUserData = {
      ...data,
      role: role as CreateHrisUserData["role"],
    };
    createUser.mutate(payload, {
      onSuccess: () => router.push("/hris/users"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href="/hris/users"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdGroup className="w-6 h-6 text-emerald-600" />
                  Add New User
                </h1>
                <p className="text-gray-500 mt-1">Create a new system user</p>
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
              value={role}
              onChange={setRole}
              placeholder="Select role"
              required
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to="/hris/users">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={createUser.isPending || !role}
              >
                {createUser.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
