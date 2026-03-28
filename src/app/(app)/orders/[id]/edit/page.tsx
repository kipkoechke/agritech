"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { MdArrowBack, MdShoppingCart } from "react-icons/md";
import { useOrder, useUpdateOrder } from "@/hooks/useOrder";
import { useTransporters } from "@/hooks/useTransporter";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { InputField } from "@/components/common/InputField";
import { TextAreaField } from "@/components/common/TextAreaField";

const orderSchema = z.object({
  transporter_id: z.string().optional(),
  discount: z.string().optional(),
  delivery_status: z.enum([
    "pending",
    "processing",
    "dispatched",
    "delivered",
    "cancelled",
  ]),
  notes: z.string().optional(),
  delivery_address: z.string().optional(),
  delivery_notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface EditOrderPageProps {
  params: Promise<{ id: string }>;
}

const DELIVERY_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: order, isLoading } = useOrder(id);
  const updateMutation = useUpdateOrder();
  const { data: transportersData, isLoading: transportersLoading } =
    useTransporters({ per_page: 100 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  const transporterOptions = [
    { value: "", label: "No Transporter" },
    ...(transportersData?.data.map((t) => ({
      value: t.id,
      label: t.name,
    })) || []),
  ];

  useEffect(() => {
    if (order) {
      const metadata =
        typeof order.metadata === "string"
          ? JSON.parse(order.metadata || "{}")
          : order.metadata || {};

      reset({
        transporter_id: order.transporter?.id || "",
        discount: order.discount ? String(order.discount) : "",
        delivery_status: order.delivery_status,
        notes: metadata?.notes || "",
        delivery_address: metadata?.delivery_address || "",
        delivery_notes: metadata?.delivery_notes || "",
      });
    }
  }, [order, reset]);

  const onSubmit = (data: OrderFormData) => {
    const payload = {
      transporter_id: data.transporter_id || undefined,
      discount: data.discount ? parseFloat(data.discount) : undefined,
      delivery_status: data.delivery_status,
      metadata: {
        notes: data.notes || undefined,
        delivery_address: data.delivery_address || undefined,
        delivery_notes: data.delivery_notes || undefined,
      },
    };

    updateMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          router.push(`/orders/${id}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-8 py-2">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <Link
            href={`/orders/${id}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MdShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {order.order_number} - {order.customer?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="space-y-5">
              {/* Order Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Order Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <SearchableSelect
                    label="Delivery Status"
                    options={DELIVERY_STATUS_OPTIONS}
                    value={watch("delivery_status") || "pending"}
                    onChange={(value) =>
                      setValue(
                        "delivery_status",
                        value as OrderFormData["delivery_status"],
                      )
                    }
                    error={errors.delivery_status?.message}
                    required
                    placeholder="Select status..."
                  />
                  <SearchableSelect
                    label="Transporter"
                    options={transporterOptions}
                    value={watch("transporter_id") || ""}
                    onChange={(value) => setValue("transporter_id", value)}
                    error={errors.transporter_id?.message}
                    disabled={transportersLoading}
                    placeholder="Select transporter..."
                  />
                  <InputField
                    label="Discount (%)"
                    type="number"
                    placeholder="Enter discount percentage"
                    register={register("discount")}
                    error={errors.discount?.message}
                  />
                </div>
              </div>

              {/* Delivery Information */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Delivery Information
                </h3>
                <div className="grid grid-cols-1 gap-5">
                  <TextAreaField
                    label="Delivery Address"
                    placeholder="Enter delivery address"
                    register={register("delivery_address")}
                    error={errors.delivery_address?.message}
                    rows={2}
                  />
                  <TextAreaField
                    label="Delivery Notes"
                    placeholder="Enter any delivery notes or instructions"
                    register={register("delivery_notes")}
                    error={errors.delivery_notes?.message}
                    rows={2}
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Additional Notes
                </h3>
                <TextAreaField
                  label="Notes"
                  placeholder="Enter any additional notes"
                  register={register("notes")}
                  error={errors.notes?.message}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-gray-200">
              <Link
                href={`/orders/${id}`}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
