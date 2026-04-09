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
} from "react-icons/md";
import { FiTrash } from "react-icons/fi";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  useWorkGroup,
  useWorkGroupMembers,
  useAddWorkGroupMembers,
  useDeleteWorkGroupMember,
} from "@/hooks/useWorkGroup";
import { useHrisUsers } from "@/hooks/useHrisUser";
import type { WorkGroupMember } from "@/types/workGroup";

export default function WorkGroupDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: groupResponse, isLoading } = useWorkGroup(id);
  const { data: membersResponse, isLoading: membersLoading } =
    useWorkGroupMembers(id);
  const addMembers = useAddWorkGroupMembers();
  const deleteMember = useDeleteWorkGroupMember();
  const { data: usersData, isLoading: usersLoading } = useHrisUsers({});

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<WorkGroupMember | null>(
    null,
  );

  const group = groupResponse?.data;
  const members = membersResponse?.data || [];

  const existingMemberUserIds = new Set(
    members.map((m) => m.user?.id || m.user_id),
  );
  const availableUsers =
    usersData?.data
      ?.filter((u) => !existingMemberUserIds.has(u.id))
      .map((u) => ({
        value: u.id,
        label: u.name,
        description: u.phone,
      })) || [];

  const handleAddMembers = () => {
    if (selectedMemberIds.length === 0) return;
    addMembers.mutate(
      { workGroupId: id, data: { members: selectedMemberIds } },
      { onSuccess: () => setSelectedMemberIds([]) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Work group not found
        </div>
      </div>
    );
  }

  return (
    <Modal>
      <div className="min-h-screen p-4">
        <div className="mb-4">
          <Link
            href="/work-groups"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MdArrowBack className="w-5 h-5" />
            Back to Work Groups
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdGroup className="w-6 h-6 text-emerald-600" />
                  {group.name}
                </h1>
                <p className="text-gray-500 mt-1">
                  {group.description || "No description"}
                </p>
              </div>
              <Button type="small" to={`/work-groups/${id}/edit`}>
                Edit
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <MdPerson className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Owner</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {group.owner?.name || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MdGroup className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      group.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {group.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MdCalendarToday className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {new Date(group.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MdPerson className="w-5 h-5 text-gray-500" />
              Members ({members.length})
            </h2>
          </div>

          {/* Add Members */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <SearchableSelect
                  label="Add Members"
                  options={availableUsers}
                  value={selectedMemberIds[0] || ""}
                  onChange={(val) => {
                    if (val && !selectedMemberIds.includes(val)) {
                      setSelectedMemberIds((prev) => [...prev, val]);
                    }
                  }}
                  placeholder="Select users to add"
                  isLoading={usersLoading}
                />
                {selectedMemberIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedMemberIds.map((uid) => {
                      const user = usersData?.data?.find((u) => u.id === uid);
                      return (
                        <span
                          key={uid}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs"
                        >
                          {user?.name || uid}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMemberIds((prev) =>
                                prev.filter((id) => id !== uid),
                              )
                            }
                            className="hover:text-emerald-600"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={handleAddMembers}
                disabled={
                  selectedMemberIds.length === 0 || addMembers.isPending
                }
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                <MdAdd className="w-4 h-4" />
                {addMembers.isPending ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {/* Members Table */}
          {membersLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
            </div>
          )}

          {!membersLoading && members.length === 0 && (
            <div className="p-8 text-center">
              <MdPerson className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No members in this work group yet</p>
            </div>
          )}

          {members.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.user?.name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {member.user?.phone || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 capitalize">
                          {member.user?.role || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(member.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Modal.Open opens="delete-member">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FiTrash className="h-4 w-4" />
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

      <Modal.Window name="delete-member">
        {selectedMember ? (
          <DeleteConfirmationModal
            itemName={selectedMember.user?.name || "this member"}
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
  );
}
