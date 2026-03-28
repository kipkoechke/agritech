"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MdAdd,
  MdStore,
  MdPhone,
  MdEmail,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdMoreVert,
  MdFilterList,
  MdCreditCard,
} from "react-icons/md";
import {
  useMTCustomers,
  usePrefetchMTCustomers,
  useDeleteMTCustomer,
} from "@/hooks/useMTCustomer";
import { useZones } from "@/hooks/useZone";
import Pagination from "@/components/common/Pagination";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

export default function ModernTradePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("");
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const zoneDropdownRef = useRef<HTMLDivElement>(null);
  const perPage = 15;

  const prefetchMTCustomers = usePrefetchMTCustomers();
  const deleteMutation = useDeleteMTCustomer();

  // Fetch zones for filter
  const { data: zonesData } = useZones({ per_page: 100 });

  const zoneOptions = [
    { value: "", label: "All Zones" },
    ...(zonesData?.data?.map((zone) => ({
      value: String(zone.id),
      label: zone.name,
    })) || []),
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        zoneDropdownRef.current &&
        !zoneDropdownRef.current.contains(event.target as Node)
      ) {
        setShowZoneDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useMTCustomers({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    zone_id: zoneFilter || undefined,
  });

  // Prefetch next page
  useEffect(() => {
    if (data?.pagination && page < data.pagination.last_page) {
      prefetchMTCustomers({
        page: page + 1,
        per_page: perPage,
        search: debouncedSearch || undefined,
        zone_id: zoneFilter || undefined,
      });
    }
  }, [data, page, perPage, debouncedSearch, zoneFilter, prefetchMTCustomers]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary">
              <MdStore className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-base md:text-2xl font-bold text-gray-900">
                Modern Trade
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 hidden md:block">
                Manage modern trade customer accounts
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search MT customers..."
            />
            <Link
              href="/modern-trade/new"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <MdAdd className="w-5 h-5" />
              New MT Customer
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading MT customers...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load MT customers</p>
          </div>
        )}

        {/* MT Customers Table */}
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
                          href={`/modern-trade/${customer.id}`}
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
                          href={`/modern-trade/${customer.id}`}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
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
                          <p className="text-gray-500 text-[10px] truncate max-w-37.5">
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
                              KES{" "}
                              {customer.credit_limit?.toLocaleString() || 0}
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

              {/* Mobile Zone Filter */}
              <div className="md:hidden px-3 py-2 border-b border-gray-200 bg-white">
                <select
                  value={zoneFilter}
                  onChange={(e) => {
                    setZoneFilter(e.target.value);
                    setPage(1);
                  }}
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-sm ${zoneFilter ? "border-accent text-accent" : "border-gray-200 text-gray-700"}`}
                >
                  {zoneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                        <div
                          className="relative inline-block"
                          ref={zoneDropdownRef}
                        >
                          <button
                            onClick={() =>
                              setShowZoneDropdown(!showZoneDropdown)
                            }
                            className={`flex items-center gap-1 hover:text-gray-700 transition-colors ${
                              zoneFilter ? "text-accent" : ""
                            }`}
                          >
                            Zone
                            <MdFilterList
                              className={`w-4 h-4 ${zoneFilter ? "text-accent" : ""}`}
                            />
                          </button>
                          {showZoneDropdown && (
                            <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                              {zoneOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setZoneFilter(option.value);
                                    setShowZoneDropdown(false);
                                    setPage(1);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                                    zoneFilter === option.value
                                      ? "bg-accent/10 text-accent font-medium"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales Person
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
                            href={`/modern-trade/${customer.id}`}
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
                          {customer.sales_person ? (
                            <span className="text-sm text-gray-900">
                              {customer.sales_person.name}
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
                          <ActionMenu
                            menuId={`mt-customer-menu-${customer.id}`}
                          >
                            <ActionMenu.Trigger>
                              <MdMoreVert className="w-5 h-5 text-gray-600" />
                            </ActionMenu.Trigger>
                            <ActionMenu.Content>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/modern-trade/${customer.id}`)
                                }
                              >
                                <MdVisibility className="w-4 h-4" />
                                View Details
                              </ActionMenu.Item>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/modern-trade/${customer.id}/edit`)
                                }
                              >
                                <MdEdit className="w-4 h-4" />
                                Edit
                              </ActionMenu.Item>
                              <Modal.Open
                                opens={`delete-mt-customer-${customer.id}`}
                              >
                                <ActionMenu.Item className="text-red-600 hover:bg-red-50">
                                  <MdDelete className="w-4 h-4" />
                                  Delete
                                </ActionMenu.Item>
                              </Modal.Open>
                            </ActionMenu.Content>
                          </ActionMenu>

                          <Modal.Window
                            name={`delete-mt-customer-${customer.id}`}
                          >
                            <DeleteConfirmationModal
                              itemName={customer.name}
                              itemType="MT customer"
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
            <MdStore className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No MT customers found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first modern trade customer.
            </p>
            <Link
              href="/modern-trade/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <MdAdd className="w-5 h-5" />
              New MT Customer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
