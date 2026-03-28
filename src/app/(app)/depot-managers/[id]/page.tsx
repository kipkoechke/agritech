"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdBusiness,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdBadge,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import {
  useDepotManager,
  useDeleteDepotManager,
} from "@/hooks/useDepotManager";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

interface DepotManagerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DepotManagerDetailPage({
  params,
}: DepotManagerDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: manager, isLoading, error } = useDepotManager(id);
  const deleteMutation = useDeleteDepotManager();

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push("/depot-managers");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !manager) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Failed to load depot manager details</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/depot-managers"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <MdBusiness className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                    {manager.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      manager.status === "active"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {manager.status === "active" ? (
                      <MdCheckCircle className="w-3 h-3" />
                    ) : (
                      <MdCancel className="w-3 h-3" />
                    )}
                    {manager.status}
                  </span>
                </div>
                {manager.employee_number && (
                  <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                    Employee #{manager.employee_number}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/depot-managers/${id}/edit`}
              className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm inline-flex items-center gap-2"
            >
              <MdEdit className="w-4 h-4" />
              <span className="hidden md:inline">Edit</span>
            </Link>
            <Modal>
              <Modal.Open opens="delete-manager">
                <button className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm inline-flex items-center gap-2">
                  <MdDelete className="w-4 h-4" />
                  <span className="hidden md:inline">Delete</span>
                </button>
              </Modal.Open>
              <Modal.Window name="delete-manager">
                <DeleteConfirmationModal
                  itemName={manager.name}
                  itemType="Depot Manager"
                  onConfirm={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              </Modal.Window>
            </Modal>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdBadge className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Employee #</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {manager.employee_number || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdLocationOn className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Zone</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {manager.zone?.name || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <MdEmail className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {manager.email || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdPhone className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {manager.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {manager.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <MdEmail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{manager.email}</span>
                    </div>
                  )}
                  {manager.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <MdPhone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{manager.phone}</span>
                    </div>
                  )}
                  {!manager.email && !manager.phone && (
                    <p className="text-sm text-gray-400">
                      No contact information available
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Address
                </h3>
                <div className="space-y-2">
                  {manager.address ? (
                    <>
                      {manager.address.street && (
                        <div className="flex items-start gap-2 text-sm">
                          <MdLocationOn className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="text-gray-600">
                            {manager.address.street}
                          </span>
                        </div>
                      )}
                      {manager.address.city && (
                        <p className="text-sm text-gray-600 ml-6">
                          {manager.address.city}
                          {manager.address.postal_code &&
                            `, ${manager.address.postal_code}`}
                        </p>
                      )}
                      {manager.address.country && (
                        <p className="text-sm text-gray-600 ml-6">
                          {manager.address.country}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No address information available
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4"></div>

            {/* Alternate Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {manager.contacts && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Alternate Contacts
                  </h3>
                  <div className="space-y-2">
                    {manager.contacts.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <MdPhone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {manager.contacts.phone}
                        </span>
                      </div>
                    )}
                    {manager.contacts.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <MdEmail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {manager.contacts.email}
                        </span>
                      </div>
                    )}
                    {manager.contacts.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MdLocationOn className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {manager.contacts.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Zone Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Zone Assignment
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    {manager.zone?.name || "No zone assigned"}
                  </p>
                  {manager.zone?.code && (
                    <p className="text-xs text-gray-500">
                      Code: {manager.zone.code}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Created:{" "}
                  {new Date(manager.created_at).toLocaleDateString("en-GB")}
                </span>
                <span>
                  Updated:{" "}
                  {new Date(manager.updated_at).toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
