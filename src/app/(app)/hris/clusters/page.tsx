"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdHub, MdAdd, MdSearch } from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ActionMenu } from "@/components/common/ActionMenu";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import { HRISLayout } from "@/components/hris";
import { useClusters, useDeleteCluster } from "@/hooks/useCluster";
import { useZones } from "@/hooks/useZone";
import { useFactories } from "@/hooks/useFactory";
import type { Cluster } from "@/types/cluster";

export default function ClustersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [factoryFilter, setFactoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);

  const { data, isLoading, error } = useClusters({
    page,
    search: search || undefined,
    zone_id: zoneFilter || undefined,
    factory_id: factoryFilter || undefined,
    sort_by: "name",
    sort_order: "asc",
  });
  const deleteCluster = useDeleteCluster();
  const { data: zonesData } = useZones();
  const { data: factoriesData } = useFactories();

  const clusters = data?.data || [];
  const pagination = data?.pagination;
  const zones = zonesData || [];
  const factories = factoriesData?.data || [];

  const zoneOptions = [
    { value: "", label: "All Zones" },
    ...zones.map((z) => ({ value: z.id, label: z.name })),
  ];

  const factoryOptions = [
    { value: "", label: "All Factories" },
    ...factories.map((f) => ({ value: f.id, label: f.name })),
  ];

  return (
    <Modal>
      <HRISLayout
        title={
          <div className="flex items-center gap-2">
            <MdHub className="w-5 h-5 text-emerald-600" />
            <div>
              <h1 className="text-base md:text-lg font-semibold text-slate-900">
                Clusters
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 hidden md:block">
                Manage farm clusters
              </p>
            </div>
          </div>
        }
        description=""
        search={
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clusters..."
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
            to="/hris/clusters/new"
            className="flex items-center gap-1"
          >
            <MdAdd className="w-4 h-4" />
            Add Cluster
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="w-44">
              <SearchableSelect
                label=""
                options={zoneOptions}
                value={zoneFilter}
                onChange={(val) => {
                  setZoneFilter(val);
                  setPage(1);
                }}
                placeholder="Filter by zone"
              />
            </div>
            <div className="w-44">
              <SearchableSelect
                label=""
                options={factoryOptions}
                value={factoryFilter}
                onChange={(val) => {
                  setFactoryFilter(val);
                  setPage(1);
                }}
                placeholder="Filter by factory"
              />
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              Failed to load clusters. Please try again later.
            </div>
          )}

          {!isLoading && clusters.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MdHub className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No clusters yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by adding your first cluster.
              </p>
            </div>
          )}

          {clusters.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Factory
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Workers
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clusters.map((cluster) => (
                      <tr key={cluster.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {cluster.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {cluster.code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {cluster.factory?.name || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {cluster.zone?.name || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {cluster.farms_count}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {cluster.farm_workers_count}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <ActionMenu menuId={`cluster-${cluster.id}`}>
                            <ActionMenu.Trigger />
                            <ActionMenu.Content>
                              <ActionMenu.Item
                                onClick={() =>
                                  router.push(
                                    `/hris/clusters/${cluster.id}`,
                                  )
                                }
                              >
                                <FiEye className="h-4 w-4" />
                                View
                              </ActionMenu.Item>
                              <ActionMenu.Item
                                onClick={() =>
                                  router.push(
                                    `/hris/clusters/${cluster.id}/edit`,
                                  )
                                }
                              >
                                <FiEdit className="h-4 w-4" />
                                Edit
                              </ActionMenu.Item>
                              <Modal.Open opens="delete-cluster">
                                <ActionMenu.Item
                                  onClick={() => setSelectedCluster(cluster)}
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

        <Modal.Window name="delete-cluster">
          {selectedCluster ? (
            <DeleteConfirmationModal
              itemName={selectedCluster.name}
              itemType="Cluster"
              onConfirm={() =>
                deleteCluster.mutateAsync(selectedCluster.id)
              }
              isDeleting={deleteCluster.isPending}
            />
          ) : (
            <div />
          )}
        </Modal.Window>
      </HRISLayout>
    </Modal>
  );
}
