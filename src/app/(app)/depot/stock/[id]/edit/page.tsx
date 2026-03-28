"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MdArrowBack } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useProducts } from "@/hooks/useProduct";
import { useStockLevel, useUpdateStockLevel } from "@/hooks/useStockLevel";
import { useCanManageStock } from "@/hooks/useAuth";

const stockSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  batch_number: z.string().min(1, "Batch number is required"),
  quantity: z.string().min(1, "Quantity is required"),
  expiry_date: z.string().min(1, "Expiry date is required"),
});

type StockFormValues = z.infer<typeof stockSchema>;

interface EditStockPageProps {
  params: Promise<{ id: string }>;
}

export default function EditStockPage({ params }: EditStockPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const canManageStock = useCanManageStock();

  const { data: stockData, isLoading: isLoadingStock } = useStockLevel(id);
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({});
  const updateMutation = useUpdateStockLevel();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      product_id: "",
      batch_number: "",
      quantity: "",
      expiry_date: "",
    },
  });

  // Redirect if user cannot manage stock
  useEffect(() => {
    if (!canManageStock) {
      router.push(`/depot/stock/${id}`);
    }
  }, [canManageStock, router, id]);

  // Reset form when stock data loads
  useEffect(() => {
    if (stockData) {
      reset({
        product_id: stockData.product.id,
        batch_number: stockData.stock.batch_number,
        quantity: String(stockData.stock.quantity),
        expiry_date: stockData.stock.expiry_date.split("T")[0],
      });
    }
  }, [stockData, reset]);

  const onSubmit = (data: StockFormValues) => {
    updateMutation.mutate(
      {
        id,
        data: {
          batch_number: data.batch_number,
          quantity: parseInt(data.quantity, 10),
          expiry_date: data.expiry_date,
        },
      },
      {
        onSuccess: () => {
          router.push(`/depot/stock/${id}`);
        },
      },
    );
  };

  const productOptions =
    productsData?.data.map((product) => ({
      value: product.id,
      label: `${product.name} (${product.sku})`,
    })) || [];

  if (!canManageStock) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">
            You do not have permission to edit stock.
          </p>
          <Link
            href={`/depot/stock/${id}`}
            className="text-accent hover:underline"
          >
            Back to Stock Details
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingStock || isLoadingProducts) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load stock details</p>
          <Link href="/depot/stock" className="text-accent hover:underline">
            Back to Stock
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50/50 px-8 py-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <Link
            href={`/depot/stock/${id}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Stock</h1>
            <p className="text-sm text-slate-500">
              Update stock entry for {stockData.product.name}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <SearchableSelect
                    label="Product"
                    placeholder="Select a product"
                    options={productOptions}
                    value={watch("product_id")}
                    onChange={(val) => setValue("product_id", val as string)}
                    error={errors.product_id?.message}
                    disabled
                  />
                </div>

                <InputField
                  label="Batch Number"
                  type="text"
                  placeholder="Enter batch number"
                  register={register("batch_number")}
                  error={errors.batch_number?.message}
                />

                <InputField
                  label="Quantity"
                  type="number"
                  placeholder="Enter quantity"
                  register={register("quantity")}
                  error={errors.quantity?.message}
                />

                <InputField
                  label="Expiry Date"
                  type="date"
                  placeholder="Select expiry date"
                  register={register("expiry_date")}
                  error={errors.expiry_date?.message}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Link
                  href={`/depot/stock/${id}`}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 text-sm"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
