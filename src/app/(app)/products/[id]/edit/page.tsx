"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { laravelLoader } from "@/lib/imageLoader";
import {
  MdArrowBack,
  MdInventory2,
  MdCloudUpload,
  MdClose,
} from "react-icons/md";
import { useProduct, useUpdateProduct } from "@/hooks/useProduct";
import { useProductCategories } from "@/hooks/useProductCategory";
import { InputField } from "@/components/common/InputField";
import { TextAreaField } from "@/components/common/TextAreaField";
import { SearchableSelect } from "@/components/common/SearchableSelect";

const UNIT_OF_MEASURE_OPTIONS = [
  { value: "liters", label: "Liters" },
  { value: "cartons", label: "Cartons" },
  { value: "pieces", label: "Pieces" },
  { value: "trays", label: "Trays" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "grams", label: "Grams" },
  { value: "bottles", label: "Bottles" },
  { value: "packs", label: "Packs" },
];

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  unit_of_measure: z.string().optional(),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  product_category_id: z.string().min(1, "Category is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: product, isLoading } = useProduct(id);
  const updateMutation = useUpdateProduct();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { data: categoriesData, isLoading: categoriesLoading } =
    useProductCategories({ per_page: 100 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const categoryOptions =
    categoriesData?.data.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })) || [];

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        unit_of_measure: product.unit_of_measure || "",
        description: product.description || "",
        price: String(product.base_price || ""),
        product_category_id: product.category?.id || "",
      });
      if (product.image) {
        setImagePreview(product.image);
      }
    }
  }, [product, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = (data: ProductFormData) => {
    const payload: Record<string, unknown> = {
      name: data.name,
      sku: data.sku,
      unit_of_measure: data.unit_of_measure || undefined,
      description: data.description || undefined,
      price: parseFloat(data.price),
      product_category_id: data.product_category_id,
    };

    if (imageFile) {
      payload.image = imageFile;
    } else if (!imagePreview) {
      payload.image = "";
    }

    updateMutation.mutate(
      { id, data: payload as any },
      {
        onSuccess: () => {
          router.push(`/products/${id}`);
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
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-8 py-2">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <Link
            href={`/products/${id}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MdInventory2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Update product information
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Product Name"
                    type="text"
                    placeholder="Enter product name"
                    register={register("name")}
                    error={errors.name?.message}
                    required
                  />
                  <InputField
                    label="SKU"
                    type="text"
                    placeholder="e.g., RG-MLK-001"
                    register={register("sku")}
                    error={errors.sku?.message}
                    required
                  />
                  <div className="md:col-span-2">
                    <TextAreaField
                      label="Description"
                      placeholder="Enter product description"
                      register={register("description")}
                      error={errors.description?.message}
                      rows={3}
                    />
                  </div>
                  <SearchableSelect
                    label="Category"
                    options={categoryOptions}
                    value={watch("product_category_id") || ""}
                    onChange={(value) => setValue("product_category_id", value)}
                    error={errors.product_category_id?.message}
                    required
                    disabled={categoriesLoading}
                    placeholder="Select category..."
                  />
                  <SearchableSelect
                    label="Unit of Measure"
                    options={UNIT_OF_MEASURE_OPTIONS}
                    value={watch("unit_of_measure") || ""}
                    onChange={(value) => setValue("unit_of_measure", value)}
                    placeholder="Select unit..."
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Price (KES)"
                    type="number"
                    placeholder="0.00"
                    register={register("price")}
                    error={errors.price?.message}
                    required
                  />
                </div>
              </div>

              {/* Product Image */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Product Image
                </h3>
                {imagePreview ? (
                  <div className="relative w-40 h-40">
                    <Image
                      loader={laravelLoader}
                      src={imagePreview}
                      alt="Product preview"
                      fill
                      className="object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-accent hover:bg-gray-50 transition-colors">
                    <MdCloudUpload className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-gray-200">
              <Link
                href={`/products/${id}`}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
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
