// app/farms/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  MdClose,
  MdMap,
  MdRefresh,
  MdFilterList,
  MdExpandMore,
  MdExpandLess,
  MdLocationOn,
  MdAgriculture,
  MdScale,
  MdViewList,
  MdPublic,
  MdPerson,
  MdFactory,
  MdCategory,
  MdCode,
  MdInfo,
  MdArrowForward,
} from "react-icons/md";
import { useAuth, useIsAdmin, useIsFarmer, useIsSupervisor } from "@/hooks/useAuth";
import { useFarms } from "@/hooks/useFarm";
import type { Farm } from "@/types/farm";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Helper to safely get coordinates
const getCoordinates = (farm: Farm): { lat: number; lng: number } | null => {
  if (!farm.coordinates) return null;
  const coords = farm.coordinates as any;
  if (typeof coords.lat === "number" && typeof coords.lng === "number") {
    return { lat: coords.lat, lng: coords.lng };
  }
  if (typeof coords.latitude === "number" && typeof coords.longitude === "number") {
    return { lat: coords.latitude, lng: coords.longitude };
  }
  return null;
};

// Helper to format number
const formatNumber = (num: number) => num.toLocaleString("en-KE");

// Get marker color based on product type
const getProductColor = (productName: string | undefined) => {
  const colors: Record<string, string> = {
    Tea: "#10b981", // green
    Coffee: "#8b5cf6", // purple
    Maize: "#f59e0b", // amber
    Wheat: "#3b82f6", // blue
    Default: "#ef4444", // red
  };
  return colors[productName || ""] || colors.Default;
};

// Get marker color based on farm size
const getSizeColor = (size: number) => {
  if (size >= 10) return "#10b981";
  if (size >= 5) return "#3b82f6";
  if (size >= 2) return "#f59e0b";
  return "#ef4444";
};

