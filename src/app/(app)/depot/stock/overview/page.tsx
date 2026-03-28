"use client";

import Link from "next/link";
import {
  MdWarehouse,
  MdAdd,
  MdSwapHoriz,
  MdCallMade,
  MdCallReceived,
  MdInventory,
  MdTrendingUp,
  MdTrendingDown,
  MdPending,
} from "react-icons/md";

import { useStockLevels } from "@/hooks/useStockLevel";
import { useStockTransfers } from "@/hooks/useStockTransfers";
import { useStockRequests } from "@/hooks/useStockRequest";
import { useCanManageStock } from "@/hooks/useAuth";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";

export default function StockOverviewPage() {
  const canManageStock = useCanManageStock();

  // Fetch data for statistics
  const { data: stockData } = useStockLevels({ per_page: 100 });
  const { data: transfersData } = useStockTransfers({ per_page: 100 });
  const { data: requestsData } = useStockRequests({ per_page: 100 });

  // Calculate statistics
  const stockStats = stockData?.data || [];
  const totalProducts = stockStats.length;
  const activeStock = stockStats.reduce((sum, item) => sum + item.active_stock, 0);
  const expiredStock = stockStats.reduce((sum, item) => sum + item.expired_stock, 0);
  const lowStockItems = stockStats.filter(item => item.active_stock <= 10).length;

  const transfers = transfersData?.data || [];
  const pendingTransfers = transfers.filter((t: any) => t.status === "pending").length;
  const completedTransfers = transfers.filter((t: any) => t.status === "completed").length;

  const requests = requestsData?.data || [];
  const pendingRequests = requests.filter((r: any) => r.status === "pending").length;
  const approvedRequests = requests.filter((r: any) => r.status === "approved").length;

  if (!canManageStock) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to manage stock.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Depot Stock Management"
        description="Complete overview of your depot's stock operations"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/depot/stock/requests/new"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Request Stock</h3>
              <p className="text-green-100 font-medium">Request stock from other depots</p>
            </div>
            <MdCallMade className="w-8 h-8 text-green-100" />
          </div>
        </Link>

        <Link
          href="/depot/stock/new"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Add Stock</h3>
              <p className="text-blue-100 font-medium">Add new stock to inventory</p>
            </div>
            <MdAdd className="w-8 h-8 text-blue-100" />
          </div>
        </Link>

        <Link
          href="/depot/stock/transfers/outgoing"
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Transfer Stock</h3>
              <p className="text-purple-100 font-medium">Transfer stock to other depots</p>
            </div>
            <MdSwapHoriz className="w-8 h-8 text-purple-100" />
          </div>
        </Link>
      </div>

      {/* Stock Statistics */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Stock Inventory Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            mainValue={totalProducts.toString()}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <MdInventory className="w-4 h-4 text-blue-600" />
            </div>
          </StatCard>
          <StatCard
            title="Active Stock"
            mainValue={activeStock.toString()}
          >
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <MdTrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </StatCard>
          <StatCard
            title="Expired Stock"
            mainValue={expiredStock.toString()}
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <MdTrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </StatCard>
          <StatCard
            title="Low Stock Items"
            mainValue={lowStockItems.toString()}
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
              <MdWarehouse className="w-4 h-4 text-yellow-600" />
            </div>
          </StatCard>
        </div>
      </div>

      {/* Transfer & Request Statistics */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Transfers & Requests</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pending Transfers"
            mainValue={pendingTransfers.toString()}
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
              <MdSwapHoriz className="w-4 h-4 text-yellow-600" />
            </div>
          </StatCard>
          <StatCard
            title="Completed Transfers"
            mainValue={completedTransfers.toString()}
          >
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <MdCallReceived className="w-4 h-4 text-green-600" />
            </div>
          </StatCard>
          <StatCard
            title="Pending Requests"
            mainValue={pendingRequests.toString()}
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
              <MdPending className="w-4 h-4 text-yellow-600" />
            </div>
          </StatCard>
          <StatCard
            title="Approved Requests"
            mainValue={approvedRequests.toString()}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <MdCallMade className="w-4 h-4 text-blue-600" />
            </div>
          </StatCard>
        </div>
      </div>

      {/* Navigation Grid */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Stock Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/depot/stock"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <MdWarehouse className="w-8 h-8 text-blue-600 mr-3" />
              <h4 className="text-lg font-bold text-gray-900">Stock Inventory</h4>
            </div>
            <p className="text-gray-700 font-medium">View and manage your current stock levels, batches, and product inventory.</p>
          </Link>

          <Link
            href="/depot/stock/requests"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <MdCallMade className="w-8 h-8 text-green-600 mr-3" />
              <h4 className="text-lg font-bold text-gray-900">Stock Requests</h4>
            </div>
            <p className="text-gray-700 font-medium">Create, approve, and manage stock requests between depots.</p>
          </Link>

          <Link
            href="/depot/stock/transfers/outgoing"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <MdSwapHoriz className="w-8 h-8 text-purple-600 mr-3" />
              <h4 className="text-lg font-bold text-gray-900">Stock Transfers</h4>
            </div>
            <p className="text-gray-700 font-medium">Initiate and track stock transfers between different depot zones.</p>
          </Link>

          <Link
            href="/depot/stock/transfers/incoming"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <MdCallReceived className="w-8 h-8 text-indigo-600 mr-3" />
              <h4 className="text-lg font-bold text-gray-900">Incoming Transfers</h4>
            </div>
            <p className="text-gray-700 font-medium">Receive and confirm incoming stock transfers from other depots.</p>
          </Link>

          <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex items-center mb-4">
              <MdAdd className="w-8 h-8 text-gray-400 mr-3" />
              <h4 className="text-lg font-bold text-gray-500">More Features</h4>
            </div>
            <p className="text-gray-600 font-medium">Additional stock management features will be available soon.</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h3>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Stock Actions</h4>
              <div className="space-y-2">
                <Link
                  href="/depot/stock/new"
                  className="block text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                  → Add new stock entry
                </Link>
                <Link
                  href="/depot/stock"
                  className="block text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                  → View stock inventory
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">Request Stock</h4>
              <div className="space-y-2">
                <Link
                  href="/depot/stock/requests/new"
                  className="block text-sm text-green-700 hover:text-green-800 font-medium"
                >
                  → Create new request
                </Link>
                <Link
                  href="/depot/stock/requests"
                  className="block text-sm text-green-700 hover:text-green-800 font-medium"
                >
                  → Manage requests
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">Transfers</h4>
              <div className="space-y-2">
                <Link
                  href="/depot/stock/transfers/outgoing"
                  className="block text-sm text-purple-700 hover:text-purple-800 font-medium"
                >
                  → Outgoing transfers
                </Link>
                <Link
                  href="/depot/stock/transfers/incoming"
                  className="block text-sm text-purple-700 hover:text-purple-800 font-medium"
                >
                  → Incoming transfers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
