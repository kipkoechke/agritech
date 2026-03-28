"use client";

import { use, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  MdArrowBack,
  MdShoppingCart,
  MdPerson,
  MdPayment,
  MdLocalShipping,
  MdCalendarToday,
  MdReceipt,
  MdExpandMore,
  MdExpandLess,
  MdCheck,
  MdAccessTime,
  MdClose,
  MdAccountBalanceWallet,
  MdEdit,
} from "react-icons/md";
import { useSalesPersonPortalOrder } from "@/hooks/useSalesPersonPortal";
import { useOrderTransactions } from "@/hooks/useOrder";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

// Capitalize first letter of each word
const capitalize = (str: string) => {
  return str
    .split(/[_\s-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const getPaymentStatusStyle = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "partially_paid":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "pending":
      return "bg-red-100 text-red-800 border-red-300";
    case "refunded":
      return "bg-purple-100 text-purple-800 border-purple-300";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300";
  }
};

const getDeliveryStatusStyle = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "dispatched":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "processing":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "pending":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300";
  }
};

const getTransactionStatusStyle = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const getTransactionIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <MdCheck className="w-4 h-4 text-emerald-600" />;
    case "pending":
      return <MdAccessTime className="w-4 h-4 text-amber-600" />;
    case "failed":
      return <MdClose className="w-4 h-4 text-red-600" />;
    default:
      return <MdReceipt className="w-4 h-4 text-slate-600" />;
  }
};

export default function SalesPersonOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = use(params);
  const [showTransactions, setShowTransactions] = useState(true);

  const { data: order, isLoading, error } = useSalesPersonPortalOrder(id);
  const { data: transactionsData, isLoading: txLoading } =
    useOrderTransactions(id);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load order details</p>
          <Link
            href="/sales-person/orders"
            className="text-accent hover:underline"
          >
            Back To Customer Orders
          </Link>
        </div>
      </div>
    );
  }

  const amountValue = parseFloat(order.amount) || 0;
  const amountPaidValue = parseFloat(order.amount_paid) || 0;
  const discountValue = parseFloat(order.discount) || 0;
  const balanceDue = amountValue - amountPaidValue;
  const transactions = transactionsData?.data?.transactions || [];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50/50 px-3 md:px-8 py-3 md:py-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/sales-person/orders"
              className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <MdArrowBack className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
                <MdShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-900">
                  {order.order_number}
                </h1>
              </div>
            </div>
          </div>
          {(order.delivery_status === "pending" ||
            order.delivery_status === "processing") && (
            <Link
              href={`/sales-person/orders/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium text-xs md:text-sm transition-colors"
            >
              <MdEdit className="w-4 h-4" />
              <span>Amend Order</span>
            </Link>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 md:mb-4 shrink-0">
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdReceipt className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Total Amount</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {formatCurrency(amountValue)}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdPayment className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Amount Paid</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {formatCurrency(amountPaidValue)}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdAccountBalanceWallet className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Balance Due</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {formatCurrency(balanceDue)}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <MdCalendarToday className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Order Date</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {new Date(order.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-4 space-y-4">
          {/* Customer & Order Info */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Customer */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                  <MdPerson className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Customer</p>
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {order.customer.name}
                  </p>
                  {order.customer.phone && (
                    <p className="text-xs text-slate-500">
                      {order.customer.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Approved By */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                  <MdCheck className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Approved By</p>
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {order.approver?.name || "Not Approved"}
                  </p>
                </div>
              </div>

              {/* Transporter */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                  <MdLocalShipping className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Transporter</p>
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {order.transporter?.name || "Not Assigned"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <MdShoppingCart className="w-4 h-4 text-slate-500" />
              Order Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Order Number</p>
                <p className="text-sm font-bold text-slate-900">
                  {order.order_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Items Count</p>
                <p className="text-sm font-bold text-slate-900">
                  {order.items_count} Items
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Payment Status</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getPaymentStatusStyle(order.payment_status)}`}
                >
                  {capitalize(order.payment_status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Delivery Status</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getDeliveryStatusStyle(order.delivery_status)}`}
                >
                  {capitalize(order.delivery_status)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <MdPayment className="w-4 h-4 text-slate-500" />
              Payment Summary
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="text-sm font-medium text-slate-900">
                  {formatCurrency(amountValue)}
                </span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Discount</span>
                  <span className="text-sm font-medium text-red-600">
                    - {formatCurrency(discountValue)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Amount Paid</span>
                <span className="text-sm font-medium text-emerald-600">
                  {formatCurrency(amountPaidValue)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-sm font-semibold text-slate-900">
                  Balance Due
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(balanceDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MdShoppingCart className="w-4 h-4 text-slate-500" />
                Ordered Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {order.orderedItems?.map((item) => (
                    <tr
                      key={item.ordered_item_id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {item.product_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-right">
                        {item.qty}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-right">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">
                        {formatCurrency(parseFloat(item.price) * item.qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Transactions */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MdReceipt className="w-4 h-4 text-slate-500" />
                Payment Transactions ({transactions.length})
              </h3>
              {showTransactions ? (
                <MdExpandLess className="w-5 h-5 text-slate-400" />
              ) : (
                <MdExpandMore className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {showTransactions && (
              <div className="border-t border-slate-100">
                {txLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    <MdReceipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No Payment Transactions Yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="px-4 py-3 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100">
                          {getTransactionIcon(tx.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {tx.transaction_number}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${getTransactionStatusStyle(tx.status)}`}
                            >
                              {capitalize(tx.status)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {capitalize(tx.payment_method)} •{" "}
                            {tx.paid_at
                              ? new Date(tx.paid_at).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : new Date(tx.initiated_at).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            {formatCurrency(tx.amount)}
                          </p>
                          {tx.mpesa_receipt && (
                            <p className="text-xs text-slate-500">
                              {tx.mpesa_receipt}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
