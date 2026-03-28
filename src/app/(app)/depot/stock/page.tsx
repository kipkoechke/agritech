"use client";

import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import Link from "next/link";
import {MdAdd, MdDelete, MdEdit, MdMoreVert, MdVisibility, MdWarehouse,} from "react-icons/md";

import {useDeleteStockLevel, useStockLevels} from "@/hooks/useStockLevel";
import {useStockTransfers} from "@/hooks/useStockTransfers";
import {useCancelStockTransfer, useCompleteStockTransfer, useInitiateStockTransfer,} from "@/hooks/useStockTransfer";
import {useCanAddStock, useCanManageStock, useIsBusinessManager, useIsSuperAdmin} from "@/hooks/useAuth";
import {useZones} from "@/hooks/useZone";
import {SearchField} from "@/components/common/SearchField";
import {ActionMenu} from "@/components/common/ActionMenu";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import toast from "react-hot-toast";
import type {StockLevelListItem} from "@/types/stockLevel";

export default function DepotStockManagementPage() {
    const router = useRouter();
    const pathname = usePathname();

    const [activeTab, setActiveTab] = useState<
        "records" | "outgoing" | "incoming"
    >("records");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [zoneId, setZoneId] = useState<string>("");

    // Transfer state
    const [transferItems, setTransferItems] = useState<{
        stock: StockLevelListItem;
        qty: number;
        batchQty: Record<string, number>;
    }[]>([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [toZoneId, setToZoneId] = useState<string>("");
    const [transferError, setTransferError] = useState<string | null>(null);

    // Single item used only for delete confirmation
    const [selectedStock, setSelectedStock] = useState<StockLevelListItem | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const canManageStock = useCanManageStock();
    const canAddStock = useCanAddStock();
    const isSuperAdmin = useIsSuperAdmin();
    const isBusinessManager = useIsBusinessManager();
    const showDepotFilter = isSuperAdmin || isBusinessManager;

    const {data: zonesData} = useZones({per_page: 100});

    // Data fetching
    const {data, isLoading, error} = useStockLevels({
        page,
        search: search || undefined,
        zone_id: zoneId || undefined,
    });

    const deleteMutation = useDeleteStockLevel();
    const initiateTransferMutation = useInitiateStockTransfer();
    const cancelTransferMutation = useCancelStockTransfer();

    const handleDelete = (stock: StockLevelListItem) => {
        setSelectedStock(stock);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!selectedStock) return;

        deleteMutation.mutate(selectedStock.id, {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedStock(null);
            },
        });
    };

    const toggleStockSelection = (stock: StockLevelListItem) => {
        setTransferItems((prev) => {
            const exists = prev.find((i) => i.stock.id === stock.id);
            if (exists) {
                return prev.filter((i) => i.stock.id !== stock.id);
            }
            // new item, default quantities
            const batches = stock.batches || [];
            let remainder = stock.active_stock;
            const perBatch = batches.length
                ? Math.floor(stock.active_stock / batches.length)
                : stock.active_stock;
            const batchQty: Record<string, number> = {};
            batches.forEach((b, idx) => {
                const qty = idx === batches.length - 1 ? remainder : perBatch;
                remainder -= qty;
                batchQty[b.batch_number] = qty;
            });
            return [...prev, {stock, qty: stock.active_stock, batchQty}];
        });
    };

    const clearSelection = () => setTransferItems([]);

    const updateItemQty = (stockId: string, qty: number) => {
        setTransferItems((prev) =>
            prev.map((item) => (item.stock.id === stockId ? {...item, qty} : item)),
        );
    };

    const updateBatchQty = (stockId: string, batchNo: string, qty: number) => {
        setTransferItems((prev) =>
            prev.map((item) => {
                if (item.stock.id !== stockId) return item;
                const newBatchQty: Record<string, number> = {...item.batchQty, [batchNo]: qty};
                return {
                    stock: item.stock,
                    qty: item.qty,
                    batchQty: newBatchQty
                };
            }),
        );
    };

    const confirmBulkInitiate = () => {
        const payload = {
            to_zone_id: toZoneId,
            products: transferItems.map((item) => ({
                product_id: item.stock.product_id,
                quantity: item.qty,
                batches: Object.entries(item.batchQty)
                    .filter(([, qty]) => qty > 0)
                    .map(([batch_no, qty]) => ({
                        batch_no,
                        quantity: qty,
                    })),
            })),
            metadata: {},
        };

        setTransferError(null);
        initiateTransferMutation.mutate(payload, {
            onSuccess: () => {
                setShowBulkModal(false);
                clearSelection();
                setToZoneId("");
                setTransferError(null);
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.errors?.join(", ") || err?.message || "Failed";
                setTransferError(msg);
            },
        });
    };

    const confirmBulkCancel = () => {
        transferItems.forEach((item) => handleCancelTransfer(item.stock));
        setShowBulkModal(false);
        clearSelection();
        setToZoneId("");
    };

    const handleInitiateTransfer = (stock: StockLevelListItem) => {
        // open bulk modal with single stock preselected
        // generate transfer item
        const batches = stock.batches || [];
        let remainder = stock.active_stock;
        const perBatch = batches.length
            ? Math.floor(stock.active_stock / batches.length)
            : stock.active_stock;
        const batchQty: Record<string, number> = {};
        batches.forEach((b, idx) => {
            const qty = idx === batches.length - 1 ? remainder : perBatch;
            remainder -= qty;
            batchQty[b.batch_number] = qty;
        });
        setTransferItems([{stock, qty: stock.active_stock, batchQty}]);
        setShowBulkModal(true);
    };

    const handleCancelTransfer = (stock: StockLevelListItem) => {
        cancelTransferMutation.mutate(stock.id);
    };

    useEffect(() => {
        if (search) setPage(1);
    }, [search]);

    useEffect(() => {
        setSelectedStock(null);
        clearSelection();
    }, [activeTab]);

    useEffect(() => {
        // Sync active tab with URL pathname
        if (pathname.includes("/transfers/outgoing")) {
            if (isSuperAdmin) {
                // Redirect super admins back to records tab
                router.replace("/depot/stock");
                setActiveTab("records");
            } else {
                setActiveTab("outgoing");
            }
        } else if (pathname.includes("/transfers/incoming")) {
            if (isSuperAdmin) {
                // Redirect super admins back to records tab
                router.replace("/depot/stock");
                setActiveTab("records");
            } else {
                setActiveTab("incoming");
            }
        } else {
            setActiveTab("records");
        }
    }, [pathname, isSuperAdmin, router]);

    const stockLevels = data?.data || [];
    const pagination = data?.pagination;

    const totalActiveStock = stockLevels.reduce(
        (sum, item) => sum + item.active_stock,
        0,
    );

    const totalExpiredStock = stockLevels.reduce(
        (sum, item) => sum + item.expired_stock,
        0,
    );

    const productsWithExpired = stockLevels.filter(
        (item) => item.expired_stock > 0,
    ).length;

    return (
        <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50/50 px-4 py-2 pb-24 md:pb-4 text-gray-900">
            <div className="container mx-auto flex-1 min-h-0 flex flex-col text-xs">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <MdWarehouse className="w-6 h-6 text-blue-600"/>
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold">
                                {activeTab === "records"
                                    ? "Stock Management"
                                    : activeTab === "outgoing"
                                        ? "Outgoing Transfers"
                                        : "Incoming Transfers"}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {activeTab === "records"
                                    ? "Manage product stock levels and transfers"
                                    : activeTab === "outgoing"
                                        ? "Track outgoing stock transfers"
                                        : "Track incoming stock transfers"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {activeTab === "records" && (
                            <>
                                <SearchField
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Search products..."
                                    className="flex-1 md:w-64"
                                />

                                {showDepotFilter && (
                                    <select
                                        value={zoneId}
                                        onChange={(e) => {
                                            setZoneId(e.target.value);
                                            setPage(1);
                                        }}
                                        className="px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    >
                                        <option value="">All Depots</option>
                                        {zonesData?.data?.map((zone) => (
                                            <option key={zone.id} value={zone.id}>
                                                {zone.name}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {canManageStock && (
                                    <Link
                                        href="/depot/stock/requests/new"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors cursor-pointer"
                                    >
                                        <MdAdd className="w-5 h-5"/>
                                        Request Stock
                                    </Link>
                                )}
                                
                                {/* Add Stock Button - Fixed to ensure clickability */}
                                {canAddStock && (
                                    <Link
                                        href="/depot/stock/new"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition-colors cursor-pointer no-underline"
                                        onClick={(e) => {
                                            // Prevent any event bubbling issues
                                            e.stopPropagation();
                                        }}
                                    >
                                        <MdAdd className="w-5 h-5"/>
                                        Add Stock
                                    </Link>
                                )}
                            </>
                        )}
                        
                        {/* Add Stock button in other tabs for quick access */}
                        {activeTab !== "records" && canAddStock && (
                            <Link
                                href="/depot/stock/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition-colors cursor-pointer no-underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MdAdd className="w-5 h-5"/>
                                Add Stock
                            </Link>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-4 border-b border-transparent">
                    <button
                        onClick={() => {
                            router.push("/depot/stock");
                            setSelectedStock(null);
                        }}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                            activeTab === "records"
                                ? "border-accent text-accent"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Stock Records
                    </button>
                    {!isSuperAdmin && (
                        <>
                            <button
                                onClick={() => {
                                    router.push("/depot/stock/transfers/outgoing");
                                    setSelectedStock(null);
                                }}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                                    activeTab === "outgoing"
                                        ? "border-accent text-accent"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Outgoing
                            </button>
                            <button
                                onClick={() => {
                                    router.push("/depot/stock/transfers/incoming");
                                    setSelectedStock(null);
                                }}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                                    activeTab === "incoming"
                                        ? "border-accent text-accent"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Incoming
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => {
                            router.push("/depot/stock/requests");
                            setSelectedStock(null);
                        }}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                            pathname.includes("/requests")
                                ? "border-accent text-accent"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Stock Requests
                    </button>
                </div>

                {/* Content Area */}
                {activeTab === "records" ? (
                    <StockRecordsSection
                        stockLevels={stockLevels}
                        transferItems={transferItems}
                        toggleStockSelection={toggleStockSelection}
                        openBulkModal={() => setShowBulkModal(true)}
                        isLoading={isLoading}
                        error={error}
                        canManageStock={canManageStock}
                        handleInitiateTransfer={handleInitiateTransfer}
                        handleCancelTransfer={handleCancelTransfer}
                        handleDelete={handleDelete}
                    />
                ) : (
                    <StockTransfersSection
                        transferType={activeTab as "outgoing" | "incoming"}
                        zonesData={zonesData}
                    />
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && selectedStock && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-2">Delete Stock</h3>
                        <p className="text-sm mb-4">
                            Delete stock entry for <b>{selectedStock.name}</b>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border rounded-lg text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk action modal */}
            {showBulkModal && transferItems.length > 0 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md overflow-auto max-h-[80vh]">
                        <h3 className="text-lg font-semibold mb-2">
                            Bulk Transfer Actions
                        </h3>
                        <p className="text-sm mb-4">
                            {transferItems.length} product(s) selected.
                        </p>
                        {transferError && (
                            <div className="text-red-600 text-sm mb-2">{transferError}</div>
                        )}

                        {/* product quantities */}
                        <div className="space-y-4 mb-4">
                            {transferItems.map((item) => {
                                const sumBatches = Object.values(item.batchQty).reduce(
                                    (a, b) => a + b,
                                    0,
                                );
                                return (
                                    <div key={item.stock.id} className="border p-2 rounded">
                                        <p className="font-medium text-sm">{item.stock.name}</p>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-xs">Quantity:</label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={item.qty}
                                                onChange={(e) =>
                                                    updateItemQty(
                                                        item.stock.id,
                                                        Number(e.target.value) || 0,
                                                    )
                                                }
                                                className="w-20 px-1 py-0.5 border rounded text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            {Object.entries(item.batchQty).map(([batch_no, qty]) => (
                                                <div key={batch_no} className="flex items-center gap-2">
                                                    <label className="text-xs">{batch_no}:</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={qty}
                                                        onChange={(e) =>
                                                            updateBatchQty(
                                                                item.stock.id,
                                                                batch_no,
                                                                Number(e.target.value) || 0,
                                                            )
                                                        }
                                                        className="w-20 px-1 py-0.5 border rounded text-xs"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {sumBatches !== item.qty && (
                                            <p className="text-red-500 text-xs">
                                                Batches must total {item.qty}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mb-4">
                            <label className="text-xs mb-1 block">Destination Zone</label>
                            <select
                                value={toZoneId}
                                onChange={(e) => setToZoneId(e.target.value)}
                                className="w-full px-2 py-1 border rounded-md text-xs"
                            >
                                <option value="">Select zone...</option>
                                {zonesData?.data?.map((z) => (
                                    <option key={z.id} value={z.id}>
                                        {z.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowBulkModal(false);
                                    setTransferError(null);
                                }}
                                className="px-4 py-2 border rounded-lg text-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={confirmBulkInitiate}
                                disabled={
                                    !toZoneId ||
                                    !transferItems.every(
                                        (i) =>
                                            i.qty > 0 &&
                                            Object.values(i.batchQty).reduce((a, b) => a + b, 0) ===
                                            i.qty,
                                    )
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                                Initiate Transfer
                            </button>
                            <button
                                onClick={confirmBulkCancel}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm"
                            >
                                Cancel Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StockRecordsSection({
    stockLevels,
    transferItems,
    toggleStockSelection,
    openBulkModal,
    isLoading,
    error,
    canManageStock,
    handleInitiateTransfer,
    handleCancelTransfer,
    handleDelete,
}: {
    stockLevels: StockLevelListItem[];
    transferItems: {
        stock: StockLevelListItem;
        qty: number;
        batchQty: Record<string, number>;
    }[];
    toggleStockSelection: (stock: StockLevelListItem) => void;
    openBulkModal: () => void;
    isLoading: boolean;
    error: Error | null;
    canManageStock: boolean;
    handleInitiateTransfer: (stock: StockLevelListItem) => void;
    handleCancelTransfer: (stock: StockLevelListItem) => void;
    handleDelete: (stock: StockLevelListItem) => void;
}) {
    const totalActiveStock = stockLevels.reduce(
        (sum, item) => sum + item.active_stock,
        0,
    );

    const totalExpiredStock = stockLevels.reduce(
        (sum, item) => sum + item.expired_stock,
        0,
    );

    const productsWithExpired = stockLevels.filter(
        (item) => item.expired_stock > 0,
    ).length;

    return (
        <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <SummaryCard title="Total Products" value={stockLevels.length}/>
                <SummaryCard title="Active Stock" value={totalActiveStock}/>
                <SummaryCard title="Expired Stock" value={totalExpiredStock}/>
                <SummaryCard
                    title="Products with Expired"
                    value={productsWithExpired}
                />
            </div>

            {/* Main Content - List */}
            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Table List */}
                <div className="flex-1 bg-white rounded-lg border border-transparent overflow-hidden flex flex-col">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            Loading...
                        </div>
                    ) : error ? (
                        <div className="text-center p-6 text-red-500">
                            Error loading stock levels.
                        </div>
                    ) : (
                        <>
                            {transferItems.length > 0 && (
                                <div className="p-2 bg-gray-100 flex items-center justify-between">
                                    <span className="text-sm">
                                        {transferItems.length} selected
                                    </span>
                                    <button
                                        onClick={openBulkModal}
                                        className="px-3 py-1 bg-accent text-white rounded text-sm"
                                    >
                                        Actions
                                    </button>
                                </div>
                            )}
                            <div className="overflow-auto flex-1">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-transparent sticky top-0">
                                        <tr>
                                            <th className="px-3 py-1 text-left text-xs uppercase">
                                                Select
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs uppercase">
                                                Product
                                            </th>
                                            <th className="px-3 py-1 text-right text-xs uppercase">
                                                Active
                                            </th>
                                            <th className="px-3 py-1 text-right text-xs uppercase">
                                                Expired
                                            </th>
                                            <th className="px-3 py-1 text-right text-xs uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockLevels.map((stock) => {
                                            const isChecked = transferItems.some(
                                                (i) => i.stock.id === stock.id,
                                            );
                                            return (
                                                <tr
                                                    key={stock.id}
                                                    className={`border-transparent hover:bg-slate-50 cursor-pointer transition ${
                                                        isChecked ? "bg-blue-50" : ""
                                                    }`}
                                                    onClick={() => toggleStockSelection(stock)}
                                                >
                                                    <td className="px-2 py-1">
                                                        <input
                                                            type="checkbox"
                                                            name="selectedStock"
                                                            checked={isChecked}
                                                            onChange={() => toggleStockSelection(stock)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1">{stock.name}</td>
                                                    <td className="px-2 py-1 text-right">
                                                        {stock.active_stock.toLocaleString()}
                                                    </td>
                                                    <td className="px-2 py-1 text-right">
                                                        {stock.expired_stock.toLocaleString()}
                                                    </td>
                                                    <td
                                                        className="px-2 py-1 text-right"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ActionMenu menuId={`stock-${stock.id}`}>
                                                            <ActionMenu.Trigger>
                                                                <MdMoreVert className="w-5 h-5 text-slate-500"/>
                                                            </ActionMenu.Trigger>
                                                            <ActionMenu.Content>
                                                                <ActionMenu.Item
                                                                    onClick={() =>
                                                                        (window.location.href = `/depot/stock/${stock.id}`)
                                                                    }
                                                                >
                                                                    <MdVisibility className="w-4 h-4"/>
                                                                    View Details
                                                                </ActionMenu.Item>

                                                                {canManageStock && (
                                                                    <>
                                                                        <ActionMenu.Item
                                                                            onClick={() =>
                                                                                (window.location.href = `/depot/stock/${stock.id}/edit`)
                                                                            }
                                                                        >
                                                                            <MdEdit className="w-4 h-4"/>
                                                                            Edit
                                                                        </ActionMenu.Item>

                                                                        <ActionMenu.Item
                                                                            onClick={() => handleDelete(stock)}
                                                                            className="text-red-600"
                                                                        >
                                                                            <MdDelete className="w-4 h-4"/>
                                                                            Delete
                                                                        </ActionMenu.Item>
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
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

function StockTransfersSection({
    transferType,
    zonesData,
}: {
    transferType: "outgoing" | "incoming";
    zonesData: any;
}) {
    // filter state
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [fromZoneId, setFromZoneId] = useState<string>("");
    const [toZoneId, setToZoneId] = useState<string>("");

    // modal for received quantity
    const [showReceivedQtyModal, setShowReceivedQtyModal] = useState(false);
    const [pendingTransferId, setPendingTransferId] = useState<string | null>(
        null,
    );
    const [pendingTransferQty, setPendingTransferQty] = useState<number | null>(
        null,
    );
    const [showCancelTransferModal, setShowCancelTransferModal] = useState(false);
    const [pendingCancelTransferId, setPendingCancelTransferId] = useState<
        string | null
    >(null);
    const [pendingCancelTransferRef, setPendingCancelTransferRef] =
        useState<string>("");
    const [receivedQty, setReceivedQty] = useState<string>("");
    const [commentText, setCommentText] = useState<string>("");

    // cancel mutation for actions
    const cancelMutation = useCancelStockTransfer();
    const completeMutation = useCompleteStockTransfer();

    const handleCancelClick = (id: string, referenceNumber?: string) => {
        setPendingCancelTransferId(id);
        setPendingCancelTransferRef(referenceNumber || "");
        setShowCancelTransferModal(true);
    };

    const handleCancelConfirm = async () => {
        if (!pendingCancelTransferId) return;

        try {
            await cancelMutation.mutateAsync(pendingCancelTransferId);
            toast.success("Transfer cancelled successfully");
            setShowCancelTransferModal(false);
            setPendingCancelTransferId(null);
            setPendingCancelTransferRef("");
        } catch (err: any) {
            const message =
                err?.response?.data?.message || err?.message || "Failed to cancel transfer";
            toast.error(message);
            throw err;
        }
    };

    const handleCompleteClick = (id: string, qty: number) => {
        setPendingTransferId(id);
        setPendingTransferQty(qty);
        setReceivedQty("");
        setCommentText("");
        setShowReceivedQtyModal(true);
    };

    const handleCompleteSubmit = () => {
        if (!receivedQty || isNaN(Number(receivedQty))) {
            toast.error("Please enter a valid received quantity");
            return;
        }

        if (
            pendingTransferQty !== null &&
            Number(receivedQty) !== pendingTransferQty &&
            commentText.trim() === ""
        ) {
            toast.error("Please provide a reason when received quantity differs");
            return;
        }

        if (pendingTransferId) {
            completeMutation.mutate({
                transferId: pendingTransferId,
                received_quantity: Number(receivedQty),
                ...(commentText.trim() && {notes: commentText.trim()}),
            }, {
                onSuccess: () => {
                    toast.success("Transfer accepted successfully");
                    setShowReceivedQtyModal(false);
                    setPendingTransferId(null);
                    setPendingTransferQty(null);
                    setReceivedQty("");
                    setCommentText("");
                },
                onError: (err: any) => {
                    const message =
                        err?.response?.data?.message || err?.message || "Failed to accept transfer";
                    toast.error(message);
                },
            });
        }
    };

    // build params for request
    const apiParams: import("@/services/stockTransferService").StockTransfersParams =
        {
            direction: transferType,
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
            status: statusFilter || undefined,
            from_zone_id: fromZoneId || undefined,
            to_zone_id: toZoneId || undefined,
        };

    const {data, isLoading, error} = useStockTransfers(apiParams);

    const transfers = data?.data || [];

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "bg-yellow-50 text-yellow-700";
            case "completed":
                return "bg-green-50 text-green-700";
            case "cancelled":
                return "bg-red-50 text-red-700";
            default:
                return "bg-slate-50 text-slate-700";
        }
    };

    return (
        <div className="flex-1 bg-white rounded-lg border border-transparent overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-slate-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <h3 className="font-semibold">
                        {transferType === "outgoing"
                            ? "Outgoing Transfers"
                            : "Incoming Transfers"}
                    </h3>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 p-2">
                        <input
                            type="date"
                            placeholder="From date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="px-2 py-1 text-xs border rounded"
                        />
                        <input
                            type="date"
                            placeholder="To date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="px-2 py-1 text-xs border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-2 py-1 text-xs border rounded"
                        />
                        <select
                            value={fromZoneId}
                            onChange={(e) => setFromZoneId(e.target.value)}
                            className="px-2 py-1 text-xs border rounded"
                        >
                            <option value="">From Zone</option>
                            {zonesData?.data?.map((zone: any) => (
                                <option key={zone.id} value={zone.id}>
                                    {zone.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={toZoneId}
                            onChange={(e) => setToZoneId(e.target.value)}
                            className="px-2 py-1 text-xs border rounded"
                        >
                            <option value="">To Zone</option>
                            {zonesData?.data?.map((zone: any) => (
                                <option key={zone.id} value={zone.id}>
                                    {zone.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-transparent sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs uppercase">
                                Reference
                            </th>
                            <th className="px-4 py-2 text-left text-xs uppercase">Product</th>
                            {transferType !== "outgoing" && (
                                <th className="px-4 py-2 text-left text-xs uppercase">From</th>
                            )}
                            {transferType !== "incoming" && (
                                <th className="px-4 py-2 text-left text-xs uppercase">To</th>
                            )}
                            <th className="px-4 py-2 text-right text-xs uppercase">Qty</th>
                            <th className="px-4 py-2 text-right text-xs uppercase">
                                Received
                            </th>
                            <th className="px-4 py-2 text-left text-xs uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs uppercase">
                                Created By
                            </th>
                            <th className="px-4 py-2 text-left text-xs uppercase">Date</th>
                            {(transferType === "outgoing" || transferType === "incoming") && (
                                <th className="px-4 py-2 text-center text-xs uppercase">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-red-500">
                                    Error loading transfers.
                                </td>
                            </tr>
                        ) : transfers.length === 0 ? (
                            <tr className="border-b hover:bg-slate-50">
                                <td
                                    colSpan={9}
                                    className="px-4 py-8 text-center text-slate-500"
                                >
                                    No transfers found.
                                </td>
                            </tr>
                        ) : (
                            transfers.map((t: any) => (
                                <tr key={t.id} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-2 text-xs font-medium">
                                        {t.reference_number}
                                    </td>
                                    <td className="px-4 py-2 text-xs">
                                        {t.product?.name || "-"}
                                    </td>
                                    {transferType !== "outgoing" && (
                                        <td className="px-4 py-2 text-xs">
                                            {t.from_zone?.name || "-"}
                                        </td>
                                    )}
                                    {transferType !== "incoming" && (
                                        <td className="px-4 py-2 text-xs">
                                            {t.to_zone?.name || "-"}
                                        </td>
                                    )}
                                    <td className="px-4 py-2 text-right text-xs">{t.quantity}</td>
                                    <td className="px-4 py-2 text-right text-xs">
                                        {t.received_quantity ?? "-"}
                                    </td>
                                    <td className="px-4 py-2 text-xs">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(t.status)}`}
                                        >
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-xs">
                                        {t.created_by?.name || "-"}
                                    </td>
                                    <td className="px-4 py-2 text-xs">
                                        {t.created_at
                                            ? new Date(t.created_at).toLocaleDateString()
                                            : "-"}
                                    </td>
                                    {(transferType === "outgoing" ||
                                        transferType === "incoming") && (
                                        <td className="px-4 py-2 text-center text-xs">
                                            {transferType === "outgoing" &&
                                                t.status === "pending" && (
                                                    <button
                                                        className="text-red-600 text-xs border border-red-600 rounded px-1"
                                                        onClick={() =>
                                                            handleCancelClick(t.id, t.reference_number)
                                                        }
                                                    >
                                                        Cancel Transfer
                                                    </button>
                                                )}
                                            {transferType === "incoming" &&
                                                t.status === "pending" && (
                                                    <button
                                                        className="text-white text-xs border border-green-900 rounded px-1 bg-green-900"
                                                        onClick={() =>
                                                            handleCompleteClick(t.id, t.quantity)
                                                        }
                                                    >
                                                        Accept Transfer
                                                    </button>
                                                )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Received Quantity Modal */}
            {showReceivedQtyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Accept Transfer</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Please enter the received quantity for this transfer.
                        </p>
                        <input
                            type="number"
                            placeholder="Received Quantity"
                            value={receivedQty}
                            onChange={(e) => setReceivedQty(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm mb-4"
                            min="0"
                        />
                        {pendingTransferQty !== null &&
                            receivedQty !== "" &&
                            Number(receivedQty) !== pendingTransferQty && (
                                <textarea
                                    placeholder="Reason for discrepancy"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm mb-4"
                                    rows={3}
                                />
                            )}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowReceivedQtyModal(false);
                                    setPendingTransferId(null);
                                    setReceivedQty("");
                                }}
                                className="px-4 py-2 border rounded-lg text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCompleteSubmit}
                                className="px-4 py-2 bg-green-900 text-white rounded-lg text-sm"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Transfer Modal */}
            {showCancelTransferModal && pendingCancelTransferId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <DeleteConfirmationModal
                            itemName={pendingCancelTransferRef || "this transfer"}
                            itemType="transfer"
                            onConfirm={handleCancelConfirm}
                            isDeleting={cancelMutation.isPending}
                            onCloseModal={() => {
                                setShowCancelTransferModal(false);
                                setPendingCancelTransferId(null);
                                setPendingCancelTransferRef("");
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="border-b pb-2">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}

function SummaryCard({title, value}: { title: string; value: number }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-2 text-xs">
            <p className="text-xs text-slate-400">{title}</p>
            <p className="text-sm font-semibold">{value.toLocaleString()}</p>
        </div>
    );
}