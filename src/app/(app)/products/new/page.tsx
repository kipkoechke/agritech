"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdInventory } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { TextAreaField } from "@/components/common/TextAreaField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useCreateProduct } from "@/hooks/useProduct";
import type { CreateProductData } from "@/types/product";

interface ProductFormData {
  name: string;
  description: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: { name: "", description: "" },
  });

  const [isActive, setIsActive] = useState("true");

  const onSubmit = (data: ProductFormData) => {
    const payload: CreateProductData = {
      name: data.name,
      description: data.description || undefined,
      is_active: isActive === "true",
    };
    createProduct.mutate(payload, {
      onSuccess: () => router.push("/products"),
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdInventory className="w-6 h-6 text-emerald-600" />
                  Add New Product
                </h1>
                <p className="text-gray-500 mt-1">Create a new product</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <InputField
              label="Name"
              placeholder="Enter product name"
              register={register("name", { required: "Name is required" })}
              error={errors.name?.message}
              required
            />

            <TextAreaField
              label="Description"
              placeholder="Enter product description"
              register={register("description")}
              rows={3}
            />

            <SearchableSelect
              label="Status"
              options={[
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
              value={isActive}
              onChange={setIsActive}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to="/products">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={createProduct.isPending}
              >
                {createProduct.isPending ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
