"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { MdArrowBack, MdBusiness } from "react-icons/md";
import {
  useBusinessManager,
  useUpdateBusinessManager,
} from "@/hooks/useBusinessManager";
import { InputField } from "@/components/common/InputField";

const businessManagerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

type BusinessManagerFormData = z.infer<typeof businessManagerSchema>;

interface EditBusinessManagerPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBusinessManagerPage({
  params,
}: EditBusinessManagerPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: manager, isLoading } = useBusinessManager(id);
  const updateMutation = useUpdateBusinessManager();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessManagerFormData>({
    resolver: zodResolver(businessManagerSchema),
  });

  useEffect(() => {
    if (manager) {
      reset({
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
      });
    }
  }, [manager, reset]);

  const onSubmit = (data: BusinessManagerFormData) => {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push(`/hris/business-managers/${id}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 md:mb-6 shrink-0">
          <Link
            href={`/hris/business-managers/${id}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
              <MdBusiness className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                Edit Business Manager
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                Update business manager information
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg border border-gray-200 p-4 md:p-6"
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
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
                  placeholder="Enter email address"
                  register={register("email")}
                  error={errors.email?.message}
                  required
                />
                <InputField
                  label="Phone Number"
                  type="tel"
                  placeholder="e.g., +254712345678"
                  register={register("phone")}
                  error={errors.phone?.message}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-3 justify-end pt-6 mt-6 border-t border-gray-200">
              <Link
                href={`/hris/business-managers/${id}`}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
