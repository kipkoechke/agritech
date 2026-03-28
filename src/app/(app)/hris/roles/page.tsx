"use client";

import React, { useState, useEffect } from "react";
import { useRoles, useDeleteRole } from "@/hooks/useRole";
import { HRISLayout } from "@/components/hris";
import { UserManagementTabs } from "@/components/hris/UserManagementTabs";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import Pagination from "@/components/common/Pagination";
import { MdMoreVert, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import Link from "next/link";
import { Role } from "@/types/role";

export default function RolesPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading, error } = useRoles(
    searchQuery ? 1 : page,
    searchQuery || undefined,
  );
  const deleteRoleMutation = useDeleteRole();

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedRole) {
      deleteRoleMutation.mutate(selectedRole.id, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setSelectedRole(null);
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

  const roles = data?.data || [];
  const pagination = data?.pagination;

  return (
    <HRISLayout
      title="Role Management"
      description="Manage system roles and permissions"
      search={
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search roles..."
          className="w-full"
        />
      }
      action={
        <Link
          href="/hris/roles/add"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
        >
          <MdAdd className="w-5 h-5" />
          Add Role
        </Link>
      }
    >
      {/* User Management Tabs */}
      <div className="mb-4">
        <UserManagementTabs />
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 min-h-0 flex flex-col">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Loading roles...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">
            Error loading roles. Please try again.
          </div>
        ) : roles.length > 0 ? (
          <>
            <div className="overflow-y-auto max-h-[calc(100vh-280px)] flex-1">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated At
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sticky right-0 bg-gray-50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((role: Role) => (
                    <tr
                      key={role.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {role.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {role.created_at}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {role.updated_at}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                        <ActionMenu menuId={`role-menu-${role.id}`}>
                          <ActionMenu.Trigger>
                            <MdMoreVert className="w-5 h-5 text-gray-600" />
                          </ActionMenu.Trigger>
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() =>
                                (window.location.href = `/hris/roles/${role.id}`)
                              }
                            >
                              <MdEdit className="w-4 h-4" />
                              Edit
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() => handleDelete(role)}
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
            {!searchQuery && pagination && pagination.last_page > 1 && (
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                onPageChange={setPage}
                totalItems={pagination.total}
                itemsPerPage={pagination.per_page}
              />
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm">
            {searchQuery
              ? "No roles found matching your search"
              : "No roles found"}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete role{" "}
              <span className="font-medium">{selectedRole.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRole(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                disabled={deleteRoleMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteRoleMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 text-sm"
              >
                {deleteRoleMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </HRISLayout>
  );
}
