"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { MdArrowBack, MdBusiness } from "react-icons/md";
import { useCreateCustomer } from "@/hooks/useCustomer";
import { useSalesPersons } from "@/hooks/useSalesPerson";
import { useZones } from "@/hooks/useZone";
import { useAuth } from "@/hooks/useAuth";
import type { CreateCustomerPayload } from "@/types/customer";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import Checkbox from "@/components/common/Checkbox";
import { toast } from "react-hot-toast";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  is_tax_exempt: z.boolean().optional(),
  is_credit_customer: z.boolean().optional(),
  credit_limit: z.string().optional(),
  kra_pin: z.string().optional(),
  sales_person_id: z.string().optional(),
  zone_id: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  customer_type: z.string().optional(),
  source: z.string().optional(),
  auto_generate_email: z.boolean().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

// Added a Function to generate email from phone number
const generateEmailFromPhone = (phone: string): string => {
  if (!phone) return "";

  // Remove any non-digit characters
  const cleanedPhone = phone.replace(/\D/g, "");

  // Handle different phone formats
  let phoneNumber = cleanedPhone;

  // If starts with 0, replace with 254
  if (phoneNumber.startsWith("0")) {
    phoneNumber = "254" + phoneNumber.substring(1);
  }

  // If starts with +254, remove the +
  if (phoneNumber.startsWith("254") && cleanedPhone.includes("+")) {
    phoneNumber = cleanedPhone.replace("+", "");
  }

  // Ensure it starts with 254
  if (!phoneNumber.startsWith("254") && phoneNumber.length >= 9) {
    phoneNumber = "254" + phoneNumber.substring(phoneNumber.length - 9);
  }

  return `${phoneNumber}@ravinedairies.co.ke`;
};