// Farm Detail Card Component (Compact for sidebar)
const FarmDetailCard = ({ farm, onViewDetails }: { farm: Farm | null; onViewDetails: (id: string) => void }) => {
  if (!farm) return null;

  const size = parseFloat(farm.size as any) || 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MdLocationOn className="w-4 h-4 text-primary" />
          Selected Farm
        </h3>
        <button
          onClick={() => onViewDetails(farm.id)}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
        >
          View Details <MdArrowForward className="w-3 h-3" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Farm Name</p>
          <p className="text-base font-semibold text-gray-900">{farm.name}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Farm Code</p>
            <p className="text-sm font-medium text-gray-700">{farm.farm_code}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Size</p>
            <p className="text-sm font-medium text-gray-700">{size.toFixed(2)} Ha</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Zone</p>
          <p className="text-sm font-medium text-gray-700">{farm.zone?.name || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Farmer</p>
          <p className="text-sm font-medium text-gray-700">{farm.farmer?.name || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Product</p>
          <p className="text-sm font-medium text-gray-700">{farm.product?.name || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default function FarmLocationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const isFarmer = useIsFarmer();
  const isSupervisor = useIsSupervisor();

  // State
  const [activeTab, setActiveTab] = useState<"map" | "table">("map");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");
  const [selectedClusterId, setSelectedClusterId] = useState<string>("");
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch farms using the hook
  const { data: farmsResponse, isLoading, isError, refetch } = useFarms({});
  const allFarms = farmsResponse?.data || [];

  // Setup Leaflet icons on mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
      });
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleClearFilters = () => {
    setSelectedZoneId("");
    setSelectedFarmerId("");
    setSelectedClusterId("");
  };

  const handleViewFarmDetails = (farmId: string) => {
    router.push(`/farms/${farmId}`);
  };

  // Filter farms based on role and selected filters
  const filteredFarms = useMemo(() => {
    let data = allFarms;

    // Role-based filtering
    if (isFarmer && user) {
      const userZoneId = (user as any)?.zone?.id;
      if (userZoneId) {
        data = data.filter((farm) => farm.zone?.id === userZoneId);
      }
    }
    if (isSupervisor && user) {
      const userZoneId = (user as any)?.zone?.id;
      if (userZoneId) {
        data = data.filter((farm) => farm.zone?.id === userZoneId);
      }
    }

    // Zone filter
    if (selectedZoneId) {
      data = data.filter((farm) => farm.zone?.id === selectedZoneId);
    }

    // Farmer filter
    if (selectedFarmerId) {
      data = data.filter((farm) => farm.farmer?.id === selectedFarmerId);
    }

    // Cluster filter
    if (selectedClusterId) {
      data = data.filter((farm) => farm.cluster?.id === selectedClusterId);
    }

    return data;
  }, [selectedZoneId, selectedFarmerId, selectedClusterId, allFarms, user, isFarmer, isSupervisor]);

  // Get unique values for filters
  const uniqueZones = useMemo(() => {
    const zonesMap = new Map<string, string>();
    allFarms.forEach((farm) => {
      if (farm.zone?.id && farm.zone?.name) {
        zonesMap.set(farm.zone.id, farm.zone.name);
      }
    });
    return Array.from(zonesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [allFarms]);

  const uniqueFarmers = useMemo(() => {
    const farmersMap = new Map<string, string>();
    allFarms.forEach((farm) => {
      if (farm.farmer?.id && farm.farmer?.name) {
        farmersMap.set(farm.farmer.id, farm.farmer.name);
      }
    });
    return Array.from(farmersMap.entries()).map(([id, name]) => ({ id, name }));
  }, [allFarms]);

  const uniqueClusters = useMemo(() => {
    const clustersMap = new Map<string, string>();
    allFarms.forEach((farm) => {
      if (farm.cluster?.id && farm.cluster?.name) {
        clustersMap.set(farm.cluster.id, farm.cluster.name);
      }
    });
    return Array.from(clustersMap.entries()).map(([id, name]) => ({ id, name }));
  }, [allFarms]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalFarms = filteredFarms.length;
    const totalSize = filteredFarms.reduce(
      (sum, farm) => sum + (parseFloat(farm.size as any) || 0),
      0,
    );
    const uniqueFarmersCount = new Set(filteredFarms.map((f) => f.farmer?.id).filter(Boolean)).size;
    return { totalFarms, totalSize: totalSize.toFixed(1), uniqueFarmersCount };
  }, [filteredFarms]);

  const getDashboardTitle = () => {
    if (isAdmin) return "Farm Locations";
    if (isFarmer) return "My Farm";
    if (isSupervisor) return "Supervisor Farms";
    return "Farm Locations";
  };

  // Calculate map center
  const mapCenter = useMemo(() => {
    if (selectedFarm) {
      const coords = getCoordinates(selectedFarm);
      if (coords) return [coords.lat, coords.lng] as [number, number];
    }
    const farmsWithCoords = filteredFarms.filter((farm) => getCoordinates(farm));
    if (farmsWithCoords.length > 0) {
      const coords = getCoordinates(farmsWithCoords[0]);
      if (coords) return [coords.lat, coords.lng] as [number, number];
    }
    return [0, 0] as [number, number];
  }, [selectedFarm, filteredFarms]);

  const farmsWithCoords = useMemo(
    () => filteredFarms.filter((f) => getCoordinates(f)),
    [filteredFarms]
  );

  // Show loading state
  if (!isMounted || isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load farms</p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-primary text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header Bar with Filter */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div
          className="flex items-center justify-between px-3 md:px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/10 text-primary shrink-0">
              <MdMap className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-base md:text-lg font-bold text-gray-900">
              {getDashboardTitle()}
            </h1>
            <MdFilterList className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MdRefresh className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            {isFilterExpanded ? (
              <MdExpandLess className="w-5 h-5 text-gray-500" />
            ) : (
              <MdExpandMore className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        {isFilterExpanded && (
          <div className="border-t border-gray-100 px-3 md:px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">Zone</label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm"
                >
                  <option value="">All Zones</option>
                  {uniqueZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">Farmer</label>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => setSelectedFarmerId(e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm"
                >
                  <option value="">All Farmers</option>
                  {uniqueFarmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">Cluster</label>
                <select
                  value={selectedClusterId}
                  onChange={(e) => setSelectedClusterId(e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm"
                >
                  <option value="">All Clusters</option>
                  {uniqueClusters.map((cluster) => (
                    <option key={cluster.id} value={cluster.id}>
                      {cluster.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={handleClearFilters}
                disabled={!selectedZoneId && !selectedFarmerId && !selectedClusterId}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  selectedZoneId || selectedFarmerId || selectedClusterId
                    ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                    : "text-gray-400 bg-gray-50 cursor-not-allowed"
                }`}
              >
                <MdClose className="w-4 h-4" /> Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards Row */}
      <div className="px-3 md:px-4 py-2 bg-gray-100 shrink-0">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <MdLocationOn className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-slate-500">Total Farms</p>
                <p className="text-lg md:text-2xl font-bold text-slate-900">
                  {formatNumber(stats.totalFarms)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <MdScale className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-slate-500">Total Size (Ha)</p>
                <p className="text-lg md:text-2xl font-bold text-amber-600">
                  {stats.totalSize} Ha
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <MdPerson className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-slate-500">Total Farmers</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600">
                  {formatNumber(stats.uniqueFarmersCount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Left Panel + Right Panel */}
      <div className="flex-1 flex overflow-hidden px-3 md:px-4 pb-4 gap-4">
        {/* LEFT PANEL - Selected Farm Details */}
        <div className="w-full lg:w-2/5 xl:w-1/3 bg-transparent overflow-y-auto space-y-4">
          {/* Instructions Card when no farm selected */}
          {!selectedFarm && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
              <MdInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Click on any farm marker on the map or select a farm from the table to view details here.
              </p>
            </div>
          )}

          {/* Selected Farm Detail Card */}
          {selectedFarm && (
            <FarmDetailCard farm={selectedFarm} onViewDetails={handleViewFarmDetails} />
          )}
        </div>

        {/* RIGHT PANEL - Tabs Container with Map/Table */}
        <div className="flex-1 relative min-w-0 bg-white rounded-lg border border-slate-200 flex flex-col">
          {/* Tab Bar */}
          <div className="border-b border-gray-200 shrink-0">
            <div className="flex">
              <button
                onClick={() => setActiveTab("map")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "map"
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <MdMap className="w-4 h-4" />
                Map View
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "table"
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <MdViewList className="w-4 h-4" />
                Table View
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "map" ? (
              // Map View
              <div className="h-full p-3 md:p-4">
                <div className="h-full rounded-lg overflow-hidden border border-gray-200">
                  {farmsWithCoords.length > 0 ? (
                    <MapContainer
                      key={`map-${selectedZoneId}-${selectedFarmerId}-${selectedClusterId}`}
                      center={mapCenter}
                      zoom={12}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {farmsWithCoords.map((farm) => {
                        const coords = getCoordinates(farm);
                        if (!coords) return null;
                        const size = parseFloat(farm.size as any) || 0;
                        const radius = Math.max(8, Math.min(25, Math.sqrt(size) * 3));
                        const isSelected = selectedFarm?.id === farm.id;
                        const markerColor = getSizeColor(size);
                        return (
                          <CircleMarker
                            key={farm.id}
                            center={[coords.lat, coords.lng]}
                            radius={isSelected ? radius + 5 : radius}
                            fillColor={markerColor}
                            color={isSelected ? "#3b82f6" : markerColor}
                            weight={isSelected ? 3 : 2}
                            opacity={1}
                            fillOpacity={0.7}
                            eventHandlers={{
                              click: () => setSelectedFarm(farm),
                            }}
                          >
                            <Popup>
                              <div className="text-sm min-w-[200px]">
                                <p className="font-bold text-gray-900">{farm.name}</p>
                                <p className="text-gray-600 text-xs">Farm Code: {farm.farm_code}</p>
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <p className="text-gray-600">
                                    <span className="font-medium">Zone:</span> {farm.zone?.name || "N/A"}
                                  </p>
                                  <p className="text-gray-600">
                                    <span className="font-medium">Farmer:</span> {farm.farmer?.name || "N/A"}
                                  </p>
                                  <p className="text-gray-600">
                                    <span className="font-medium">Product:</span> {farm.product?.name || "N/A"}
                                  </p>
                                  <p className="text-primary font-bold mt-1">
                                    Size: {size.toFixed(2)} Ha
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleViewFarmDetails(farm.id)}
                                  className="mt-2 w-full text-center text-primary text-xs font-medium hover:underline"
                                >
                                  View Full Details →
                                </button>
                              </div>
                            </Popup>
                          </CircleMarker>
                        );
                      })}
                    </MapContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50">
                      <p className="text-gray-500">No farms with coordinates available</p>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-gray-600">Large (10+ Ha)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-600">Medium (5-10 Ha)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs text-gray-600">Small (2-5 Ha)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600">Very Small (&lt;2 Ha)</span>
                  </div>
                </div>
              </div>
            ) : (
              // Table View
              <div className="h-full overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farm Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farm Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farmer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cluster
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size (Ha)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFarms.map((farm) => (
                      <tr
                        key={farm.id}
                        onClick={() => setSelectedFarm(farm)}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedFarm?.id === farm.id ? "bg-primary/5" : ""
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {farm.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {farm.farm_code}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {farm.zone?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {farm.farmer?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {farm.cluster?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {farm.product?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {parseFloat(farm.size as any)?.toFixed(2) || "0"} Ha
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFarmDetails(farm.id);
                            }}
                            className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
                          >
                            View <MdArrowForward className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredFarms.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No farms found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}