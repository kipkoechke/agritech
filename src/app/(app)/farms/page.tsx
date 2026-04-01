"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdAgriculture,
  MdAdd,
  MdSearch,
  MdSupervisorAccount,
} from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ActionMenu } from "@/components/common/ActionMenu";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import PageHeader from "@/components/common/PageHeader";
import { useFarms, useDeleteFarm, useAssignSupervisor } from "@/hooks/useFarm";
import { useHrisUsers } from "@/hooks/useHrisUser";
import { useProducts } from "@/hooks/useProduct";
import { useZones } from "@/hooks/useZone";
import type { Farm } from "@/types/farm";

export default function FarmsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [assignFarm, setAssignFarm] = useState<Farm | null>(null);
  const [supervisorId, setSupervisorId] = useState("");

  const { data, isLoading, error } = useFarms({
    page,
    zone_id: zoneFilter || undefined,
    product_id: productFilter || undefined,
  });
  const { data: productsData } = useProducts();
  const { data: zonesData } = useZones();
  const deleteFarm = useDeleteFarm();
  const assignSupervisor = useAssignSupervisor();

  const { data: supervisorsData, isLoading: supervisorsLoading } = useHrisUsers({
    role: "supervisor",
  });
  const supervisorOptions =
    supervisorsData?.data?.map((u) => ({ value: u.id, label: u.name })) || [];

  const farms = data?.data || [];
  const pagination = data?.pagination;

  const productOptions =
    productsData?.data?.map((p) => ({ value: p.id, label: p.name })) || [];
  const zoneOptions = Array.isArray(zonesData)
    ? zonesData.map((z: { id: string; name: string }) => ({
        value: z.id,
        label: z.name,
      }))
    : [];

  return (
    <Modal>
      <div className="min-h-screen p-4 space-y-4">
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <MdAgriculture className="w-5 h-5 text-emerald-600" />
              <div>
                <h1 className="text-base md:text-lg font-semibold text-slate-900">
                  Farms
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 hidden md:block">
                  Manage registered farms
                </p>
              </div>
            </div>
          }
          search={
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search farms..."
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
            <Button type="small" to="/farms/new" className="flex items-center gap-1">
              <MdAdd className="w-4 h-4" />
              Add Farm
            </Button>
          }
        />

        <div className="flex gap-2 items-center flex-wrap">
          <div className="w-40">
            <SearchableSelect
              label=""
              options={[{ value: "", label: "All Zones" }, ...zoneOptions]}
              value={zoneFilter}
              onChange={(val) => {
                setZoneFilter(val);
                setPage(1);
              }}
              placeholder="Filter by zone"
            />
          </div>
          <div className="w-40">
            <SearchableSelect
              label=""
              options={[
                { value: "", label: "All Products" },
                ...productOptions,
              ]}
              value={productFilter}
              onChange={(val) => {
                setProductFilter(val);
                setPage(1);
              }}
              placeholder="Filter by product"
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
            Failed to load farms. Please try again later.
          </div>
        )}

        {!isLoading && farms.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MdAgriculture className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No farms yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first farm.
            </p>
          </div>
        )}

        {farms.length > 0 && (
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
                      Size (Ha)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Farmer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supervisor
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {farms.map((farm) => (
                    <tr key={farm.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {farm.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {farm.farm_code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {parseFloat(farm.size).toLocaleString()} Ha
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {farm.zone?.name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {farm.product?.name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {farm.farmer?.name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {farm.supervisor?.name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ActionMenu menuId={`farm-${farm.id}`}>
                          <ActionMenu.Trigger />
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() => router.push(`/farms/${farm.id}`)}
                            >
                              <FiEye className="h-4 w-4" />
                              View
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() => router.push(`/farms/${farm.id}/edit`)}
                            >
                              <FiEdit className="h-4 w-4" />
                              Edit
                            </ActionMenu.Item>
                            <Modal.Open opens="assign-supervisor">
                              <ActionMenu.Item
                                onClick={() => {
                                  setAssignFarm(farm);
                                  setSupervisorId(farm.supervisor?.id || "");
                                }}
                              >
                                <MdSupervisorAccount className="h-4 w-4" />
                                Assign Supervisor
                              </ActionMenu.Item>
                            </Modal.Open>
                            <Modal.Open opens="delete-farm">
                              <ActionMenu.Item
                                onClick={() => setSelectedFarm(farm)}
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

      <Modal.Window name="delete-farm">
        {selectedFarm ? (
          <DeleteConfirmationModal
            itemName={selectedFarm.name}
            itemType="Farm"
            onConfirm={() => deleteFarm.mutateAsync(selectedFarm.id)}
            isDeleting={deleteFarm.isPending}
          />
        ) : (
          <div />
        )}
      </Modal.Window>

      <Modal.Window name="assign-supervisor">
        {assignFarm ? (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Assign Supervisor to {assignFarm.name}
            </h2>
            <p className="text-sm text-gray-500">
              Select a supervisor to assign to this farm.
            </p>
            <SearchableSelect
              label="Supervisor"
              options={supervisorOptions}
              value={supervisorId}
              onChange={setSupervisorId}
              isLoading={supervisorsLoading}
              placeholder="Select supervisor"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Modal.Close>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
              </Modal.Close>
              <button
                onClick={() => {
                  if (supervisorId) {
                    assignSupervisor.mutate(
                      { id: assignFarm.id, supervisor_id: supervisorId },
                      {
                        onSuccess: () => {
                          setAssignFarm(null);
                          setSupervisorId("");
                        },
                      },
                    );
                  }
                }}
                disabled={!supervisorId || assignSupervisor.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {assignSupervisor.isPending ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        ) : (
          <div />
        )}
      </Modal.Window>
    </Modal>
  );
}