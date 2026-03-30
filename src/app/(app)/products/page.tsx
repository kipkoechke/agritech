"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { laravelLoader } from "@/lib/imageLoader";
import {
  MdAdd,
  MdInventory,
  MdCategory,
  MdCheckCircle,
  MdCancel,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdMoreVert,
  MdFilterList,
} from "react-icons/md";
import {
  useProducts,
  usePrefetchProducts,
  useDeleteProduct,
  productQueryKeys,
} from "@/hooks/useProduct";
import { useProductCategories } from "@/hooks/useProductCategory";
import Pagination from "@/components/common/Pagination";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  image?: string;
  unit_of_measure?: string;
  is_active: boolean;
  category?: {
    id: string;
    name: string;
  };
}

interface ProductsResponse {
  data: Product[];
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const perPage = 15;

  const prefetchProducts = usePrefetchProducts(queryClient);
  const deleteMutation = useDeleteProduct();

  // Fetch categories for filter
  const { data: categoriesData } = useProductCategories({ per_page: 100 });

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...(categoriesData?.data?.map((cat: any) => ({
      value: String(cat.id),
      label: cat.name,
    })) || []),
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: productsData, isLoading, error } = useProducts({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    category_id: categoryFilter || undefined,
  });

  // Cast the response to our expected type
  const products = productsData as ProductsResponse | undefined;

useEffect(() => {
  if (products?.pagination && page < products.pagination.last_page) {
    prefetchProducts();
  }
}, [products, page, prefetchProducts]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `KES ${numPrice.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
  };

  // Prefetch product details on hover
  const handleProductHover = (productId: string) => {
    queryClient.prefetchQuery({
      queryKey: productQueryKeys.detail(productId),
      queryFn: () => import("@/services/productService").then(module => module.getProduct(productId)),
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-3 md:px-8 py-2 pb-20 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary">
                <MdInventory className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                  Products
                </h1>
                <p className="text-xs md:text-sm text-gray-600 mt-0.5 hidden md:block">
                  Manage your product catalog
                </p>
              </div>
            </div>
            {/* Mobile Buttons */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                href="/product-categories"
                className="flex items-center gap-1 p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <MdCategory className="w-4 h-4" />
              </Link>
              <Link
                href="/products/new"
                className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-xs"
              >
                <MdAdd className="w-4 h-4" />
                New
              </Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search products..."
            />
            {/* Mobile Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className={`md:hidden px-3 py-2 bg-white border rounded-lg text-sm ${categoryFilter ? "border-accent text-accent" : "border-gray-200 text-gray-700"}`}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Link
              href="/product-categories"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm border border-gray-200"
            >
              <MdCategory className="w-5 h-5" />
              Categories
            </Link>
            <Link
              href="/products/new"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <MdAdd className="w-5 h-5" />
              New Product
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load products. Please try again later.</p>
          </div>
        )}

        {/* Products Table */}
        {products && products.data && products.data.length > 0 && (
          <Modal>
            <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
              {/* Mobile Card View */}
              <div className="md:hidden overflow-y-auto flex-1 p-3 space-y-2">
                {products.data.map((product: Product) => (
                  <div
                    key={product.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                    onMouseEnter={() => handleProductHover(product.id)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {product.image ? (
                          <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 border border-gray-200">
                            <Image
                              loader={laravelLoader}
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center shrink-0">
                            <MdInventory className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/products/${product.id}`}
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            {product.name}
                          </Link>
                          {product.unit_of_measure && (
                            <p className="text-xs text-gray-500">
                              per {product.unit_of_measure}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.is_active ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                        <Link
                          href={`/products/${product.id}`}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                    {/* Row 1: SKU, Category, Price */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400 text-[10px]">SKU</span>
                        <p className="font-bold text-gray-900">{product.sku}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-400 text-[10px]">
                          Category
                        </span>
                        <p className="text-gray-600">
                          {product.category?.name || "Uncategorized"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px]">Price</span>
                        <p className="font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="overflow-y-auto flex-1 hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 pl-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div
                          className="relative inline-block"
                          ref={categoryDropdownRef}
                        >
                          <button
                            onClick={() =>
                              setShowCategoryDropdown(!showCategoryDropdown)
                            }
                            className={`flex items-center gap-1 hover:text-gray-700 transition-colors ${
                              categoryFilter ? "text-accent" : ""
                            }`}
                          >
                            Category
                            <MdFilterList
                              className={`w-4 h-4 ${categoryFilter ? "text-accent" : ""}`}
                            />
                          </button>
                          {showCategoryDropdown && (
                            <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                              {categoryOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setCategoryFilter(option.value);
                                    setShowCategoryDropdown(false);
                                    setPage(1);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                                    categoryFilter === option.value
                                      ? "bg-accent/10 text-accent font-medium"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sticky right-0 bg-gray-50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.data.map((product: Product) => (
                      <tr 
                        key={product.id} 
                        className="hover:bg-gray-50"
                        onMouseEnter={() => handleProductHover(product.id)}
                      >
                        <td className="px-2 pl-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {product.image ? (
                              <div className="relative w-9 h-9 rounded-md overflow-hidden shrink-0 border border-gray-200">
                                <Image
                                  loader={laravelLoader}
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                                <MdInventory className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <Link
                                href={`/products/${product.id}`}
                                className="text-sm font-bold text-primary hover:underline"
                              >
                                {product.name}
                              </Link>
                              {product.unit_of_measure && (
                                <span className="text-xs text-gray-500">
                                  per {product.unit_of_measure}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-600">
                            {product.sku}
                          </span>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <MdCategory className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {product.category?.name || "Uncategorized"}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          {product.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <MdCheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <MdCancel className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                          <ActionMenu menuId={`product-menu-${product.id}`}>
                            <ActionMenu.Trigger>
                              <MdMoreVert className="w-5 h-5 text-gray-600" />
                            </ActionMenu.Trigger>
                            <ActionMenu.Content>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/products/${product.id}`)
                                }
                              >
                                <MdVisibility className="w-4 h-4" />
                                View Details
                              </ActionMenu.Item>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/products/${product.id}/edit`)
                                }
                              >
                                <MdEdit className="w-4 h-4" />
                                Edit
                              </ActionMenu.Item>
                              <ActionMenu.Item
                                onClick={() =>
                                  (window.location.href = `/products/${product.id}/price-history`)
                                }
                              >
                                <MdInventory className="w-4 h-4" />
                                Price History
                              </ActionMenu.Item>
                              <Modal.Open
                                opens={`delete-product-${product.id}`}
                              >
                                <ActionMenu.Item className="text-red-600 hover:bg-red-50">
                                  <MdDelete className="w-4 h-4" />
                                  Delete
                                </ActionMenu.Item>
                              </Modal.Open>
                            </ActionMenu.Content>
                          </ActionMenu>

                          <Modal.Window name={`delete-product-${product.id}`}>
                            <DeleteConfirmationModal
                              itemName={product.name}
                              itemType="product"
                              onConfirm={() =>
                                deleteMutation.mutate(product.id)
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

              {products.pagination && products.pagination.total > 0 && (
                <Pagination
                  currentPage={products.pagination.current_page}
                  totalPages={products.pagination.last_page}
                  onPageChange={handlePageChange}
                  totalItems={products.pagination.total}
                  itemsPerPage={products.pagination.per_page}
                />
              )}
            </div>
          </Modal>
        )}

        {/* Empty State */}
        {products && products.data && products.data.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MdInventory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first product.
            </p>
            <Link
              href="/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <MdAdd className="w-5 h-5" />
              New Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}