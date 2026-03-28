"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MdAdd,
  MdBusiness,
  MdPhone,
  MdEmail,
  MdCheck,
  MdClose,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdMoreVert,
  MdFilterList,
  MdExpandLess,
  MdExpandMore,
  MdCreditCard,
} from "react-icons/md";
import {
  useCustomers,
  usePrefetchCustomers,
  useDeleteCustomer,
} from "@/hooks/useCustomer";
import { useZones } from "@/hooks/useZone";
import Pagination from "@/components/common/Pagination";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const perPage = 15;

  const prefetchCustomers = usePrefetchCustomers();
  const deleteMutation = useDeleteCustomer();

  // Fetch zones for filter
  const { data: zonesData, isLoading: zonesLoading } = useZones({
    per_page: 100,
  });

  const zoneOptions = [
    { value: "", label: "All Zones" },
    ...(zonesData?.data?.map((zone) => ({
      value: String(zone.id),
      label: zone.name,
    })) || []),
  ];

  const hasAnyFilter = !!zoneFilter;

  const handleClearFilters = () => {
    setZoneFilter("");
    setPage(1);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useCustomers({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    zone_id: zoneFilter || undefined,
  });

  // Prefetch next page
  useEffect(() => {
    if (data?.pagination && page < data.pagination.last_page) {
      prefetchCustomers({
        page: page + 1,
        per_page: perPage,
        search: debouncedSearch || undefined,
        zone_id: zoneFilter || undefined,
      });
    }
  }, [data, page, perPage, debouncedSearch, zoneFilter, prefetchCustomers]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary">
              <MdBusiness className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-base md:text-2xl font-bold text-gray-900">
                Customers
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 hidden md:block">
                Manage your customer accounts
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search customers..."
            />
            <Link
              href="/customers/new"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <MdAdd className="w-5 h-5" />
              New Customer
            </Link>
          </div>
        </div>

        {/* Collapsible Filters */}
        <div className="bg-white rounded-lg border border-gray-200 mb-2 shrink-0">
          <div
            className="flex items-center justify-between px-3 md:px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <MdFilterList className="w-4 h-4 md:w-5 md:h-5 text-gray-500 shrink-0" />
              <span className="text-xs md:text-sm font-medium text-gray-700">
                Filters
                {hasAnyFilter && (
                  <span className="ml-2 text-xs text-blue-600">
                    (Filters applied)
                  </span>
                )}
              </span>
            </div>
            {isFilterExpanded ? (
              <MdExpandLess className="w-5 h-5 text-gray-500" />
            ) : (
              <MdExpandMore className="w-5 h-5 text-gray-500" />
            )}
          </div>
          {isFilterExpanded && (
            <div className="border-t border-gray-100 px-3 md:px-4 py-3">
              <div className="grid grid-cols-2 gap-2 md:gap-3 items-end">
                <div>
                  <SearchableSelect
                    label="Zone"
                    options={zoneOptions}
                    value={zoneFilter}
                    onChange={(val) => {
                      setZoneFilter(val);
                      setPage(1);
                    }}
                    placeholder="All Zones"
                    disabled={zonesLoading}
                  />
                </div>
                <div>
                  <button
                    onClick={handleClearFilters}
                    disabled={!hasAnyFilter}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full ${
                      hasAnyFilter
                        ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                        : "text-gray-400 bg-gray-50 cursor-not-allowed"
                    }`}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
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

        {/* Customers Table */}
        {data && data.data.length > 0 && (
          <Modal>
            <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
              {/* Mobile Card View */}
              <div className="md:hidden overflow-y-auto flex-1 p-3 space-y-2">
                {data.data.map((customer) => (
                  <div
                    key={customer.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <Link
                          href={`/customers/${customer.id}`}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          {customer.name}
                        </Link>
                        {customer.account_number && (
                          <p className="text-xs font-bold text-gray-600">
                            {customer.account_number}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {customer.zone && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                            {customer.zone.name}
                          </span>
                        )}
                        <Link
                          href={`/customers/${customer.id}`}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                    {/* Row 1: Contact Info */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div>
                        <span className="text-gray-400 text-[10px]">
                          Contact
                        </span>
                        {customer.contacts?.phone && (
                          <p className="text-gray-900 flex items-center gap-1">
                            <MdPhone className="w-3 h-3 text-gray-400" />
                            {customer.contacts.phone}
                          </p>
                        )}
                        {customer.contacts?.email && (
                          <p className="text-gray-500 text-[10px] truncate max-w-[150px]">
                            {customer.contacts.email}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px]">
                          Credit
                        </span>
                        <p>
                          {customer.is_credit_customer ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                              KES {customer.credit_limit?.toLocaleString() || 0}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                              No
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-y-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Account No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Total Spent
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
                          <Link
                            href={`/customers/${customer.id}`}
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            {customer.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-950 tracking-wider">
                            {customer.account_number || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {customer.contacts?.email && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <MdEmail className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate max-w-45">
                                  {customer.contacts.email}
                                </span>
                              </div>
                            )}
                            {customer.contacts?.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <MdPhone className="w-3.5 h-3.5 text-gray-400" />
                                <span>{customer.contacts.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.zone ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {customer.zone.name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.is_credit_customer ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <MdCreditCard className="w-3 h-3" />
                                Yes
                              </span>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Limit: KES{" "}
                                {customer.credit_limit?.toLocaleString() || 0}
                              </p>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {customer.order_count ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {customer.total_spent
                              ? `KES ${customer.total_spent}`
                              : "KES 0"}
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
                                  (window.location.href = `/customers/${customer.id}`)
                                }
                              >
                                <MdVisibility className="w-4 h-4" />
                                View Details
                              </ActionMenu.Item>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/customers/${customer.id}/edit`)
                                }
                              >
                                <MdEdit className="w-4 h-4" />
                                Edit
                              </ActionMenu.Item>
                              <Modal.Open
                                opens={`delete-customer-${customer.id}`}
                              >
                                <ActionMenu.Item className="text-red-600 hover:bg-red-50">
                                  <MdDelete className="w-4 h-4" />
                                  Delete
                                </ActionMenu.Item>
                              </Modal.Open>
                            </ActionMenu.Content>
                          </ActionMenu>

                          <Modal.Window name={`delete-customer-${customer.id}`}>
                            <DeleteConfirmationModal
                              itemName={customer.name}
                              itemType="customer"
                              onConfirm={() =>
                                deleteMutation.mutate(customer.id)
                              }
                              isDeleting={deleteMutation.isPending}
                            />
                          </Modal.Window>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          </Modal>
        )}

        {/* Empty State */}
        {data && data.data.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MdBusiness className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No customers found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first customer.
            </p>
            <Link
              href="/customers/new"
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
