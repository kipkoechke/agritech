"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MdAdd,
  MdBusiness,
  MdPhone,
  MdEmail,
  MdCheckCircle,
  MdCancel,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdMoreVert,
  MdFilterList,
} from "react-icons/md";
import {
  useDepotManagers,
  useDeleteDepotManager,
} from "@/hooks/useDepotManager";
import { useZones } from "@/hooks/useZone";
import Pagination from "@/components/common/Pagination";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { HRISLayout } from "@/components/hris";

export default function DepotManagersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("");
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const zoneDropdownRef = useRef<HTMLDivElement>(null);
  const perPage = 15;

  const deleteMutation = useDeleteDepotManager();

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

  const { data, isLoading, error } = useDepotManagers({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    zone_id: zoneFilter || undefined,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <HRISLayout
      title="Depot Managers"
      description="Manage your depot service managers"
      search={
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search managers..."
        />
      }
      action={
        <Link
          href="/depot-managers/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
        >
          <MdAdd className="w-5 h-5" />
          New Manager
        </Link>
      }
    >
      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Loading depot managers...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load depot managers</p>
        </div>
      )}

      {/* Depot Managers Table */}
      {data && data.data.length > 0 && (
        <Modal>
          <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-y-auto p-3 space-y-3">
              {data.data.map((manager) => (
                <div
                  key={manager.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/depot-managers/${manager.id}`}
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      {manager.name}
                    </Link>
                    <ActionMenu menuId={`depot-manager-mobile-${manager.id}`}>
                      <ActionMenu.Trigger>
                        <MdMoreVert className="w-5 h-5 text-gray-600" />
                      </ActionMenu.Trigger>
                      <ActionMenu.Content>
                        <ActionMenu.Item
                          onClick={() =>
                            (window.location.href = `/depot-managers/${manager.id}`)
                          }
                        >
                          <MdVisibility className="w-4 h-4" />
                          View Details
                        </ActionMenu.Item>
                        <ActionMenu.Item
                          onClick={() =>
                            (window.location.href = `/depot-managers/${manager.id}/edit`)
                          }
                        >
                          <MdEdit className="w-4 h-4" />
                          Edit
                        </ActionMenu.Item>
                        <Modal.Open opens={`delete-manager-mobile-${manager.id}`}>
                          <ActionMenu.Item className="text-red-600 hover:bg-red-50">
                            <MdDelete className="w-4 h-4" />
                            Delete
                          </ActionMenu.Item>
                        </Modal.Open>
                      </ActionMenu.Content>
                    </ActionMenu>
                    <Modal.Window name={`delete-manager-mobile-${manager.id}`}>
                      <DeleteConfirmationModal
                        itemName={manager.name}
                        itemType="depot manager"
                        onConfirm={() => deleteMutation.mutate(manager.id)}
                        isDeleting={deleteMutation.isPending}
                      />
                    </Modal.Window>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-400">Employee #</span>
                      <p className="font-medium text-gray-700">{manager.employee_number || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Zone</span>
                      <p className="font-medium text-gray-700">{manager.zone?.name || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs space-y-0.5">
                      {manager.email && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <MdEmail className="w-3 h-3" />
                          <span className="truncate max-w-32">{manager.email}</span>
                        </div>
                      )}
                      {manager.phone && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <MdPhone className="w-3 h-3" />
                          <span>{manager.phone}</span>
                        </div>
                      )}
                    </div>
                    {manager.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <MdCheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <MdCancel className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee #
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
                          onClick={() => setShowZoneDropdown(!showZoneDropdown)}
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sticky right-0 bg-gray-50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((manager) => (
                    <tr key={manager.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/depot-managers/${manager.id}`}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          {manager.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-bold tracking-wide">
                          {manager.employee_number || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {manager.email && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <MdEmail className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate max-w-45">
                                {manager.email}
                              </span>
                            </div>
                          )}
                          {manager.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <MdPhone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{manager.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {manager.zone ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {manager.zone.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {manager.status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <MdCheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <MdCancel className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                        <ActionMenu menuId={`depot-manager-menu-${manager.id}`}>
                          <ActionMenu.Trigger>
                            <MdMoreVert className="w-5 h-5 text-gray-600" />
                          </ActionMenu.Trigger>
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() =>
                                (window.location.href = `/depot-managers/${manager.id}`)
                              }
                            >
                              <MdVisibility className="w-4 h-4" />
                              View Details
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() =>
                                (window.location.href = `/depot-managers/${manager.id}/edit`)
                              }
                            >
                              <MdEdit className="w-4 h-4" />
                              Edit
                            </ActionMenu.Item>
                            <Modal.Open opens={`delete-manager-${manager.id}`}>
                              <ActionMenu.Item className="text-red-600 hover:bg-red-50">
                                <MdDelete className="w-4 h-4" />
                                Delete
                              </ActionMenu.Item>
                            </Modal.Open>
                          </ActionMenu.Content>
                        </ActionMenu>

                        <Modal.Window name={`delete-manager-${manager.id}`}>
                          <DeleteConfirmationModal
                            itemName={manager.name}
                            itemType="depot manager"
                            onConfirm={() => deleteMutation.mutate(manager.id)}
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
              <div className="px-3 md:px-6 py-3 border-t border-gray-200 bg-white shrink-0">
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
        </Modal>
      )}

      {/* Empty State */}
      {data && data.data.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MdBusiness className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No depot managers found
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first depot manager.
          </p>
          <Link
            href="/depot-managers/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
          >
            <MdAdd className="w-5 h-5" />
            New Manager
          </Link>
        </div>
      )}
    </HRISLayout>
  );
}
