"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MdShoppingCart,
  MdDelete,
  MdAdd,
  MdRemove,
  MdArrowBack,
  MdInventory,
  MdLocalOffer,
} from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  initializeCart,
  selectCartItems,
  selectCartTotal,
  updateItemQty,
  removeFromCart,
  clearCart,
  calculateEffectivePrice,
} from "@/store/slices/cartSlice";
import { useSalesPersonPortalCustomers } from "@/hooks/useSalesPersonPortal";
import {
  useCreateSalesPersonPortalOrder,
  useCreateCustomerOrder,
} from "@/hooks/useSalesPersonPortal";
import { useAuth } from "@/hooks/useAuth";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { TextAreaField } from "@/components/common/TextAreaField";
import toast from "react-hot-toast";

// Zod schema for checkout form (sales person)
const salesPersonCheckoutSchema = z.object({
  customer_id: z.string().min(1, "Please select a customer"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  notes: z.string().optional(),
});

// Zod schema for customer checkout (no customer_id needed)
const customerCheckoutSchema = z.object({
  priority: z.enum(["low", "normal", "high", "urgent"]),
  notes: z.string().optional(),
});

type SalesPersonCheckoutFormData = z.infer<typeof salesPersonCheckoutSchema>;
type CustomerCheckoutFormData = z.infer<typeof customerCheckoutSchema>;

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function SalesPersonCartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);

  const [customerSearch, setCustomerSearch] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is a customer
  const isCustomer = user?.role === "customer";

  const createSalesPersonOrderMutation = useCreateSalesPersonPortalOrder();
  const createCustomerOrderMutation = useCreateCustomerOrder();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SalesPersonCheckoutFormData | CustomerCheckoutFormData>({
    resolver: zodResolver(
      isCustomer ? customerCheckoutSchema : salesPersonCheckoutSchema,
    ),
    defaultValues: {
      ...(isCustomer ? {} : { customer_id: "" }),
      priority: "normal",
      notes: "",
    },
  });

  const selectedCustomerId = watch(
    "customer_id" as keyof (
      | SalesPersonCheckoutFormData
      | CustomerCheckoutFormData
    ),
  );

  // Initialize cart from localStorage
  useEffect(() => {
    dispatch(initializeCart());
    setIsInitialized(true);
  }, [dispatch]);

  // Fetch customers (only for sales person, not customers)
  const { data: customersData, isLoading: customersLoading } =
    useSalesPersonPortalCustomers({
      search: customerSearch || undefined,
      enabled: !isCustomer, // Only fetch for non-customers
    });

  const customerOptions = (customersData?.data || []).map((cust) => ({
    value: cust.id,
    label: `${cust.name}${cust.phone ? ` - ${cust.phone}` : ""}`,
  }));

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleQuantityChange = (productId: string, newQty: number) => {
    dispatch(updateItemQty({ product_id: productId, qty: newQty }));
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
    toast.success("Item removed from cart");
  };

  const handleCustomerChange = (value: string) => {
    setValue(
      "customer_id" as keyof (
        | SalesPersonCheckoutFormData
        | CustomerCheckoutFormData
      ),
      value,
      { shouldValidate: true },
    );
  };

  const onSubmit = (
    data: SalesPersonCheckoutFormData | CustomerCheckoutFormData,
  ) => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderedItems = cartItems.map((item) => {
      const { price: effectivePrice } = calculateEffectivePrice(
        item.qty,
        item.unit_price,
        item.purchase_volumes,
      );
      return {
        product_id: item.product_id,
        qty: item.qty,
        unit_price: effectivePrice,
        metadata: {},
      };
    });

    const metadata = {
      priority: data.priority,
      notes: data.notes || undefined,
    };

    if (isCustomer) {
      // Customer order - no customer_id needed
      createCustomerOrderMutation.mutate(
        {
          discount: 0,
          ordered_items: orderedItems,
          metadata,
        },
        {
          onSuccess: () => {
            dispatch(clearCart());
            router.push("/orders");
          },
        },
      );
    } else {
      // Sales person order - needs customer_id
      const salesPersonData = data as SalesPersonCheckoutFormData;
      createSalesPersonOrderMutation.mutate(
        {
          customer_id: salesPersonData.customer_id,
          discount: 0,
          ordered_items: orderedItems,
          metadata,
        },
        {
          onSuccess: () => {
            dispatch(clearCart());
            router.push("/sales-person/orders");
          },
        },
      );
    }
  };

  const handleClearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      dispatch(clearCart());
      toast.success("Cart cleared");
    }
  };

  // Check if order creation is pending
  const isOrderPending = isCustomer
    ? createCustomerOrderMutation.isPending
    : createSalesPersonOrderMutation.isPending;

  if (!isInitialized) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalAmount = cartTotal; // Prices are VAT inclusive

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-100 pb-16 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-3 md:px-4 py-2 md:py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/sales-person/products"
              className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MdArrowBack className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary">
                <MdShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-bold text-gray-900">
                  Cart
                </h1>
                <p className="text-xs md:text-sm text-gray-500">
                  {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium text-sm"
            >
              <MdDelete className="w-5 h-5" />
              <span className="hidden sm:inline">Clear Cart</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center max-w-md mx-auto mt-8">
            <MdShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Browse products and add items to your cart
            </p>
            <Link
              href="/sales-person/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <MdInventory className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Top Section - Cart Items (left 2/3) and Customer Details (right 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
              {/* Cart Items - Left (2/3 width) */}
              <div className="bg-white rounded-lg shadow flex flex-col lg:col-span-2">
                <div className="px-3 py-2 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900 text-sm">
                    Cart Items
                  </h2>
                </div>
                <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-100">
                  {cartItems.map((item) => {
                    const {
                      price: effectivePrice,
                      volumeName,
                      isDiscounted,
                    } = calculateEffectivePrice(
                      item.qty,
                      item.unit_price,
                      item.purchase_volumes,
                    );
                    const lineTotal = item.qty * effectivePrice;

                    return (
                      <div
                        key={item.product_id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate text-sm">
                            {item.product_name}
                          </h3>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isDiscounted ? (
                              <>
                                <span className="text-xs text-slate-400 line-through">
                                  {formatPrice(item.unit_price)}
                                </span>
                                <span className="text-xs text-emerald-600 font-medium">
                                  {formatPrice(effectivePrice)} each
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-emerald-600 font-medium">
                                {formatPrice(effectivePrice)} each
                              </span>
                            )}
                            {volumeName && (
                              <span
                                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  isDiscounted
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-50 text-slate-600 border border-slate-200"
                                }`}
                              >
                                <MdLocalOffer className="w-2.5 h-2.5" />
                                {volumeName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.product_id,
                                item.qty - 1,
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 transition-colors"
                          >
                            <MdRemove className="w-4 h-4 text-white" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.product_id,
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className="w-12 h-7 text-center border-2 border-gray-800 rounded text-sm font-bold text-gray-900 bg-white shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.product_id,
                                item.qty + 1,
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded bg-green-500 hover:bg-green-600 transition-colors"
                          >
                            <MdAdd className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <div className="text-right w-20">
                          <p className="font-bold text-gray-900 text-sm">
                            {formatPrice(lineTotal)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.product_id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Details - Right (1/3 width) */}
              <div className="bg-white rounded-lg shadow p-3 h-fit">
                <h2 className="font-semibold text-gray-900 mb-2 text-sm">
                  {isCustomer ? "Order Details" : "Customer Details"}
                </h2>
                <div className="space-y-2">
                  {!isCustomer && (
                    <SearchableSelect
                      label="Customer"
                      options={customerOptions}
                      value={selectedCustomerId as string}
                      onChange={handleCustomerChange}
                      onSearchChange={setCustomerSearch}
                      placeholder="Search customer..."
                      isLoading={customersLoading}
                      required
                      error={
                        (errors as { customer_id?: { message?: string } })
                          .customer_id?.message
                      }
                      showSearchHint={true}
                    />
                  )}
                  <SearchableSelect
                    label="Priority"
                    options={priorityOptions}
                    value={watch("priority")}
                    onChange={(value) =>
                      setValue(
                        "priority",
                        value as "low" | "normal" | "high" | "urgent",
                        { shouldValidate: true },
                      )
                    }
                    placeholder="Select priority"
                    error={errors.priority?.message}
                  />
                  <TextAreaField
                    label="Notes"
                    placeholder="Order notes (optional)..."
                    register={register("notes")}
                    error={errors.notes?.message}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Summary - Fixed Bottom Bar (only show when cart has items) */}
      {cartItems.length > 0 && (
        <form onSubmit={handleSubmit(onSubmit)} className="shrink-0">
          <div className="bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
                <div>
                  <span className="text-xs text-gray-500">
                    Items ({cartItems.length})
                  </span>
                  <p className="font-medium text-gray-900 text-sm">
                    {formatPrice(cartTotal)}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs text-gray-500">VAT (Incl.)</span>
                  <p className="font-medium text-gray-500 text-sm">Inclusive</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Total</span>
                  <p className="font-bold text-emerald-600 text-lg">
                    {formatPrice(totalAmount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Link
                  href="/sales-person/products"
                  className="text-xs md:text-sm text-primary font-medium hover:underline hidden sm:block"
                >
                  Continue Shopping
                </Link>
                <button
                  type="submit"
                  disabled={isOrderPending || cartItems.length === 0}
                  className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isOrderPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <MdShoppingCart className="w-4 h-4" />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
