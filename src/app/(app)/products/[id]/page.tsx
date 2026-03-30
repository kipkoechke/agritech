"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { laravelLoader } from "@/lib/imageLoader";
import {
  MdArrowBack,
  MdAttachMoney,
  MdCancel,
  MdCategory,
  MdCheckCircle,
  MdDelete,
  MdEdit,
  MdHistory,
  MdInventory,
  MdInventory2,
  MdTrendingDown,
  MdTrendingUp,
} from "react-icons/md";
import {
  useDeleteProduct,
  useProduct,
  useProductPriceHistory,
} from "@/hooks/useProduct";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import type { Product, PriceHistory } from "@/types/product";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: productResponse, isLoading, error } = useProduct(id);
  const { data: priceHistoryResponse } = useProductPriceHistory(id);
  const deleteMutation = useDeleteProduct();

  const product = productResponse?.data;
  const priceHistory = priceHistoryResponse?.data;

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push("/products");
      },
    });
  };

  const formatPrice = (price?: number | string | null) => {
    if (price === undefined || price === null) return "N/A";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "N/A";
    return `KES ${numPrice.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MdInventory2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-red-500">Failed to load product details</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <MdArrowBack className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 md:mb-6 shrink-0">
          <div className="flex items-start gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden shrink-0">
                {product.image ? (
                  <Image
                    loader={laravelLoader}
                    src={product.image}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center">
                    <MdInventory2 className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  {product.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <MdCheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      <MdCancel className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  SKU: {product.sku}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-13 md:ml-0">
            <Link
              href={`/products/${id}/edit`}
              className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm inline-flex items-center gap-2"
            >
              <MdEdit className="w-4 h-4" />
              Edit
            </Link>
            <Modal>
              <Modal.Open opens="delete-product">
                <button className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm inline-flex items-center gap-2">
                  <MdDelete className="w-4 h-4" />
                  Delete
                </button>
              </Modal.Open>
              <Modal.Window name="delete-product">
                <DeleteConfirmationModal
                  itemName={product.name}
                  itemType="product"
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
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdAttachMoney className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Current Price</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdAttachMoney className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Production Cost</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {formatPrice(product.production_cost)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <MdCategory className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Category</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {product.category?.name || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdInventory className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Unit</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {product.unit_of_measure || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Product Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Product Details
              </h3>

              {/* Product Image */}
              {product.image && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 mb-4">
                  <Image
                    loader={laravelLoader}
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {product.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {product.description}
                </p>
              )}

              <div className="space-y-3">
                {product.discounted_price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discounted Price</span>
                    <span className="font-medium text-emerald-600">
                      {formatPrice(product.discounted_price)}
                    </span>
                  </div>
                )}
                {product.base_price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base Price</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(product.base_price)}
                    </span>
                  </div>
                )}
              </div>

              {/* Current Price Review */}
              {product.current_price_review && (
                <>
                  <div className="border-t border-gray-100 my-4"></div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                      Current Price Review
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">
                        {product.current_price_review.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="text-gray-500 line-through">
                          {formatPrice(product.current_price_review.old_price)}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium text-emerald-600">
                          {formatPrice(product.current_price_review.new_price)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Effective:{" "}
                        {new Date(
                          product.current_price_review.effective_date
                        ).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Timestamps */}
              <div className="border-t border-gray-100 mt-4 pt-4">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    Created:{" "}
                    {new Date(product.created_at).toLocaleDateString("en-GB")}
                  </span>
                  <span>
                    Updated:{" "}
                    {new Date(product.updated_at).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase Volumes */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Purchase Volume Pricing
              </h3>
              {product.purchase_volumes && product.purchase_volumes.length > 0 ? (
                <div className="space-y-2">
                  {product.purchase_volumes.map((volume) => (
                    <div
                      key={volume.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {volume.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {volume.min_quantity} - {volume.max_quantity || "∞"} units
                        </p>
                      </div>
                      <span className="text-sm font-medium text-emerald-600">
                        {formatPrice(volume.price)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No volume pricing configured
                </p>
              )}
            </div>
          </div>

          {/* Price History */}
          {priceHistory && priceHistory.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MdHistory className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-900">
                  Price History
                </h3>
              </div>
              <div className="space-y-2">
                {priceHistory.map((history) => {
                  const oldPrice = history.old_price;
                  const newPrice = history.new_price;
                  const isIncrease = newPrice > oldPrice;
                  return (
                    <div
                      key={history.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {history.price_review.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(history.created_at).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(history.old_price)}
                        </span>
                        {isIncrease ? (
                          <MdTrendingUp className="w-4 h-4 text-red-500" />
                        ) : (
                          <MdTrendingDown className="w-4 h-4 text-emerald-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            isIncrease ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {formatPrice(history.new_price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}