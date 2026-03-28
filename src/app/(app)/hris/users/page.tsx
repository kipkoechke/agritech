"use client";

import React, { useState, useEffect } from "react";
import { HRISLayout } from "@/components/hris";
import { UserManagementTabs } from "@/components/hris/UserManagementTabs";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import { MdMoreVert, MdPersonAdd, MdEdit, MdDelete } from "react-icons/md";
import Link from "next/link";
import { User } from "@/types/user";
import { useDeleteUser, useUsers } from "@/hooks/useUser";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // When searching, don't use pagination (backend handles it)
  const { data, isLoading, error } = useUsers(
    searchQuery ? 1 : page,
    searchQuery || undefined,
  );
  const deleteUserMutation = useDeleteUser();
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setSelectedUser(null);
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

  return (
    <HRISLayout
      title="User Management"
      description="Manage system users"
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
          href="/hris/users/add"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
        >
          <MdPersonAdd className="w-5 h-5" />
          Add User
        </Link>
      }
    >
      {/* User Management Tabs */}
      <div className="mb-4">
        <UserManagementTabs />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 min-h-0 flex flex-col">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm flex-1 flex items-center justify-center">
            Loading users...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm flex-1 flex items-center justify-center">
            Error loading users. Please try again.
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden overflow-y-auto flex-1 p-3 space-y-2">
              {!data?.data || data.data.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  {searchQuery
                    ? "No users found matching your search"
                    : "No users found"}
                </div>
              ) : (
                data.data.map((user: User) => (
                  <div
                    key={user.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            user.status
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status ? "Active" : "Inactive"}
                        </span>
                        <ActionMenu menuId={`user-menu-mobile-${user.id}`}>
                          <ActionMenu.Trigger>
                            <MdMoreVert className="w-5 h-5 text-gray-600" />
                          </ActionMenu.Trigger>
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() =>
                                (window.location.href = `/hris/users/${user.id}`)
                              }
                            >
                              <MdEdit className="w-4 h-4" />
                              Edit
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() => handleDelete(user)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <MdDelete className="w-4 h-4" />
                              Delete
                            </ActionMenu.Item>
                          </ActionMenu.Content>
                        </ActionMenu>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 text-[10px]">Role</span>
                        <p className="text-gray-900">{user.role?.name || "-"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px]">Region</span>
                        <p className="text-gray-900">{user.region?.name || "-"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px]">Zone</span>
                        <p className="text-gray-900">{user.zone?.name || "-"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-y-auto max-h-[calc(100vh-280px)]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      User
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Role
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Region
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Zone
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap w-24 sticky right-0 bg-gray-50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!data?.data || data.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-gray-500 text-sm"
                      >
                        {searchQuery
                          ? "No users found matching your search"
                          : "No users found"}
                      </td>
                    </tr>
                  ) : (
                    data.data.map((user: User) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {user.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {user.role?.name || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {user.region?.name || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {user.zone?.name || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              user.status
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                          <ActionMenu menuId={`user-menu-${user.id}`}>
                            <ActionMenu.Trigger>
                              <MdMoreVert className="w-5 h-5 text-gray-600" />
                            </ActionMenu.Trigger>
                            <ActionMenu.Content>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/hris/users/${user.id}`)
                                }
                              >
                                <MdEdit className="w-4 h-4" />
                                Edit
                              </ActionMenu.Item>
                              <ActionMenu.Item
                                onClick={() => handleDelete(user)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <MdDelete className="w-4 h-4" />
                                Delete
                              </ActionMenu.Item>
                            </ActionMenu.Content>
                          </ActionMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - hide when searching */}
            {!searchQuery && data && data.pagination.last_page > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  Page {data.pagination.current_page} of{" "}
                  {data.pagination.last_page} ({data.pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-xs text-gray-700">
                    {page} / {data.pagination.last_page}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(data.pagination.last_page, p + 1))
                    }
                    disabled={page === data.pagination.last_page}
                    className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete user{" "}
              <span className="font-medium">{selectedUser.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                disabled={deleteUserMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteUserMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 text-sm"
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </HRISLayout>
  );
}
