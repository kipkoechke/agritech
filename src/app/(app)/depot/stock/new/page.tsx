"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { MdArrowBack, MdWarehouse } from "react-icons/md";
import { useCreateStockLevel } from "@/hooks/useStockLevel";
import { useProducts } from "@/hooks/useProduct";
import { useCanAddStock } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useAuth";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useEffect } from "react";
import {router} from "next/client";

const stockSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  batch_number: z.string().min(1, "Batch number is required"),
  quantity: z.string().min(1, "Quantity is required"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  manufacture_date: z.string().optional(),
});

type StockFormData = z.infer<typeof stockSchema>;

export default function NewStockPage() {
  const router = useRouter();
  const canAddStock = useCanAddStock();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const createMutation = useCreateStockLevel();

  const { data: productsData, isLoading: productsLoading } = useProducts({
    per_page: 100,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StockFormData>({
    resolver: zodResolver(stockSchema) as any,
  });

  // Redirect if user can't add stock, but only after loading is complete
  useEffect(() => {
    if (!profileLoading && !canAddStock) {
      router.push("/depot/stock");
    }
  }, [canAddStock, profileLoading, router]);

  const productOptions =
    productsData?.data.map((product) => ({
      value: product.id,
      label: `${product.name} (${product.sku})`,
    })) || [];

  const onSubmit = (data: StockFormData) => {
    const payload = {
      product_id: data.product_id,
      batch_number: data.batch_number,
      quantity: parseInt(data.quantity),
      expiry_date: data.expiry_date,
      manufacture_date: data.manufacture_date || undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        router.push("/depot/stock");
      },
    });
  };

  if (profileLoading) {
    return null; // or a loading spinner if you prefer
  }
  if (!canAddStock) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50/50 px-8 py-2">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <Link
            href="/depot/stock"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
              <MdWarehouse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Add Stock</h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Add new stock entry for a product
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg border border-slate-200 p-6"
          >
            <div className="space-y-5">
              <SearchableSelect
                label="Product"
                options={productOptions}
                value={watch("product_id") || ""}
                onChange={(value) => setValue("product_id", value)}
                error={errors.product_id?.message}
                required
                disabled={productsLoading}
                placeholder="Select product..."
              />

              <InputField
                label="Batch Number"
                type="text"
                placeholder="e.g., BATCH-001"
                register={register("batch_number")}
                error={errors.batch_number?.message}
                required
              />

              <InputField
                label="Quantity"
                type="number"
                placeholder="Enter quantity"
                register={register("quantity")}
                error={errors.quantity?.message}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Manufacture Date"
                  type="date"
                  placeholder="Select manufacture date"
                  register={register("manufacture_date")}
                  error={errors.manufacture_date?.message}
                />
                <InputField
                  label="Expiry Date"
                  type="date"
                  placeholder="Select expiry date"
                  register={register("expiry_date")}
                  error={errors.expiry_date?.message}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-slate-200">
              <Link
                href="/depot/stock"
                className="px-5 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {createMutation.isPending ? "Adding..." : "Add Stock"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
