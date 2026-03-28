"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MdArrowBack,
  MdBusiness,
  MdEmail,
  MdPhone,
  MdBadge,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import {
  useBusinessManager,
  useDeleteBusinessManager,
} from "@/hooks/useBusinessManager";
import { useState } from "react";

interface BusinessManagerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BusinessManagerDetailPage({
  params,
}: BusinessManagerDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: manager, isLoading, error } = useBusinessManager(id);
  const deleteMutation = useDeleteBusinessManager();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push("/hris/business-managers");
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
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Failed to load business manager details
          </p>
          <Link
            href="/hris/business-managers"
            className="text-accent hover:underline"
          >
            Back to Business Managers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-4 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/hris/business-managers"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
                <MdBusiness className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                  {manager.name}
                </h1>
                <p className="text-xs md:text-sm text-gray-500">
                  {manager.employee_number}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/hris/business-managers/${id}/edit`}
              className="flex items-center gap-2 px-3 md:px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              <MdEdit className="w-4 h-4" />
              <span className="hidden md:inline">Edit</span>
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
            >
              <MdDelete className="w-4 h-4" />
              <span className="hidden md:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 shrink-0">
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdBadge className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Employee No.</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {manager.employee_number}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdEmail className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {manager.email}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdPhone className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Phone</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {manager.phone}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <MdBusiness className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Role</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                Business Manager
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            {/* Personal Information */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Full Name</p>
                  <p className="text-sm text-gray-900">{manager.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Employee Number</p>
                  <p className="text-sm text-gray-900">
                    {manager.employee_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email Address</p>
                  <p className="text-sm text-gray-900">{manager.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Phone Number</p>
                  <p className="text-sm text-gray-900">{manager.phone}</p>
                </div>
              </div>
            </div>

            {/* User Account */}
            {manager.user && (
              <div className="border-t border-gray-100 pt-4 mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Linked User Account
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">User Name</p>
                    <p className="text-sm text-gray-900">{manager.user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">User Email</p>
                    <p className="text-sm text-gray-900">
                      {manager.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-6 text-xs text-gray-400">
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Business Manager
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete{" "}
              <span className="font-medium">{manager.name}</span>? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 text-sm"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
