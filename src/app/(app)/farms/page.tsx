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
import {
  GeoHierarchyFilter,
  GeoHierarchyValues,
} from "@/components/common/GeoHierarchyFilter";
import Tooltip from "@/components/common/Tooltip";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import PageHeader from "@/components/common/PageHeader";
import {
  useFarms,
  useMineFarms,
  useDeleteFarm,
  useAssignSupervisor,
} from "@/hooks/useFarm";
import { useIsFarmer, useIsSupervisor } from "@/hooks/useAuth";
import { useHrisUsers } from "@/hooks/useHrisUser";
import { useProducts } from "@/hooks/useProduct";
import type { Farm } from "@/types/farm";

export default function FarmsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [geoFilters, setGeoFilters] = useState<GeoHierarchyValues>({
    zoneId: "",
    factoryId: "",
    clusterId: "",
    farmId: "",
    workerId: "",
  });
  const [productFilter, setProductFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [assignFarm, setAssignFarm] = useState<Farm | null>(null);
  const [supervisorId, setSupervisorId] = useState("");

  const isFarmer = useIsFarmer();
  const isSupervisor = useIsSupervisor();
  const farmsParams = {
    page,
    zone_id: geoFilters.zoneId || undefined,
    product_id: productFilter || undefined,
  };
  const {
    data: allFarmsData,
    isLoading: allFarmsLoading,
    error: allFarmsError,
  } = useFarms(farmsParams, { enabled: !isFarmer });
  const {
    data: mineFarmsData,
    isLoading: mineFarmsLoading,
    error: mineFarmsError,
  } = useMineFarms(farmsParams, { enabled: isFarmer });
  const data = isFarmer ? mineFarmsData : allFarmsData;
  const isLoading = isFarmer ? mineFarmsLoading : allFarmsLoading;
  const error = isFarmer ? mineFarmsError : allFarmsError;
  const { data: productsData } = useProducts();
  const deleteFarm = useDeleteFarm();
  const assignSupervisor = useAssignSupervisor();

  const { data: supervisorsData, isLoading: supervisorsLoading } = useHrisUsers(
    {
      role: "supervisor",
    },
  );
  const supervisorOptions =
    supervisorsData?.data?.map((u) => ({ value: u.id, label: u.name })) || [];

  const farms = data?.data || [];
  const pagination = data?.pagination;

  const productOptions =
    productsData?.data?.map((p) => ({ value: p.id, label: p.name })) || [];

  return (
    <Modal>
      <div className="min-h-screen p-4 space-y-4">
        <PageHeader
          title="Farms"
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
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          }
          filters={
            <>
              <GeoHierarchyFilter
                levels={["zone", "factory", "cluster"]}
                values={geoFilters}
                onChange={(vals) => {
                  setGeoFilters(vals);
                  setPage(1);
                }}
                selectWidth="w-40"
              />
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
            </>
          }
          action={
            !isSupervisor ? (
              <Button
                type="small"
                to="/farms/new"
                className="flex items-center gap-1"
              >
                <MdAdd className="w-4 h-4" />
                Add Farm
              </Button>
            ) : undefined
          }
        />

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
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size (Acres)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    {!isFarmer && !isSupervisor && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farmer
                      </th>
                    )}
                    {!isSupervisor && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supervisor
                      </th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {farms.map((farm) => (
                    <tr
                      key={farm.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/farms/${farm.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
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
                          {(parseFloat(farm.size) * 2.471).toFixed(2)} Acres
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
                      {!isFarmer && !isSupervisor && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {farm.farmer?.name || "—"}
                          </div>
                        </td>
                      )}
                      {!isSupervisor && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {farm.supervisor?.name || "—"}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip content="View farm details">
                            <button
                              onClick={() => router.push(`/farms/${farm.id}`)}
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <FiEye className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          {!isSupervisor && (
                            <Tooltip content="Edit farm">
                              <button
                                onClick={() =>
                                  router.push(`/farms/${farm.id}/edit`)
                                }
                                className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              >
                                <FiEdit className="h-3.5 w-3.5" />
                              </button>
                            </Tooltip>
                          )}
                          {!isSupervisor && (
                            <Tooltip content="Assign a supervisor to this farm">
                              <Modal.Open opens="assign-supervisor">
                                <button
                                  onClick={() => {
                                    setAssignFarm(farm);
                                    setSupervisorId(farm.supervisor?.id || "");
                                  }}
                                  className="inline-flex items-center justify-center p-1.5 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                                >
                                  <MdSupervisorAccount className="h-3.5 w-3.5" />
                                </button>
                              </Modal.Open>
                            </Tooltip>
                          )}
                          {!isSupervisor && (
                            <Tooltip content="Delete farm">
                              <Modal.Open opens="delete-farm">
                                <button
                                  onClick={() => setSelectedFarm(farm)}
                                  className="inline-flex items-center justify-center p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                                >
                                  <FiTrash className="h-3.5 w-3.5" />
                                </button>
                              </Modal.Open>
                            </Tooltip>
                          )}
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
                          router.push(`/farms/${assignFarm.id}`);
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