export default function NewCustomerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateCustomer();
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const { data: salesPersonsData, isLoading: salesPersonsLoading } =
    useSalesPersons({ per_page: 100 });
  const { data: zonesData, isLoading: zonesLoading } = useZones({
    per_page: 100,
  });

  const canEditCredit =
    user?.role === "business-manager" || user?.role === "super-admin";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      is_tax_exempt: false,
      is_credit_customer: false,
      auto_generate_email: false,
    },
  });

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

  // Helper to get API error for a field (handles nested keys like "contacts.phone")
  const getApiError = (field: string): string | undefined => {
    if (apiErrors[field]) return apiErrors[field][0];
    for (const [key, messages] of Object.entries(apiErrors)) {
      if (key.endsWith(`.${field}`)) return messages[0];
    }
    return undefined;
  };

  const phoneValue = watch("phone");
  const autoGenerateEmail = watch("auto_generate_email");
  const hasPhone = !!phoneValue && phoneValue.trim() !== "";

  // Auto-generate email when checkbox is checked or phone changes
  useEffect(() => {
    if (autoGenerateEmail && hasPhone) {
      const generatedEmail = generateEmailFromPhone(phoneValue!);
      if (generatedEmail) {
        setValue("email", generatedEmail);
      }
    }
  }, [autoGenerateEmail, phoneValue, hasPhone, setValue]);

  // Uncheck auto-generate if phone is cleared
  useEffect(() => {
    if (autoGenerateEmail && !hasPhone) {
      setValue("auto_generate_email", false);
      setValue("email", "");
    }
  }, [hasPhone, autoGenerateEmail, setValue]);

  const onSubmit = (data: CustomerFormData) => {
    setApiErrors({});
    const payload: CreateCustomerPayload = {
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

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Customer created successfully");
        router.push("/customers");
      },
      onError: (error: unknown) => {
        const axiosError = error as {
          response?: { data?: { errors?: Record<string, string[]> } };
        };
        if (axiosError.response?.data?.errors) {
          setApiErrors(axiosError.response.data.errors);
        } else {
          toast.error("Failed to create customer");
        }
      },
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-8 py-2">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <Link
            href="/customers"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MdBusiness className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Customer</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Create a new customer account
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            {/* API Validation Errors Banner */}
            {Object.keys(apiErrors).length > 0 && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-800 mb-1">
                  Please fix the following errors:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {Object.entries(apiErrors).map(([key, messages]) =>
                    messages.map((msg, i) => (
                      <li key={`${key}-${i}`} className="text-sm text-red-700">
                        {msg}
                      </li>
                    )),
                  )}
                </ul>
              </div>
            )}
            <div className="space-y-4">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Customer Name"
                    type="text"
                    placeholder="Enter customer name"
                    register={register("name")}
                    error={errors.name?.message || getApiError("name")}
                    required
                  />
                  <InputField
                    label="KRA PIN"
                    type="text"
                    placeholder="e.g., P051234567A"
                    register={register("kra_pin")}
                    error={errors.kra_pin?.message || getApiError("kra_pin")}
                  />
                  <SearchableSelect
                    label="Sales Person"
                    options={salesPersonOptions}
                    value={watch("sales_person_id") || ""}
                    onChange={(value) => setValue("sales_person_id", value)}
                    error={
                      errors.sales_person_id?.message ||
                      getApiError("sales_person_id")
                    }
                    disabled={salesPersonsLoading}
                    placeholder="Select sales person..."
                  />
                  <SearchableSelect
                    label="Zone"
                    options={zoneOptions}
                    value={watch("zone_id") || ""}
                    onChange={(value) => setValue("zone_id", value)}
                    error={errors.zone_id?.message || getApiError("zone_id")}
                    disabled={zonesLoading}
                    placeholder="Select zone..."
                  />
                </div>
                <div className="flex flex-wrap items-start gap-6 mt-3">
                  <Checkbox label="Tax Exempt" {...register("is_tax_exempt")} />
                  {canEditCredit && (
                    <Checkbox
                      label="Credit Customer"
                      {...register("is_credit_customer")}
                    />
                  )}
                  <div className="flex flex-col">
                    <Checkbox
                      label="Auto-generate Email"
                      disabled={!hasPhone}
                      {...register("auto_generate_email")}
                    />
                    {!hasPhone && (
                      <p className="text-xs text-red-400 mt-0.5 ml-6">
                        Enter a phone number first to enable
                      </p>
                    )}
                  </div>
                </div>
                {canEditCredit && watch("is_credit_customer") && (
                  <div className="mt-3 max-w-xs">
                    <InputField
                      label="Credit Limit"
                      type="number"
                      placeholder="e.g., 150000"
                      register={register("credit_limit")}
                      error={
                        errors.credit_limit?.message ||
                        getApiError("credit_limit")
                      }
                    />
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Phone Number"
                    type="tel"
                    placeholder="e.g., +254712345678"
                    register={register("phone")}
                    error={errors.phone?.message || getApiError("phone")}
                  />
                  <InputField
                    label="Email Address"
                    type="email"
                    placeholder={
                      autoGenerateEmail
                        ? "Auto-generated from phone"
                        : "Enter email address"
                    }
                    register={register("email")}
                    error={errors.email?.message || getApiError("email")}
                    disabled={!!autoGenerateEmail}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="Street"
                    type="text"
                    placeholder="Enter street address"
                    register={register("street")}
                    error={errors.street?.message || getApiError("street")}
                  />
                  <InputField
                    label="City"
                    type="text"
                    placeholder="Enter city"
                    register={register("city")}
                    error={errors.city?.message || getApiError("city")}
                  />
                  <InputField
                    label="Country"
                    type="text"
                    placeholder="e.g., Kenya"
                    register={register("country")}
                    error={errors.country?.message || getApiError("country")}
                  />
                </div>
              </div>

              {/* Business Details */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Business Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchableSelect
                    label="Customer Type"
                    options={customerTypeOptions}
                    value={watch("customer_type") || ""}
                    onChange={(value) => setValue("customer_type", value)}
                    error={
                      errors.customer_type?.message ||
                      getApiError("customer_type")
                    }
                    placeholder="Select customer type..."
                  />
                  <SearchableSelect
                    label="Source"
                    options={sourceOptions}
                    value={watch("source") || ""}
                    onChange={(value) => setValue("source", value)}
                    error={errors.source?.message || getApiError("source")}
                    placeholder="Select source..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-gray-200">
              <Link
                href="/customers"
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {createMutation.isPending ? "Creating..." : "Create Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
