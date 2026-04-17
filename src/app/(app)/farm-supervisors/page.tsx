"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdSupervisorAccount, MdSearch, MdAdd } from "react-icons/md";
import { FiEye } from "react-icons/fi";
import Tooltip from "@/components/common/Tooltip";
import Button from "@/components/common/Button";
import { HRISLayout } from "@/components/hris";
import PageHeader from "@/components/common/PageHeader";
import { useHrisUsers } from "@/hooks/useHrisUser";
import { useIsAdmin, useIsFarmer } from "@/hooks/useAuth";

export default function FarmsSupervisorsPage() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const isFarmer = useIsFarmer();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useHrisUsers({
    page,
    role: "supervisor",
    search: search || undefined,
    sort_by: "name",
    sort_order: "asc",
  });

  const supervisors = data?.data || [];
  const pagination = data?.pagination;

  const searchInput = (
    <div className="relative w-full sm:w-64">
      <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search supervisors..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
      />
    </div>
  );

  const tableContent = (
    <div className={isAdmin ? "flex-1 overflow-y-auto space-y-4" : "space-y-4"}>
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Failed to load supervisors. Please try again later.
        </div>
      )}

      {!isLoading && supervisors.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <MdSupervisorAccount className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No supervisors found
          </h3>
          <p className="text-gray-500 mb-4">
            There are no supervisors to display.
          </p>
        </div>
      )}

      {supervisors.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account No.
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supervisors.map((sup) => (
                  <tr
                    key={sup.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/farm-supervisors/${sup.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
                        {sup.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{sup.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{sup.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {sup.account_number || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip content="View supervisor profile">
                          <button
                            onClick={() =>
                              router.push(`/farm-supervisors/${sup.id}`)
                            }
                            className="inline-flex items-center justify-center p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <FiEye className="h-3.5 w-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Page {pagination.current_page} of {pagination.total_pages}{" "}
                &nbsp;·&nbsp; {pagination.total_items} items
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.current_page <= 1}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.next_page}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isAdmin) {
    return (
      <HRISLayout
        title="Supervisors"
        search={searchInput}
        action={
          <Button
            type="small"
            to="/farm-supervisors/new"
            className="flex items-center gap-1"
          >
            <MdAdd className="w-4 h-4" />
            Add Supervisor
          </Button>
        }
      >
        {tableContent}
      </HRISLayout>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-4">
      <PageHeader
        title="My Supervisors"
        search={searchInput}
        action={
          isFarmer ? (
            <Button
              type="small"
              to="/farm-supervisors/new"
              className="flex items-center gap-1"
            >
              <MdAdd className="w-4 h-4" />
              Add Supervisor
            </Button>
          ) : undefined
        }
      />
      {tableContent}
    </div>
  );
}
