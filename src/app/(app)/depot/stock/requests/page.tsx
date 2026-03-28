"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MdAdd,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdCallMade,
  MdCallReceived,
  MdPending,
  MdCheckCircle,
  MdCancel,
  MdFilterList,
  MdPictureAsPdf,
  MdExpandLess,
  MdExpandMore,
} from "react-icons/md";

import {
  useStockRequests,
  useDeleteStockRequest,
  useApproveStockRequest,
  useRejectStockRequest,
  useFulfillStockRequest,
} from "@/hooks/useStockRequest";
import { useCanManageStock, useUserZone, useAuth, useIsSuperAdmin } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProduct";
import { useZones } from "@/hooks/useZone";
import { ActionMenu } from "@/components/common/ActionMenu";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import StockRequestReportModal from "@/components/common/StockRequestReportModal";
import StockRequestsReportPDF from "@/components/common/StockRequestsReportPDF";
import { pdf } from "@react-pdf/renderer";
import toast from "react-hot-toast";
import type {
  StockRequestItem,
  StockRequestFilters,
} from "@/types/stockRequest";

const getStatusStyle = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "approved":
      return "bg-blue-100 text-blue-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "fulfilled":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export default function StockRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<StockRequestFilters>({
    direction: "all",
    status: undefined,
    from_date: "",
    to_date: "",
    from_zone_id: "",
    to_zone_id: "",
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<StockRequestItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const userZone = useUserZone();
  const { data: productsData } = useProducts({ per_page: 100 });
  const { data: zonesData } = useZones({ per_page: 100 });

  const directionOptions = useMemo(() => [
    { value: "all", label: "All Requests" },
    { value: "incoming", label: "Incoming" },
    { value: "outgoing", label: "Outgoing" },
  ], []);

  const statusOptions = useMemo(() => [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "fulfilled", label: "Fulfilled" },
  ], []);

  const fromZoneOptions = useMemo(() => [
    { value: "", label: "All From Zones" },
    ...(zonesData?.data?.map((zone) => ({
      value: String(zone.id),
      label: zone.name,
    })) || []),
  ], [zonesData]);

  const toZoneOptions = useMemo(() => [
    { value: "", label: "All To Zones" },
    ...(zonesData?.data?.map((zone) => ({
      value: String(zone.id),
      label: zone.name,
    })) || []),
  ], [zonesData]);

  const productOptions = useMemo(() => [
    { value: "", label: "All Products" },
    ...(productsData?.data?.map((product) => ({
      value: String(product.id),
      label: product.name,
    })) || []),
  ], [productsData]);

  const hasAnyFilter = !!(
    filters.from_zone_id ||
    filters.to_zone_id ||
    filters.from_date ||
    filters.to_date ||
    search ||
    (filters.direction && filters.direction !== "all") ||
    filters.status
  );

  const handleClearFilters = () => {
    setFilters({
      direction: "all",
      status: undefined,
      from_date: "",
      to_date: "",
      from_zone_id: "",
      to_zone_id: "",
    });
    setSearch("");
    setPage(1);
  };

  // Data fetching
  const { data: requestsData, isLoading, error } = useStockRequests({
    page,
    product_id: search || undefined,
    direction: filters.direction !== "all" ? filters.direction : undefined,
    status: filters.status,
    from_date: filters.from_date || undefined,
    to_date: filters.to_date || undefined,
    from_zone_id: filters.from_zone_id || undefined,
    to_zone_id: filters.to_zone_id || undefined,
  });

  // Mutations
  const deleteMutation = useDeleteStockRequest();
  const approveMutation = useApproveStockRequest();
  const rejectMutation = useRejectStockRequest();
  const fulfillMutation = useFulfillStockRequest();

  const handleDelete = (request: StockRequestItem) => {
    setSelectedRequest(request);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedRequest) return;

    deleteMutation.mutate(selectedRequest.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setSelectedRequest(null);
      },
    });
  };

  const handleApprove = (request: StockRequestItem) => {
    setSelectedRequest(request);
    setApprovalNotes("");
    setShowApproveModal(true);
  };

  const confirmApprove = () => {
    if (!selectedRequest) return;

    approveMutation.mutate({
      id: selectedRequest.id,
      payload: { notes: approvalNotes.trim() || undefined },
    }, {
      onSuccess: () => {
        setShowApproveModal(false);
        setSelectedRequest(null);
        setApprovalNotes("");
      },
    });
  };

  const handleReject = (request: StockRequestItem) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    rejectMutation.mutate({
      id: selectedRequest.id,
      payload: { reason: rejectionReason.trim() },
    }, {
      onSuccess: () => {
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectionReason("");
      },
    });
  };

  const handleFulfill = (request: StockRequestItem) => {
    fulfillMutation.mutate(request.id);
  };

  // Helper to get product info from a request
  const getRequestProducts = (request: StockRequestItem) => {
    return request.products || (request.product ? [{
      id: request.id,
      product_id: request.product_id,
      quantity: request.quantity,
      product: request.product,
      batches: request.batches || []
    }] : []);
  };

  const getRequestQuantity = (request: StockRequestItem) => {
    const products = getRequestProducts(request);
    return request.total_quantity || products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  };

  const getProductNames = (request: StockRequestItem) => {
    const products = getRequestProducts(request);
    return products.map(p => p.product?.name || "Unknown Product").join(", ");
  };

  const getRequestedByName = (request: StockRequestItem) => {
    if (typeof request.requested_by === 'object' && request.requested_by?.name) {
      return request.requested_by.name;
    }
    return request.requestedBy?.name || "Unknown User";
  };

  // Statistics
  const requests = requestsData?.data || [];
  const pagination = requestsData?.pagination;

  // Check if user can manage stock (create, edit, delete) vs just view
  const canManageStockActions = useCanManageStock();
  const isSuperAdmin = useIsSuperAdmin();

  // Generate report handler
  const handleDownloadPdf = useCallback(
    async (reportParams: {
      filter: string;
      dateFrom: string;
      dateTo: string;
    }) => {
      setIsGeneratingPdf(true);
      try {
        const { getStockRequests } = await import("@/services/stockRequestService");
        const reportData = await getStockRequests({
          paginate: false,
          status: (reportParams.filter || undefined) as "pending" | "approved" | "rejected" | "fulfilled" | "cancelled" | undefined,
          from_date: reportParams.dateFrom || undefined,
          to_date: reportParams.dateTo || undefined,
          from_zone_id: filters.from_zone_id || undefined,
          to_zone_id: filters.to_zone_id || undefined,
        });

        if (!reportData?.data?.length) {
          toast.error("No stock request data to generate report");
          return;
        }

        const formatDate = (d: string) =>
          new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

        const reportRequests = reportData.data.map((r) => ({
          id: r.id,
          product_names: getProductNames(r),
          from_zone: r.from_zone?.name || r.fromZone?.name || "N/A",
          to_zone: r.to_zone?.name || r.toZone?.name || "N/A",
          quantity: getRequestQuantity(r),
          status: r.status,
          requested_by: getRequestedByName(r),
          date: formatDate(r.created_at),
        }));

        const totalQuantity = reportData.data.reduce(
          (s, r) => s + getRequestQuantity(r),
          0,
        );

        const reportSummary = {
          total_requests: reportData.pagination?.total || reportRequests.length,
          total_quantity: totalQuantity,
          pending_count: reportData.data.filter((r) => r.status === "pending").length,
          approved_count: reportData.data.filter((r) => r.status === "approved").length,
          fulfilled_count: reportData.data.filter((r) => r.status === "fulfilled").length,
          rejected_count: reportData.data.filter((r) => r.status === "rejected").length,
        };

        const filterLabel =
          reportParams.filter === "pending"
            ? "Pending Stock Requests"
            : reportParams.filter === "approved"
              ? "Approved Stock Requests"
              : reportParams.filter === "fulfilled"
                ? "Fulfilled Stock Requests"
                : "Stock Requests";

        const blob = await pdf(
          <StockRequestsReportPDF
            requests={reportRequests}
            summary={reportSummary}
            dateRange={{ from: reportParams.dateFrom, to: reportParams.dateTo }}
            generatedBy={user?.name}
            reportType={`${filterLabel} Report`}
          />,
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const dateStr = new Date().toISOString().split("T")[0];
        link.download = `stock-requests-report-${dateStr}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Report downloaded successfully");
        setShowReportModal(false);
      } catch {
        toast.error("Failed to generate report");
      } finally {
        setIsGeneratingPdf(false);
      }
    },
    [user?.name, filters.from_zone_id, filters.to_zone_id],
  );

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary shrink-0">
              <MdCallMade className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-2xl font-bold text-gray-900">
                Stock Requests
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 hidden md:block">
                Manage stock requests between depots
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SearchField
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search by product..."
            />
            <button
              onClick={() => setShowReportModal(true)}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdPictureAsPdf className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </button>
            {isSuperAdmin && (
              <Link
                href="/depot/stock/requests/new"
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <MdAdd className="w-4 h-4" />
                <span className="hidden sm:inline">New Request</span>
              </Link>
            )}
          </div>
        </div>

        {/* Collapsible Filters */}
        <div className="bg-white rounded-lg border border-gray-200 mb-2 shrink-0">
          <div
            className="flex items-center justify-between px-3 md:px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <MdFilterList className="w-4 h-4 md:w-5 md:h-5 text-gray-500 shrink-0" />
              <span className="text-xs md:text-sm font-medium text-gray-700">
                Filters
                {hasAnyFilter && (
                  <span className="ml-2 text-xs text-blue-600">
                    (Filters applied)
                  </span>
                )}
              </span>
            </div>
            {isFilterExpanded ? (
              <MdExpandLess className="w-5 h-5 text-gray-500" />
            ) : (
              <MdExpandMore className="w-5 h-5 text-gray-500" />
            )}
          </div>
          {isFilterExpanded && (
            <div className="border-t border-gray-100 px-3 md:px-4 py-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 items-end">
                <div>
                  <SearchableSelect
                    label="Direction"
                    options={directionOptions}
                    value={filters.direction || "all"}
                    onChange={(val) => {
                      setFilters(prev => ({ ...prev, direction: val as "all" | "incoming" | "outgoing" }));
                      setPage(1);
                    }}
                    placeholder="All Requests"
                  />
                </div>
                <div>
                  <SearchableSelect
                    label="Status"
                    options={statusOptions}
                    value={filters.status || ""}
                    onChange={(val) => {
                      setFilters(prev => ({ ...prev, status: val as StockRequestFilters["status"] }));
                      setPage(1);
                    }}
                    placeholder="All Statuses"
                  />
                </div>
                <div>
                  <SearchableSelect
                    label="Product"
                    options={productOptions}
                    value={search}
                    onChange={(val) => {
                      setSearch(val);
                      setPage(1);
                    }}
                    placeholder="All Products"
                  />
                </div>
                <div>
                  <SearchableSelect
                    label="From Zone"
                    options={fromZoneOptions}
                    value={filters.from_zone_id || ""}
                    onChange={(val) => {
                      setFilters(prev => ({ ...prev, from_zone_id: val }));
                      setPage(1);
                    }}
                    placeholder="All From Zones"
                  />
                </div>
                <div>
                  <SearchableSelect
                    label="To Zone"
                    options={toZoneOptions}
                    value={filters.to_zone_id || ""}
                    onChange={(val) => {
                      setFilters(prev => ({ ...prev, to_zone_id: val }));
                      setPage(1);
                    }}
                    placeholder="All To Zones"
                  />
                </div>
                <div>
                  <label className="text-gray-700 mb-1 flex text-xs font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.from_date}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, from_date: e.target.value }));
                      setPage(1);
                    }}
                    className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-3 py-2 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-700 mb-1 flex text-xs font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.to_date}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, to_date: e.target.value }));
                      setPage(1);
                    }}
                    className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg placeholder:text-gray-500 border px-3 py-2 text-sm transition-all duration-300 focus:ring-1 focus:outline-none"
                  />
                </div>
                <div>
                  <button
                    onClick={handleClearFilters}
                    disabled={!hasAnyFilter}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full ${
                      hasAnyFilter
                        ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                        : "text-gray-400 bg-gray-50 cursor-not-allowed"
                    }`}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading stock requests...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load stock requests</p>
          </div>
        )}

        {/* Requests Table */}
        {requestsData && requests.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-y-auto p-3 space-y-3">
              {requests.map((request) => {
                const products = getRequestProducts(request);
                const totalQuantity = getRequestQuantity(request);
                const productNames = getProductNames(request);

                return (
                  <div
                    key={request.id}
                    className="rounded-lg p-3 bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        href={`/depot/stock/requests/${request.id}`}
                        className="text-sm font-bold text-primary hover:underline truncate max-w-[60%]"
                      >
                        {request.has_multiple_products || products.length > 1
                          ? `${products.length} Products`
                          : productNames}
                      </Link>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyle(request.status)}`}
                      >
                        {STATUS_LABELS[request.status] || request.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-gray-400">From</span>
                        <p className="font-medium text-gray-700 truncate">
                          {request.from_zone?.name || request.fromZone?.name || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">To</span>
                        <p className="font-medium text-gray-700 truncate">
                          {request.to_zone?.name || request.toZone?.name || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Quantity</span>
                        <p className="font-medium text-gray-900">{totalQuantity}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Requested By</span>
                        <p className="font-medium text-gray-700 truncate">
                          {getRequestedByName(request)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        {new Date(request.created_at).toLocaleDateString("en-GB")}
                      </span>
                      <ActionMenu menuId={`request-mobile-${request.id}`}>
                        <ActionMenu.Trigger>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </ActionMenu.Trigger>
                        <ActionMenu.Content>
                          <ActionMenu.Item onClick={() => router.push(`/depot/stock/requests/${request.id}`)}>
                            <MdVisibility className="w-4 h-4 mr-2" />
                            View Details
                          </ActionMenu.Item>
                          {canManageStockActions && (
                            <>
                              {request.status === "pending" && userZone?.id === (request.from_zone_id || request.fromZone?.id) && (
                                <>
                                  <ActionMenu.Item onClick={() => handleApprove(request)} className="text-green-600">
                                    <MdCheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </ActionMenu.Item>
                                  <ActionMenu.Item onClick={() => handleReject(request)} className="text-red-600">
                                    <MdCancel className="w-4 h-4 mr-2" />
                                    Reject
                                  </ActionMenu.Item>
                                </>
                              )}
                              {request.status === "pending" && userZone?.id === (request.to_zone_id || request.toZone?.id) && (
                                <>
                                  <ActionMenu.Item onClick={() => router.push(`/depot/stock/requests/${request.id}/edit`)}>
                                    <MdEdit className="w-4 h-4 mr-2" />
                                    Edit
                                  </ActionMenu.Item>
                                  <ActionMenu.Item onClick={() => handleDelete(request)} className="text-red-600">
                                    <MdDelete className="w-4 h-4 mr-2" />
                                    Delete
                                  </ActionMenu.Item>
                                </>
                              )}
                              {request.status === "approved" && userZone?.id === (request.from_zone_id || request.fromZone?.id) && (
                                <ActionMenu.Item onClick={() => handleFulfill(request)} className="text-blue-600">
                                  <MdCallReceived className="w-4 h-4 mr-2" />
                                  Fulfill
                                </ActionMenu.Item>
                              )}
                            </>
                          )}
                        </ActionMenu.Content>
                      </ActionMenu>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From Zone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To Zone
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => {
                    const products = getRequestProducts(request);
                    const totalQuantity = getRequestQuantity(request);
                    const productNames = getProductNames(request);

                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.has_multiple_products || products.length > 1 ? (
                              <div>
                                <div>{products.length} Products</div>
                                <div className="text-xs text-gray-500 truncate max-w-xs" title={productNames}>
                                  {productNames}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div>{productNames}</div>
                                {products[0]?.product?.sku && (
                                  <div className="text-xs text-gray-500">{products[0].product.sku}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {request.from_zone?.name || request.fromZone?.name || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {request.to_zone?.name || request.toZone?.name || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-gray-900">
                            {totalQuantity}
                          </span>
                          {(request.has_multiple_products || products.length > 1) && (
                            <div className="text-xs text-gray-500">
                              {products.length} items
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(request.status)}`}
                          >
                            {STATUS_LABELS[request.status] || request.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {getRequestedByName(request)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {new Date(request.created_at).toLocaleDateString("en-GB")}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <ActionMenu menuId={`request-${request.id}`}>
                            <ActionMenu.Trigger>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </ActionMenu.Trigger>
                            <ActionMenu.Content>
                              <ActionMenu.Item onClick={() => router.push(`/depot/stock/requests/${request.id}`)}>
                                <MdVisibility className="w-4 h-4 mr-2" />
                                View Details
                              </ActionMenu.Item>

                              {canManageStockActions && (
                                <>
                                  {request.status === "pending" && userZone?.id === (request.from_zone_id || request.fromZone?.id) && (
                                    <>
                                      <ActionMenu.Item onClick={() => handleApprove(request)} className="text-green-600">
                                        <MdCheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                      </ActionMenu.Item>
                                      <ActionMenu.Item onClick={() => handleReject(request)} className="text-red-600">
                                        <MdCancel className="w-4 h-4 mr-2" />
                                        Reject
                                      </ActionMenu.Item>
                                    </>
                                  )}

                                  {request.status === "pending" && userZone?.id === (request.to_zone_id || request.toZone?.id) && (
                                    <>
                                      <ActionMenu.Item onClick={() => router.push(`/depot/stock/requests/${request.id}/edit`)}>
                                        <MdEdit className="w-4 h-4 mr-2" />
                                        Edit
                                      </ActionMenu.Item>
                                      <ActionMenu.Item onClick={() => handleDelete(request)} className="text-red-600">
                                        <MdDelete className="w-4 h-4 mr-2" />
                                        Delete
                                      </ActionMenu.Item>
                                    </>
                                  )}

                                  {request.status === "approved" && userZone?.id === (request.from_zone_id || request.fromZone?.id) && (
                                    <ActionMenu.Item onClick={() => handleFulfill(request)} className="text-blue-600">
                                      <MdCallReceived className="w-4 h-4 mr-2" />
                                      Fulfill
                                    </ActionMenu.Item>
                                  )}
                                </>
                              )}
                            </ActionMenu.Content>
                          </ActionMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination && pagination.total > 0 && (
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                onPageChange={setPage}
                totalItems={pagination.total}
                itemsPerPage={pagination.per_page}
              />
            )}
          </div>
        )}

        {/* Empty State */}
        {requestsData && requests.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MdCallMade className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No stock requests found
            </h3>
            <p className="text-gray-600">
              {hasAnyFilter
                ? "Try adjusting your filters"
                : "No stock requests have been created yet."}
            </p>
            {isSuperAdmin && (
              <Link
                href="/depot/stock/requests/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
              >
                <MdAdd className="w-4 h-4" />
                Create Stock Request
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedRequest && (
        <DeleteConfirmationModal
          itemName={(() => {
            const products = getRequestProducts(selectedRequest);
            if (selectedRequest.has_multiple_products || products.length > 1) {
              return `request containing ${products.length} products`;
            } else if (products.length === 1) {
              return `request for ${products[0].product?.name || selectedRequest.product?.name}`;
            } else {
              return "stock request";
            }
          })()}
          itemType="stock request"
          onConfirm={confirmDelete}
          isDeleting={deleteMutation.isPending}
          onCloseModal={() => setShowDeleteModal(false)}
        />
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Approve Stock Request
            </h3>
            {(() => {
              const products = getRequestProducts(selectedRequest);
              const totalQuantity = getRequestQuantity(selectedRequest);

              if (selectedRequest.has_multiple_products || products.length > 1) {
                return (
                  <div className="text-sm text-gray-600 mb-4">
                    <p className="mb-2">Approve this stock request containing:</p>
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
                    <p className="text-xs text-gray-500">
                      This will approve the entire request for all {products.length} products.
                    </p>
                  </div>
                );
              } else {
                return (
                  <p className="text-sm text-gray-600 mb-4">
                    Approve this stock request for {products[0]?.quantity || totalQuantity} units of {products[0]?.product?.name || selectedRequest.product?.name}?
                  </p>
                );
              }
            })()}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reject Stock Request
            </h3>
            {(() => {
              const products = getRequestProducts(selectedRequest);
              const totalQuantity = getRequestQuantity(selectedRequest);

              if (selectedRequest.has_multiple_products || products.length > 1) {
                return (
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
                );
              } else {
                return (
                  <p className="text-sm text-gray-600 mb-4">
                    Reject this stock request for {products[0]?.quantity || totalQuantity} units of {products[0]?.product?.name || selectedRequest.product?.name}?
                  </p>
                );
              }
            })()}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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

      {/* Stock Request Report Modal */}
      <StockRequestReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerate={handleDownloadPdf}
        isGenerating={isGeneratingPdf}
        title="Generate Stock Requests Report"
      />
    </div>
  );
}
