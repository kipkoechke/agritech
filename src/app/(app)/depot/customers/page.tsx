"use client";

import { useState, useEffect } from "react";
import { MdPeople, MdPerson, MdSell, MdBusiness } from "react-icons/md";
import Link from "next/link";
import { useDepotCustomers } from "@/hooks/useDepotPortal";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";

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

export default function DepotCustomersPage() {
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

  const { data, isLoading, error } = useDepotCustomers({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MdPeople className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                Customers
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                View customers in your depot
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search customers..."
            />
          </div>
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

        {/* Table */}
        {data && data.data.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-y-auto p-3 space-y-3">
              {data.data.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/depot/customers/${customer.id}`}
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      {customer.account_number}
                    </Link>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyle(customer.status)}`}
                    >
                      {customer.status}
                    </span>
                  </div>
                  <div className="mb-1">
                    <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                    <p className="text-xs text-gray-500">{customer.phone}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{customer.zone?.name || "-"}</span>
                    <span className="text-gray-500">{customer.sales_person?.name || "Unassigned"}</span>
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
                      <div className="flex items-center gap-1">
                        <MdBusiness className="w-3.5 h-3.5" />
                        Account #
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <MdPerson className="w-3.5 h-3.5" />
                        Name
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <MdSell className="w-3.5 h-3.5" />
                        Sales Rep
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/depot/customers/${customer.id}`}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          {customer.account_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {customer.zone?.name || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.sales_person ? (
                          <div>
                            <p className="text-sm text-gray-900">
                              {customer.sales_person.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {customer.sales_person.employee_number}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(customer.status)}`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(customer.created_at).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.pagination && data.pagination.total > 0 && (
              <div className="px-3 md:px-0 py-3 border-t border-gray-200 bg-white shrink-0">
                <Pagination
                  currentPage={data.pagination.current_page}
                  totalPages={data.pagination.last_page}
                  onPageChange={handlePageChange}
                  totalItems={data.pagination.total}
                  itemsPerPage={data.pagination.per_page}
                />
              </div>
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
            <p className="text-gray-600">
              {debouncedSearch
                ? "Try adjusting your search"
                : "No customers in your depot yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
