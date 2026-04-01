"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdPerson } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import Button from "@/components/common/Button";
import { useCreateHrisUser } from "@/hooks/useHrisUser";
import type { CreateHrisUserData } from "@/types/hrisUser";

interface FarmerFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export default function NewFarmerPage() {
  const router = useRouter();
  const createUser = useCreateHrisUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmerFormData>({
    defaultValues: { name: "", email: "", password: "", phone: "" },
  });

  const onSubmit = (data: FarmerFormData) => {
    const payload: CreateHrisUserData = {
      ...data,
      role: "farmer",
    };
    createUser.mutate(payload, {
      onSuccess: () => router.push("/farmers"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/farmers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Farmers
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdPerson className="w-6 h-6 text-emerald-600" />
              Add New Farmer
            </h1>
            <p className="text-gray-500 mt-1">Register a new farmer in the system</p>
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
              placeholder="farmer@example.com"
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

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to="/farmers">
                Cancel
              </Button>
              <button
                type="submit"
                disabled={createUser.isPending}
                className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {createUser.isPending ? "Creating..." : "Create Farmer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
