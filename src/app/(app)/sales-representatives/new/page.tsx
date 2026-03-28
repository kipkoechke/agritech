"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { MdArrowBack, MdPerson } from "react-icons/md";
import { useCreateSalesPerson } from "@/hooks/useSalesPerson";
import { useZones } from "@/hooks/useZone";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";

const salesPersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  zone_id: z.string().min(1, "Zone is required"),
  phone: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  street: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
});

type SalesPersonFormData = z.infer<typeof salesPersonSchema>;

export default function NewSalesRepresentativePage() {
  const router = useRouter();
  const createMutation = useCreateSalesPerson();

  // Fetch zones for dropdown
  const { data: zonesData } = useZones({ per_page: 100 });
  const zoneOptions =
    zonesData?.data?.map((zone) => ({
      value: zone.id,
      label: zone.name,
    })) || [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SalesPersonFormData>({
    resolver: zodResolver(salesPersonSchema),
    defaultValues: {
      name: "",
      email: "",
      zone_id: "",
      phone: "",
      contact_phone: "",
      contact_email: "",
      street: "",
      city: "",
      postal_code: "",
    },
  });

  const onSubmit = (data: SalesPersonFormData) => {
    const payload = {
      name: data.name,
      email: data.email,
      zone_id: data.zone_id,
      phone: data.phone || undefined,
      contacts:
        data.contact_phone || data.contact_email
          ? {
              phone: data.contact_phone || undefined,
              email: data.contact_email || undefined,
            }
          : undefined,
      address:
        data.street || data.city || data.postal_code
          ? {
              street: data.street || undefined,
              city: data.city || undefined,
              postal_code: data.postal_code || undefined,
            }
          : undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        router.push("/sales-representatives");
      },
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-8 py-2">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <Link
            href="/sales-representatives"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MdPerson className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                New Sales Representative
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Create a new sales representative account
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
                    label="Full Name"
                    type="text"
                    placeholder="Enter full name"
                    register={register("name")}
                    error={errors.name?.message}
                    required
                  />
                  <InputField
                    label="Email Address"
                    type="email"
                    placeholder="Enter email address"
                    register={register("email")}
                    error={errors.email?.message}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                  <SearchableSelect
                    label="Zone"
                    required
                    options={zoneOptions}
                    value={watch("zone_id")}
                    onChange={(value: string) => setValue("zone_id", value)}
                    error={errors.zone_id?.message}
                    placeholder="Select zone"
                  />
                  <InputField
                    label="Phone Number"
                    type="tel"
                    placeholder="+254712345678"
                    register={register("phone")}
                    error={errors.phone?.message}
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Alternate Contacts (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Contact Phone"
                    type="tel"
                    placeholder="+254712345678"
                    register={register("contact_phone")}
                    error={errors.contact_phone?.message}
                  />
                  <InputField
                    label="Contact Email"
                    type="email"
                    placeholder="contact@example.com"
                    register={register("contact_email")}
                    error={errors.contact_email?.message}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Address (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <InputField
                    label="Street"
                    type="text"
                    placeholder="123 Main Street"
                    register={register("street")}
                    error={errors.street?.message}
                  />
                  <InputField
                    label="City"
                    type="text"
                    placeholder="Nairobi"
                    register={register("city")}
                    error={errors.city?.message}
                  />
                  <InputField
                    label="Postal Code"
                    type="text"
                    placeholder="00100"
                    register={register("postal_code")}
                    error={errors.postal_code?.message}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-gray-200">
              <Link
                href="/sales-representatives"
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-5 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {createMutation.isPending ? "Creating..." : "Create Sales Rep"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
