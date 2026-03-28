"use client";

import { use, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  MdArrowBack,
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdBadge,
  MdCheckCircle,
  MdCancel,
  MdPeople,
  MdShoppingCart,
  MdEdit,
  MdMoreVert,
  MdVisibility,
} from "react-icons/md";
import {
  useDepotSalesPerson,
  useDepotSalesPersonCustomers,
  useDepotSalesPersonOrders,
} from "@/hooks/useDepotPortal";
import Pagination from "@/components/common/Pagination";
import { ActionMenu } from "@/components/common/ActionMenu";

interface SalesPersonDetailPageProps {
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

const getStatusStyle = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800";
    case "inactive":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export default function DepotSalesPersonDetailPage({
  params,
}: SalesPersonDetailPageProps) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"customers" | "orders">(
    "customers",
  );
  const [customersPage, setCustomersPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);

  const { data: person, isLoading, error } = useDepotSalesPerson(id);
  const { data: customersData, isLoading: customersLoading } =
    useDepotSalesPersonCustomers(id, { page: customersPage, per_page: 10 });
  const { data: ordersData, isLoading: ordersLoading } =
    useDepotSalesPersonOrders(id, { page: ordersPage, per_page: 10 });

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Failed to load sales representative details
          </p>
          <Link
            href="/depot/sales-persons"
            className="text-accent hover:underline"
          >
            Back to Sales Representatives
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50/50 px-3 md:px-8 py-3 md:py-4 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-start gap-3">
            <Link
              href="/depot/sales-persons"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-base md:text-lg font-bold">
                {person.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg md:text-2xl font-bold text-slate-900">
                    {person.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      person.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {person.status === "active" ? (
                      <MdCheckCircle className="w-3 h-3" />
                    ) : (
                      <MdCancel className="w-3 h-3" />
                    )}
                    {person.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  Employee #{person.employee_number}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-13 md:ml-0">
            <Link
              href={`/depot/sales-persons/${id}/edit`}
              className="flex items-center gap-2 px-3 md:px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
            >
              <MdEdit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 shrink-0">
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdBadge className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Employee #</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {person.employee_number}
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
                {person.zone?.name || "-"}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <MdPeople className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Customers</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {person.customers_count}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdPhone className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Phone</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {person.phone || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MdEmail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{person.email || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MdPhone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{person.phone || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MdLocationOn className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                {person.zone?.name || "No zone"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "customers"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <MdPeople className="w-4 h-4" />
              Customers
              {customersData?.pagination && (
                <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-full">
                  {customersData.pagination.total}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <MdShoppingCart className="w-4 h-4" />
              Orders
              {ordersData?.pagination && (
                <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-full">
                  {ordersData.pagination.total}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {customersLoading ? (
                <div className="p-8 text-center text-slate-500">
                  Loading customers...
                </div>
              ) : customersData && customersData.data.length > 0 ? (
                <>
                  {/* Mobile */}
                  <div className="md:hidden p-3 space-y-2">
                    {customersData.data.map((customer) => (
                      <Link
                        key={customer.id}
                        href={`/depot/customers/${customer.id}`}
                        className="block bg-gray-50 rounded-lg p-3 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-primary">
                            {customer.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyle(customer.status)}`}
                          >
                            {customer.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Account #</span>
                            <p className="font-medium text-gray-700">
                              {customer.account_number}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Zone</span>
                            <p className="font-medium text-gray-700">
                              {customer.zone?.name || "-"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                            Account #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                            Contact
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                            Zone
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {customersData.data.map((customer) => (
                          <tr key={customer.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Link
                                href={`/depot/customers/${customer.id}`}
                                className="text-sm font-bold text-primary hover:underline"
                              >
                                {customer.name}
                              </Link>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                              {customer.account_number}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div>
                                <p className="text-sm text-slate-900">
                                  {customer.email}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {customer.phone}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                              {customer.zone?.name || "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(customer.status)}`}
                              >
                                {customer.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <ActionMenu
                                menuId={`customer-menu-${customer.id}`}
                              >
                                <ActionMenu.Trigger>
                                  <MdMoreVert className="w-5 h-5 text-slate-600" />
                                </ActionMenu.Trigger>
                                <ActionMenu.Content>
                                  <ActionMenu.Item
                                    onClick={() =>
                                      (window.location.href = `/depot/customers/${customer.id}`)
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

                  {customersData.pagination &&
                    customersData.pagination.total > 0 && (
                      <Pagination
                        currentPage={customersData.pagination.current_page}
                        totalPages={customersData.pagination.last_page}
                        onPageChange={setCustomersPage}
                        totalItems={customersData.pagination.total}
                        itemsPerPage={customersData.pagination.per_page}
                      />
                    )}
                </>
              ) : (
                <div className="p-8 text-center">
                  <MdPeople className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">
                    No customers found for this sales representative
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {ordersLoading ? (
                <div className="p-8 text-center text-slate-500">
                  Loading orders...
                </div>
              ) : ordersData && ordersData.data.length > 0 ? (
                <>
                  {/* Mobile */}
                  <div className="md:hidden p-3 space-y-2">
                    {ordersData.data.map((order) => (
                      <Link
                        key={order.id}
                        href={`/depot/orders/${order.id}`}
                        className="block bg-gray-50 rounded-lg p-3 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-primary">
                            {order.order_number}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium ${getPaymentStatusStyle(order.payment_status)}`}
                            >
                              {order.payment_status.replace("_", " ")}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium ${getDeliveryStatusStyle(order.delivery_status)}`}
                            >
                              {order.delivery_status}
                            </span>
                          </div>
                          <span className="text-gray-400">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-GB",
                            )}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                            Order #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                            Customer
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
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                              {order.customer?.name || "-"}
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
                                className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusStyle(order.payment_status)}`}
                              >
                                {order.payment_status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDeliveryStatusStyle(order.delivery_status)}`}
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
                    <Pagination
                      currentPage={ordersData.pagination.current_page}
                      totalPages={ordersData.pagination.last_page}
                      onPageChange={setOrdersPage}
                      totalItems={ordersData.pagination.total}
                      itemsPerPage={ordersData.pagination.per_page}
                    />
                  )}
                </>
              ) : (
                <div className="p-8 text-center">
                  <MdShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">
                    No orders found for this sales representative
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
