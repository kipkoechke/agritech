"use client";

import { use } from "react";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  MdArrowBack,
  MdLocalShipping,
  MdPerson,
  MdShoppingCart,
  MdLocationOn,
  MdDirectionsCar,
  MdCalendarToday,
  MdPayment,
} from "react-icons/md";
import { useDispatch } from "@/hooks/useDispatch";

const getStatusStyle = (status: string) => {
  switch (status) {
    case "dispatched":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const getPaymentStatusStyle = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800";
    case "partially_paid":
      return "bg-amber-100 text-amber-800";
    case "pending":
      return "bg-slate-100 text-slate-800";
    case "refunded":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const getDeliveryStatusStyle = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-800";
    case "dispatched":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-amber-100 text-amber-800";
    case "pending":
      return "bg-slate-100 text-slate-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export default function DispatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: dispatch, isLoading, error } = useDispatch(id);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !dispatch) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MdLocalShipping className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Dispatch not found</p>
          <Link
            href="/depot/dispatches"
            className="text-primary hover:underline text-sm"
          >
            Back to Dispatches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/depot/dispatches"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <MdLocalShipping className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                    {dispatch.dispatch_number}
                  </h1>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusStyle(dispatch.status)}`}
                  >
                    {dispatch.status}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-500">
                  Dispatched on{" "}
                  {new Date(dispatch.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                <MdPayment className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Total Amount</p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {dispatch.total_amount}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                <MdShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Orders</p>
                <p className="text-sm font-medium text-slate-900">
                  {dispatch.orders_count}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
                <MdLocationOn className="w-4 h-4 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Zone</p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {dispatch.zone?.name || "-"}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
                <MdPerson className="w-4 h-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Dispatched By</p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {dispatch.dispatched_by?.name || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Transport Details */}
          {dispatch.transporter && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <MdDirectionsCar className="w-4 h-4 text-primary" />
                Transporter Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Transporter Name</p>
                  <p className="text-sm font-medium text-slate-900">
                    {dispatch.transporter.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">License Plate</p>
                  <p className="text-sm font-medium text-slate-900">
                    {dispatch.transporter.license_plate || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Comment */}
          {dispatch.comment && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Comment
              </h2>
              <p className="text-sm text-gray-600">{dispatch.comment}</p>
            </div>
          )}

          {/* Orders */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MdShoppingCart className="w-4 h-4 text-primary" />
                Orders ({dispatch.orders?.length || 0})
              </h2>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden p-3 space-y-3">
              {dispatch.orders?.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg p-3 bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/depot/orders/${order.id}`}
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      {order.order_number}
                    </Link>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                    <MdPerson className="w-3 h-3" />
                    {order.customer?.name || "-"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPaymentStatusStyle(order.payment_status)}`}
                    >
                      {order.payment_status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getDeliveryStatusStyle(order.delivery_status)}`}
                    >
                      {order.delivery_status}
                    </span>
                  </div>
                  {order.order_comment && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      {order.order_comment}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Delivery
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Comment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dispatch.orders?.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/depot/orders/${order.id}`}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">
                          {order.customer?.name || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPaymentStatusStyle(order.payment_status)}`}
                        >
                          {order.payment_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getDeliveryStatusStyle(order.delivery_status)}`}
                        >
                          {order.delivery_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500 truncate max-w-50 block">
                          {order.order_comment || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="border-t border-gray-200">
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-sm font-semibold text-gray-700"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(dispatch.total_amount)}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MdCalendarToday className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Created</p>
                  <p className="text-sm text-slate-600">
                    {new Date(dispatch.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MdCalendarToday className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Last Updated</p>
                  <p className="text-sm text-slate-600">
                    {new Date(dispatch.updated_at).toLocaleDateString("en-GB", {
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
          </div>
        </div>
      </div>
    </div>
  );
}
