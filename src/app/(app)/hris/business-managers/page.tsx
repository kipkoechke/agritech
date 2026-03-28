"use client";

import React, { useState, useEffect } from "react";
import { HRISLayout } from "@/components/hris";
import { UserManagementTabs } from "@/components/hris/UserManagementTabs";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import Pagination from "@/components/common/Pagination";
import {
  MdMoreVert,
  MdPersonAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
} from "react-icons/md";
import Link from "next/link";
import { BusinessManager } from "@/types/businessManager";
import {
  useBusinessManagers,
  useDeleteBusinessManager,
} from "@/hooks/useBusinessManager";

export default function BusinessManagersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManager, setSelectedManager] =
    useState<BusinessManager | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading, error } = useBusinessManagers({
    page: searchQuery ? 1 : page,
    search: searchQuery || undefined,
  });
  const deleteManagerMutation = useDeleteBusinessManager();

  const handleDelete = (manager: BusinessManager) => {
    setSelectedManager(manager);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedManager) {
      deleteManagerMutation.mutate(selectedManager.id, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setSelectedManager(null);
        },
      });
    }
  };

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery) {
      setPage(1);
    }
  }, [searchQuery]);

  const managers = data?.data || [];
  const pagination = data?.pagination;

  return (
    <HRISLayout
      title="Business Managers"
      description="Manage business managers"
      search={
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or email..."
          className="w-full"
        />
      }
      action={
        <Link
          href="/hris/business-managers/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
        >
          <MdPersonAdd className="w-5 h-5" />
          Add Business Manager
        </Link>
      }
    >
      {/* User Management Tabs */}
      <div className="mb-4">
        <UserManagementTabs />
      </div>

      {/* Business Managers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Loading business managers...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">
            Error loading business managers. Please try again.
          </div>
        ) : managers.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-y-auto max-h-[calc(100vh-320px)] p-3 space-y-3">
              {managers.map((manager: BusinessManager) => (
                <div
                  key={manager.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {manager.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {manager.name}
                      </span>
                    </div>
                    <ActionMenu menuId={`manager-mobile-${manager.id}`}>
                      <ActionMenu.Trigger>
                        <MdMoreVert className="w-5 h-5 text-gray-500" />
                      </ActionMenu.Trigger>
                      <ActionMenu.Content>
                        <ActionMenu.Item
                          onClick={() =>
                            (window.location.href = `/hris/business-managers/${manager.id}`)
                          }
                        >
                          <MdVisibility className="w-4 h-4" />
                          View Details
                        </ActionMenu.Item>
                        <ActionMenu.Item
                          onClick={() =>
                            (window.location.href = `/hris/business-managers/${manager.id}/edit`)
                          }
                        >
                          <MdEdit className="w-4 h-4" />
                          Edit
                        </ActionMenu.Item>
                        <ActionMenu.Item
                          onClick={() => handleDelete(manager)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <MdDelete className="w-4 h-4" />
                          Delete
                        </ActionMenu.Item>
                      </ActionMenu.Content>
                    </ActionMenu>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Employee No.</span>
                      <p className="font-medium text-gray-700">{manager.employee_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Created</span>
                      <p className="font-medium text-gray-700">
                        {new Date(manager.created_at).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Email</span>
                      <p className="font-medium text-gray-700 truncate">{manager.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Phone</span>
                      <p className="font-medium text-gray-700">{manager.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-y-auto max-h-[calc(100vh-320px)]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Employee No.
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Phone
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Created
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap w-24 sticky right-0 bg-gray-50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {managers.map((manager: BusinessManager) => (
                    <tr
                      key={manager.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {manager.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {manager.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {manager.employee_number}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {manager.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {manager.phone}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(manager.created_at).toLocaleDateString(
                          "en-GB",
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                        <ActionMenu menuId={`manager-menu-${manager.id}`}>
                          <ActionMenu.Trigger>
                            <MdMoreVert className="w-5 h-5 text-gray-500" />
                          </ActionMenu.Trigger>
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() =>
                                (window.location.href = `/hris/business-managers/${manager.id}`)
                              }
                            >
                              <MdVisibility className="w-4 h-4" />
                              View Details
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() =>
                                (window.location.href = `/hris/business-managers/${manager.id}/edit`)
                              }
                            >
                              <MdEdit className="w-4 h-4" />
                              Edit
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() => handleDelete(manager)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <MdDelete className="w-4 h-4" />
                              Delete
                            </ActionMenu.Item>
                          </ActionMenu.Content>
                        </ActionMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-3 md:px-4 py-3 border-t border-gray-200">
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.last_page}
                  onPageChange={setPage}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.per_page}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm">
            No business managers found.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Business Manager
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete{" "}
              <span className="font-medium">{selectedManager.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedManager(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                disabled={deleteManagerMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteManagerMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 text-sm"
              >
                {deleteManagerMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </HRISLayout>
  );
}
