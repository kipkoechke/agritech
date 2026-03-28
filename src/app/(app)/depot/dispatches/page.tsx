"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  MdLocalShipping,
  MdPictureAsPdf,
  MdFilterList,
  MdExpandLess,
  MdExpandMore,
} from "react-icons/md";
import { useDispatches } from "@/hooks/useDispatch";
import {
  useAuth,
  useIsSuperAdmin,
  useIsBusinessManager,
} from "@/hooks/useAuth";
import { useZones } from "@/hooks/useZone";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import DispatchReportModal from "@/components/common/DispatchReportModal";
import DispatchesReportPDF from "@/components/common/DispatchesReportPDF";
import { pdf } from "@react-pdf/renderer";
import { formatCurrency } from "@/utils/formatCurrency";
import toast from "react-hot-toast";

const getStatusStyle = (status: string) => {
  switch (status) {
    case "dispatched":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-emerald-100 text-emerald-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export default function DepotDispatchesPage() {
  const { user } = useAuth();
  const isSuperAdmin = useIsSuperAdmin();
  const isBusinessManager = useIsBusinessManager();
  const showDepotFilter = isSuperAdmin || isBusinessManager;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [zoneId, setZoneId] = useState<string>("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showDispatchReportModal, setShowDispatchReportModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const perPage = 15;

  const { data: zonesData, isLoading: zonesLoading } = useZones({
    per_page: 100,
  });

  const zoneOptions = useMemo(() => {
    return [
      { value: "", label: "All Depots" },
      ...(zonesData?.data?.map((zone) => ({
        value: String(zone.id),
        label: zone.name,
      })) || []),
    ];
  }, [zonesData]);

  const hasAnyFilter = !!(zoneId || dateFrom || dateTo);

  const handleClearFilters = () => {
    setZoneId("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useDispatches({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    zone_id: zoneId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDownloadDispatchPdf = useCallback(
    async (reportParams: {
      filter: string;
      dateFrom: string;
      dateTo: string;
    }) => {
      setIsGeneratingPdf(true);
      try {
        const { getDispatches } = await import("@/services/dispatchService");
        const reportData = await getDispatches({
          paginate: false,
          status: reportParams.filter || undefined,
          date_from: reportParams.dateFrom || undefined,
          date_to: reportParams.dateTo || undefined,
          zone_id: zoneId || undefined,
        });

        if (!reportData?.data?.length) {
          toast.error("No dispatch data to generate report");
          return;
        }

        const formatDate = (d: string) =>
          new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

        const reportDispatches = reportData.data.map((d) => ({
          id: d.id,
          dispatch_number: d.dispatch_number,
          zone_name: d.zone?.name || "N/A",
          transporter_name: d.transporter?.name || "N/A",
          license_plate: d.transporter?.license_plate || "N/A",
          orders_count: d.orders_count,
          total_amount: formatCurrency(d.total_amount),
          status: d.status,
          date: formatDate(d.created_at),
        }));

        const totalAmount = reportData.data.reduce(
          (s, d) => s + (parseFloat(String(d.total_amount)) || 0),
          0,
        );
        const totalOrders = reportData.data.reduce(
          (s, d) => s + d.orders_count,
          0,
        );

        const reportSummary = {
          total_dispatches:
            reportData.pagination?.total || reportDispatches.length,
          total_amount: totalAmount.toLocaleString("en-KE", {
            minimumFractionDigits: 2,
          }),
          total_orders: totalOrders,
          dispatched_count: reportData.data.filter(
            (d) => d.status === "dispatched",
          ).length,
          delivered_count: reportData.data.filter(
            (d) => d.status === "delivered",
          ).length,
          pending_count: reportData.data.filter((d) => d.status === "pending")
            .length,
        };

        const filterLabel =
          reportParams.filter === "dispatched"
            ? "Dispatched"
            : reportParams.filter === "pending"
              ? "Pending Dispatches"
              : "Dispatches";

        const blob = await pdf(
          <DispatchesReportPDF
            dispatches={reportDispatches}
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
        link.download = `dispatches-report-${dateStr}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Report downloaded successfully");
        setShowDispatchReportModal(false);
      } catch {
        toast.error("Failed to generate report");
      } finally {
        setIsGeneratingPdf(false);
      }
    },
    [user?.name, zoneId],
  );

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary shrink-0">
              <MdLocalShipping className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-2xl font-bold text-gray-900">
                Dispatches
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 hidden md:block">
                View all dispatches from your depot
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search dispatches..."
            />
            <button
              onClick={() => setShowDispatchReportModal(true)}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdPictureAsPdf className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </button>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showDepotFilter && (
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
                      label="Depot"
                      options={zoneOptions}
                      value={zoneId}
                      onChange={(val) => {
                        setZoneId(val);
                        setPage(1);
                      }}
                      placeholder="All Depots"
                      disabled={zonesLoading}
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 mb-1 flex text-xs font-medium">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
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
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
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
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading dispatches...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load dispatches</p>
          </div>
        )}

        {/* Dispatches Table */}
        {data && data.data.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-y-auto p-3 space-y-3">
              {data.data.map((dispatch) => (
                <div
                  key={dispatch.id}
                  className="rounded-lg p-3 bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/depot/dispatches/${dispatch.id}`}
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      {dispatch.dispatch_number}
                    </Link>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyle(dispatch.status)}`}
                    >
                      {dispatch.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-400">Amount</span>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(dispatch.total_amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Orders</span>
                      <p className="font-medium text-gray-700">
                        {dispatch.orders_count}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Transporter</span>
                      <p className="font-medium text-gray-700 truncate">
                        {dispatch.transporter?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">License Plate</span>
                      <p className="font-medium text-gray-700">
                        {dispatch.transporter?.license_plate || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      {new Date(dispatch.created_at).toLocaleDateString(
                        "en-GB",
                      )}
                    </span>
                    <span className="text-gray-500">
                      {dispatch.zone?.name || "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispatch #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transporter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License Plate
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((dispatch) => (
                    <tr key={dispatch.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/depot/dispatches/${dispatch.id}`}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          {dispatch.dispatch_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {dispatch.zone?.name || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(dispatch.total_amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-600">
                          {dispatch.orders_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {dispatch.transporter?.name || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {dispatch.transporter?.license_plate || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(dispatch.status)}`}
                        >
                          {dispatch.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(dispatch.created_at).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
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
        )}

        {/* Empty State */}
        {data && data.data.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MdLocalShipping className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No dispatches found
            </h3>
            <p className="text-gray-600">
              {debouncedSearch
                ? "Try adjusting your search"
                : "No dispatches from your depot yet."}
            </p>
            <Link
              href={
                user?.role === "depot-manager" ||
                user?.role === "depot-supervisor"
                  ? "/depot/orders"
                  : "/orders"
              }
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
            >
              Go to Orders
            </Link>
          </div>
        )}
      </div>

      {/* Dispatch Report Modal */}
      <DispatchReportModal
        isOpen={showDispatchReportModal}
        onClose={() => setShowDispatchReportModal(false)}
        onGenerate={handleDownloadDispatchPdf}
        isGenerating={isGeneratingPdf}
        title="Generate Dispatches Report"
      />
    </div>
  );
}
