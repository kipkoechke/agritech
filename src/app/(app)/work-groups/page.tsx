"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdGroup, MdAdd, MdSearch } from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import { ActionMenu } from "@/components/common/ActionMenu";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import PageHeader from "@/components/common/PageHeader";
import { useWorkGroups, useDeleteWorkGroup } from "@/hooks/useWorkGroup";
import type { WorkGroup } from "@/types/workGroup";

export default function WorkGroupsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<WorkGroup | null>(null);

  const { data, isLoading, error } = useWorkGroups({
    page,
    search: search || undefined,
    active: activeFilter === "" ? undefined : activeFilter === "true",
  });
  const deleteWorkGroup = useDeleteWorkGroup();

  const workGroups = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Modal>
      <div className="min-h-screen p-4 space-y-4">
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <MdGroup className="w-5 h-5 text-emerald-600" />
              <div>
                <h1 className="text-base md:text-lg font-semibold text-slate-900">
                  Work Groups
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 hidden md:block">
                  Manage work groups and their members
                </p>
              </div>
            </div>
          }
          search={
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search work groups..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          }
          action={
            <Button
              type="small"
              to="/work-groups/new"
              className="flex items-center gap-1"
            >
              <MdAdd className="w-4 h-4" />
              Add Work Group
            </Button>
          }
        />

        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            Failed to load work groups. Please try again later.
          </div>
        )}

        {!isLoading && workGroups.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MdGroup className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No work groups yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first work group.
            </p>
          </div>
        )}

        {workGroups.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">
                          {group.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {group.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {group.members}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            group.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {group.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ActionMenu menuId={`wg-${group.id}`}>
                          <ActionMenu.Trigger />
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() =>
                                router.push(`/work-groups/${group.id}`)
                              }
                            >
                              <FiEye className="h-4 w-4" />
                              View
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() =>
                                router.push(`/work-groups/${group.id}/edit`)
                              }
                            >
                              <FiEdit className="h-4 w-4" />
                              Edit
                            </ActionMenu.Item>
                            <Modal.Open opens="delete-work-group">
                              <ActionMenu.Item
                                onClick={() => setSelectedGroup(group)}
                                className="text-red-600"
                              >
                                <FiTrash className="h-4 w-4" />
                                Delete
                              </ActionMenu.Item>
                            </Modal.Open>
                          </ActionMenu.Content>
                        </ActionMenu>
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

      <Modal.Window name="delete-work-group">
        {selectedGroup ? (
          <DeleteConfirmationModal
            itemName={selectedGroup.name}
            itemType="Work Group"
            onConfirm={() => deleteWorkGroup.mutateAsync(selectedGroup.id)}
            isDeleting={deleteWorkGroup.isPending}
          />
        ) : (
          <div />
        )}
      </Modal.Window>
    </Modal>
  );
}
