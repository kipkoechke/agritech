"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MdInventory,
  MdFilterList,
  MdShoppingCart,
  MdAdd,
  MdRemove,
} from "react-icons/md";
import { useProducts, usePrefetchProducts } from "@/hooks/useProduct";
import { useProductCategories } from "@/hooks/useProductCategory";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addToCart,
  selectCartItemCount,
  selectCartItems,
  initializeCart,
} from "@/store/slices/cartSlice";
import toast from "react-hot-toast";

import { Product, PurchaseVolume } from "@/types/product";

export default function SalesPersonProductsPage() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartItemCount = useAppSelector(selectCartItemCount);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const perPage = 12;

  const prefetchProducts = usePrefetchProducts();

  // Initialize cart from localStorage
  useEffect(() => {
    dispatch(initializeCart());
  }, [dispatch]);

  // Fetch categories for filter
  const { data: categoriesData } = useProductCategories({ per_page: 100 });

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...(categoriesData?.data?.map((cat) => ({
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

  const { data, isLoading, error } = useProducts({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    category_id: categoryFilter || undefined,
  });

  // Prefetch next page
  useEffect(() => {
    if (data?.pagination && page < data.pagination.last_page) {
      prefetchProducts({
        page: page + 1,
        per_page: perPage,
        search: debouncedSearch || undefined,
        category_id: categoryFilter || undefined,
      });
    }
  }, [data, page, perPage, debouncedSearch, categoryFilter, prefetchProducts]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `KES ${numPrice.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
  };

  const getQuantity = (productId: string) => {
    return quantities[productId] ?? 1;
  };

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const setQuantity = (productId: string, value: string) => {
    // Allow empty string for typing, but store as number or empty
    if (value === "") {
      setQuantities((prev) => ({
        ...prev,
        [productId]: 0, // Temporarily store 0 for empty input
      }));
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setQuantities((prev) => ({
          ...prev,
          [productId]: numValue,
        }));
      }
    }
  };

  const handleQuantityBlur = (productId: string) => {
    // Enforce minimum of 1 when user leaves the field
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, prev[productId] || 1),
    }));
  };

  const handleAddToCart = (product: Product) => {
    const qty = Math.max(1, getQuantity(product.id) || 1);
    dispatch(
      addToCart({
        product_id: product.id,
        product_name: product.name,
        qty,
        unit_price: parseFloat(product.price),
        category: product.category?.name,
        purchase_volumes: product.purchase_volumes,
      }),
    );
    toast.success(`Added ${qty} x ${product.name} to cart`);
    // Reset quantity after adding
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const getCartQtyForProduct = (productId: string) => {
    const item = cartItems.find((item) => item.product_id === productId);
    return item?.qty || 0;
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary">
              <MdInventory className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Products
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 hidden md:block">
                Browse products and add to cart
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search products..."
            />
            <div className="flex items-center gap-2">
              {/* Category Filter */}
              <div
                className="relative flex-1 sm:flex-none"
                ref={categoryDropdownRef}
              >
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm ${
                    categoryFilter
                      ? "border-accent text-accent"
                      : "border-gray-200 text-gray-700"
                  }`}
                >
                  <MdFilterList className="w-5 h-5" />
                  <span className="truncate max-w-25 sm:max-w-none">
                    {categoryFilter
                      ? categoryOptions.find((o) => o.value === categoryFilter)
                          ?.label || "Category"
                      : "Category"}
                  </span>
                </button>
                {showCategoryDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
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
              {/* Cart Button */}
              <Link
                href="/sales-person/cart"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm relative"
              >
                <MdShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load products</p>
          </div>
        )}

        {/* Products Grid */}
        {data && data.data.length > 0 && (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {data.data.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 flex flex-col hover:shadow-md transition-shadow"
                  >
                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1 md:mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm md:text-base">
                          {product.name}
                        </h3>
                        {!product.is_active && (
                          <span className="shrink-0 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] md:text-xs">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 hidden md:block">
                        SKU: {product.sku}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-500 mb-2 md:mb-3">
                        {product.category?.name || "Uncategorized"}
                      </p>
                      <p className="text-base md:text-lg font-bold text-primary mb-2 md:mb-3">
                        {formatPrice(product.price)}
                      </p>
                      {getCartQtyForProduct(product.id) > 0 && (
                        <p className="text-[10px] md:text-xs text-accent mb-1 md:mb-2">
                          {getCartQtyForProduct(product.id)} in cart
                        </p>
                      )}
                    </div>

                    {/* Quantity & Add to Cart */}
                    <div className="pt-0 space-y-1.5 md:space-y-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 transition-colors shrink-0"
                          disabled={!product.is_active}
                        >
                          <MdRemove className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={
                            getQuantity(product.id) === 0
                              ? ""
                              : getQuantity(product.id)
                          }
                          onChange={(e) =>
                            setQuantity(product.id, e.target.value)
                          }
                          onBlur={() => handleQuantityBlur(product.id)}
                          className="flex-1 min-w-0 h-7 md:h-8 text-center border-2 border-gray-800 rounded text-sm md:text-base font-bold text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary bg-white shadow-inner"
                          disabled={!product.is_active}
                        />
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded bg-green-500 hover:bg-green-600 transition-colors shrink-0"
                          disabled={!product.is_active}
                        >
                          <MdAdd className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.is_active}
                        className="w-full py-1.5 md:py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MdShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {data.pagination && data.pagination.total > 0 && (
              <div className="mt-4 bg-white rounded-lg shadow">
                <Pagination
                  currentPage={data.pagination.current_page}
                  totalPages={data.pagination.last_page}
                  onPageChange={handlePageChange}
                  totalItems={data.pagination.total}
                  itemsPerPage={data.pagination.per_page}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {data && data.data.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MdInventory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              {debouncedSearch || categoryFilter
                ? "Try adjusting your search or filters"
                : "No products available at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
