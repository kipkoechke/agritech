"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MdAdd,
  MdPriceChange,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdNotifications,
  MdNotificationsOff,
  MdPerson,
  MdCalendarToday,
} from "react-icons/md";
import {
  usePriceReviews,
  usePrefetchPriceReviews,
  useDeletePriceReview,
} from "@/hooks/usePriceReview";
import Pagination from "@/components/common/Pagination";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

export default function PriceReviewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const perPage = 15;

  const prefetchPriceReviews = usePrefetchPriceReviews();
  const deleteMutation = useDeletePriceReview();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = usePriceReviews({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  // Prefetch next page
  useEffect(() => {
    if (data?.pagination && page < data.pagination.last_page) {
      prefetchPriceReviews({
        page: page + 1,
        per_page: perPage,
        search: debouncedSearch || undefined,
      });
    }
  }, [data, page, perPage, debouncedSearch, prefetchPriceReviews]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MdPriceChange className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                Price Reviews
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                Manage product price adjustments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search price reviews..."
              className="flex-1 md:w-auto"
            />
            <Link
              href="/price-reviews/new"
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm whitespace-nowrap"
            >
              <MdAdd className="w-5 h-5" />
              <span className="hidden md:inline">New Price Review</span>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading price reviews...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load price reviews</p>
          </div>
        )}

        {/* Price Reviews Table */}
        {data && data.data.length > 0 && (
          <Modal>
            <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
              {/* Mobile Card View */}
              <div className="md:hidden flex-1 overflow-y-auto p-3 space-y-3">
                {data.data.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/price-reviews/${review.id}`}
                          className="text-sm font-bold text-primary hover:underline block truncate"
                        >
                          {review.title}
                        </Link>
                        {review.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {review.description}
                          </p>
                        )}
                      </div>
                      <ActionMenu menuId={`review-menu-mobile-${review.id}`}>
                        <ActionMenu.Trigger>
                          <MdMoreVert className="w-5 h-5 text-gray-600" />
                        </ActionMenu.Trigger>
                        <ActionMenu.Content>
                          <ActionMenu.Item
                            onClick={() =>
                              (window.location.href = `/price-reviews/${review.id}`)
                            }
                          >
                            <MdVisibility className="w-4 h-4" />
                            View Details
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() =>
                              (window.location.href = `/price-reviews/${review.id}/edit`)
                            }
                          >
                            <MdEdit className="w-4 h-4" />
                            Edit
                          </ActionMenu.Item>
                          <Modal.Open opens={`delete-review-mobile-${review.id}`}>
                            <ActionMenu.Item className="text-red-600 hover:bg-red-50">
                              <MdDelete className="w-4 h-4" />
                              Delete
                            </ActionMenu.Item>
                          </Modal.Open>
                        </ActionMenu.Content>
                      </ActionMenu>

                      <Modal.Window name={`delete-review-mobile-${review.id}`}>
                        <DeleteConfirmationModal
                          itemName={review.title}
                          itemType="price review"
                          onConfirm={() => deleteMutation.mutate(review.id)}
                          isDeleting={deleteMutation.isPending}
                        />
                      </Modal.Window>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <MdCalendarToday className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDate(review.effective_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MdPerson className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">
                          {review.reviewer?.name || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {review.meta?.percentage !== undefined &&
                        review.meta?.percentage !== 0 ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              review.meta.percentage > 0
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {review.meta.percentage > 0 ? "+" : ""}
                            {review.meta.percentage}%
                          </span>
                        ) : null}
                        <span className="text-xs text-gray-500">
                          {review.meta?.reason || "-"}
                        </span>
                      </div>
                      {review.send_notification ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <MdNotifications className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <MdNotificationsOff className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-y-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          Effective Date
                        </div>
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Adjustment
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">Reviewer</div>
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notification
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sticky right-0 bg-gray-50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap">
                          <Link
                            href={`/price-reviews/${review.id}`}
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            {review.title}
                          </Link>
                          {review.description && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-50">
                              {review.description}
                            </p>
                          )}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {formatDate(review.effective_date)}
                          </span>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {review.meta?.reason || "-"}
                          </span>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          {review.meta?.percentage !== undefined &&
                          review.meta?.percentage !== 0 ? (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                review.meta.percentage > 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {review.meta.percentage > 0 ? "+" : ""}
                              {review.meta.percentage}%
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {review.reviewer?.name || "-"}
                          </span>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          {review.send_notification ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <MdNotifications className="w-3 h-3" />
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              <MdNotificationsOff className="w-3 h-3" />
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                          <ActionMenu menuId={`review-menu-${review.id}`}>
                            <ActionMenu.Trigger>
                              <MdMoreVert className="w-5 h-5 text-gray-600" />
                            </ActionMenu.Trigger>
                            <ActionMenu.Content>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/price-reviews/${review.id}`)
                                }
                              >
                                <MdVisibility className="w-4 h-4" />
                                View Details
                              </ActionMenu.Item>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/price-reviews/${review.id}/edit`)
                                }
                              >
                                <MdEdit className="w-4 h-4" />
                                Edit
                              </ActionMenu.Item>
                              <Modal.Open opens={`delete-review-${review.id}`}>
                                <ActionMenu.Item className="text-red-600 hover:bg-red-50">
                                  <MdDelete className="w-4 h-4" />
                                  Delete
                                </ActionMenu.Item>
                              </Modal.Open>
                            </ActionMenu.Content>
                          </ActionMenu>

                          <Modal.Window name={`delete-review-${review.id}`}>
                            <DeleteConfirmationModal
                              itemName={review.title}
                              itemType="price review"
                              onConfirm={() => deleteMutation.mutate(review.id)}
                              isDeleting={deleteMutation.isPending}
                            />
                          </Modal.Window>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.pagination && data.pagination.total > 0 && (
                <Pagination
                  currentPage={data.pagination.current_page}
                  totalPages={data.pagination.last_page}
                  onPageChange={handlePageChange}
                  totalItems={data.pagination.total}
                  itemsPerPage={data.pagination.per_page}
                />
              )}
            </div>
          </Modal>
        )}

        {/* Empty State */}
        {data && data.data.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MdPriceChange className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No price reviews found
            </h3>
            <p className="text-gray-600 mb-4">
              {debouncedSearch
                ? "Try adjusting your search"
                : "Get started by creating your first price review."}
            </p>
            <Link
              href="/price-reviews/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <MdAdd className="w-5 h-5" />
              New Price Review
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
