"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  MdArrowBack,
  MdStore,
  MdSave,
  MdAdd,
  MdDelete,
} from "react-icons/md";
import {
  useMTCustomer,
  useMTCustomerPrices,
  useSetMTCustomerPrices,
} from "@/hooks/useMTCustomer";
import { useProducts } from "@/hooks/useProduct";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { toast } from "react-hot-toast";

interface PriceRow {
  product_id: string;
  price: string;
}

interface MTCustomerPricesPageProps {
  params: Promise<{ id: string }>;
}

export default function MTCustomerPricesPage({
  params,
}: MTCustomerPricesPageProps) {
  const { id } = use(params);

  const { data: customer, isLoading: customerLoading } = useMTCustomer(id);
  const {
    data: existingPrices,
    isLoading: pricesLoading,
  } = useMTCustomerPrices(id);
  const { data: productsData, isLoading: productsLoading } = useProducts({
    per_page: 100,
  });
  const setMTCustomerPricesMutation = useSetMTCustomerPrices();

  const [priceRows, setPriceRows] = useState<PriceRow[]>([
    { product_id: "", price: "" },
  ]);
  const [initialized, setInitialized] = useState(false);

  // Initialize price rows from existing prices once loaded
  if (existingPrices && !initialized && existingPrices.length > 0) {
    setPriceRows(
      existingPrices.map((p) => ({
        product_id: p.product_id,
        price: String(p.price),
      })),
    );
    setInitialized(true);
  }

  const productOptions =
    productsData?.data.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.sku}) - KES ${p.price}`,
    })) || [];

  // Get available product options for a specific row (excluding already selected products)
  const getAvailableProductOptions = (currentRowIndex: number) => {
    const selectedProductIds = priceRows
      .map((row, index) => (index !== currentRowIndex ? row.product_id : null))
      .filter((id) => id !== null && id !== "");

    return productOptions.filter(
      (option) => !selectedProductIds.includes(option.value)
    );
  };

  const handleAddRow = () => {
    setPriceRows([...priceRows, { product_id: "", price: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    if (priceRows.length === 1) return;
    setPriceRows(priceRows.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, value: string) => {
    const updated = [...priceRows];
    updated[index].product_id = value;

    // Auto-populate price with product's default price
    if (value && productsData?.data) {
      const selectedProduct = productsData.data.find((p) => p.id === value);
      if (selectedProduct && selectedProduct.price) {
        updated[index].price = String(selectedProduct.price);
      }
    }

    setPriceRows(updated);
  };

  const handlePriceChange = (index: number, value: string) => {
    const updated = [...priceRows];
    updated[index].price = value;
    setPriceRows(updated);
  };

  const handleSubmit = () => {
    // Validate
    const validRows = priceRows.filter(
      (row) => row.product_id && row.price && parseFloat(row.price) > 0,
    );

    if (validRows.length === 0) {
      toast.error("Please add at least one product with a valid price");
      return;
    }

    // Check for duplicate products
    const productIds = validRows.map((r) => r.product_id);
    const hasDuplicates = new Set(productIds).size !== productIds.length;
    if (hasDuplicates) {
      toast.error("Duplicate products found. Each product should be listed once.");
      return;
    }

    setMTCustomerPricesMutation.mutate({
      customerId: id,
      data: {
        products: validRows.map((row) => ({
          product_id: row.product_id,
          price: parseFloat(row.price),
        })),
      },
    });
  };

  const isLoading = customerLoading || pricesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 md:mb-6 shrink-0">
          <div className="flex items-start gap-3">
            <Link
              href={`/modern-trade/${id}`}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <MdStore className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Product Prices
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {customer?.name} — Set custom product prices
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-13 md:ml-0">
            <button
              onClick={handleSubmit}
              disabled={setMTCustomerPricesMutation.isPending}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdSave className="w-4 h-4" />
              {setMTCustomerPricesMutation.isPending
                ? "Saving..."
                : "Save Prices"}
            </button>
          </div>
        </div>

        {/* Price Rows */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">
                Product Prices ({priceRows.length})
              </h3>
              <button
                onClick={handleAddRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/5 rounded-lg transition-colors"
              >
                <MdAdd className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 mb-2 px-1">
              <div className="col-span-1 text-xs font-medium text-gray-500 uppercase">
                #
              </div>
              <div className="col-span-6 text-xs font-medium text-gray-500 uppercase">
                Product
              </div>
              <div className="col-span-4 text-xs font-medium text-gray-500 uppercase">
                Price (KES)
              </div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-3">
              {priceRows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-3 md:p-1 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none border md:border-0 border-gray-100"
                >
                  <div className="hidden md:flex col-span-1 items-center h-10 text-sm text-gray-500 font-medium">
                    {index + 1}
                  </div>
                  <div className="col-span-1 md:col-span-6">
                    <SearchableSelect
                      label=""
                      options={getAvailableProductOptions(index)}
                      value={row.product_id}
                      onChange={(value) => handleProductChange(index, value)}
                      placeholder="Select product..."
                      disabled={productsLoading}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-4">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.price}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      placeholder="Enter price"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all hover:border-gray-400"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-end md:justify-center h-10">
                    <button
                      onClick={() => handleRemoveRow(index)}
                      disabled={priceRows.length === 1}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <MdDelete className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Existing Prices Reference */}
            {existingPrices && existingPrices.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-medium text-gray-400 uppercase mb-3">
                  Existing Prices for Customer
                </h4>
                <div className="space-y-1.5">
                  {existingPrices.map((price) => (
                    <div
                      key={price.product_id}
                      className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-gray-50"
                    >
                      <span className="text-gray-700">
                        {price.product_name || price.product?.name || price.product_id}
                        {price.product?.sku && (
                          <span className="text-gray-400 ml-1">
                            ({price.product.sku})
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-gray-900">
                        KES {typeof price.price === 'string' ? parseFloat(price.price).toLocaleString() : price.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
