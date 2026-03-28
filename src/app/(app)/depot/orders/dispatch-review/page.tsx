"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MdArrowBack,
  MdSend,
  MdShoppingCart,
  MdExpandMore,
  MdExpandLess,
  MdPerson,
  MdLocalShipping,
  MdWarning,
} from "react-icons/md";
import { formatCurrency } from "@/utils/formatCurrency";
import { useTransporters } from "@/hooks/useTransporter";
import { useCreateDispatch } from "@/hooks/useDispatch";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { TextAreaField } from "@/components/common/TextAreaField";
import Button from "@/components/common/Button";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { DepotPortalOrder } from "@/types/depotPortal";
import { useQueries } from "@tanstack/react-query";
import { getDepotOrder } from "@/services/depotPortalService";

const dispatchSchema = z.object({
  transporter_id: z.string().min(1, "Transporter is required"),
  comment: z.string().optional(),
});

type DispatchFormData = z.infer<typeof dispatchSchema>;

export default function DispatchReviewPage() {
  const router = useRouter();
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderComments, setOrderComments] = useState<Record<string, string>>(
    {},
  );

  // Load selected order IDs from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("dispatch-order-ids");
    if (!stored) {
      router.push("/depot/orders");
      return;
    }
    try {
      const ids: string[] = JSON.parse(stored);
      if (!ids.length) {
        router.push("/depot/orders");
      } else {
        setOrderIds(ids);
      }
    } catch {
      router.push("/depot/orders");
    }
  }, [router]);

  // Fetch each order detail individually to get items
  const orderQueries = useQueries({
    queries: orderIds.map((id) => ({
      queryKey: ["depot-portal", "order", id],
      queryFn: () => getDepotOrder(id),
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    })),
  });

  const isLoadingOrders = orderQueries.some((q) => q.isLoading);
  const selectedOrders = orderQueries
    .filter((q) => q.data)
    .map((q) => q.data as DepotPortalOrder);

  const { data: transportersData } = useTransporters({ per_page: 100 });
  const createDispatchMutation = useCreateDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DispatchFormData>({
    resolver: zodResolver(dispatchSchema),
    defaultValues: {
      transporter_id: "",
      comment: "",
    },
  });

  const transporterOptions =
    transportersData?.data?.map((t) => ({
      value: t.id,
      label:
        t.license_plate && t.license_plate !== "N/A"
          ? `${t.name} — ${t.license_plate}`
          : t.name,
    })) || [];

  const toggleExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  // Identify credit customer orders
  const creditOrders = selectedOrders.filter((order) => order.is_credit_order);

  const updateOrderComment = (orderId: string, comment: string) => {
    setOrderComments((prev) => ({ ...prev, [orderId]: comment }));
  };

  const onSubmit = (formData: DispatchFormData) => {
    // Validate that all credit customer orders have comments
    const missingComments = creditOrders.filter(
      (order) => !orderComments[order.id]?.trim(),
    );
    if (missingComments.length > 0) {
      toast.error(
        `Please add comments for all credit customer orders (${missingComments.length} missing)`,
      );
      return;
    }

    createDispatchMutation.mutate(
      {
        orders: selectedOrders.map((order) => ({
          order_id: order.id,
          comment: orderComments[order.id]?.trim() || undefined,
        })),
        comment: formData.comment || undefined,
        transporter_id: formData.transporter_id,
      },
      {
        onSuccess: () => {
          sessionStorage.removeItem("dispatch-order-ids");
          router.push("/depot/dispatches");
        },
      },
    );
  };

  if (orderIds.length === 0 || isLoadingOrders) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MdShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {isLoadingOrders
              ? "Loading orders for review..."
              : "No orders selected"}
          </p>
          <Link
            href="/depot/orders"
            className="text-primary hover:underline text-sm"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <Link
            href="/depot/orders"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
              <MdSend className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                Review Dispatch
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                Review {selectedOrders.length} order
                {selectedOrders.length !== 1 ? "s" : ""} before dispatching
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Orders Review */}
          <div className="space-y-3">
            {selectedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                        <MdShoppingCart className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {order.order_number}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MdPerson className="w-3 h-3" />
                          {order.customer?.name}
                        </div>
                        {order.is_credit_order && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 mt-0.5">
                            <MdWarning className="w-3 h-3" />
                            Credit
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.items_count} item
                          {order.items_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {expandedOrder === order.id ? (
                        <MdExpandLess className="w-5 h-5 text-gray-400" />
                      ) : (
                        <MdExpandMore className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Items */}
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-3">
                      Items in this order
                    </p>
                    {order.items && order.items.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-white">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Product
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Qty
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Unit Price
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                              <tr key={item.id}>
                                <td className="px-3 py-2 text-sm text-gray-900">
                                  {item.product.name}
                                  <span className="text-xs text-gray-400 ml-1">
                                    ({item.product.sku})
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-sm font-bold text-gray-900 text-right">
                                  {item.quantity ?? "-"}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600 text-right">
                                  {formatCurrency(item.unit_price)}
                                </td>
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">
                                  {formatCurrency(item.total_price)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-white">
                            <tr className="border-t border-gray-200">
                              <td
                                colSpan={3}
                                className="px-3 py-2 text-sm font-semibold text-gray-900 text-right"
                              >
                                Order Total
                              </td>
                              <td className="px-3 py-2 text-sm font-semibold text-gray-900 text-right">
                                {formatCurrency(order.amount)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No item details available
                      </p>
                    )}
                  </div>
                )}

                {/* Credit Order Comment */}
                {order.is_credit_order && (
                  <div className="border-t border-gray-100 bg-amber-50/50 p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MdWarning className="w-4 h-4 text-amber-600" />
                      <p className="text-xs font-medium text-amber-700">
                        This is a credit customer order — comment is required
                      </p>
                    </div>
                    <textarea
                      value={orderComments[order.id] || ""}
                      onChange={(e) =>
                        updateOrderComment(order.id, e.target.value)
                      }
                      placeholder="Add comment for this credit order..."
                      rows={2}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary ${
                        !orderComments[order.id]?.trim()
                          ? "border-amber-300 bg-white"
                          : "border-gray-200 bg-white"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Orders Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                Total Orders: {selectedOrders.length}
              </span>
              <span className="font-semibold text-gray-900">
                Total Amount:{" "}
                {formatCurrency(
                  selectedOrders.reduce(
                    (sum, o) => sum + (parseFloat(String(o.amount)) || 0),
                    0,
                  ),
                )}
              </span>
            </div>
          </div>

          {/* Dispatch Details Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <MdLocalShipping className="w-5 h-5 text-primary" />
              Dispatch Details
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <SearchableSelect
                  label="Transporter"
                  options={transporterOptions}
                  value={watch("transporter_id")}
                  onChange={(value) => setValue("transporter_id", value)}
                  placeholder="Select transporter..."
                  error={errors.transporter_id?.message}
                  required
                />
              </div>

              <div className="mb-4">
                <TextAreaField
                  label="Comment"
                  placeholder="Add dispatch notes..."
                  register={register("comment")}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link
                  href="/depot/orders"
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <Button
                  htmlType="submit"
                  disabled={createDispatchMutation.isPending}
                >
                  {createDispatchMutation.isPending
                    ? "Dispatching..."
                    : "Confirm Dispatch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
