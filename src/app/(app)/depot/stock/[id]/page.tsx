"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MdArrowBack,
  MdWarehouse,
  MdInventory,
  MdCalendarToday,
  MdTag,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdError,
  MdHistory,
} from "react-icons/md";
import { useStockLevel, useDeleteStockLevel } from "@/hooks/useStockLevel";
import { useCanManageStock } from "@/hooks/useAuth";

interface StockDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function StockDetailPage({ params }: StockDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const canManageStock = useCanManageStock();

  const { data, isLoading, error } = useStockLevel(id);
  const deleteMutation = useDeleteStockLevel();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push("/depot/stock");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !data || !data.stock) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load stock details</p>
          <Link href="/depot/stock" className="text-accent hover:underline">
            Back to Stock
          </Link>
        </div>
      </div>
    );
  }

  const { stock, product, summary, history } = data;

  // Build a unified batches list: prefer history (which includes all batches),
  // but fall back to the current stock entry so at least one batch always shows.
  const allBatches =
    history && history.length > 0
      ? history
      : [
          {
            id: stock.id,
            batch_number: stock.batch_number,
            quantity: stock.quantity,
            manufacture_date: stock.manufacture_date ?? "",
            expiry_date: stock.expiry_date,
            received_stock: stock.quantity,
            created_at: "",
            updated_at: "",
            is_expired: false,
          },
        ];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50/50 px-4 md:px-8 py-4 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-start gap-3">
            <Link
              href="/depot/stock"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <MdWarehouse className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
                  {product.name}
                </h1>
                <p className="text-sm text-slate-500">{product.sku}</p>
              </div>
            </div>
          </div>
          {canManageStock && (
            <div className="flex items-center gap-2 ml-13 md:ml-0">
              <Link
                href={`/depot/stock/${id}/edit`}
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                <MdEdit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
              >
                <MdDelete className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 shrink-0">
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdTag className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Total Batches</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {allBatches.length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdCheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Active Stock</p>
              <p className="text-sm font-medium text-slate-900">
                {summary.active_stock.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
              <MdError className="w-4 h-4 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Expired Stock</p>
              <p className="text-sm font-medium text-slate-900">
                {summary.expired_stock.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdInventory className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Batch Quantity</p>
              <p className="text-sm font-medium text-slate-900">
                {stock.quantity.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <MdCalendarToday className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Expiry Date</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(stock.expiry_date).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          {/* Product Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 shrink-0">
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              Product Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Product Name</p>
                <p className="text-sm text-slate-900">{product.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">SKU</p>
                <p className="text-sm text-slate-900">{product.sku}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Unit of Measure</p>
                <p className="text-sm text-slate-900">
                  {product.unit_of_measure || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Stock Batches */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex-1 min-h-0 flex flex-col">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <MdHistory className="w-4 h-4 text-primary" />
                  Stock Batches ({allBatches.length})
                </h3>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden p-3 space-y-2 overflow-y-auto flex-1 min-h-0">
                {allBatches.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg p-3 border ${
                      item.is_expired
                        ? "bg-red-50 border-red-100"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">
                        {item.batch_number}
                      </span>
                      {item.is_expired && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          Expired
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                      <div>
                        <span className="text-slate-400">Qty: </span>
                        <span className="font-bold text-slate-900">
                          {item.quantity.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Received: </span>
                        <span className="font-medium text-emerald-600">
                          {item.received_stock.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Mfg: </span>
                        <span className="text-slate-700">
                          {new Date(item.manufacture_date).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Exp: </span>
                        <span className="text-slate-700">
                          {new Date(item.expiry_date).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Recorded{" "}
                      {new Date(item.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:flex flex-col flex-1 min-h-0 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Batch
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Received
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Manufacture Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Expiry Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Recorded
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allBatches.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 ${
                          item.is_expired ? "bg-red-50/50" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-slate-900">
                            {item.batch_number}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-slate-900">
                            {item.quantity.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-medium text-emerald-600">
                            {item.received_stock.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">
                            {new Date(item.manufacture_date).toLocaleDateString(
                              "en-GB",
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">
                            {new Date(item.expiry_date).toLocaleDateString(
                              "en-GB",
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">
                            {new Date(item.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.is_expired ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Stock Entry
            </h3>
            <p className="text-slate-600 mb-6 text-sm">
              Are you sure you want to delete the stock entry for{" "}
              <span className="font-medium">{product.name}</span>? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 text-sm"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
