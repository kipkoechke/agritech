"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  MdArrowBack,
  MdShoppingCart,
  MdRemove,
  MdAdd,
  MdInfo,
} from "react-icons/md";
import {
  useSalesPersonPortalOrder,
  useAmendSalesPersonPortalOrder,
} from "@/hooks/useSalesPersonPortal";

interface EditOrderPageProps {
  params: Promise<{ id: string }>;
}

interface AmendedItem {
  ordered_item_id: string;
  product_name: string;
  original_qty: number;
  new_qty: number;
  price: string;
}

export default function SalesPersonEditOrderPage({
  params,
}: EditOrderPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: order, isLoading, error } = useSalesPersonPortalOrder(id);
  const amendMutation = useAmendSalesPersonPortalOrder();

  const [amendedItems, setAmendedItems] = useState<AmendedItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize items from order data once loaded
  if (order && !initialized) {
    setAmendedItems(
      (order.orderedItems || []).map((item) => ({
        ordered_item_id: item.ordered_item_id,
        product_name: item.product_name,
        original_qty: item.qty,
        new_qty: item.qty,
        price: item.price,
      })),
    );
    setInitialized(true);
  }

  const updateQty = (ordered_item_id: string, qty: number) => {
    if (qty < 0) return;
    setAmendedItems((prev) =>
      prev.map((item) =>
        item.ordered_item_id === ordered_item_id
          ? { ...item, new_qty: qty }
          : item,
      ),
    );
  };

  const hasChanges = amendedItems.some(
    (item) => item.new_qty !== item.original_qty,
  );

  const changedItems = amendedItems.filter(
    (item) => item.new_qty !== item.original_qty,
  );

  const newTotal = amendedItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.new_qty,
    0,
  );

  const handleSubmit = () => {
    if (!hasChanges) return;

    const payload = {
      ordered_items: changedItems.map((item) => ({
        ordered_item_id: item.ordered_item_id,
        qty: item.new_qty,
      })),
    };

    amendMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          router.push(`/sales-person/orders/${id}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load order details</p>
          <Link
            href="/sales-person/orders"
            className="text-accent hover:underline"
          >
            Back To Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50/50 px-3 md:px-8 py-3 md:py-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 shrink-0">
          <Link
            href={`/sales-person/orders/${id}`}
            className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MdArrowBack className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
              <MdShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-slate-900">
                Amend Order
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {order.order_number} &bull; {order.customer.name}
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2 shrink-0">
          <MdInfo className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Adjust the quantities below to match the customer&apos;s updated
            request. Only changed items will be submitted.
          </p>
        </div>

        {/* Items Form */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-4 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MdShoppingCart className="w-4 h-4 text-slate-500" />
                Order Items
              </h3>
            </div>

            {/* Mobile View */}
            <div className="md:hidden p-3 space-y-2">
              {amendedItems.map((item) => {
                const isChanged = item.new_qty !== item.original_qty;
                return (
                  <div
                    key={item.ordered_item_id}
                    className={`rounded-lg p-3 border ${isChanged ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}
                  >
                    <p className="text-sm font-medium text-slate-900 mb-2">
                      {item.product_name}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        Price: {formatCurrency(item.price)}
                      </div>
                      <div className="flex items-center gap-2">
                        {isChanged && (
                          <span className="text-xs text-slate-400 line-through">
                            {item.original_qty}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(item.ordered_item_id, item.new_qty - 1)
                            }
                            className="w-9 h-9 rounded-lg bg-red-700 hover:bg-red-800 text-white flex items-center justify-center transition-colors shadow-sm"
                          >
                            <MdRemove className="w-5 h-5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={item.new_qty}
                            onChange={(e) =>
                              updateQty(
                                item.ordered_item_id,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-16 h-9 text-center text-base font-bold text-slate-900 border-2 border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(item.ordered_item_id, item.new_qty + 1)
                            }
                            className="w-9 h-9 rounded-lg bg-green-700 hover:bg-green-800 text-white flex items-center justify-center transition-colors shadow-sm"
                          >
                            <MdAdd className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(parseFloat(item.price) * item.new_qty)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">
                      Original Qty
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">
                      New Qty
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {amendedItems.map((item) => {
                    const isChanged = item.new_qty !== item.original_qty;
                    return (
                      <tr
                        key={item.ordered_item_id}
                        className={
                          isChanged ? "bg-amber-50" : "hover:bg-slate-50"
                        }
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-right">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 text-center">
                          {item.original_qty}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateQty(
                                  item.ordered_item_id,
                                  item.new_qty - 1,
                                )
                              }
                              className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition-colors shadow-sm"
                            >
                              <MdRemove className="w-5 h-5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={item.new_qty}
                              onChange={(e) =>
                                updateQty(
                                  item.ordered_item_id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-18 h-9 text-center text-base font-bold text-slate-900 border-2 border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateQty(
                                  item.ordered_item_id,
                                  item.new_qty + 1,
                                )
                              }
                              className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition-colors shadow-sm"
                            >
                              <MdAdd className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">
                          {formatCurrency(
                            parseFloat(item.price) * item.new_qty,
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr className="border-t border-slate-200">
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-sm font-semibold text-slate-900 text-right"
                    >
                      New Total
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                      {formatCurrency(newTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Changes Summary */}
          {hasChanges && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">
                Changes Summary
              </h4>
              <div className="space-y-1">
                {changedItems.map((item) => (
                  <div
                    key={item.ordered_item_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-amber-700">{item.product_name}</span>
                    <span className="text-amber-800 font-medium">
                      {item.original_qty} &rarr; {item.new_qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <Link
              href={`/sales-person/orders/${id}`}
              className="px-5 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasChanges || amendMutation.isPending}
              className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {amendMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
