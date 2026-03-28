"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdPriceChange,
  MdCalendarToday,
  MdNotifications,
  MdNotificationsOff,
  MdPerson,
  MdTrendingUp,
  MdTrendingDown,
  MdInventory,
  MdAdd,
  MdSend,
  MdCheck,
  MdClose,
} from "react-icons/md";
import {
  usePriceReview,
  useDeletePriceReview,
  useRequestApprovalPriceReview,
  useApprovePriceReview,
  useRejectPriceReview,
} from "@/hooks/usePriceReview";
import { useAuth } from "@/hooks/useAuth";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/common/TabBar";

interface PriceReviewDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PriceReviewDetailPage({
  params,
}: PriceReviewDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("price-changes");

  const { user } = useAuth();
  const { data: review, isLoading, error } = usePriceReview(id);
  const deleteMutation = useDeletePriceReview();
  const requestApprovalMutation = useRequestApprovalPriceReview();
  const approveMutation = useApprovePriceReview();
  const rejectMutation = useRejectPriceReview();

  // Role-based visibility
  const isSuperAdmin = user?.role === "super-admin";
  const isBusinessManager = user?.role === "business-manager";

  // Show request approval button: super admin + has products + approval not yet requested
  const canRequestApproval =
    isSuperAdmin &&
    review?.price_lists &&
    review.price_lists.length > 0 &&
    !review?.approval_requested_at;

  // Show approve/reject buttons: business manager + approval requested + not yet approved
  const canApproveReject =
    isBusinessManager && review?.approval_requested_at && !review?.approved_at;

  const handleRequestApproval = () => {
    requestApprovalMutation.mutate(id);
  };

  const handleApprove = () => {
    approveMutation.mutate(id);
  };

  const handleReject = () => {
    rejectMutation.mutate(id);
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push("/price-reviews");
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPriceChange = (oldPrice: string, newPrice: string) => {
    const old = parseFloat(oldPrice);
    const current = parseFloat(newPrice);
    const change = ((current - old) / old) * 100;
    return change;
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Failed to load price review details</p>
      </div>
    );
  }

  // Group purchase volumes by product
  const purchaseVolumesByProduct = review.purchase_volumes?.reduce(
    (acc, pv) => {
      const productId = pv.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          product: pv.product,
          volumes: [],
        };
      }
      acc[productId].volumes.push(pv);
      return acc;
    },
    {} as Record<
      string,
      {
        product: { id: string; name: string; sku: string };
        volumes: typeof review.purchase_volumes;
      }
    >,
  );

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 md:mb-6 shrink-0">
          <div className="flex items-start gap-3">
            <Link
              href="/price-reviews"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <MdPriceChange className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {review.title}
                  </h1>
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      review.approved_at
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : review.approval_requested_at
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {review.approved_at
                      ? "Approved"
                      : review.approval_requested_at
                        ? "Pending Approval"
                        : "Draft"}
                  </span>
                  {review.meta?.percentage !== undefined &&
                    review.meta.percentage !== 0 && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          review.meta.percentage > 0
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {review.meta.percentage > 0 ? (
                          <MdTrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <MdTrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {review.meta.percentage > 0 ? "+" : ""}
                        {review.meta.percentage}%
                      </span>
                    )}
                </div>
                {review.description && (
                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2 md:line-clamp-1">
                    {review.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 ml-13 md:ml-0">
            {/* Request Approval - Super Admin only when products exist and status is draft */}
            {canRequestApproval && (
              <button
                onClick={handleRequestApproval}
                disabled={requestApprovalMutation.isPending}
                className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdSend className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {requestApprovalMutation.isPending
                    ? "Requesting..."
                    : "Request Approval"}
                </span>
              </button>
            )}

            {/* Approve/Reject - Business Manager only when status is pending */}
            {canApproveReject && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={
                    approveMutation.isPending || rejectMutation.isPending
                  }
                  className="px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </span>
                </button>
                <button
                  onClick={handleReject}
                  disabled={
                    approveMutation.isPending || rejectMutation.isPending
                  }
                  className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdClose className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                  </span>
                </button>
              </>
            )}

            <Link
              href={`/price-reviews/${id}/add-products`}
              className="px-3 md:px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium text-sm inline-flex items-center gap-2"
            >
              <MdAdd className="w-4 h-4" />
              <span className="hidden sm:inline">Add Products</span>
            </Link>
            <Link
              href={`/price-reviews/${id}/edit`}
              className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm inline-flex items-center gap-2"
            >
              <MdEdit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
            <Modal>
              <Modal.Open opens="delete-review">
                <button className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm inline-flex items-center gap-2">
                  <MdDelete className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </Modal.Open>
              <Modal.Window name="delete-review">
                <DeleteConfirmationModal
                  itemName={review.title}
                  itemType="Price Review"
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
              <MdCalendarToday className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Effective Date</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {formatDate(review.effective_date)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdInventory className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Products</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {review.price_lists?.length || 0} items
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <MdPerson className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Reviewer</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {review.reviewer?.name || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              {review.send_notification ? (
                <MdNotifications className="w-4 h-4 text-amber-600" />
              ) : (
                <MdNotificationsOff className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Notifications</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {review.send_notification ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Review Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Reason
                </h3>
                <p className="text-sm text-gray-600">
                  {review.meta?.reason || "No reason specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Approver
                </h3>
                <p className="text-sm text-gray-600">
                  {review.approver?.name || "Pending approval"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Created
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(review.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs for Price Changes and Volume Pricing */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger
                value="price-changes"
                icon={<MdPriceChange className="w-4 h-4" />}
              >
                Price Changes ({review.price_lists?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="volume-pricing"
                icon={<MdInventory className="w-4 h-4" />}
              >
                Volume Pricing ({review.purchase_volumes?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Price Changes Tab */}
            <TabsContent value="price-changes">
              {review.price_lists && review.price_lists.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Product
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            SKU
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Old Price
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            New Price
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {review.price_lists.map((item) => {
                          const change = getPriceChange(
                            item.old_price,
                            item.new_price,
                          );
                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {item.product?.name || "Unknown Product"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {item.product?.sku || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                {formatCurrency(item.old_price)}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                {formatCurrency(item.new_price)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    change > 0
                                      ? "bg-emerald-100 text-emerald-800"
                                      : change < 0
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {change > 0 ? (
                                    <MdTrendingUp className="w-3 h-3 mr-1" />
                                  ) : change < 0 ? (
                                    <MdTrendingDown className="w-3 h-3 mr-1" />
                                  ) : null}
                                  {change > 0 ? "+" : ""}
                                  {change.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <MdPriceChange className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No price changes in this review
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Volume Pricing Tab */}
            <TabsContent value="volume-pricing">
              {review.purchase_volumes && review.purchase_volumes.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {Object.values(purchaseVolumesByProduct || {}).map(
                      ({ product, volumes }) => (
                        <div key={product.id} className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              {product.name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              ({product.sku})
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {volumes
                              .sort(
                                (a, b) =>
                                  parseFloat(a.min_quantity) -
                                  parseFloat(b.min_quantity),
                              )
                              .map((vol) => (
                                <div
                                  key={vol.id}
                                  className="bg-gray-50 rounded-lg p-3"
                                >
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                    {vol.name}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(vol.price)}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Qty:{" "}
                                    {parseFloat(vol.min_quantity).toFixed(0)}
                                    {vol.max_quantity
                                      ? ` - ${parseFloat(vol.max_quantity).toFixed(0)}`
                                      : "+"}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <MdInventory className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No volume pricing tiers in this review
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Timestamps */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Created: {formatDate(review.created_at)}</span>
              <span>Updated: {formatDate(review.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
