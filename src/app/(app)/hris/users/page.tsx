"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdGroup, MdAdd, MdSearch } from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Tooltip from "@/components/common/Tooltip";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import { HRISLayout } from "@/components/hris";
import { useHrisUsers, useDeleteHrisUser } from "@/hooks/useHrisUser";
import type { HrisUser } from "@/types/hrisUser";

const formatRole = (role: string) =>
  role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function HrisUsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<HrisUser | null>(null);

  const { data, isLoading, error } = useHrisUsers({
    page,
    search: search || undefined,
    role: roleFilter || undefined,
    sort_by: "name",
    sort_order: "asc",
  });
  const deleteUser = useDeleteHrisUser();

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Modal>
      <HRISLayout
        title="User Management"
        search={
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
            />
          </div>
        }
        filters={
          <div className="w-44">
            <SearchableSelect
              label=""
              options={[
                { value: "", label: "All Roles" },
                { value: "admin", label: "Admin" },
                { value: "farmer", label: "Farmer" },
                { value: "supervisor", label: "Supervisor" },
                { value: "farm_worker", label: "Farm Worker" },
              ]}
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val);
                setPage(1);
              }}
              placeholder="Filter by role"
            />
          </div>
        }
        action={
          <Button
            type="small"
            to="/hris/users/new"
            className="flex items-center gap-1"
          >
            <MdAdd className="w-4 h-4" />
            Add User
          </Button>
        }
      >
        <div className="space-y-4">
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              Failed to load users. Please try again later.
            </div>
          )}

          {!isLoading && users.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MdGroup className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by adding your first user.
              </p>
            </div>
          )}

          {users.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
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
                        Role
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/hris/users/${user.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {formatRole(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip content="View user profile">
                              <button
                                onClick={() =>
                                  router.push(`/hris/users/${user.id}`)
                                }
                                className="p-1.5 text-primary/70 bg-primary/5 hover:text-primary hover:bg-primary/15 rounded-lg transition-all"
                              >
                                <FiEye className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Edit user">
                              <button
                                onClick={() =>
                                  router.push(`/hris/users/${user.id}/edit`)
                                }
                                className="p-1.5 text-blue-500/70 bg-blue-50 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                              >
                                <FiEdit className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Modal.Open opens="delete-user">
                              <Tooltip content="Delete user">
                                <button
                                  onClick={() => setSelectedUser(user)}
                                  className="p-1.5 text-red-400/70 bg-red-50 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                >
                                  <FiTrash className="h-4 w-4" />
                                </button>
                              </Tooltip>
                            </Modal.Open>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.total_pages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Page {pagination.current_page} of {pagination.total_pages} (
                    {pagination.total_items} items)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.current_page <= 1}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.next_page}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Modal.Window name="delete-user">
          {selectedUser ? (
            <DeleteConfirmationModal
              itemName={selectedUser.name}
              itemType="User"
              onConfirm={() => deleteUser.mutateAsync(selectedUser.id)}
              isDeleting={deleteUser.isPending}
            />
          ) : (
            <div />
          )}
        </Modal.Window>
      </HRISLayout>
    </Modal>
  );
}
