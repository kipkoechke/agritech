"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdCancel,
  MdCallReceived,
} from "react-icons/md";

import {
  useStockRequest,
  useDeleteStockRequest,
  useApproveStockRequest,
  useRejectStockRequest,
  useFulfillStockRequest,
} from "@/hooks/useStockRequest";
import { useCanManageStock, useUserZone } from "@/hooks/useAuth";
import PageHeader from "@/components/common/PageHeader";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { STOCK_REQUEST_STATUS_CONFIG } from "@/types/stockRequest";
import { useState } from "react";
import toast from "react-hot-toast";

export default function StockRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const userZone = useUserZone();
  const { data: request, isLoading, error } = useStockRequest(id);

  // Check if user can manage stock (create, edit, delete) vs just view
  const canManageStockActions = useCanManageStock();

  // Check if current user can approve/reject (must be from the source zone)
  const canApproveReject = userZone?.id === (request?.from_zone_id || request?.fromZone?.id);

  // Check if current user can edit/delete (must be the requester and request must be pending)
  const canEditDelete = request?.status === "pending" &&
    userZone?.id === (request?.to_zone_id || request?.toZone?.id);

  // Mutations
  const deleteMutation = useDeleteStockRequest();
  const approveMutation = useApproveStockRequest();
  const rejectMutation = useRejectStockRequest();
  const fulfillMutation = useFulfillStockRequest();

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push("/depot/stock/requests");
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
          toast.error("Failed to delete request");
        }
      },
    });
  };

  const handleApprove = () => {
    setApprovalNotes("");
    setShowApproveModal(true);
  };

  const confirmApprove = () => {
    approveMutation.mutate({
      id,
      payload: { notes: approvalNotes.trim() || undefined },
    }, {
      onSuccess: () => {
        setShowApproveModal(false);
        setApprovalNotes("");
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
          toast.error("Failed to approve request");
        }
      },
    });
  };

  const handleReject = () => {
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    rejectMutation.mutate({
      id,
      payload: { reason: rejectionReason.trim() },
    }, {
      onSuccess: () => {
        setShowRejectModal(false);
        setRejectionReason("");
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
          toast.error("Failed to reject request");
        }
      },
    });
  };

  const handleFulfill = () => {
    fulfillMutation.mutate(id, {
      onError: (error: any) => {
        // Handle API error messages
        if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach((errorMsg: string) => {
            toast.error(errorMsg);
          });
        } else if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to fulfill request");
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Request Not Found</h2>
          <p className="text-gray-600 mb-4">The requested stock request could not be found.</p>
          <Link
            href="/depot/stock/requests"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <MdArrowBack className="mr-2 w-4 h-4" />
            Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  // Calculate products data once
  const products = request.products || (request.product ? [{
    id: request.id,
    product_id: request.product_id,
    quantity: request.quantity,
    product: request.product,
    batches: request.batches || []
  }] : []);

  const totalQuantity = request.total_quantity || products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const hasAnyBatches = products.some(p => p.batches && p.batches.length > 0);
  const isMultipleProducts = request.has_multiple_products || products.length > 1;

  const statusConfig = STOCK_REQUEST_STATUS_CONFIG[request.status];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Stock Request #${request.id.slice(-8).toUpperCase()}`}
        description="View and manage stock request details"
      />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {/* Header with Status and Actions */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <div className="flex items-center gap-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                <span className="text-sm text-gray-500">
                  Created {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {canManageStockActions && (
                  <>
                    {request.status === "pending" && canApproveReject && (
                      <>
                        <button
                          onClick={handleApprove}
                          className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          <MdCheckCircle className="mr-1 w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={handleReject}
                          className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          <MdCancel className="mr-1 w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {request.status === "approved" && canApproveReject && (
                      <button
                        onClick={handleFulfill}
                        disabled={fulfillMutation.isPending}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        <MdCallReceived className="mr-1 w-4 h-4" />
                        {fulfillMutation.isPending ? "Fulfilling..." : "Fulfill"}
                      </button>
                    )}

                    {canEditDelete && (
                      <>
                        <Link
                          href={`/depot/stock/requests/${request.id}/edit`}
                          className="inline-flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <MdEdit className="mr-1 w-4 h-4" />
                          Edit
                        </Link>
                        <button
                          onClick={handleDelete}
                          className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          <MdDelete className="mr-1 w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}

                    {/* Show message if user cannot perform actions */}
                    {request.status === "pending" && !canApproveReject && !canEditDelete && (
                      <div className="text-sm text-gray-500 italic">
                        {userZone?.id === (request?.to_zone_id || request?.toZone?.id)
                          ? "Waiting for approval from source zone"
                          : "You cannot approve requests from other zones"}
                      </div>
                    )}
                  </>
                )}

                {!canManageStockActions && (
                  <div className="text-sm text-gray-500 italic">
                    View only - No actions available
                  </div>
                )}
              </div>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Request Information</h3>

                <div className="space-y-4">
                  {/* Products Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Products</label>
                    {isMultipleProducts ? (
                      <div className="space-y-3">
                        <div className="text-base text-gray-900">Multiple Products ({products.length} items)</div>
                        <div className="text-sm text-gray-700 font-medium">Total Quantity: {totalQuantity}</div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          {products.map((product, index) => (
                            <div key={product.id || index} className="flex justify-between items-center py-1">
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {product.product?.name || "Unknown Product"}
                                </span>
                                {product.product?.sku && (
                                  <span className="text-xs text-gray-500 ml-2">({product.product.sku})</span>
                                )}
                              </div>
                              <span className="text-sm text-gray-700">
                                {product.quantity} {product.product?.unit_of_measure || ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-base text-gray-900">{products[0]?.product?.name || request.product?.name}</div>
                        <div className="text-sm text-gray-500">
                          SKU: {products[0]?.product?.sku || request.product?.sku}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Quantity: {products[0]?.quantity || request.quantity}
                          {(products[0]?.product?.unit_of_measure || request.product?.unit_of_measure) &&
                            ` ${products[0]?.product?.unit_of_measure || request.product?.unit_of_measure}`}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">From Zone</label>
                      <div className="text-base text-gray-900">{request.from_zone?.name || request.fromZone?.name || "Unknown Zone"}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">To Zone</label>
                      <div className="text-base text-gray-900">{request.to_zone?.name || request.toZone?.name || "Unknown Zone"}</div>
                    </div>
                  </div>

                  {request.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                      <div className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {request.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Timeline */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Status & Timeline</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Requested By</label>
                    <div className="text-base text-gray-900">
                      {typeof request.requested_by === 'object' && request.requested_by?.name
                        ? request.requested_by.name
                        : request.requestedBy?.name || "Unknown User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {typeof request.requested_by === 'object' && request.requested_by?.email
                        ? request.requested_by.email
                        : request.requestedBy?.email || ""}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Request Date</label>
                    <div className="text-base text-gray-900">
                      {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>

                  {(request.approved_by || request.approvedBy) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Approved By</label>
                      <div className="text-base text-gray-900">
                        {typeof request.approved_by === 'object' && request.approved_by?.name
                          ? request.approved_by.name
                          : request.approvedBy?.name || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {typeof request.approved_by === 'object' && request.approved_by?.email
                          ? request.approved_by.email
                          : request.approvedBy?.email || ""}
                      </div>
                    </div>
                  )}

                  {(request.stock_transfer || request.stockTransfer) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Stock Transfer</label>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (request.stock_transfer?.status || request.stockTransfer?.status) === 'completed' ? 'bg-green-100 text-green-800' :
                          (request.stock_transfer?.status || request.stockTransfer?.status) === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.stock_transfer?.status || request.stockTransfer?.status}
                        </span>
                        <Link
                          href={`/depot/stock/transfers/${request.stock_transfer?.id || request.stockTransfer?.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View Transfer
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Batch Information */}
            {hasAnyBatches && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Batch Details</h3>

                {products.map((product, productIndex) => {
                  if (!product.batches || product.batches.length === 0) return null;

                  return (
                    <div key={product.id || productIndex} className="mb-6">
                      {isMultipleProducts && (
                        <h4 className="text-md font-medium text-gray-800 mb-3">
                          {product.product?.name || "Product"} - Batches
                        </h4>
                      )}

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
                            {product.batches.map((batch, batchIndex) => (
                              <tr key={batchIndex}>
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
                  );
                })}
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          itemName={
            isMultipleProducts
              ? `request containing ${products.length} products`
              : products.length === 1
              ? `request for ${products[0]?.product?.name || request.product?.name}`
              : "stock request"
          }
          itemType="stock request"
          onConfirm={confirmDelete}
          isDeleting={deleteMutation.isPending}
          onCloseModal={() => setShowDeleteModal(false)}
        />
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Approve Stock Request
            </h3>
            {isMultipleProducts ? (
              <div className="text-sm text-gray-600 mb-4">
                <p className="mb-2">Approve this stock request containing:</p>
                <div className="bg-gray-50 p-3 rounded-lg mb-2">
                  {products.map((product, index) => (
                    <div key={product.id || index} className="flex justify-between items-center py-1">
                      <span className="text-sm">{product.product?.name || "Unknown Product"}</span>
                      <span className="text-sm font-medium">{product.quantity} units</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{totalQuantity} units</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  This will approve the entire request for all {products.length} products.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                Approve this stock request for {products[0]?.quantity || totalQuantity} units of {products[0]?.product?.name || request.product?.name}?
              </p>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add any notes about this approval..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={approveMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
              >
                {approveMutation.isPending ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reject Stock Request
            </h3>
            {isMultipleProducts ? (
              <div className="text-sm text-gray-600 mb-4">
                <p className="mb-2">Reject this stock request containing:</p>
                <div className="bg-gray-50 p-3 rounded-lg mb-2">
                  {products.map((product, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="text-sm">{product.product?.name || "Unknown Product"}</span>
                      <span className="text-sm font-medium">{product.quantity} units</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{totalQuantity} units</span>
                  </div>
                </div>
                <p className="text-xs text-red-600 font-medium">
                  This will reject the entire request for all {products.length} products.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                Reject this stock request for {products[0]?.quantity || totalQuantity} units of {products[0]?.product?.name || request.product?.name}?
              </p>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Provide a reason for rejection..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
