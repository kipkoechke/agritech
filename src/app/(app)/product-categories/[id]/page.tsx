"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdCategory,
  MdThermostat,
  MdSchedule,
  MdInventory,
  MdAttachMoney,
} from "react-icons/md";
import {
  useProductCategory,
  useDeleteProductCategory,
} from "@/hooks/useProductCategory";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

interface ProductCategoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductCategoryDetailPage({
  params,
}: ProductCategoryDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: category, isLoading, error } = useProductCategory(id);
  const deleteMutation = useDeleteProductCategory();

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push("/product-categories");
      },
    });
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `KES ${numPrice.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Failed to load category details</p>
      </div>
    );
  }

  const storageTemp =
    category.metadata?.storage_requirements?.temperature ||
    category.metadata?.storage_temperature;
  const shelfLife =
    category.metadata?.storage_requirements?.shelf_life_days ||
    category.metadata?.shelf_life_days;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 md:mb-6 shrink-0">
          <div className="flex items-start gap-3">
            <Link
              href="/product-categories"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <MdCategory className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2 md:line-clamp-1">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-13 md:ml-0">
            <Link
              href={`/product-categories/${id}/edit`}
              className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm inline-flex items-center gap-2"
            >
              <MdEdit className="w-4 h-4" />
              Edit
            </Link>
            <Modal>
              <Modal.Open opens="delete-category">
                <button className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm inline-flex items-center gap-2">
                  <MdDelete className="w-4 h-4" />
                  Delete
                </button>
              </Modal.Open>
              <Modal.Window name="delete-category">
                <DeleteConfirmationModal
                  itemName={category.name}
                  itemType="category"
                  onConfirm={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              </Modal.Window>
            </Modal>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdThermostat className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Storage Temp</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {storageTemp || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdSchedule className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Shelf Life</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {shelfLife ? `${shelfLife} days` : "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <MdInventory className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Products</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {category.products?.length || 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdCategory className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Market Segment</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {category.metadata?.market_segment || "General"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            {/* Metadata */}
            {category.metadata && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Category Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.metadata.quality_standards && (
                    <div>
                      <p className="text-xs text-gray-500">Quality Standards</p>
                      <p className="text-sm text-gray-900">
                        {category.metadata.quality_standards}
                      </p>
                    </div>
                  )}
                  {category.metadata.storage_requirements?.humidity && (
                    <div>
                      <p className="text-xs text-gray-500">Humidity</p>
                      <p className="text-sm text-gray-900">
                        {category.metadata.storage_requirements.humidity}
                      </p>
                    </div>
                  )}
                </div>

                {category.metadata.typical_products &&
                  category.metadata.typical_products.length > 0 && (
                    <>
                      <div className="border-t border-gray-100 my-4"></div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">
                          Typical Products
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {category.metadata.typical_products.map(
                            (product, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {product}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </>
                  )}
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Created:{" "}
                  {new Date(category.created_at).toLocaleDateString("en-GB")}
                </span>
                <span>
                  Updated:{" "}
                  {new Date(category.updated_at).toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>
          </div>

          {/* Products in Category */}
          {category.products && category.products.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Products in this Category
              </h3>
              <div className="space-y-2">
                {category.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
                        <MdInventory className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MdAttachMoney className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-600">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
