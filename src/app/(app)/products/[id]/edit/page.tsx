"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { MdArrowBack, MdInventory } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { TextAreaField } from "@/components/common/TextAreaField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";
import { useProduct, useUpdateProduct } from "@/hooks/useProduct";
import type { UpdateProductData } from "@/types/product";

interface ProductFormData {
  name: string;
  description: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: productResponse, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();
  const product = productResponse?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    values: product
      ? { name: product.name, description: product.description || "" }
      : undefined,
  });

  const [isActive, setIsActive] = useState<string | null>(null);

  const activeValue =
    isActive ?? (product ? String(product.is_active) : "true");

  const onSubmit = (data: ProductFormData) => {
    const payload: UpdateProductData = {
      name: data.name,
      description: data.description || undefined,
      is_active: activeValue === "true",
    };
    updateProduct.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/products/${id}`) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Product not found
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
                href={`/products/${id}`}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdInventory className="w-6 h-6 text-emerald-600" />
                  Edit Product
                </h1>
                <p className="text-gray-500 mt-1">Update product information</p>
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
              value={activeValue}
              onChange={setIsActive}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="secondary" to={`/products/${id}`}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={updateProduct.isPending}
              >
                {updateProduct.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
