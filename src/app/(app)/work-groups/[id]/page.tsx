"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MdArrowBack,
  MdGroup,
  MdPerson,
  MdAdd,
  MdCalendarToday,
  MdEdit,
  MdInfo,
  MdPersonAdd,
  MdSearch,
} from "react-icons/md";
import { FiTrash } from "react-icons/fi";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { InputField } from "@/components/common/InputField";
import {
  useWorkGroup,
  useWorkGroupMembers,
  useAddWorkGroupMembers,
  useDeleteWorkGroupMember,
} from "@/hooks/useWorkGroup";
import { useWorkers, useCreateWorker } from "@/hooks/useWorkers";
import { useZones } from "@/hooks/useZone";
import { useZoneFactories } from "@/hooks/useFactory";
import { useFactoryClusters } from "@/hooks/useCluster";
import type { WorkGroupMember } from "@/types/workGroup";

export default function WorkGroupDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [selectedMember, setSelectedMember] = useState<WorkGroupMember | null>(
    null,
  );
  const [workerSearch, setWorkerSearch] = useState("");
  const [showCreateWorker, setShowCreateWorker] = useState(false);
  const [showAddExisting, setShowAddExisting] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: "",
    phone: "",
    pin: "",
    zone_id: "",
    factory_id: "",
    cluster_id: "",
  });

  const { data: groupResponse, isLoading } = useWorkGroup(id);
  const { data: membersResponse, isLoading: membersLoading } =
    useWorkGroupMembers(id);
  const addMembers = useAddWorkGroupMembers();
  const deleteMember = useDeleteWorkGroupMember();
  const createWorker = useCreateWorker();
  // If the search is a phone number, use phone param, else use search
  const isPhone = /^\d{10,}$/.test(workerSearch.trim());
  const { data: workersData, isLoading: workersLoading } = useWorkers(
    workerSearch.trim()
      ? isPhone
        ? { phone: workerSearch.trim() }
        : { search: workerSearch.trim() }
      : {}
  );
  const { data: zonesData } = useZones();
  const { data: factoriesData } = useZoneFactories(newWorker.zone_id);
  const { data: clustersData } = useFactoryClusters(newWorker.factory_id);

  const group = groupResponse?.data;
  const members = membersResponse?.data || [];

  const existingMemberUserIds = new Set(members.map((m) => m.farm_worker?.id));
  const availableUsers =
    workersData?.data
      ?.filter((w) => !existingMemberUserIds.has(w.id))
      .map((w) => ({
        value: w.id,
        label: w.name,
        description: w.phone,
      })) || [];

  const handleAddMembers = () => {
    if (selectedMemberIds.length === 0) return;
    addMembers.mutate(
      { workGroupId: id, data: { members: selectedMemberIds } },
      { onSuccess: () => setSelectedMemberIds([]) },
    );
  };

  const handleCreateWorker = () => {
    if (
      !newWorker.name ||
      !newWorker.phone ||
      !newWorker.pin ||
      !newWorker.zone_id ||
      !newWorker.factory_id ||
      !newWorker.cluster_id
    )
      return;
    createWorker.mutate(
      {
        name: newWorker.name,
        phone: newWorker.phone,
        pin: newWorker.pin,
        zone_id: newWorker.zone_id,
        factory_id: newWorker.factory_id,
        cluster_id: newWorker.cluster_id,
      },
      {
        onSuccess: (response) => {
          const newWorkerId = response.data.id;
          addMembers.mutate(
            { workGroupId: id, data: { members: [newWorkerId] } },
            {
              onSuccess: () => {
                setNewWorker({
                  name: "",
                  phone: "",
                  pin: "",
                  zone_id: "",
                  factory_id: "",
                  cluster_id: "",
                });
                setShowCreateWorker(false);
              },
            },
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading work group…</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Work group not found
          </h2>
          <Link
            href="/work-groups"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MdArrowBack className="w-4 h-4" /> Back to Work Groups
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = new Date(group.created_at).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Modal>
        <div className="min-h-screen bg-gray-50">
          {/* Sticky Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  href="/work-groups"
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
                >
                  <MdArrowBack className="w-5 h-5" />
                </Link>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-gray-900 truncate">
                    {group.name}
                  </h1>
                  {group.description && (
                    <p className="text-[11px] text-gray-400 leading-none mt-0.5 truncate">
                      {group.description}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={`/work-groups/${id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0"
              >
                <MdEdit className="w-3.5 h-3.5" />
                Edit
              </Link>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            {/* Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <MdGroup className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Work Group Details
                </h2>
              </div>
              <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    Name
                  </span>
                  <div className="flex items-center gap-1.5">
                    <MdGroup className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm font-medium text-gray-800">
                      {group.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    Owner
                  </span>
                  <div className="flex items-center gap-1.5">
                    <MdPerson className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm font-medium text-gray-800">
                      {group.owner?.name || "—"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                      group.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {group.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    Created
                  </span>
                  <div className="flex items-center gap-1.5">
                    <MdCalendarToday className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm font-medium text-gray-800">
                      {createdDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MdPerson className="w-4 h-4 text-primary" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Members
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                    {members.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMemberIds([]);
                      setWorkerSearch("");
                      setShowAddExisting(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
                  >
                    <MdAdd className="w-3.5 h-3.5" />
                    Existing Worker
                  </button>
                  <button
                    onClick={() => setShowCreateWorker(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <MdPersonAdd className="w-3.5 h-3.5" />
                    New Worker
                  </button>
                </div>
              </div>

              {/* Members List */}
              {membersLoading && (
                <div className="flex justify-center items-center py-10">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              {!membersLoading && members.length === 0 && (
                <div className="py-10 text-center">
                  <MdPerson className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    No members yet. Add workers above.
                  </p>
                </div>
              )}

              {members.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Added
                        </th>
                        <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3.5">
                            <span className="text-sm font-medium text-gray-900">
                              {member.farm_worker?.name || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="text-sm text-gray-500">
                              {member.farm_worker?.phone || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                member.active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {member.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="text-sm text-gray-500">
                              {new Date(member.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <Modal.Open opens="delete-member">
                              <button
                                onClick={() => setSelectedMember(member)}
                                className="inline-flex items-center justify-center p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                              >
                                <FiTrash className="h-3.5 w-3.5" />
                              </button>
                            </Modal.Open>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <Modal.Window name="delete-member">
          {selectedMember ? (
            <DeleteConfirmationModal
              itemName={selectedMember.farm_worker?.name || "this member"}
              itemType="Member"
              onConfirm={() =>
                deleteMember.mutateAsync({
                  workGroupId: id,
                  memberId: selectedMember.id,
                })
              }
              isDeleting={deleteMember.isPending}
            />
          ) : (
            <div />
          )}
        </Modal.Window>
      </Modal>

      {/* Add Existing Worker Modal */}
      {showAddExisting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MdPersonAdd className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-gray-900">
                  Add Existing Worker
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowAddExisting(false);
                  setWorkerSearch("");
                }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 space-y-3 overflow-y-auto flex-1">
              {/* Search */}
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or phone…"
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Results */}
              {workerSearch.trim() && (
                <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-50">
                  {workersLoading && (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                  {!workersLoading && availableUsers.length === 0 && (
                    <div className="py-6 text-center space-y-3">
                      <p className="text-sm text-gray-400">No worker found</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddExisting(false);
                          setWorkerSearch("");
                          setShowCreateWorker(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <MdPersonAdd className="w-3.5 h-3.5" />
                        Create New Worker
                      </button>
                    </div>
                  )}
                  {availableUsers.map((w) => (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => {
                        addMembers.mutate(
                          { workGroupId: id, data: { members: [w.value] } },
                          {
                            onSuccess: () => {
                              setShowAddExisting(false);
                              setWorkerSearch("");
                            },
                          },
                        );
                      }}
                      disabled={addMembers.isPending}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {w.label}
                        </p>
                        {w.description && (
                          <p className="text-xs text-gray-400">
                            {w.description}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                        <MdAdd className="w-3 h-3" />
                        Add
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAddExisting(false);
                  setWorkerSearch("");
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Worker Modal */}
      {showCreateWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdPersonAdd className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-gray-900">
                  Add New Worker
                </h2>
              </div>
              <button
                onClick={() => setShowCreateWorker(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                placeholder="e.g. Jane Muthoni"
                value={newWorker.name}
                onChange={(e) =>
                  setNewWorker((s) => ({ ...s, name: e.target.value }))
                }
                required
              />
              <InputField
                label="Phone"
                placeholder="e.g. 0712345678"
                value={newWorker.phone}
                onChange={(e) =>
                  setNewWorker((s) => ({ ...s, phone: e.target.value }))
                }
                required
              />
              <InputField
                label="PIN"
                type="password"
                placeholder="4-digit PIN"
                value={newWorker.pin}
                onChange={(e) =>
                  setNewWorker((s) => ({ ...s, pin: e.target.value }))
                }
                required
              />
              <SearchableSelect
                label="Zone"
                options={(zonesData ?? []).map(
                  (z: { id: string; name: string }) => ({
                    value: z.id,
                    label: z.name,
                  }),
                )}
                value={newWorker.zone_id}
                onChange={(val) =>
                  setNewWorker((s) => ({
                    ...s,
                    zone_id: val,
                    factory_id: "",
                    cluster_id: "",
                  }))
                }
                placeholder="Select zone"
                required
              />
              {newWorker.zone_id && (
                <SearchableSelect
                  label="Factory"
                  options={(factoriesData?.data ?? []).map(
                    (f: { id: string; name: string }) => ({
                      value: f.id,
                      label: f.name,
                    }),
                  )}
                  value={newWorker.factory_id}
                  onChange={(val) =>
                    setNewWorker((s) => ({
                      ...s,
                      factory_id: val,
                      cluster_id: "",
                    }))
                  }
                  placeholder="Select factory"
                  required
                />
              )}
              {newWorker.factory_id && (
                <SearchableSelect
                  label="Cluster"
                  options={(clustersData?.data ?? []).map(
                    (c: { id: string; name: string }) => ({
                      value: c.id,
                      label: c.name,
                    }),
                  )}
                  value={newWorker.cluster_id}
                  onChange={(val) =>
                    setNewWorker((s) => ({ ...s, cluster_id: val }))
                  }
                  placeholder="Select cluster"
                  required
                />
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateWorker(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateWorker}
                disabled={
                  createWorker.isPending ||
                  addMembers.isPending ||
                  !newWorker.name ||
                  !newWorker.phone ||
                  !newWorker.pin ||
                  !newWorker.zone_id ||
                  !newWorker.factory_id ||
                  !newWorker.cluster_id
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <MdPersonAdd className="w-3.5 h-3.5" />
                {createWorker.isPending
                  ? "Creating…"
                  : addMembers.isPending
                    ? "Adding to group…"
                    : "Create & Add to Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
