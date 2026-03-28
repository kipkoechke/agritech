"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  MdArrowBack,
  MdCheckCircle,
  MdCancel,
  MdLocalShipping,
  MdInventory,
} from "react-icons/md";

import { useStockTransfer, useCompleteStockTransfer, useCancelStockTransfer } from "@/hooks/useStockTransfer";
import { useCanManageStock, useUserZone } from "@/hooks/useAuth";
import PageHeader from "@/components/common/PageHeader";
import toast from "react-hot-toast";
import type { StockTransferItem } from "@/types/stockTransfer";

export default function StockTransferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [receivedQuantity, setReceivedQuantity] = useState<number>(0);
  const [completionNotes, setCompletionNotes] = useState("");

  const canManageStock = useCanManageStock();
  const userZone = useUserZone();
  const { data: transferResponse, isLoading, error, refetch } = useStockTransfer(id);
  const transfer: StockTransferItem | undefined = transferResponse?.data;

  // Check if user can manage stock (create, edit, delete) vs just view
  const canManageStockActions = useCanManageStock();

  // Check if current user can complete the transfer (must be from destination zone)
  const canComplete = canManageStockActions && transfer && userZone?.id === transfer.to_zone_id && transfer.status === "pending";

  // Check if current user can cancel the transfer (must be from source zone)
  const canCancel = canManageStockActions && transfer && userZone?.id === transfer.from_zone_id && transfer.status === "pending";

  // Mutations
  const completeMutation = useCompleteStockTransfer();
  const cancelMutation = useCancelStockTransfer();

  const handleComplete = () => {
    if (!transfer) return;
    setReceivedQuantity(transfer.quantity);
    setCompletionNotes("");
    setShowCompleteModal(true);
  };

  const confirmComplete = () => {
    if (!transfer) return;

    completeMutation.mutate({
      transferId: transfer.id,
      received_quantity: receivedQuantity,
      notes: completionNotes.trim() || undefined,
    }, {
      onSuccess: async () => {
        setShowCompleteModal(false);
        setReceivedQuantity(0);
        setCompletionNotes("");
        // Force immediate refetch to update UI
        await refetch();
      },
      onError: (error: any) => {
        // Handle API error messages
        if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach((errorMsg: string) => {
            toast.error(errorMsg);
          });
        } else if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to complete transfer");
        }
      },
    });
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (!transfer) return;

    cancelMutation.mutate(transfer.id, {
      onSuccess: async () => {
        setShowCancelModal(false);
        // Force immediate refetch to update UI
        await refetch();
      },
      onError: (error: any) => {
        // Handle API error messages
        if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach((errorMsg: string) => {
            toast.error(errorMsg);
          });
        } else if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to cancel transfer");
        }
      },
    });
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transfer details...</p>
        </div>
      </div>
    );
  }

  if (error || !transfer || !transfer.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Transfer Not Found</h2>
          <p className="text-gray-600 mb-4">The requested stock transfer could not be found.</p>
          <Link
            href="/depot/stock/transfers"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <MdArrowBack className="mr-2 w-4 h-4" />
            Back to Transfers
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Stock Transfer #${transfer.reference_number || transfer.id.slice(-8).toUpperCase()}`}
        description="View and manage stock transfer details"
      />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {/* Header with Status and Actions */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <div className="flex items-center gap-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(transfer.status)}`}>
                  {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Created {new Date(transfer.created_at).toLocaleDateString()}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  transfer.direction === 'incoming' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {transfer.direction === 'incoming' ? 'Incoming' : 'Outgoing'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {canComplete && (
                  <button
                    onClick={handleComplete}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    <MdCheckCircle className="mr-1 w-4 h-4" />
                    Complete Transfer
                  </button>
                )}

                {canCancel && (
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    <MdCancel className="mr-1 w-4 h-4" />
                    Cancel Transfer
                  </button>
                )}

                {!canComplete && !canCancel && transfer.status === "pending" && (
                  <div className="text-sm text-gray-500 italic">
                    {transfer.direction === 'incoming'
                      ? "Waiting for you to receive the transfer"
                      : "Transfer sent - waiting for destination to receive"}
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MdInventory className="mr-2 w-5 h-5" />
                  Transfer Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Product</label>
                    <div className="text-base text-gray-900">{transfer.product.name}</div>
                    <div className="text-sm text-gray-500">SKU: {transfer.product.sku}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Quantity Transferred</label>
                      <div className="text-base text-gray-900">
                        {transfer.quantity} {transfer.product.unit_of_measure || 'units'}
                      </div>
                    </div>

                    {transfer.received_quantity !== null && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Quantity Received</label>
                        <div className="text-base text-gray-900">
                          {transfer.received_quantity} {transfer.product.unit_of_measure || 'units'}
                        </div>
                        {transfer.received_quantity !== transfer.quantity && (
                          <div className="text-sm text-orange-600">
                            Discrepancy: {transfer.quantity - transfer.received_quantity} units
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">From Zone</label>
                      <div className="text-base text-gray-900">{transfer.from_zone.name}</div>
                      <div className="text-sm text-gray-500">Code: {transfer.from_zone.code}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">To Zone</label>
                      <div className="text-base text-gray-900">{transfer.to_zone.name}</div>
                      <div className="text-sm text-gray-500">Code: {transfer.to_zone.code}</div>
                    </div>
                  </div>

                  {transfer.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                      <div className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {transfer.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Timeline */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MdLocalShipping className="mr-2 w-5 h-5" />
                  Status & Timeline
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created By</label>
                    <div className="text-base text-gray-900">{transfer.created_by.name}</div>
                    <div className="text-sm text-gray-500">{transfer.created_by.email}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Transfer Date</label>
                    <div className="text-base text-gray-900">
                      {new Date(transfer.created_at).toLocaleString()}
                    </div>
                  </div>

                  {transfer.received_by && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Received By</label>
                      <div className="text-base text-gray-900">{transfer.received_by.name}</div>
                      <div className="text-sm text-gray-500">{transfer.received_by.email}</div>
                    </div>
                  )}

                  {transfer.received_date && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Received Date</label>
                      <div className="text-base text-gray-900">
                        {new Date(transfer.received_date).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {transfer.reference_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Reference Number</label>
                      <div className="text-base text-gray-900 font-mono">
                        {transfer.reference_number}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Batch Information */}
            {transfer.batches && transfer.batches.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Batch Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transfer.batches.map((batch, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {batch.batch_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {batch.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-start pt-6 border-t mt-6">
              <Link
                href="/depot/stock/requests"
                className="inline-flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <MdArrowBack className="mr-2 w-4 h-4" />
                Back to Requests
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Transfer Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Complete Stock Transfer
            </h3>
            <div className="text-sm text-gray-600 mb-4">
              <p className="mb-2">
                Complete transfer for {transfer.quantity} units of {transfer.product.name}
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>From:</span>
                  <span className="font-medium">{transfer.from_zone.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>To:</span>
                  <span className="font-medium">{transfer.to_zone.name}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received Quantity *
              </label>
              <input
                type="number"
                value={receivedQuantity}
                onChange={(e) => setReceivedQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                min={0}
                max={transfer.quantity}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {transfer.quantity} units
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes {receivedQuantity !== transfer.quantity ? "*" : "(Optional)"}
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder={
                  receivedQuantity !== transfer.quantity
                    ? "Please explain the discrepancy (required for partial receipts)"
                    : "Add any notes about the transfer completion..."
                }
                required={receivedQuantity !== transfer.quantity}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmComplete}
                disabled={
                  completeMutation.isPending ||
                  receivedQuantity <= 0 ||
                  (receivedQuantity !== transfer.quantity && !completionNotes.trim())
                }
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
              >
                {completeMutation.isPending ? "Completing..." : "Complete Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Transfer Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cancel Stock Transfer
            </h3>
            <div className="text-sm text-gray-600 mb-6">
              <p className="mb-2">
                Are you sure you want to cancel this stock transfer?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>Product:</span>
                  <span className="font-medium">{transfer.product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-medium">{transfer.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span>From:</span>
                  <span className="font-medium">{transfer.from_zone.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>To:</span>
                  <span className="font-medium">{transfer.to_zone.name}</span>
                </div>
              </div>
              <p className="text-red-600 text-sm mt-2 font-medium">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Keep Transfer
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
