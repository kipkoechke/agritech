"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { MdArrowBack, MdPriceChange } from "react-icons/md";
import { usePriceReview, useUpdatePriceReview } from "@/hooks/usePriceReview";
import { InputField } from "@/components/common/InputField";
import { TextAreaField } from "@/components/common/TextAreaField";
import Checkbox from "@/components/common/Checkbox";

const priceReviewSchema = z.object({
  title: z.string().min(1, "Title is required"),
  effective_date: z.string().min(1, "Effective date is required"),
  description: z.string().optional(),
  send_notification: z.boolean().optional(),
  reason: z.string().optional(),
  percentage: z.string().optional(),
});

type PriceReviewFormData = z.infer<typeof priceReviewSchema>;

interface EditPriceReviewPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPriceReviewPage({
  params,
}: EditPriceReviewPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: review, isLoading } = usePriceReview(id);
  const updateMutation = useUpdatePriceReview();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PriceReviewFormData>({
    resolver: zodResolver(priceReviewSchema),
  });

  useEffect(() => {
    if (review) {
      // Format date to YYYY-MM-DD for input
      const effectiveDate = review.effective_date
        ? new Date(review.effective_date).toISOString().split("T")[0]
        : "";

      reset({
        title: review.title,
        effective_date: effectiveDate,
        description: review.description || "",
        send_notification: review.send_notification,
        reason: review.meta?.reason || "",
        percentage: review.meta?.percentage
          ? String(review.meta.percentage)
          : "",
      });
    }
  }, [review, reset]);

  const onSubmit = (data: PriceReviewFormData) => {
    const payload = {
      title: data.title,
      effective_date: data.effective_date,
      description: data.description || undefined,
      send_notification: data.send_notification,
      meta: {
        reason: data.reason || undefined,
        percentage: data.percentage ? parseFloat(data.percentage) : undefined,
      },
    };

    updateMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          router.push(`/price-reviews/${id}`);
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

  if (!review) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Price review not found</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-8 py-2">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <Link
            href={`/price-reviews/${id}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MdPriceChange className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Price Review
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">{review.title}</p>
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
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Title"
                    type="text"
                    placeholder="e.g., Q1 2026 Price Adjustment"
                    register={register("title")}
                    error={errors.title?.message}
                    required
                  />
                  <InputField
                    label="Effective Date"
                    type="date"
                    placeholder="Select effective date"
                    register={register("effective_date")}
                    error={errors.effective_date?.message}
                    required
                  />
                  <div className="md:col-span-2">
                    <TextAreaField
                      label="Description"
                      placeholder="Enter a description for this price review"
                      register={register("description")}
                      error={errors.description?.message}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Adjustment Details */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Adjustment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Reason"
                    type="text"
                    placeholder="e.g., Inflation adjustment"
                    register={register("reason")}
                    error={errors.reason?.message}
                  />
                  <InputField
                    label="Percentage Adjustment (%)"
                    type="number"
                    placeholder="e.g., 5 or -10"
                    register={register("percentage")}
                    error={errors.percentage?.message}
                  />
                </div>
              </div>

              {/* Notification Settings */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Notification Settings
                </h3>
                <Checkbox
                  label="Send notification to customers when this price review becomes effective"
                  {...register("send_notification")}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-gray-200">
              <Link
                href={`/price-reviews/${id}`}
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
