"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { MdArrowBack, MdStore } from "react-icons/md";
import { useMTCustomer, useUpdateMTCustomer } from "@/hooks/useMTCustomer";
import { useSalesPersons } from "@/hooks/useSalesPerson";
import { useZones } from "@/hooks/useZone";
import { useAuth } from "@/hooks/useAuth";
import type { UpdateMTCustomerPayload } from "@/types/mtCustomer";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Checkbox from "@/components/common/Checkbox";

const mtCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  is_tax_exempt: z.boolean().optional(),
  is_credit_customer: z.boolean().optional(),
  credit_limit: z.string().optional(),
  kra_pin: z.string().optional(),
  sales_person_id: z.string().min(1, "Sales person is required"),
  zone_id: z.string().min(1, "Zone is required"),
  street: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  customer_type: z.string().optional(),
  source: z.string().optional(),
});

type MTCustomerFormData = z.infer<typeof mtCustomerSchema>;

interface EditMTCustomerPageProps {
  params: Promise<{ id: string }>;
}

export default function EditMTCustomerPage({
  params,
}: EditMTCustomerPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { user } = useAuth();
  const { data: customer, isLoading } = useMTCustomer(id);
  const updateMutation = useUpdateMTCustomer();
  const { data: salesPersonsData, isLoading: salesPersonsLoading } =
    useSalesPersons({ per_page: 100 });
  const { data: zonesData, isLoading: zonesLoading } = useZones({
    per_page: 100,
  });

  const canEditCredit =
    user?.role === "business-manager" || user?.role === "super-admin";

  const salesPersonOptions =
    salesPersonsData?.data.map((sp) => ({
      value: String(sp.id),
      label: sp.name,
    })) || [];

  const zoneOptions =
    zonesData?.data.map((z) => ({
      value: String(z.id),
      label: z.name,
    })) || [];

  const customerTypeOptions = [
    { value: "wholesale", label: "Wholesale" },
    { value: "retail", label: "Retail" },
    { value: "distributor", label: "Distributor" },
    { value: "institutional", label: "Institutional" },
  ];

  const sourceOptions = [
    { value: "referral", label: "Referral" },
    { value: "walk-in", label: "Walk-in" },
    { value: "online", label: "Online" },
    { value: "sales-team", label: "Sales Team" },
  ];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MTCustomerFormData>({
    resolver: zodResolver(mtCustomerSchema),
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        is_tax_exempt: customer.is_tax_exempt || false,
        is_credit_customer: customer.is_credit_customer || false,
        credit_limit: customer.credit_limit
          ? String(customer.credit_limit)
          : "",
        kra_pin: customer.kra_pin || "",
        sales_person_id: customer.sales_person?.id || "",
        zone_id: customer.zone?.id || "",
        street: customer.address?.street || "",
        city: customer.address?.city || "",
        country: customer.address?.country || "",
        phone: customer.contacts?.phone || "",
        email: customer.contacts?.email || "",
        customer_type: customer.metadata?.customer_type || "",
        source: customer.metadata?.source || "",
      });
    }
  }, [customer, reset]);

  const onSubmit = (data: MTCustomerFormData) => {
    const payload: UpdateMTCustomerPayload = {
      name: data.name,
      is_tax_exempt: data.is_tax_exempt,
      kra_pin: data.kra_pin || undefined,
      sales_person_id: data.sales_person_id || undefined,
      zone_id: data.zone_id || undefined,
      address: {
        street: data.street || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
      },
      contacts: {
        phone: data.phone || undefined,
        email: data.email || undefined,
      },
      metadata: {
        customer_type: data.customer_type || undefined,
        source: data.source || undefined,
      },
    };

    if (canEditCredit) {
      payload.is_credit_customer = data.is_credit_customer;
      payload.credit_limit = data.credit_limit
        ? parseFloat(data.credit_limit)
        : undefined;
    }

    updateMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          router.push(`/modern-trade/${id}`);
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

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-8 py-2">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <Link
            href={`/modern-trade/${id}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MdStore className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit MT Customer
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Update modern trade customer information
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
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Customer Name"
                    type="text"
                    placeholder="Enter customer name"
                    register={register("name")}
                    error={errors.name?.message}
                    required
                  />
                  <InputField
                    label="KRA PIN"
                    type="text"
                    placeholder="e.g., P051234567A"
                    register={register("kra_pin")}
                    error={errors.kra_pin?.message}
                  />
                  <SearchableSelect
                    label="Sales Person"
                    options={salesPersonOptions}
                    value={watch("sales_person_id") || ""}
                    onChange={(value) => setValue("sales_person_id", value)}
                    error={errors.sales_person_id?.message}
                    disabled={salesPersonsLoading}
                    placeholder="Select sales person..."
                    required
                  />
                  <SearchableSelect
                    label="Zone"
                    options={zoneOptions}
                    value={watch("zone_id") || ""}
                    onChange={(value) => setValue("zone_id", value)}
                    error={errors.zone_id?.message}
                    disabled={zonesLoading}
                    placeholder="Select zone..."
                    required
                  />
                </div>
                <div className="flex gap-6 mt-4">
                  <Checkbox label="Tax Exempt" {...register("is_tax_exempt")} />
                  {canEditCredit && (
                    <Checkbox
                      label="Credit Customer"
                      {...register("is_credit_customer")}
                    />
                  )}
                </div>
                {canEditCredit && watch("is_credit_customer") && (
                  <div className="mt-4 max-w-xs">
                    <InputField
                      label="Credit Limit"
                      type="number"
                      placeholder="e.g., 150000"
                      register={register("credit_limit")}
                      error={errors.credit_limit?.message}
                    />
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Phone Number"
                    type="tel"
                    placeholder="e.g., 254712345678"
                    register={register("phone")}
                    error={errors.phone?.message}
                  />
                  <InputField
                    label="Email Address"
                    type="email"
                    placeholder="Enter email address"
                    register={register("email")}
                    error={errors.email?.message}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <InputField
                    label="Street"
                    type="text"
                    placeholder="Enter street address"
                    register={register("street")}
                    error={errors.street?.message}
                  />
                  <InputField
                    label="City"
                    type="text"
                    placeholder="Enter city"
                    register={register("city")}
                    error={errors.city?.message}
                  />
                  <InputField
                    label="Country"
                    type="text"
                    placeholder="e.g., Kenya"
                    register={register("country")}
                    error={errors.country?.message}
                  />
                </div>
              </div>

              {/* Business Details */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Business Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <SearchableSelect
                    label="Customer Type"
                    options={customerTypeOptions}
                    value={watch("customer_type") || ""}
                    onChange={(value) => setValue("customer_type", value)}
                    error={errors.customer_type?.message}
                    placeholder="Select customer type..."
                  />
                  <SearchableSelect
                    label="Source"
                    options={sourceOptions}
                    value={watch("source") || ""}
                    onChange={(value) => setValue("source", value)}
                    error={errors.source?.message}
                    placeholder="Select source..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-5 mt-5 border-t border-gray-200">
              <Link
                href={`/modern-trade/${id}`}
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
