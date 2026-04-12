"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdAdd, MdSearch, MdInventory } from "react-icons/md";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Tooltip from "@/components/common/Tooltip";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Button from "@/components/common/Button";
import PageHeader from "@/components/common/PageHeader";
import { useProducts, useDeleteProduct } from "@/hooks/useProduct";
import type { Product } from "@/types/product";

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data, isLoading, error } = useProducts({
    page,
    search: search || undefined,
    is_active: statusFilter || undefined,
    sort_by: "name",
    sort_order: "asc",
  });
  const deleteProduct = useDeleteProduct();

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Modal>
      <div className="min-h-screen p-4 space-y-4">
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <MdInventory className="w-5 h-5 text-emerald-600" />
              <div>
                <h1 className="text-base md:text-lg font-semibold text-slate-900">
                  Products
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 hidden md:block">
                  Manage your product catalog
                </p>
              </div>
            </div>
          }
          search={
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          }
          action={
            <Button type="small" to="/products/new" className="flex items-center gap-1">
              <MdAdd className="w-4 h-4" />
              Add Product
            </Button>
          }
        />

        <div className="flex gap-2 items-center">
          <div className="w-40">
            <SearchableSelect
              label=""
              options={[
                { value: "", label: "All Status" },
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              placeholder="Filter by status"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            Failed to load products. Please try again later.
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MdInventory className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first product.
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/products/${product.id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            product.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(product.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Tooltip content="View product details">
                            <button
                              onClick={() => router.push(`/products/${product.id}`)}
                              className="p-1.5 text-primary/70 bg-primary/5 hover:text-primary hover:bg-primary/15 rounded-lg transition-all"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit product">
                            <button
                              onClick={() => router.push(`/products/${product.id}/edit`)}
                              className="p-1.5 text-blue-500/70 bg-blue-50 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                          </Tooltip>
                          <Modal.Open opens="delete-product">
                            <Tooltip content="Delete product">
                              <button
                                onClick={() => setSelectedProduct(product)}
                                className="p-1.5 text-red-400/70 bg-red-50 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                              >
                                <FiTrash className="h-4 w-4" />
                              </button>
                            </Tooltip>
                          </Modal.Open>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.total_pages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {pagination.current_page} of {pagination.total_pages} (
                  {pagination.total_items} items)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.current_page <= 1}
                    className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.next_page}
                    className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal.Window name="delete-product">
        {selectedProduct ? (
          <DeleteConfirmationModal
            itemName={selectedProduct.name}
            itemType="Product"
            onConfirm={() => deleteProduct.mutateAsync(selectedProduct.id)}
            isDeleting={deleteProduct.isPending}
          />
        ) : (
          <div />
        )}
      </Modal.Window>
    </Modal>
  );
}
