"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdAdd, MdDelete } from "react-icons/md";

import { useStockRequest, useUpdateStockRequest } from "@/hooks/useStockRequest";
import { useCanManageStock, useUserZone } from "@/hooks/useAuth";
import { useZones } from "@/hooks/useZone";
import { useProducts } from "@/hooks/useProduct";
import { useStockLevels } from "@/hooks/useStockLevel";
import PageHeader from "@/components/common/PageHeader";
import toast from "react-hot-toast";
import type { UpdateStockRequestPayload, ProductRequest, StockRequestBatch } from "@/types/stockRequest";

interface EditStockRequestPageProps {
  params: Promise<{ id: string }>;
}

export default function EditStockRequestPage({ params }: EditStockRequestPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const canManageStock = useCanManageStock();
  const userZone = useUserZone();

  const { data: request, isLoading: isLoadingRequest } = useStockRequest(id);

  const [formData, setFormData] = useState<UpdateStockRequestPayload>({
    from_zone_id: "",
    to_zone_id: "",
    notes: "",
    products: [{ product_id: "", quantity: 0, batches: [] }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBatchSelection, setShowBatchSelection] = useState<Record<number, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: zonesData } = useZones({ per_page: 100 });
  const { data: productsData } = useProducts({ per_page: 100 });

  const { data: stockData } = useStockLevels({
    zone_id: formData.from_zone_id || undefined,
  });

  const updateMutation = useUpdateStockRequest();

  // Populate form when request data loads
  useEffect(() => {
    if (request && !isInitialized) {
      const products: ProductRequest[] =
        request.products && request.products.length > 0
          ? request.products.map((p) => ({
              product_id: p.product_id,
              quantity: p.quantity,
              batches: p.batches || [],
            }))
          : request.product_id
            ? [{ product_id: request.product_id, quantity: request.quantity || 0, batches: request.batches || [] }]
            : [{ product_id: "", quantity: 0, batches: [] }];

      setFormData({
        from_zone_id: request.from_zone_id,
        to_zone_id: request.to_zone_id,
        notes: request.notes || "",
        products,
      });

      // Show batch selection for products that have batches
      const batchVisibility: Record<number, boolean> = {};
      products.forEach((p, i) => {
        if (p.batches && p.batches.length > 0) {
          batchVisibility[i] = true;
        }
      });
      setShowBatchSelection(batchVisibility);
      setIsInitialized(true);
    }
  }, [request, isInitialized]);

  const handleZoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, from_zone_id: value }));
    if (errors.from_zone_id) {
      setErrors((prev) => ({ ...prev, from_zone_id: "" }));
    }
  };

  const handleNotesChange = (value: string) => {
    setFormData((prev) => ({ ...prev, notes: value }));
  };

  const handleProductChange = (index: number, field: keyof ProductRequest, value: any) => {
    const newProducts = [...(formData.products || [])];

    if (field === "product_id" && value) {
      const isDuplicate = newProducts.some((product, i) => i !== index && product.product_id === value);
      if (isDuplicate) {
        toast.error("This product has already been selected. Please choose a different product.");
        return;
      }
    }

    newProducts[index] = { ...newProducts[index], [field]: value };

    if (field === "product_id") {
      newProducts[index].batches = [];
      setShowBatchSelection((prev) => ({ ...prev, [index]: false }));
    }

    setFormData((prev) => ({ ...prev, products: newProducts }));

    if (errors[`products.${index}.${field}`]) {
      setErrors((prev) => ({ ...prev, [`products.${index}.${field}`]: "" }));
    }
  };

  const handleBatchChange = (productIndex: number, batchIndex: number, field: keyof StockRequestBatch, value: any) => {
    const newProducts = [...(formData.products || [])];
    const newBatches = [...(newProducts[productIndex].batches || [])];
    newBatches[batchIndex] = { ...newBatches[batchIndex], [field]: value };
    newProducts[productIndex].batches = newBatches;
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const addProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...(prev.products || []), { product_id: "", quantity: 0, batches: [] }],
    }));
  };

  const removeProduct = (index: number) => {
    if ((formData.products?.length || 0) <= 1) {
      toast.error("At least one product is required");
      return;
    }

    const newProducts = (formData.products || []).filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, products: newProducts }));

    setShowBatchSelection((prev) => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const addBatch = (productIndex: number) => {
    const newProducts = [...(formData.products || [])];
    newProducts[productIndex].batches = [
      ...(newProducts[productIndex].batches || []),
      { batch_no: "", quantity: 0 },
    ];
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const removeBatch = (productIndex: number, batchIndex: number) => {
    const newProducts = [...(formData.products || [])];
    newProducts[productIndex].batches = (newProducts[productIndex].batches || []).filter((_, i) => i !== batchIndex);
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.from_zone_id) newErrors.from_zone_id = "Source zone is required";
    if (!formData.to_zone_id) newErrors.to_zone_id = "Destination zone is required";
    if (formData.from_zone_id === formData.to_zone_id) {
      newErrors.from_zone_id = "Cannot request stock from your own zone";
    }

    if (!formData.products || formData.products.length === 0) {
      newErrors.products = "At least one product is required";
    } else {
      const productIds = formData.products.map((p) => p.product_id).filter(Boolean);
      const duplicateIds = productIds.filter((pid, index) => productIds.indexOf(pid) !== index);

      if (duplicateIds.length > 0) {
        newErrors.products = "Duplicate products are not allowed. Please remove duplicate entries.";
      }

      formData.products.forEach((product, index) => {
        if (!product.product_id) {
          newErrors[`products.${index}.product_id`] = "Product is required";
        }
        if (product.quantity <= 0) {
          newErrors[`products.${index}.quantity`] = "Quantity must be greater than 0";
        }

        if (product.batches && product.batches.length > 0) {
          const totalBatchQty = product.batches.reduce((sum, batch) => sum + batch.quantity, 0);
          if (totalBatchQty !== product.quantity) {
            newErrors[`products.${index}.batches`] = "Total batch quantities must equal the product quantity";
          }

          product.batches.forEach((batch, batchIndex) => {
            if (!batch.batch_no.trim()) {
              newErrors[`products.${index}.batches.${batchIndex}.batch_no`] = "Batch number is required";
            }
            if (batch.quantity <= 0) {
              newErrors[`products.${index}.batches.${batchIndex}.quantity`] = "Batch quantity must be greater than 0";
            }
          });
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const cleanedProducts = formData.products?.map((product) => ({
        ...product,
        batches: product.batches && product.batches.length > 0 ? product.batches : undefined,
      }));

      await updateMutation.mutateAsync({
        id,
        payload: {
          ...formData,
          products: cleanedProducts,
        },
      });
      router.push(`/depot/stock/requests/${id}`);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const getAvailableBatches = (productId: string) => {
    return (stockData?.data || [])
      .filter((stock) => stock.product_id === productId)
      .flatMap((stock) => stock.batches || []);
  };

  if (!canManageStock) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to edit stock requests.</p>
        </div>
      </div>
    );
  }

  if (isLoadingRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Request Not Found</h2>
          <p className="text-gray-600 mb-4">The stock request could not be found.</p>
          <Link
            href="/depot/stock/requests"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <MdArrowBack className="mr-2 w-4 h-4" />
            Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  if (request.status !== "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Cannot Edit</h2>
          <p className="text-gray-600 mb-4">Only pending requests can be edited.</p>
          <Link
            href={`/depot/stock/requests/${id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <MdArrowBack className="mr-2 w-4 h-4" />
            Back to Request
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Stock Request"
        description="Update stock request details"
      />

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Zone Information */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">Request Details</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      From: {formData.from_zone_id
                        ? zonesData?.data?.find((z) => z.id === formData.from_zone_id)?.name || "Unknown"
                        : "Select source zone"}{" "}
                      → To:{" "}
                      <span className="font-medium">
                        {zonesData?.data?.find((z) => z.id === formData.to_zone_id)?.name || userZone?.name || "Loading..."}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Source Zone Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Source Zone (Request From) *
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Select which zone you want to request stock from.
                </p>
                <select
                  value={formData.from_zone_id}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" className="text-gray-500">Select zone to request from</option>
                  {zonesData?.data
                    ?.filter((zone: any) => zone.id !== formData.to_zone_id)
                    ?.map((zone: any) => (
                      <option key={zone.id} value={zone.id} className="text-gray-900">
                        {zone.name}
                      </option>
                    ))}
                </select>
                {errors.from_zone_id && (
                  <p className="text-sm text-red-700 font-medium">{errors.from_zone_id}</p>
                )}
              </div>

              {/* Products Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Products to Request</h3>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const selectedProductIds = formData.products?.map((p) => p.product_id).filter(Boolean) || [];
                      const totalAvailableProducts = productsData?.data?.length || 0;
                      const allSelected = selectedProductIds.length >= totalAvailableProducts;

                      return (
                        <>
                          {allSelected && totalAvailableProducts > 0 && (
                            <span className="text-xs text-gray-500 italic">All products selected</span>
                          )}
                          <button
                            type="button"
                            onClick={addProduct}
                            disabled={allSelected}
                            className="inline-flex items-center px-3 py-2 text-sm text-blue-700 font-medium border border-blue-600 rounded-md hover:bg-blue-50 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-700"
                            title={allSelected ? "All available products have been selected" : "Add another product to this request"}
                          >
                            <MdAdd className="mr-1 w-4 h-4" />
                            Add Product
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {formData.products?.map((product, productIndex) => (
                  <div key={productIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900">Product {productIndex + 1}</h4>
                      {(formData.products?.length || 0) > 1 && (
                        <button type="button" onClick={() => removeProduct(productIndex)} className="text-red-700 hover:text-red-800 p-1">
                          <MdDelete className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Selection */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">Product *</label>
                        <select
                          value={product.product_id}
                          onChange={(e) => handleProductChange(productIndex, "product_id", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="" className="text-gray-500">Select a product</option>
                          {(() => {
                            const availableProducts =
                              productsData?.data?.filter((prod) => {
                                const selectedProductIds =
                                  formData.products?.map((p, index) => (index !== productIndex ? p.product_id : null)).filter(Boolean) || [];
                                return !selectedProductIds.includes(prod.id);
                              }) || [];

                            if (availableProducts.length === 0) {
                              return (
                                <option disabled className="text-gray-400">
                                  {productsData?.data?.length === 0 ? "No products available" : "All products have been selected"}
                                </option>
                              );
                            }

                            return availableProducts.map((prod) => (
                              <option key={prod.id} value={prod.id} className="text-gray-900">
                                {prod.name} ({prod.sku})
                              </option>
                            ));
                          })()}
                        </select>
                        {errors[`products.${productIndex}.product_id`] && (
                          <p className="text-sm text-red-700 font-medium">{errors[`products.${productIndex}.product_id`]}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">Quantity *</label>
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(productIndex, "quantity", parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min={1}
                          required
                        />
                        {errors[`products.${productIndex}.quantity`] && (
                          <p className="text-sm text-red-700 font-medium">{errors[`products.${productIndex}.quantity`]}</p>
                        )}
                      </div>
                    </div>

                    {/* Batch Selection */}
                    {product.product_id && (
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-semibold text-gray-900">Batch Selection (Optional)</label>
                          <button
                            type="button"
                            onClick={() =>
                              setShowBatchSelection((prev) => ({
                                ...prev,
                                [productIndex]: !prev[productIndex],
                              }))
                            }
                            className="text-sm text-blue-700 hover:text-blue-800 font-medium underline"
                          >
                            {showBatchSelection[productIndex] ? "Hide" : "Specify"} Batches
                          </button>
                        </div>

                        {showBatchSelection[productIndex] && (
                          <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                            {product.batches?.map((batch, batchIndex) => (
                              <div key={batchIndex} className="flex items-end gap-4">
                                <div className="flex-1">
                                  <label className="block text-sm font-semibold text-gray-900 mb-1">Batch Number</label>
                                  <select
                                    value={batch.batch_no}
                                    onChange={(e) => handleBatchChange(productIndex, batchIndex, "batch_no", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="" className="text-gray-500">Select batch</option>
                                    {getAvailableBatches(product.product_id).map((availableBatch) => (
                                      <option key={availableBatch.id} value={availableBatch.batch_number} className="text-gray-900">
                                        {availableBatch.batch_number}
                                      </option>
                                    ))}
                                  </select>
                                  {errors[`products.${productIndex}.batches.${batchIndex}.batch_no`] && (
                                    <p className="mt-1 text-sm text-red-700 font-medium">
                                      {errors[`products.${productIndex}.batches.${batchIndex}.batch_no`]}
                                    </p>
                                  )}
                                </div>

                                <div className="w-32">
                                  <label className="block text-sm font-semibold text-gray-900 mb-1">Quantity</label>
                                  <input
                                    type="number"
                                    value={batch.quantity}
                                    onChange={(e) => handleBatchChange(productIndex, batchIndex, "quantity", parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    min={1}
                                  />
                                  {errors[`products.${productIndex}.batches.${batchIndex}.quantity`] && (
                                    <p className="mt-1 text-sm text-red-700 font-medium">
                                      {errors[`products.${productIndex}.batches.${batchIndex}.quantity`]}
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeBatch(productIndex, batchIndex)}
                                  className="p-2 text-red-700 hover:text-red-800 hover:bg-red-50 rounded-md"
                                >
                                  <MdDelete className="w-5 h-5" />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addBatch(productIndex)}
                              className="inline-flex items-center px-3 py-2 text-sm text-blue-700 font-medium border border-blue-600 rounded-md hover:bg-blue-50 hover:text-blue-800"
                            >
                              <MdAdd className="mr-1 w-4 h-4" />
                              Add Batch
                            </button>

                            {errors[`products.${productIndex}.batches`] && (
                              <p className="text-sm text-red-700 font-medium">{errors[`products.${productIndex}.batches`]}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {errors.products && <p className="text-sm text-red-700 font-medium">{errors.products}</p>}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Notes</label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional notes..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link
                  href={`/depot/stock/requests/${id}`}
                  className="inline-flex items-center px-4 py-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  <MdArrowBack className="mr-2 w-4 h-4" />
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center font-medium transition-colors"
                >
                  {updateMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
