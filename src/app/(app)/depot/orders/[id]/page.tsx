"use client";

import { use } from "react";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  MdArrowBack,
  MdShoppingCart,
  MdPerson,
  MdPayment,
  MdLocalShipping,
  MdReceipt,
  MdEdit,
} from "react-icons/md";
import { useDepotOrder } from "@/hooks/useDepotPortal";

interface DepotOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const getPaymentStatusStyle = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "partially_paid":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "pending":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "refunded":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const getDeliveryStatusStyle = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "dispatched":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "processing":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "pending":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

export default function DepotOrderDetailPage({
  params,
}: DepotOrderDetailPageProps) {
  const { id } = use(params);

  const { data: order, isLoading, error } = useDepotOrder(id);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load order details</p>
          <Link href="/depot/orders" className="text-accent hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-start gap-3">
            <Link
              href="/depot/orders"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <MdShoppingCart className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {order.order_number}
                  </h1>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${getPaymentStatusStyle(order.payment_status)}`}
                  >
                    Payment: {order.payment_status.replace("_", " ")}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${getDeliveryStatusStyle(order.delivery_status)}`}
                  >
                    Delivery: {order.delivery_status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5 truncate">
                  {order.customer?.name}
                </p>
              </div>
            </div>
          </div>
          {(order.delivery_status === "pending" ||
            order.delivery_status === "processing") && (
            <Link
              href={`/depot/orders/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium text-sm transition-colors shrink-0"
            >
              <MdEdit className="w-4 h-4" />
              <span>Amend Order</span>
            </Link>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdReceipt className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Total Amount</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {formatCurrency(order.amount)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdPayment className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Payment Status</p>
              <p className="text-sm font-medium text-gray-900 truncate capitalize">
                {order.payment_status.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <MdShoppingCart className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Items</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {order.items_count} item{order.items_count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdLocalShipping className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Delivery Status</p>
              <p className="text-sm font-medium text-gray-900 truncate capitalize">
                {order.delivery_status}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Customer & Zone Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MdPerson className="w-4 h-4 text-gray-400" />
                  Customer
                </h3>
                <div className="space-y-1.5">
                  <Link
                    href={`/depot/customers/${order.customer?.id}`}
                    className="text-sm font-bold text-primary hover:underline block"
                  >
                    {order.customer?.name}
                  </Link>
                  {order.customer?.email && (
                    <p className="text-xs text-gray-500">
                      {order.customer.email}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MdLocalShipping className="w-4 h-4 text-gray-400" />
                  Zone
                </h3>
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-600">
                    {order.zone?.name || "N/A"}
                  </p>
                  {order.zone?.code && (
                    <p className="text-xs text-gray-400">
                      Code: {order.zone.code}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Order Date
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">
                Items Ordered
              </h3>
            </div>
            {order.items && order.items.length > 0 ? (
              <>
                {/* Mobile Items View */}
                <div className="md:hidden p-3 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        SKU: {item.product.sku}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Qty:{" "}
                          <span className="font-bold">
                            {item.quantity ?? "-"}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          @ {formatCurrency(item.unit_price)}
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.total_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                </div>

                {/* Desktop Items Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          SKU
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Unit Price
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.product.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.product.sku}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                            {item.quantity ?? "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="border-t border-gray-200">
                        <td
                          colSpan={4}
                          className="px-4 py-3 text-sm font-semibold text-gray-900 text-right"
                        >
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                          {formatCurrency(order.amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No items found for this order
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                Created:{" "}
                {new Date(order.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>
                Updated:{" "}
                {new Date(order.updated_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
