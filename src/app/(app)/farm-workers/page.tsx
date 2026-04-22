"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdPerson, MdAdd, MdSearch } from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import {
  GeoHierarchyFilter,
  GeoHierarchyValues,
} from "@/components/common/GeoHierarchyFilter";
import Tooltip from "@/components/common/Tooltip";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import PageHeader from "@/components/common/PageHeader";
import { useWorkers, useDeleteWorker } from "@/hooks/useWorkers";
import type { Worker } from "@/types/worker";

export default function WorkersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [geoFilters, setGeoFilters] = useState<GeoHierarchyValues>({
    zoneId: "",
    factoryId: "",
    clusterId: "",
    farmId: "",
    workerId: "",
  });
  const [page, setPage] = useState(1);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const { data, isLoading, error } = useWorkers({
    page,
    search: search || undefined,
  });
  const deleteWorker = useDeleteWorker();

  const workers = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Modal>
      <div className="min-h-screen p-4 space-y-4">
        <PageHeader
          title="Farm Workers"
          search={
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workers..."
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
            <GeoHierarchyFilter
              levels={["zone", "factory", "cluster"]}
              values={geoFilters}
              onChange={(vals) => {
                setGeoFilters(vals);
                setPage(1);
              }}
              selectWidth="w-40"
            />
          }
          action={
            <Button
              type="small"
              to="/farm-workers/new"
              className="flex items-center gap-1"
            >
              <MdAdd className="w-4 h-4" />
              Add Worker
            </Button>
          }
        />

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            Failed to load workers. Please try again later.
          </div>
        )}

        {!isLoading && workers.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MdPerson className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No workers yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first worker.
            </p>
          </div>
        )}

        {workers.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Factory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cluster
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workers.map((worker) => (
                    <tr
                      key={worker.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/farm-workers/${worker.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
                          {worker.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {worker.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {worker.zone?.name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {worker.factory?.name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {worker.cluster?.name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {worker.created_at
                            ? new Date(worker.created_at).toLocaleDateString()
                            : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip content="View worker details">
                            <button
                              onClick={() =>
                                router.push(`/farm-workers/${worker.id}`)
                              }
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <FiEye className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit worker">
                            <button
                              onClick={() =>
                                router.push(`/farm-workers/${worker.id}/edit`)
                              }
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            >
                              <FiEdit className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete worker">
                            <Modal.Open opens="delete-worker">
                              <button
                                onClick={() => setSelectedWorker(worker)}
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
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.next_page}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal.Window name="delete-worker">
        {selectedWorker ? (
          <DeleteConfirmationModal
            itemName={selectedWorker.name}
            itemType="Worker"
            onConfirm={() => deleteWorker.mutateAsync(selectedWorker.id)}
            isDeleting={deleteWorker.isPending}
          />
        ) : (
          <div />
        )}
      </Modal.Window>
    </Modal>
  );
}
