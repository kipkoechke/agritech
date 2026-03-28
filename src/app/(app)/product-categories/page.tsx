"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MdAdd,
  MdCategory,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdMoreVert,
} from "react-icons/md";
import {
  useProductCategories,
  usePrefetchProductCategories,
  useDeleteProductCategory,
} from "@/hooks/useProductCategory";
import Pagination from "@/components/common/Pagination";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

export default function ProductCategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const perPage = 15;

  const prefetchCategories = usePrefetchProductCategories();
  const deleteMutation = useDeleteProductCategory();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useProductCategories({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  // Prefetch next page
  useEffect(() => {
    if (data?.pagination && page < data.pagination.last_page) {
      prefetchCategories({
        page: page + 1,
        per_page: perPage,
        search: debouncedSearch || undefined,
      });
    }
  }, [data, page, perPage, debouncedSearch, prefetchCategories]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-3 md:px-8 py-2 pb-20 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary">
                <MdCategory className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                  Product Categories
                </h1>
                <p className="text-xs md:text-sm text-gray-600 mt-0.5 hidden md:block">
                  Organize your products into categories
                </p>
              </div>
            </div>
            {/* Mobile New Button */}
            <Link
              href="/product-categories/new"
              className="md:hidden flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-xs"
            >
              <MdAdd className="w-4 h-4" />
              New
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search categories..."
            />
            <Link
              href="/product-categories/new"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <MdAdd className="w-5 h-5" />
              New Category
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading categories...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load categories</p>
          </div>
        )}

        {/* Categories Table */}
        {data && data.data.length > 0 && (
          <Modal>
            <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
              {/* Mobile Card View */}
              <div className="md:hidden overflow-y-auto flex-1 p-3 space-y-2">
                {data.data.map((category) => (
                  <div
                    key={category.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/product-categories/${category.id}`}
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        {category.name}
                      </Link>
                      <Link
                        href={`/product-categories/${category.id}`}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <MdVisibility className="w-4 h-4" />
                      </Link>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {category.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400 text-[10px]">
                          Storage
                        </span>
                        <p className="text-gray-900">
                          {category.metadata?.storage_requirements
                            ?.temperature ||
                            category.metadata?.storage_temperature ||
                            "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px]">
                          Shelf Life
                        </span>
                        <p className="text-gray-900">
                          {category.metadata?.storage_requirements
                            ?.shelf_life_days ||
                          category.metadata?.shelf_life_days
                            ? `${category.metadata?.storage_requirements?.shelf_life_days || category.metadata?.shelf_life_days} days`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-y-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Storage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shelf Life
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sticky right-0 bg-gray-50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/product-categories/${category.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {category.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 truncate max-w-[250px]">
                            {category.description || "No description"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {category.metadata?.storage_requirements
                              ?.temperature ||
                              category.metadata?.storage_temperature ||
                              "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {category.metadata?.storage_requirements
                              ?.shelf_life_days ||
                            category.metadata?.shelf_life_days
                              ? `${category.metadata?.storage_requirements?.shelf_life_days || category.metadata?.shelf_life_days} days`
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                          <ActionMenu menuId={`category-menu-${category.id}`}>
                            <ActionMenu.Trigger>
                              <MdMoreVert className="w-5 h-5 text-gray-600" />
                            </ActionMenu.Trigger>
                            <ActionMenu.Content>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/product-categories/${category.id}`)
                                }
                              >
                                <MdVisibility className="w-4 h-4" />
                                View Details
                              </ActionMenu.Item>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/product-categories/${category.id}/edit`)
                                }
                              >
                                <MdEdit className="w-4 h-4" />
                                Edit
                              </ActionMenu.Item>
                              <Modal.Open
                                opens={`delete-category-${category.id}`}
                              >
                                <ActionMenu.Item className="text-red-600 hover:bg-red-50">
                                  <MdDelete className="w-4 h-4" />
                                  Delete
                                </ActionMenu.Item>
                              </Modal.Open>
                            </ActionMenu.Content>
                          </ActionMenu>

                          <Modal.Window name={`delete-category-${category.id}`}>
                            <DeleteConfirmationModal
                              itemName={category.name}
                              itemType="category"
                              onConfirm={() =>
                                deleteMutation.mutate(category.id)
                              }
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
            <MdCategory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first category.
            </p>
            <Link
              href="/product-categories/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <MdAdd className="w-5 h-5" />
              New Category
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
