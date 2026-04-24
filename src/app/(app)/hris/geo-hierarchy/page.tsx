"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdPublic,
  MdAdd,
  MdSearch,
  MdFactory,
  MdHub,
  MdAgriculture,
  MdLocationOn,
} from "react-icons/md";
import Button from "@/components/common/Button";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/common/TabBar";
import { HRISLayout } from "@/components/hris";
import Tooltip from "@/components/common/Tooltip";
import {
  useZones,
  useZonesPaginated,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
} from "@/hooks/useZone";
import { useFactories, useDeleteFactory } from "@/hooks/useFactory";
import { useClusters, useDeleteCluster } from "@/hooks/useCluster";
import { useFarms, useDeleteFarm } from "@/hooks/useFarm";
import type { Zone } from "@/types/zone";
import type { Factory } from "@/types/factory";
import type { Cluster } from "@/types/cluster";
import type { Farm } from "@/types/farm";

// ─── Shared Inline Delete Dialog ─────────────────────────────────────────────
function InlineDeleteDialog({
  itemName,
  onConfirm,
  onCancel,
  isPending,
}: {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Confirm Delete
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete <strong>{itemName}</strong>? This
          action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Zone Form Modal ────────────────────────────────────────────────────────
function ZoneFormModal({
  zone,
  onClose,
}: {
  zone?: Zone;
  onClose: () => void;
}) {
  const [name, setName] = useState(zone?.name ?? "");
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (zone) {
      updateZone.mutate(
        { id: zone.id, name: name.trim() },
        { onSuccess: onClose },
      );
    } else {
      createZone.mutate(name.trim(), { onSuccess: onClose });
    }
  };

  const isPending = createZone.isPending || updateZone.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          {zone ? "Edit Zone" : "Add Zone"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zone Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter zone name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400"
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : zone ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Zones Tab ──────────────────────────────────────────────────────────────
function ZonesTab({
  search,
  onEditZone,
}: {
  search: string;
  onEditZone: (zone: Zone) => void;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useZonesPaginated({
    page,
    per_page: 10,
    search: search || undefined,
  });
  const deleteZone = useDeleteZone();
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null);

  const zones = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      )}

      {!isLoading && zones.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <MdPublic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No zones found
          </h3>
          <p className="text-gray-500">Add your first zone to get started.</p>
        </div>
      )}

      {zones.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Factories
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zones.map((zone) => (
                  <tr
                    key={zone.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MdLocationOn className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {zone.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          zone.is_active !== false
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {zone.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                        <MdFactory className="w-4 h-4 text-gray-400" />
                        {zone.factories ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip content="Edit zone">
                          <button
                            onClick={() => onEditZone(zone)}
                            className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <FiEdit className="h-3.5 w-3.5" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Delete zone">
                          <button
                            onClick={() => setDeleteTarget(zone)}
                            className="inline-flex items-center justify-center p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <FiTrash className="h-3.5 w-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing {(pagination.current_page - 1) * pagination.per_page + 1}–
                {Math.min(
                  pagination.current_page * pagination.per_page,
                  pagination.total_items,
                )}{" "}
                of {pagination.total_items}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.current_page === pagination.first_page}
                  className="px-3 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-xs text-gray-700 font-medium">
                  {pagination.current_page} / {pagination.total_pages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.total_pages, p + 1))
                  }
                  disabled={
                    pagination.current_page === pagination.last_page
                  }
                  className="px-3 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Delete Zone
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteZone.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }}
                disabled={deleteZone.isPending}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteZone.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Factories Tab ──────────────────────────────────────────────────────────
function FactoriesTab({ search }: { search: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Factory | null>(null);

  const { data, isLoading } = useFactories({
    page,
    search: search || undefined,
    sort_by: "name",
    sort_order: "asc",
  });
  const deleteFactory = useDeleteFactory();

  const factories = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {!isLoading && factories.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MdFactory className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No factories found
            </h3>
            <p className="text-gray-500">
              Add your first factory to get started.
            </p>
          </div>
        )}

        {factories.length > 0 && (
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {factories.map((factory) => (
                    <tr
                      key={factory.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/factories/${factory.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
                          {factory.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {factory.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip content="View factory">
                            <button
                              onClick={() =>
                                router.push(`/factories/${factory.id}`)
                              }
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <FiEye className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit factory">
                            <button
                              onClick={() =>
                                router.push(`/factories/${factory.id}/edit`)
                              }
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              <FiEdit className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete factory">
                            <button
                              onClick={() => setDeleteTarget(factory)}
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <FiTrash className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-2">
            <p className="text-xs text-gray-500">
              Page {pagination.current_page} of {pagination.total_pages} ·{" "}
              {pagination.total_items} items
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={pagination.current_page >= pagination.total_pages}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <InlineDeleteDialog
          itemName={deleteTarget.name}
          onConfirm={() =>
            deleteFactory.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteFactory.isPending}
        />
      )}
    </>
  );
}

// ─── Clusters Tab ────────────────────────────────────────────────────────────
function ClustersTab({ search }: { search: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Cluster | null>(null);

  const { data, isLoading } = useClusters({
    page,
    search: search || undefined,
    sort_by: "name",
    sort_order: "asc",
  });
  const deleteCluster = useDeleteCluster();

  const clusters = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {!isLoading && clusters.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MdHub className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No clusters found
            </h3>
            <p className="text-gray-500">
              Add your first cluster to get started.
            </p>
          </div>
        )}

        {clusters.length > 0 && (
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
                      Factory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Farms
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clusters.map((cluster) => (
                    <tr
                      key={cluster.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/hris/clusters/${cluster.id}`)
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
                          {cluster.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cluster.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cluster.factory?.name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cluster.zone?.name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cluster.farms_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip content="View cluster">
                            <button
                              onClick={() =>
                                router.push(`/hris/clusters/${cluster.id}`)
                              }
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <FiEye className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit cluster">
                            <button
                              onClick={() =>
                                router.push(`/hris/clusters/${cluster.id}/edit`)
                              }
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              <FiEdit className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete cluster">
                            <button
                              onClick={() => setDeleteTarget(cluster)}
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <FiTrash className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-2">
            <p className="text-xs text-gray-500">
              Page {pagination.current_page} of {pagination.total_pages} ·{" "}
              {pagination.total_items} items
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={pagination.current_page >= pagination.total_pages}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <InlineDeleteDialog
          itemName={deleteTarget.name}
          onConfirm={() =>
            deleteCluster.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteCluster.isPending}
        />
      )}
    </>
  );
}

// ─── Farms Tab ──────────────────────────────────────────────────────────────
function FarmsTab({ search }: { search: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Farm | null>(null);

  const { data, isLoading } = useFarms({ page, search: search || undefined });
  const deleteFarm = useDeleteFarm();

  const farms = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {!isLoading && farms.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MdAgriculture className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No farms found
            </h3>
            <p className="text-gray-500">Add your first farm to get started.</p>
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
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cluster
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size (Ha)
                    </th>
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
                        <span className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
                          {farm.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {farm.farm_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {farm.zone?.name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {farm.cluster?.name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {farm.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip content="View farm">
                            <button
                              onClick={() => router.push(`/farms/${farm.id}`)}
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <FiEye className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit farm">
                            <button
                              onClick={() =>
                                router.push(`/farms/${farm.id}/edit`)
                              }
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              <FiEdit className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete farm">
                            <button
                              onClick={() => setDeleteTarget(farm)}
                              className="inline-flex items-center justify-center p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <FiTrash className="h-3.5 w-3.5" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-2">
            <p className="text-xs text-gray-500">
              Page {pagination.current_page} of {pagination.total_pages} ·{" "}
              {pagination.total_items} items
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={pagination.current_page >= pagination.total_pages}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <InlineDeleteDialog
          itemName={deleteTarget.name}
          onConfirm={() =>
            deleteFarm.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteFarm.isPending}
        />
      )}
    </>
  );
}

// ─── Tab config ──────────────────────────────────────────────────────────────
const GEO_TABS = [
  { value: "zones", label: "Zones", addLabel: "Add Zone", icon: MdPublic },
  {
    value: "factories",
    label: "Factories",
    addLabel: "Add Factory",
    icon: MdFactory,
    href: "/factories/new",
  },
  {
    value: "clusters",
    label: "Clusters",
    addLabel: "Add Cluster",
    icon: MdHub,
    href: "/hris/clusters/new",
  },
  {
    value: "farms",
    label: "Farms",
    addLabel: "Add Farm",
    icon: MdAgriculture,
    href: "/farms/new",
  },
] as const;

type GeoTab = (typeof GEO_TABS)[number]["value"];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GeoHierarchyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<GeoTab>("zones");
  const [search, setSearch] = useState("");
  const [zoneFormState, setZoneFormState] = useState<{
    open: boolean;
    zone?: Zone;
  }>({ open: false });

  const currentTab = GEO_TABS.find((t) => t.value === activeTab)!;

  const handleTabChange = (v: string) => {
    setActiveTab(v as GeoTab);
    setSearch("");
  };

  const handleAdd = () => {
    if (activeTab === "zones") {
      setZoneFormState({ open: true, zone: undefined });
    } else {
      const tab = GEO_TABS.find((t) => t.value === activeTab);
      if (tab && "href" in tab) router.push(tab.href as string);
    }
  };

  return (
    <HRISLayout
      title={currentTab.label}
      search={
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${currentTab.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
          />
        </div>
      }
      action={
        <Button
          type="small"
          onClick={handleAdd}
          className="flex items-center gap-1"
        >
          <MdAdd className="w-4 h-4" />
          {currentTab.addLabel}
        </Button>
      }
    >
      <div className="flex flex-col h-full overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex flex-col h-full overflow-hidden"
        >
          <TabsList>
            {GEO_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                icon={<tab.icon />}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="zones">
              <ZonesTab
                search={search}
                onEditZone={(zone) => setZoneFormState({ open: true, zone })}
              />
            </TabsContent>
            <TabsContent value="factories">
              <FactoriesTab search={search} />
            </TabsContent>
            <TabsContent value="clusters">
              <ClustersTab search={search} />
            </TabsContent>
            <TabsContent value="farms">
              <FarmsTab search={search} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {zoneFormState.open && (
        <ZoneFormModal
          zone={zoneFormState.zone}
          onClose={() => setZoneFormState({ open: false })}
        />
      )}
    </HRISLayout>
  );
}
