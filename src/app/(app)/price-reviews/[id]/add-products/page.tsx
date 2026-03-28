"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MdArrowBack,
  MdAdd,
  MdDelete,
  MdPriceChange,
  MdInventory,
  MdClose,
} from "react-icons/md";
import {
  usePriceReview,
  useAddProductsToPriceReview,
} from "@/hooks/usePriceReview";
import { useProducts } from "@/hooks/useProduct";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Button from "@/components/common/Button";

interface AddProductsPageProps {
  params: Promise<{ id: string }>;
}

const purchaseVolumeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  min_quantity: z.number().min(0, "Min quantity must be 0 or greater"),
  max_quantity: z.number().nullable(),
  price: z.number().min(0, "Price must be 0 or greater"),
});

const productSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  old_price: z.number().min(0, "Old price must be 0 or greater"),
  new_price: z.number().min(0, "New price must be 0 or greater"),
  purchase_volumes: z.array(purchaseVolumeSchema).optional(),
});

const formSchema = z.object({
  products: z.array(productSchema).min(1, "At least one product is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AddProductsPage({ params }: AddProductsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [showVolumes, setShowVolumes] = useState<Record<number, boolean>>({});

  const { data: review, isLoading: reviewLoading } = usePriceReview(id);
  const { data: productsData, isLoading: productsLoading } = useProducts({
    per_page: 100,
  });
  const addProductsMutation = useAddProductsToPriceReview();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: [
        {
          product_id: "",
          old_price: 0,
          new_price: 0,
          purchase_volumes: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const productOptions =
    productsData?.data?.map((product) => ({
      value: product.id,
      label: `${product.name} (${product.sku})`,
    })) || [];

  const toggleVolumes = (index: number) => {
    setShowVolumes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const addVolumeTier = (productIndex: number) => {
    const currentVolumes =
      watch(`products.${productIndex}.purchase_volumes`) || [];
    const newTier = {
      name: "",
      min_quantity:
        currentVolumes.length > 0
          ? (currentVolumes[currentVolumes.length - 1].max_quantity || 0) + 1
          : 1,
      max_quantity: null,
      price: watch(`products.${productIndex}.new_price`) || 0,
    };
    setValue(`products.${productIndex}.purchase_volumes`, [
      ...currentVolumes,
      newTier,
    ]);
    setShowVolumes((prev) => ({ ...prev, [productIndex]: true }));
  };

  const removeVolumeTier = (productIndex: number, tierIndex: number) => {
    const currentVolumes =
      watch(`products.${productIndex}.purchase_volumes`) || [];
    const newVolumes = currentVolumes.filter((_, i) => i !== tierIndex);
    setValue(`products.${productIndex}.purchase_volumes`, newVolumes);
  };

  const onSubmit = (data: FormData) => {
    addProductsMutation.mutate(
      { id, data: { products: data.products } },
      {
        onSuccess: () => {
          router.push(`/price-reviews/${id}`);
        },
      },
    );
  };

  if (reviewLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Price review not found</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-8 py-2">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href={`/price-reviews/${id}`}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <MdPriceChange className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Add Products to Review
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">{review.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto space-y-4"
        >
          {fields.map((field, index) => {
            const watchedProduct = watch(`products.${index}`);
            const purchaseVolumes = watchedProduct?.purchase_volumes || [];

            return (
              <div
                key={field.id}
                className="bg-white rounded-lg border border-gray-200 p-4 mt-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <MdInventory className="w-4 h-4 text-gray-400" />
                    Product {index + 1}
                  </h3>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <MdDelete className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-3">
                    <SearchableSelect
                      label="Product"
                      options={productOptions}
                      value={watchedProduct?.product_id || ""}
                      onChange={(value) =>
                        setValue(`products.${index}.product_id`, value)
                      }
                      placeholder="Select a product..."
                      error={errors.products?.[index]?.product_id?.message}
                      isLoading={productsLoading}
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 mb-2 flex text-xs sm:text-sm font-semibold">
                      Old Price (KES)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`products.${index}.old_price`, {
                        valueAsNumber: true,
                      })}
                      className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-4 py-3 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                    />
                    {errors.products?.[index]?.old_price?.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.products?.[index]?.old_price?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-gray-700 mb-2 flex text-xs sm:text-sm font-semibold">
                      New Price (KES)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`products.${index}.new_price`, {
                        valueAsNumber: true,
                      })}
                      className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-4 py-3 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                    />
                    {errors.products?.[index]?.new_price?.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.products?.[index]?.new_price?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => addVolumeTier(index)}
                      className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <MdAdd className="w-4 h-4" />
                      Add Volume Tier
                    </button>
                  </div>
                </div>

                {/* Purchase Volumes */}
                {purchaseVolumes.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => toggleVolumes(index)}
                      className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1"
                    >
                      Volume Pricing ({purchaseVolumes.length} tier
                      {purchaseVolumes.length !== 1 ? "s" : ""})
                      {showVolumes[index] ? (
                        <span className="text-xs text-gray-400">▲</span>
                      ) : (
                        <span className="text-xs text-gray-400">▼</span>
                      )}
                    </button>

                    {showVolumes[index] && (
                      <div className="space-y-3">
                        {purchaseVolumes.map((_, volIndex) => (
                          <div
                            key={volIndex}
                            className="grid grid-cols-5 gap-3 bg-gray-50 p-3 rounded-lg"
                          >
                            <div>
                              <label className="text-gray-700 mb-2 flex text-xs font-semibold">
                                Tier Name
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Retail"
                                {...register(
                                  `products.${index}.purchase_volumes.${volIndex}.name`,
                                )}
                                className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-3 py-2 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                              />
                              {errors.products?.[index]?.purchase_volumes?.[
                                volIndex
                              ]?.name?.message && (
                                <p className="text-red-500 text-xs mt-1">
                                  {
                                    errors.products?.[index]
                                      ?.purchase_volumes?.[volIndex]?.name
                                      ?.message
                                  }
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="text-gray-700 mb-2 flex text-xs font-semibold">
                                Min Qty
                              </label>
                              <input
                                type="number"
                                {...register(
                                  `products.${index}.purchase_volumes.${volIndex}.min_quantity`,
                                  { valueAsNumber: true },
                                )}
                                className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-3 py-2 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                              />
                              {errors.products?.[index]?.purchase_volumes?.[
                                volIndex
                              ]?.min_quantity?.message && (
                                <p className="text-red-500 text-xs mt-1">
                                  {
                                    errors.products?.[index]
                                      ?.purchase_volumes?.[volIndex]
                                      ?.min_quantity?.message
                                  }
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="text-gray-700 mb-2 flex text-xs font-semibold">
                                Max Qty
                              </label>
                              <input
                                type="number"
                                placeholder="∞"
                                {...register(
                                  `products.${index}.purchase_volumes.${volIndex}.max_quantity`,
                                  {
                                    setValueAs: (v) =>
                                      v === "" || v === null ? null : Number(v),
                                  },
                                )}
                                className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-3 py-2 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-gray-700 mb-2 flex text-xs font-semibold">
                                Price (KES)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                {...register(
                                  `products.${index}.purchase_volumes.${volIndex}.price`,
                                  { valueAsNumber: true },
                                )}
                                className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-3 py-2 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                              />
                              {errors.products?.[index]?.purchase_volumes?.[
                                volIndex
                              ]?.price?.message && (
                                <p className="text-red-500 text-xs mt-1">
                                  {
                                    errors.products?.[index]
                                      ?.purchase_volumes?.[volIndex]?.price
                                      ?.message
                                  }
                                </p>
                              )}
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() =>
                                  removeVolumeTier(index, volIndex)
                                }
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove tier"
                              >
                                <MdClose className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addVolumeTier(index)}
                          className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-1 text-sm"
                        >
                          <MdAdd className="w-4 h-4" />
                          Add Another Tier
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Product Button */}
          <button
            type="button"
            onClick={() =>
              append({
                product_id: "",
                old_price: 0,
                new_price: 0,
                purchase_volumes: [],
              })
            }
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
          >
            <MdAdd className="w-5 h-5" />
            Add Another Product
          </button>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 pb-6 sticky bottom-0 bg-gray-50">
            <Link
              href={`/price-reviews/${id}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
            >
              Cancel
            </Link>
            <Button
              htmlType="submit"
              disabled={addProductsMutation.isPending}
              className="px-6"
            >
              {addProductsMutation.isPending ? "Adding..." : "Add Products"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
