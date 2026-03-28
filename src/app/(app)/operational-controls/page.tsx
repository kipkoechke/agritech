"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MdSettings,
  MdPublic,
  MdLocationOn,
  MdLocalShipping,
  MdAdd,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdCheck,
  MdClose,
} from "react-icons/md";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/common/TabBar";
import { SearchField } from "@/components/common/SearchField";
import { ActionMenu } from "@/components/common/ActionMenu";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import Pagination from "@/components/common/Pagination";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { HRISLayout } from "@/components/hris";
import {
  useRegions,
  useCreateRegion,
  useUpdateRegion,
  useDeleteRegion,
} from "@/hooks/useRegion";
import {
  useZones,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
} from "@/hooks/useZone";
import {
  useTransporters,
  useCreateTransporter,
  useUpdateTransporter,
  useDeleteTransporter,
} from "@/hooks/useTransporter";
import type { Region } from "@/types/region";
import type { Zone } from "@/types/zone";
import type { Transporter } from "@/types/transporter";

// Schemas
const regionSchema = z.object({
  name: z.string().min(1, "Region name is required"),
});

const zoneSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  region_id: z.string().min(1, "Region is required"),
});

const transporterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  license_plate: z.string().optional(),
  capacity: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  driver_name: z.string().optional(),
  route: z.string().optional(),
  region_id: z.string().optional(),
});

type RegionFormData = z.infer<typeof regionSchema>;
type ZoneFormData = z.infer<typeof zoneSchema>;
type TransporterFormData = z.infer<typeof transporterSchema>;

