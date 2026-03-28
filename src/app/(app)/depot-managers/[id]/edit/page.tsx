"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { MdArrowBack, MdBusiness } from "react-icons/md";
import {
  useDepotManager,
  useUpdateDepotManager,
} from "@/hooks/useDepotManager";
import { useZones } from "@/hooks/useZone";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { SelectField } from "@/components/common/SelectField";

const depotManagerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  zone_id: z.string().min(1, "Zone is required"),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  street: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  contact_address: z.string().optional(),
});

type DepotManagerFormData = z.infer<typeof depotManagerSchema>;

interface EditDepotManagerPageProps {
  params: Promise<{ id: string }>;
}

export default function EditDepotManagerPage({
  params,
}: EditDepotManagerPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: manager, isLoading } = useDepotManager(id);
  const updateMutation = useUpdateDepotManager();

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
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DepotManagerFormData>({
    resolver: zodResolver(depotManagerSchema),
  });

  useEffect(() => {
    if (manager) {
      reset({
        name: manager.name,
        email: manager.email,
        zone_id: manager.zone?.id || "",
        phone: manager.phone || "",
        status: manager.status || "active",
        street: manager.address?.street || "",
        city: manager.address?.city || "",
        postal_code: manager.address?.postal_code || "",
        country: manager.address?.country || "",
        contact_phone: manager.contacts?.phone || "",
        contact_email: manager.contacts?.email || "",
        contact_address: manager.contacts?.address || "",
      });
    }
  }, [manager, reset]);

  const onSubmit = (data: DepotManagerFormData) => {
    const payload = {
      name: data.name,
      email: data.email,
      zone_id: data.zone_id,
      phone: data.phone || undefined,
      status: data.status,
      address:
        data.street || data.city || data.postal_code || data.country
          ? {
              street: data.street || undefined,
              city: data.city || undefined,
              postal_code: data.postal_code || undefined,
              country: data.country || undefined,
            }
          : undefined,
      contacts:
        data.contact_phone || data.contact_email || data.contact_address
          ? {
              phone: data.contact_phone || undefined,
              email: data.contact_email || undefined,
              address: data.contact_address || undefined,
            }
          : undefined,
    };

    updateMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          router.push(`/depot-managers/${id}`);
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
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 md:mb-6 shrink-0">
          <Link
            href={`/depot-managers/${id}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MdBusiness className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                Edit Depot Manager
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                Update depot manager information
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg border border-gray-200 p-4 md:p-6"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
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
                  <SelectField
                    label="Status"
                    register={register("status")}
                    error={errors.status?.message}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Address (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  <InputField
                    label="Country"
                    type="text"
                    placeholder="Kenya"
                    register={register("country")}
                    error={errors.country?.message}
                  />
                </div>
              </div>

              {/* Alternate Contacts */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Alternate Contacts (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Alternate Phone"
                    type="tel"
                    placeholder="+254712345678"
                    register={register("contact_phone")}
                    error={errors.contact_phone?.message}
                  />
                  <InputField
                    label="Alternate Email"
                    type="email"
                    placeholder="alternate@example.com"
                    register={register("contact_email")}
                    error={errors.contact_email?.message}
                  />
                </div>
                <div className="mt-5">
                  <InputField
                    label="Alternate Address"
                    type="text"
                    placeholder="P.O Box 12345, Nairobi"
                    register={register("contact_address")}
                    error={errors.contact_address?.message}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-3 justify-end pt-6 mt-6 border-t border-gray-200">
              <Link
                href={`/depot-managers/${id}`}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm text-center"
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
