"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdGroup, MdAdd, MdSearch } from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import Tooltip from "@/components/common/Tooltip";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import { HRISLayout } from "@/components/hris";
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
      <HRISLayout
        title="Work Groups"
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
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
            />
          </div>
        }
        filters={
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
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
      >
        <div className="flex-1 overflow-y-auto space-y-4">
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
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/60">
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
                      <tr
                        key={group.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/work-groups/${group.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
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
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip content="View work group details">
                              <button
                                onClick={() =>
                                  router.push(`/work-groups/${group.id}`)
                                }
                                className="inline-flex items-center justify-center p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              >
                                <FiEye className="h-3.5 w-3.5" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Edit work group">
                              <button
                                onClick={() =>
                                  router.push(`/work-groups/${group.id}/edit`)
                                }
                                className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              >
                                <FiEdit className="h-3.5 w-3.5" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Delete work group">
                              <Modal.Open opens="delete-work-group">
                                <button
                                  onClick={() => setSelectedGroup(group)}
                                  className="inline-flex items-center justify-center p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                                >
                                  <FiTrash className="h-3.5 w-3.5" />
                                </button>
                              </Modal.Open>
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
      </HRISLayout>
    </Modal>
  );
}