// Region Form Modal
function RegionFormModal({
  region,
  onClose,
}: {
  region?: Region;
  onClose: () => void;
}) {
  const createMutation = useCreateRegion();
  const updateMutation = useUpdateRegion();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegionFormData>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      name: region?.name || "",
    },
  });

  const onSubmit = (data: RegionFormData) => {
    if (region) {
      updateMutation.mutate(
        { id: region.id, data: { name: data.name } },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate({ name: data.name }, { onSuccess: onClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {region ? "Edit Region" : "New Region"}
      </h2>
      <InputField
        label="Region Name"
        type="text"
        placeholder="Enter region name"
        register={register("name")}
        error={errors.name?.message}
        required
      />
      <div className="flex gap-3 justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isPending ? "Saving..." : region ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

// Zone Form Modal
function ZoneFormModal({
  zone,
  regions,
  onClose,
}: {
  zone?: Zone;
  regions: Region[];
  onClose: () => void;
}) {
  const createMutation = useCreateZone();
  const updateMutation = useUpdateZone();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: zone?.name || "",
      region_id: zone?.region?.id || "",
    },
  });

  const regionId = watch("region_id");
  const regionOptions = regions.map((r) => ({ value: r.id, label: r.name }));

  const onSubmit = (data: ZoneFormData) => {
    if (zone) {
      updateMutation.mutate(
        { id: zone.id, data: { name: data.name, region_id: data.region_id } },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(
        { name: data.name, region_id: data.region_id },
        { onSuccess: onClose },
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {zone ? "Edit Zone" : "New Zone"}
      </h2>
      <div className="space-y-4">
        <InputField
          label="Zone Name"
          type="text"
          placeholder="Enter zone name"
          register={register("name")}
          error={errors.name?.message}
          required
        />
        <SearchableSelect
          label="Region"
          options={regionOptions}
          value={regionId}
          onChange={(value) => setValue("region_id", value)}
          placeholder="Select region"
          required
          error={errors.region_id?.message}
        />
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isPending ? "Saving..." : zone ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

// Transporter Form Modal
function TransporterFormModal({
  transporter,
  regions,
  onClose,
}: {
  transporter?: Transporter;
  regions: Region[];
  onClose: () => void;
}) {
  const createMutation = useCreateTransporter();
  const updateMutation = useUpdateTransporter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransporterFormData>({
    resolver: zodResolver(transporterSchema),
    defaultValues: {
      name: transporter?.name || "",
      license_plate: transporter?.license_plate || "",
      capacity: transporter?.capacity || "",
      phone: transporter?.contacts?.phone || "",
      email: transporter?.contacts?.email || "",
      driver_name: transporter?.metadata?.driver_name || "",
      route: transporter?.metadata?.route || "",
      region_id: transporter?.region?.id || "",
    },
  });

  const regionId = watch("region_id");
  const regionOptions = [
    { value: "", label: "No Region" },
    ...regions.map((r) => ({ value: r.id, label: r.name })),
  ];

  const onSubmit = (data: TransporterFormData) => {
    const payload = {
      name: data.name,
      license_plate: data.license_plate || undefined,
      capacity: data.capacity ? parseFloat(data.capacity) : undefined,
      contacts: {
        phone: data.phone || undefined,
        email: data.email || undefined,
      },
      metadata: {
        driver_name: data.driver_name || undefined,
        route: data.route || undefined,
      },
      region_id: data.region_id || undefined,
    };

    if (transporter) {
      updateMutation.mutate(
        { id: transporter.id, data: payload },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 max-h-[80vh] overflow-y-auto"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {transporter ? "Edit Transporter" : "New Transporter"}
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Name"
            type="text"
            placeholder="Enter transporter name"
            register={register("name")}
            error={errors.name?.message}
            required
          />
          <InputField
            label="License Plate"
            type="text"
            placeholder="e.g., KCA 123X"
            register={register("license_plate")}
            error={errors.license_plate?.message}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Capacity (Litres)"
            type="number"
            placeholder="Enter capacity"
            register={register("capacity")}
            error={errors.capacity?.message}
          />
          <SearchableSelect
            label="Region"
            options={regionOptions}
            value={regionId || ""}
            onChange={(value) => setValue("region_id", value)}
            placeholder="Select region"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Phone"
            type="tel"
            placeholder="Enter phone number"
            register={register("phone")}
            error={errors.phone?.message}
          />
          <InputField
            label="Email"
            type="email"
            placeholder="Enter email"
            register={register("email")}
            error={errors.email?.message}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Driver Name"
            type="text"
            placeholder="Enter driver name"
            register={register("driver_name")}
            error={errors.driver_name?.message}
          />
          <InputField
            label="Route"
            type="text"
            placeholder="e.g., Nairobi-Kiambu"
            register={register("route")}
            error={errors.route?.message}
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isPending ? "Saving..." : transporter ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

function OperationalControlsContent() {
  // Read tab from URL search params
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const validTabs = ["regions", "zones", "transporters"];
  const initialTab =
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "regions";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Sync activeTab with URL params when navigating
  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Pagination state
  const [regionsPage, setRegionsPage] = useState(1);
  const [zonesPage, setZonesPage] = useState(1);
  const [transportersPage, setTransportersPage] = useState(1);
  const perPage = 15;

  // Modal state
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showTransporterModal, setShowTransporterModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | undefined>();
  const [editingZone, setEditingZone] = useState<Zone | undefined>();
  const [editingTransporter, setEditingTransporter] = useState<
    Transporter | undefined
  >();

  // Delete mutations
  const deleteRegionMutation = useDeleteRegion();
  const deleteZoneMutation = useDeleteZone();
  const deleteTransporterMutation = useDeleteTransporter();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setRegionsPage(1);
      setZonesPage(1);
      setTransportersPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Data queries
  const { data: regionsData, isLoading: regionsLoading } = useRegions({
    page: regionsPage,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  const { data: zonesData, isLoading: zonesLoading } = useZones({
    page: zonesPage,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  const { data: transportersData, isLoading: transportersLoading } =
    useTransporters({
      page: transportersPage,
      per_page: perPage,
      search: debouncedSearch || undefined,
    });

  // All regions for zone/transporter forms
  const { data: allRegionsData } = useRegions({ per_page: 100 });
  const allRegions = allRegionsData?.data || [];

  const handleAddNew = () => {
    if (activeTab === "regions") {
      setEditingRegion(undefined);
      setShowRegionModal(true);
    } else if (activeTab === "zones") {
      setEditingZone(undefined);
      setShowZoneModal(true);
    } else if (activeTab === "transporters") {
      setEditingTransporter(undefined);
      setShowTransporterModal(true);
    }
  };

  const getAddButtonLabel = () => {
    if (activeTab === "regions") return "New Region";
    if (activeTab === "zones") return "New Zone";
    if (activeTab === "transporters") return "New Transporter";
    return "Add New";
  };

  return (
    <HRISLayout
      title="Operational Controls"
      description="Manage regions, zones, and transporters"
      search={
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search..."
        />
      }
      action={
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
        >
          <MdAdd className="w-5 h-5" />
          {getAddButtonLabel()}
        </button>
      }
    >
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 min-h-0 flex flex-col"
      >
        <TabsList className="shrink-0">
          <TabsTrigger value="regions" icon={<MdPublic className="w-4 h-4" />}>
            Regions
          </TabsTrigger>
          <TabsTrigger
            value="zones"
            icon={<MdLocationOn className="w-4 h-4" />}
          >
            Zones
          </TabsTrigger>
          <TabsTrigger
            value="transporters"
            icon={<MdLocalShipping className="w-4 h-4" />}
          >
            Transporters
          </TabsTrigger>
        </TabsList>

        {/* Regions Tab */}
        <TabsContent value="regions" className="flex-1 min-h-0 flex flex-col">
          <Modal>
            {regionsLoading && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">Loading regions...</p>
              </div>
            )}

            {regionsData && regionsData.data.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="overflow-y-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zones
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {regionsData.data.map((region) => (
                        <tr key={region.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {region.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {region.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {region.status ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <MdCheck className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <MdClose className="w-3 h-3" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {region.zones?.length || 0} zones
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <ActionMenu menuId={`region-menu-${region.id}`}>
                              <ActionMenu.Trigger>
                                <MdMoreVert className="w-5 h-5 text-gray-600" />
                              </ActionMenu.Trigger>
                              <ActionMenu.Content>
                                <ActionMenu.Item
                                  onClick={() => {
                                    setEditingRegion(region);
                                    setShowRegionModal(true);
                                  }}
                                >
                                  <MdEdit className="w-4 h-4" />
                                  Edit
                                </ActionMenu.Item>
                                <Modal.Open
                                  opens={`delete-region-${region.id}`}
                                >
                                  <ActionMenu.Item className="text-red-600 hover:bg-red-50">
                                    <MdDelete className="w-4 h-4" />
                                    Delete
                                  </ActionMenu.Item>
                                </Modal.Open>
                              </ActionMenu.Content>
                            </ActionMenu>

                            <Modal.Window name={`delete-region-${region.id}`}>
                              <DeleteConfirmationModal
                                itemName={region.name}
                                itemType="region"
                                onConfirm={() =>
                                  deleteRegionMutation.mutate(region.id)
                                }
                                isDeleting={deleteRegionMutation.isPending}
                              />
                            </Modal.Window>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {regionsData.pagination && regionsData.pagination.total > 0 && (
                  <Pagination
                    currentPage={regionsData.pagination.current_page}
                    totalPages={regionsData.pagination.last_page}
                    onPageChange={setRegionsPage}
                    totalItems={regionsData.pagination.total}
                    itemsPerPage={regionsData.pagination.per_page}
                  />
                )}
              </div>
            )}

            {regionsData && regionsData.data.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <MdPublic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No regions found
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by adding your first region.
                </p>
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
                >
                  <MdAdd className="w-5 h-5" />
                  New Region
                </button>
              </div>
            )}
          </Modal>
        </TabsContent>

        {/* Zones Tab */}
        <TabsContent value="zones" className="flex-1 min-h-0 flex flex-col">
          <Modal>
            {zonesLoading && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">Loading zones...</p>
              </div>
            )}

            {zonesData && zonesData.data.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="overflow-y-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Region
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {zonesData.data.map((zone) => (
                        <tr key={zone.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {zone.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {zone.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {zone.region ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {zone.region.name}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {zone.status ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <MdCheck className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <MdClose className="w-3 h-3" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <ActionMenu menuId={`zone-menu-${zone.id}`}>
                              <ActionMenu.Trigger>
                                <MdMoreVert className="w-5 h-5 text-gray-600" />
                              </ActionMenu.Trigger>
                              <ActionMenu.Content>
                                <ActionMenu.Item
                                  onClick={() => {
                                    setEditingZone(zone);
                                    setShowZoneModal(true);
                                  }}
                                >
                                  <MdEdit className="w-4 h-4" />
                                  Edit
                                </ActionMenu.Item>
                                <Modal.Open opens={`delete-zone-${zone.id}`}>
                                  <ActionMenu.Item className="text-red-600 hover:bg-red-50">
                                    <MdDelete className="w-4 h-4" />
                                    Delete
                                  </ActionMenu.Item>
                                </Modal.Open>
                              </ActionMenu.Content>
                            </ActionMenu>

                            <Modal.Window name={`delete-zone-${zone.id}`}>
                              <DeleteConfirmationModal
                                itemName={zone.name}
                                itemType="zone"
                                onConfirm={() =>
                                  deleteZoneMutation.mutate(zone.id)
                                }
                                isDeleting={deleteZoneMutation.isPending}
                              />
                            </Modal.Window>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {zonesData.pagination && zonesData.pagination.total > 0 && (
                  <Pagination
                    currentPage={zonesData.pagination.current_page}
                    totalPages={zonesData.pagination.last_page}
                    onPageChange={setZonesPage}
                    totalItems={zonesData.pagination.total}
                    itemsPerPage={zonesData.pagination.per_page}
                  />
                )}
              </div>
            )}

            {zonesData && zonesData.data.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <MdLocationOn className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No zones found
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by adding your first zone.
                </p>
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
                >
                  <MdAdd className="w-5 h-5" />
                  New Zone
                </button>
              </div>
            )}
          </Modal>
        </TabsContent>

        {/* Transporters Tab */}
        <TabsContent
          value="transporters"
          className="flex-1 min-h-0 flex flex-col"
        >
          <Modal>
            {transportersLoading && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">Loading transporters...</p>
              </div>
            )}

            {transportersData && transportersData.data.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="overflow-y-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          License Plate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Capacity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Region
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transportersData.data.map((transporter) => (
                        <tr key={transporter.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {transporter.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {transporter.license_plate || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {transporter.capacity
                                ? `${parseFloat(transporter.capacity).toLocaleString()} L`
                                : "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {transporter.region ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {transporter.region.name}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {transporter.contacts?.phone ||
                                transporter.contacts?.primary_phone ||
                                transporter.contacts?.email ||
                                "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <ActionMenu
                              menuId={`transporter-menu-${transporter.id}`}
                            >
                              <ActionMenu.Trigger>
                                <MdMoreVert className="w-5 h-5 text-gray-600" />
                              </ActionMenu.Trigger>
                              <ActionMenu.Content>
                                <ActionMenu.Item
                                  onClick={() => {
                                    setEditingTransporter(transporter);
                                    setShowTransporterModal(true);
                                  }}
                                >
                                  <MdEdit className="w-4 h-4" />
                                  Edit
                                </ActionMenu.Item>
                                <Modal.Open
                                  opens={`delete-transporter-${transporter.id}`}
                                >
                                  <ActionMenu.Item className="text-red-600 hover:bg-red-50">
                                    <MdDelete className="w-4 h-4" />
                                    Delete
                                  </ActionMenu.Item>
                                </Modal.Open>
                              </ActionMenu.Content>
                            </ActionMenu>

                            <Modal.Window
                              name={`delete-transporter-${transporter.id}`}
                            >
                              <DeleteConfirmationModal
                                itemName={transporter.name}
                                itemType="transporter"
                                onConfirm={() =>
                                  deleteTransporterMutation.mutate(
                                    transporter.id,
                                  )
                                }
                                isDeleting={deleteTransporterMutation.isPending}
                              />
                            </Modal.Window>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {transportersData.pagination &&
                  transportersData.pagination.total > 0 && (
                    <Pagination
                      currentPage={transportersData.pagination.current_page}
                      totalPages={transportersData.pagination.last_page}
                      onPageChange={setTransportersPage}
                      totalItems={transportersData.pagination.total}
                      itemsPerPage={transportersData.pagination.per_page}
                    />
                  )}
              </div>
            )}

            {transportersData && transportersData.data.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <MdLocalShipping className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No transporters found
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by adding your first transporter.
                </p>
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
                >
                  <MdAdd className="w-5 h-5" />
                  New Transporter
                </button>
              </div>
            )}
          </Modal>
        </TabsContent>
      </Tabs>

      {/* Form Modals */}
      {showRegionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <RegionFormModal
              region={editingRegion}
              onClose={() => {
                setShowRegionModal(false);
                setEditingRegion(undefined);
              }}
            />
          </div>
        </div>
      )}

      {showZoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <ZoneFormModal
              zone={editingZone}
              regions={allRegions}
              onClose={() => {
                setShowZoneModal(false);
                setEditingZone(undefined);
              }}
            />
          </div>
        </div>
      )}

      {showTransporterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <TransporterFormModal
              transporter={editingTransporter}
              regions={allRegions}
              onClose={() => {
                setShowTransporterModal(false);
                setEditingTransporter(undefined);
              }}
            />
          </div>
        </div>
      )}
    </HRISLayout>
  );
}

export default function OperationalControlsPage() {
  return (
    <Suspense
      fallback={
        <HRISLayout
          title="Operational Controls"
          description="Manage regions, zones, and transporters for your operations"
        >
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </HRISLayout>
      }
    >
      <OperationalControlsContent />
    </Suspense>
  );
}
