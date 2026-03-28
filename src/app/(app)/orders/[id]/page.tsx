"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdShoppingCart,
  MdPerson,
  MdPayment,
  MdLocalShipping,
  MdReceipt,
  MdAccountBalanceWallet,
  MdExpandMore,
  MdExpandLess,
  MdCheck,
  MdClose,
  MdAccessTime,
} from "react-icons/md";
import {
  useOrder,
  useOrderTransactions,
  useDeleteOrder,
} from "@/hooks/useOrder";
import Modal from "@/components/common/Modal";
import CancelOrderModal from "@/components/common/CancelOrderModal";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const getPaymentStatusStyle = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "partial":
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

const getTransactionStatusStyle = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-slate-100 text-slate-800";
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

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [showTransactions, setShowTransactions] = useState(true);

  const { data: order, isLoading, error } = useOrder(String(id));
  const { data: transactionsData, isLoading: txLoading } =
    useOrderTransactions(String(id));
  const deleteMutation = useDeleteOrder();

  const handleCancelOrder = (cancellationMessage: string) => {
    deleteMutation.mutate({ id: String(id), cancellation_message: cancellationMessage }, {
      onSuccess: () => {
        router.push("/orders");
      },
    });
  };

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
        <p className="text-red-500">Failed to load order details</p>
      </div>
    );
  }

  const transactions = transactionsData?.data?.transactions || [];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 md:mb-6 shrink-0">
          <div className="flex items-start gap-3">
            <Link
              href="/orders"
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
                    Payment: {order.payment_status}
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
          <div className="flex items-center gap-2 ml-0 md:ml-0 pl-13 md:pl-0">
            <Link
              href={`/orders/${id}/edit`}
              className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm inline-flex items-center gap-2"
            >
              <MdEdit className="w-4 h-4" />
              Edit
            </Link>
            {order.payment_status === "pending" && (
              <Modal>
                <Modal.Open opens="cancel-order">
                  <button className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm inline-flex items-center gap-2">
                    <MdDelete className="w-4 h-4" />
                    Cancel Order
                  </button>
                </Modal.Open>
                <Modal.Window name="cancel-order">
                  <CancelOrderModal
                    orderNumber={order.order_number}
                    onConfirm={handleCancelOrder}
                    isCancelling={deleteMutation.isPending}
                  />
                </Modal.Window>
              </Modal>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdReceipt className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Amount</p>
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
              <p className="text-xs text-gray-400">Paid</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {formatCurrency(order.amount_paid)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdAccountBalanceWallet className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Balance</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {formatCurrency(order.balance_remaining)}
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
                {order.orderedItems?.length || 0} items
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Customer & Order Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MdPerson className="w-4 h-4 text-gray-400" />
                  Customer
                </h3>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-gray-900">
                    {order.customer?.name}
                  </p>
                  {order.customer?.email && (
                    <p className="text-xs text-gray-500">
                      {order.customer.email}
                    </p>
                  )}
                  {order.customer?.contacts?.phone && (
                    <p className="text-xs text-gray-500">
                      {order.customer.contacts.phone}
                    </p>
                  )}
                  {order.customer?.account_number && (
                    <p className="text-xs text-gray-400">
                      Account: {order.customer.account_number}
                    </p>
                  )}
                </div>
              </div>

              {/* Approver */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MdPerson className="w-4 h-4 text-gray-400" />
                  Approved By
                </h3>
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-600">
                    {order.approver?.name || "N/A"}
                  </p>
                  {order.approver?.email && (
                    <p className="text-xs text-gray-500">
                      {order.approver.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Transporter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MdLocalShipping className="w-4 h-4 text-gray-400" />
                  Transporter
                </h3>
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-600">
                    {order.transporter?.name || "Not Assigned"}
                  </p>
                  {order.transporter?.contacts && (
                    <p className="text-xs text-gray-500">
                      {order.transporter.contacts}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">
                Ordered Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
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
                  {order.orderedItems?.map((item) => (
                    <tr key={item.ordered_item_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.product_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        {item.qty}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(parseFloat(item.price) * item.qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-sm font-medium text-gray-900 text-right"
                    >
                      Subtotal
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(order.subtotal)}
                    </td>
                  </tr>
                  {parseFloat(order.discount) > 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-sm text-gray-600 text-right"
                      >
                        Discount
                      </td>
                      <td className="px-4 py-2 text-sm text-red-600 text-right">
                        -{formatCurrency(order.discount)}
                      </td>
                    </tr>
                  )}
                  {parseFloat(order.tax) > 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-sm text-gray-600 text-right"
                      >
                        Tax
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 text-right">
                        {formatCurrency(order.tax)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-gray-200">
                    <td
                      colSpan={3}
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
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="w-full px-4 py-3 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <MdPayment className="w-4 h-4 text-gray-400" />
                Transactions ({transactions.length})
              </h3>
              {showTransactions ? (
                <MdExpandLess className="w-5 h-5 text-gray-400" />
              ) : (
                <MdExpandMore className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {showTransactions && (
              <div>
                {txLoading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Loading transactions...
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No transactions found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            {getTransactionIcon(tx.status)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {tx.transaction_number}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="capitalize">
                                {tx.payment_method}
                              </span>
                              {tx.mpesa_receipt && (
                                <span>• Ref: {tx.mpesa_receipt}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(tx.amount)}
                          </p>
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${getTransactionStatusStyle(tx.status)}`}
                            >
                              {tx.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(tx.initiated_at).toLocaleDateString(
                                "en-GB",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
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
