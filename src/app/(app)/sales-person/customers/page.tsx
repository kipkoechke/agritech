"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MdAdd,
  MdPeople,
  MdVisibility,
  MdMoreVert,
  MdShoppingCart,
  MdLocationOn,
  MdPhone,
} from "react-icons/md";
import {
  useSalesPersonPortalCustomers,
  useSalesPersonCustomerOrders,
} from "@/hooks/useSalesPersonPortal";
import Pagination from "@/components/common/Pagination";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";

export default function SalesPersonCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const perPage = 15;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useSalesPersonPortalCustomers({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-2 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary">
              <MdPeople className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                Customers
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                {data?.pagination?.total || 0} customers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:block">
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Search customers..."
              />
            </div>
            <Link
              href="/sales-person/customers/new"
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-xs md:text-sm"
            >
              <MdAdd className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline">New Customer</span>
              <span className="md:hidden">Add</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-3 shrink-0">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search customers..."
            className="w-full"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading customers...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load customers</p>
          </div>
        )}

        {/* Customers Table - Desktop / Card View - Mobile */}
        {data && data.data.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-auto p-3 space-y-2">
              {data.data.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/sales-person/customers/${customer.id}`}
                  className="block bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {customer.phone || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-700">
                    <span>
                      <span className="text-gray-500 font-medium">Zone:</span>{" "}
                      {customer.zone?.name || "-"}
                    </span>
                    <span>
                      <span className="text-gray-500 font-medium">
                        Account:
                      </span>
                      <span className="font-bold text-black">
                        {customer.account_number || "-"}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 text-xs text-gray-700">
                    <span className="text-gray-500 font-medium">Added:</span>{" "}
                    {new Date(customer.created_at).toLocaleDateString("en-GB")}
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:flex md:flex-col flex-1 min-h-0">
              <div className="overflow-y-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <MdPhone className="w-3.5 h-3.5" />
                          Contact
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <MdLocationOn className="w-3.5 h-3.5" />
                          Zone
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Added
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sticky right-0 bg-gray-50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <Link
                                href={`/sales-person/customers/${customer.id}`}
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                {customer.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {customer.phone || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {customer.zone?.name || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-950 font-bold">
                            {customer.account_number || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {new Date(customer.created_at).toLocaleDateString(
                              "en-GB",
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                          <ActionMenu menuId={`customer-menu-${customer.id}`}>
                            <ActionMenu.Trigger>
                              <MdMoreVert className="w-5 h-5 text-gray-600" />
                            </ActionMenu.Trigger>
                            <ActionMenu.Content>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/sales-person/customers/${customer.id}`)
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
            </div>

            {data.pagination && data.pagination.total > 0 && (
              <Pagination
                currentPage={data.pagination.current_page}
                totalPages={data.pagination.last_page}
                onPageChange={handlePageChange}
                totalItems={data.pagination.total}
                itemsPerPage={data.pagination.per_page}
              />
            )}
          </div>
        )}

        {/* Empty State */}
        {data && data.data.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MdPeople className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No customers found
            </h3>
            <p className="text-gray-600 mb-4">
              {debouncedSearch
                ? "Try adjusting your search"
                : "Get started by adding your first customer."}
            </p>
            <Link
              href="/sales-person/customers/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <MdAdd className="w-5 h-5" />
              New Customer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
