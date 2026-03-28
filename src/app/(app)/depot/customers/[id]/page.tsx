"use client";

import { use, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  MdArrowBack,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdAccountBalance,
  MdCalendarToday,
  MdShoppingCart,
  MdEmail,
  MdBusiness,
  MdMoreVert,
  MdVisibility,
} from "react-icons/md";
import {
  useDepotCustomer,
  useDepotCustomerOrders,
} from "@/hooks/useDepotPortal";
import Pagination from "@/components/common/Pagination";
import { ActionMenu } from "@/components/common/ActionMenu";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

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

export default function DepotCustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = use(params);
  const [ordersPage, setOrdersPage] = useState(1);

  const { data: customer, isLoading, error } = useDepotCustomer(id);
  const { data: ordersData, isLoading: ordersLoading } = useDepotCustomerOrders(
    id,
    { page: ordersPage, per_page: 10 },
  );

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load customer details</p>
          <Link href="/depot/customers" className="text-accent hover:underline">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50/50 px-3 md:px-8 py-3 md:py-4 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/depot/customers"
              className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <MdArrowBack className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-base md:text-lg font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-900">
                  {customer.name}
                </h1>
                {customer.account_number && (
                  <p className="text-xs md:text-sm text-slate-950 font-bold">
                    {customer.account_number}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 md:mb-4 shrink-0">
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdPhone className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Phone</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {customer.phone || "-"}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdLocationOn className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Zone</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {customer.zone?.name || "-"}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdAccountBalance className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Account #</p>
              <p className="text-sm font-bold text-gray-900 truncate">
                {customer.account_number || "-"}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <MdCalendarToday className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Added</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {new Date(customer.created_at).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 shrink-0">
          <h3 className="text-sm font-medium text-slate-900 mb-3">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MdEmail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{customer.email || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MdPhone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{customer.phone || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MdPerson className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                Sales Rep:{" "}
                {customer.sales_person ? (
                  <Link
                    href={`/depot/sales-persons/${customer.sales_person.id}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {customer.sales_person.name}
                  </Link>
                ) : (
                  "Unassigned"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MdShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                <h2 className="text-sm md:text-lg font-semibold text-slate-900">
                  Orders
                </h2>
                {ordersData?.pagination && (
                  <span className="text-xs md:text-sm text-slate-500">
                    ({ordersData.pagination.total})
                  </span>
                )}
              </div>
            </div>

            {ordersLoading ? (
              <div className="p-6 md:p-8 text-center text-slate-500">
                Loading orders...
              </div>
            ) : ordersData && ordersData.data.length > 0 ? (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden p-3 space-y-2">
                  {ordersData.data.map((order) => (
                    <Link
                      key={order.id}
                      href={`/depot/orders/${order.id}`}
                      className="block bg-gray-50 rounded-lg p-3 border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-primary">
                            {order.order_number}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(order.amount)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getPaymentStatusStyle(order.payment_status)}`}
                          >
                            {order.payment_status.replace("_", " ")}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getDeliveryStatusStyle(order.delivery_status)}`}
                          >
                            {order.delivery_status}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Order #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Items
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Payment
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Delivery
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {ordersData.data.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Link
                              href={`/depot/orders/${order.id}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {order.items_count} item
                            {order.items_count !== 1 ? "s" : ""}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900 text-right">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusStyle(order.payment_status)}`}
                            >
                              {order.payment_status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDeliveryStatusStyle(order.delivery_status)}`}
                            >
                              {order.delivery_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-GB",
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <ActionMenu menuId={`order-menu-${order.id}`}>
                              <ActionMenu.Trigger>
                                <MdMoreVert className="w-5 h-5 text-slate-600" />
                              </ActionMenu.Trigger>
                              <ActionMenu.Content>
                                <ActionMenu.Item
                                  onClick={() =>
                                    (window.location.href = `/depot/orders/${order.id}`)
                                  }
                                >
                                  <MdVisibility className="w-4 h-4" />
                                  View Details
                                </ActionMenu.Item>
                              </ActionMenu.Content>
                            </ActionMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {ordersData.pagination && ordersData.pagination.total > 0 && (
                  <div className="px-3 md:px-0 py-3 border-t border-slate-200 bg-white">
                    <Pagination
                      currentPage={ordersData.pagination.current_page}
                      totalPages={ordersData.pagination.last_page}
                      onPageChange={setOrdersPage}
                      totalItems={ordersData.pagination.total}
                      itemsPerPage={ordersData.pagination.per_page}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center">
                <MdShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">
                  No orders found for this customer
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
