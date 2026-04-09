"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdFactory, MdAdd, MdSearch } from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ActionMenu } from "@/components/common/ActionMenu";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import { useFactories, useDeleteFactory } from "@/hooks/useFactory";
import { useZones } from "@/hooks/useZone";
import type { Factory } from "@/types/factory";

export default function FactoriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);

  const { data, isLoading, error } = useFactories({
    page,
    search: search || undefined,
    zone_id: zoneFilter || undefined,
    sort_by: "name",
    sort_order: "asc",
  });
  const deleteFactory = useDeleteFactory();
  const { data: zonesData } = useZones();

  const factories = data?.data || [];
  const pagination = data?.pagination;
  const zones = zonesData || [];

  const zoneOptions = [
    { value: "", label: "All Zones" },
    ...zones.map((z) => ({ value: z.id, label: z.name })),
  ];

  return (
    <Modal>
      <div className="min-h-screen p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <MdFactory className="w-6 h-6 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Factories</h1>
              <p className="text-sm text-gray-500">
                Manage processing factories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search factories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>
            <Button
              type="small"
              to="/factories/new"
              className="flex items-center gap-1"
            >
              <MdAdd className="w-4 h-4" />
              Add Factory
            </Button>
          </div>
        </div>
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
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              Failed to load factories. Please try again later.
            </div>
          )}

          {!isLoading && factories.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MdFactory className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No factories yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by adding your first factory.
              </p>
            </div>
          )}

          {factories.length > 0 && (
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
                        Zone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coordinates
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {factories.map((factory) => (
                      <tr key={factory.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {factory.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {factory.code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {factory.zone?.name || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {factory.admin?.name || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {factory.coordinates
                              ? `${factory.coordinates[0]}, ${factory.coordinates[1]}`
                              : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <ActionMenu menuId={`factory-${factory.id}`}>
                            <ActionMenu.Trigger />
                            <ActionMenu.Content>
                              <ActionMenu.Item
                                onClick={() =>
                                  router.push(`/factories/${factory.id}`)
                                }
                              >
                                <FiEye className="h-4 w-4" />
                                View
                              </ActionMenu.Item>
                              <ActionMenu.Item
                                onClick={() =>
                                  router.push(`/factories/${factory.id}/edit`)
                                }
                              >
                                <FiEdit className="h-4 w-4" />
                                Edit
                              </ActionMenu.Item>
                              <Modal.Open opens="delete-factory">
                                <ActionMenu.Item
                                  onClick={() => setSelectedFactory(factory)}
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

        <Modal.Window name="delete-factory">
          {selectedFactory ? (
            <DeleteConfirmationModal
              itemName={selectedFactory.name}
              itemType="Factory"
              onConfirm={() => deleteFactory.mutateAsync(selectedFactory.id)}
              isDeleting={deleteFactory.isPending}
            />
          ) : (
            <div />
          )}
        </Modal.Window>
      </div>
    </Modal>
  );
}
