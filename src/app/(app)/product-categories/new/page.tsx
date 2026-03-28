"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { MdArrowBack, MdCategory } from "react-icons/md";
import { useCreateProductCategory } from "@/hooks/useProductCategory";
import { InputField } from "@/components/common/InputField";
import { TextAreaField } from "@/components/common/TextAreaField";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  shelf_life_days: z.string().optional(),
  storage_temperature: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function NewProductCategoryPage() {
  const router = useRouter();
  const createMutation = useCreateProductCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = (data: CategoryFormData) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      metadata: {
        shelf_life_days: data.shelf_life_days
          ? parseInt(data.shelf_life_days, 10)
          : undefined,
        storage_temperature: data.storage_temperature || undefined,
      },
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        router.push("/product-categories");
      },
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-8 py-2">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <Link
            href="/product-categories"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MdCategory className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                New Product Category
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Create a new category for products
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="space-y-5">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-5">
                  <InputField
                    label="Category Name"
                    type="text"
                    placeholder="Enter category name"
                    register={register("name")}
                    error={errors.name?.message}
                    required
                  />
                  <TextAreaField
                    label="Description"
                    placeholder="Enter category description"
                    register={register("description")}
                    error={errors.description?.message}
                    rows={3}
                  />
                </div>
              </div>

              {/* Storage Requirements */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Storage Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Storage Temperature"
                    type="text"
                    placeholder="e.g., 2-4°C"
                    register={register("storage_temperature")}
                    error={errors.storage_temperature?.message}
                  />
                  <InputField
                    label="Shelf Life (days)"
                    type="number"
                    placeholder="Enter number of days"
                    register={register("shelf_life_days")}
                    error={errors.shelf_life_days?.message}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-gray-200">
              <Link
                href="/product-categories"
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {createMutation.isPending ? "Creating..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
