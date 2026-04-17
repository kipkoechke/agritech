"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdAdd, MdSearch, MdLocalActivity } from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Tooltip from "@/components/common/Tooltip";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import { HRISLayout } from "@/components/hris";
import { useActivities, useDeleteActivity } from "@/hooks/useActivity";
import type { Activity } from "@/types/activity";

export default function ActivitiesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  const { data, isLoading, error } = useActivities({
    page,
    search: search || undefined,
    is_active: statusFilter || undefined,
    sort_by: "name",
    sort_order: "asc",
  });
  const deleteActivity = useDeleteActivity();

  const activities = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Modal>
      <HRISLayout
        title="Farm Activities"
        search={
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
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
          <div className="w-40">
            <SearchableSelect
              label=""
              options={[
                { value: "", label: "All Status" },
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              placeholder="Filter by status"
            />
          </div>
        }
        action={
          <Button
            type="small"
            to="/activities/new"
            className="flex items-center gap-1"
          >
            <MdAdd className="w-4 h-4" />
            Add Activity
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
            Failed to load activities. Please try again later.
          </div>
        )}

        {!isLoading && activities.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MdLocalActivity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No activities yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first activity.
            </p>
          </div>
        )}

        {activities.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit of Measure
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
                  {activities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/activities/${activity.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
                          {activity.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {activity.uom}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            activity.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {activity.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip content="View activity details">
                            <button
                              onClick={() =>
                                router.push(`/activities/${activity.id}`)
                              }
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <FiEye className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit activity">
                            <button
                              onClick={() =>
                                router.push(`/activities/${activity.id}/edit`)
                              }
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            >
                              <FiEdit className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete activity">
                            <Modal.Open opens="delete-activity">
                              <button
                                onClick={() => setSelectedActivity(activity)}
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

        <Modal.Window name="delete-activity">
          {selectedActivity ? (
            <DeleteConfirmationModal
              itemName={selectedActivity.name}
              itemType="Activity"
              onConfirm={() => deleteActivity.mutateAsync(selectedActivity.id)}
              isDeleting={deleteActivity.isPending}
            />
          ) : (
            <div />
          )}
        </Modal.Window>
      </HRISLayout>
    </Modal>
  );
}
