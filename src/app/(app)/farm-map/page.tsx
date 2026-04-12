// app/farms/page.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  MdMap,
  MdRefresh,
  MdFilterList,
  MdLocationOn,
  MdAgriculture,
  MdScale,
  MdViewList,
  MdPublic,
  MdPerson,
  MdInfo,
  MdArrowForward,
  MdClear,
  MdStore,
  MdDirections,
  MdSchedule,
  MdVisibility,
} from "react-icons/md";
import { useAuth, useIsAdmin, useIsFarmer, useIsSupervisor } from "@/hooks/useAuth";
import { useFarms } from "@/hooks/useFarm";
import { useFactories } from "@/hooks/useFactory";
import { useClusters } from "@/hooks/useCluster";
import type { Farm } from "@/types/farm";
import "leaflet/dist/leaflet.css";

// Dynamically import MapContainer with no SSR
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

// Get marker color based on farm size
const getSizeColor = (size: number) => {
  if (size >= 10) return "#10b981";
  if (size >= 5) return "#3b82f6";
  if (size >= 2) return "#f59e0b";
  return "#ef4444";
};

// Farm Detail Card Component
const FarmDetailCard = ({ farm, onViewDetails }: { farm: Farm | null; onViewDetails: (id: string) => void }) => {
  if (!farm) return null;

  const size = parseFloat(farm.size as any) || 0;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 shadow-md overflow-hidden">
      <div className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <MdStore className="w-3 h-3 text-white" />
            </div>
            <h3 className="font-semibold text-white text-xs">Selected Farm</h3>
          </div>
          <button
            onClick={() => onViewDetails(farm.id)}
            className="text-[10px] text-white/90 hover:text-white font-medium flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded-lg transition-colors"
          >
            View <MdArrowForward className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
      <div className="p-2">
        <div className="mb-2">
          <p className="text-[9px] text-emerald-700/70 uppercase mb-0.5 font-medium">Farm Name</p>
          <p className="text-xs font-bold text-gray-900 truncate">{farm.name}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <p className="text-[9px] text-emerald-700/70 uppercase mb-0.5 font-medium">Code</p>
            <p className="text-[10px] font-semibold text-gray-700 bg-white/60 px-1.5 py-0.5 rounded-lg">{farm.farm_code}</p>
          </div>
          <div>
            <p className="text-[9px] text-emerald-700/70 uppercase mb-0.5 font-medium">Size</p>
            <p className="text-[10px] font-bold text-emerald-700 bg-emerald-200/50 px-1.5 py-0.5 rounded-lg inline-block">{size.toFixed(2)} Ha</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-0.5 border-b border-emerald-200/50">
            <span className="text-[9px] text-emerald-700/70 font-medium">Zone</span>
            <span className="text-[10px] font-semibold text-gray-800">{farm.zone?.name || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[9px] text-emerald-700/70 font-medium">Farmer</span>
            <span className="text-[10px] font-semibold text-gray-800">{farm.farmer?.name || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Single Card Map Popup Component
const MapPopup = ({ farm, onViewDetails, onViewSchedules, onGetDirections }: { 
  farm: Farm; 
  onViewDetails: (id: string) => void; 
  onViewSchedules: (id: string) => void;
  onGetDirections: (lat: number, lng: number, name: string) => void;
}) => {
  const size = parseFloat(farm.size as any) || 0;
  const coords = getCoordinates(farm);
  
  return (
    <div className="w-[260px] bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <MdStore className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{farm.name}</h3>
            <p className="text-white/80 text-[10px]">{farm.farm_code}</p>
          </div>
        </div>
      </div>
      
      <div className="px-3 py-2">
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MdLocationOn className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] text-gray-500">Zone</span>
          </div>
          <span className="text-[12px] font-semibold text-gray-800">{farm.zone?.name || "N/A"}</span>
        </div>
        
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MdPerson className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] text-gray-500">Farmer</span>
          </div>
          <span className="text-[12px] font-semibold text-gray-800">{farm.farmer?.name || "N/A"}</span>
        </div>
        
        <div className="flex justify-between items-center py-1.5">
          <div className="flex items-center gap-2">
            <MdScale className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] text-gray-500">Size</span>
          </div>
          <span className="text-[12px] font-bold text-emerald-600">{size.toFixed(2)} Ha</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-0.5 p-1.5 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => onViewDetails(farm.id)}
          className="flex flex-col items-center gap-0.5 py-1.5 rounded-md bg-white hover:bg-gray-100 transition-colors shadow-sm"
        >
          <MdVisibility className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[9px] font-medium text-gray-600">View</span>
        </button>
        
        <button
          onClick={() => onViewSchedules(farm.id)}
          className="flex flex-col items-center gap-0.5 py-1.5 rounded-md bg-white hover:bg-gray-100 transition-colors shadow-sm"
        >
          <MdSchedule className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[9px] font-medium text-gray-600">Schedule</span>
        </button>
        
        {coords && (
          <button
            onClick={() => onGetDirections(coords.lat, coords.lng, farm.name)}
            className="flex flex-col items-center gap-0.5 py-1.5 rounded-md bg-white hover:bg-gray-100 transition-colors shadow-sm"
          >
            <MdDirections className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[9px] font-medium text-gray-600">Direction</span>
          </button>
        )}
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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>("");
  const [selectedClusterId, setSelectedClusterId] = useState<string>("");
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  // Fetch farms using the hook
  const { data: farmsResponse, isLoading, isError, refetch } = useFarms({});
  const allFarms = farmsResponse?.data || [];

  // Fetch factories based on selected zone
  const { data: factoriesResponse } = useFactories(
    selectedZoneId ? { zone_id: selectedZoneId } : undefined
  );
  const factories = factoriesResponse?.data || [];

  // Fetch clusters based on selected factory
  const { data: clustersResponse } = useClusters(
    selectedFactoryId ? { factory_id: selectedFactoryId } : undefined
  );
  const clusters = clustersResponse?.data || [];

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

  // Update map key when filters change to force remount
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [selectedZoneId, selectedFactoryId, selectedClusterId, selectedFarmId, activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleClearFilters = () => {
    setSelectedZoneId("");
    setSelectedFactoryId("");
    setSelectedClusterId("");
    setSelectedFarmId("");
  };

  const handleViewFarmDetails = (farmId: string) => {
    router.push(`/farms/${farmId}`);
  };

  const handleViewSchedules = (farmId: string) => {
    router.push(`/schedules?farmId=${farmId}`);
  };

  const handleGetDirections = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Get unique zones from farms
  const uniqueZones = useMemo(() => {
    const zonesMap = new Map<string, string>();
    allFarms.forEach((farm) => {
      if (farm.zone?.id && farm.zone?.name) {
        zonesMap.set(farm.zone.id, farm.zone.name);
      }
    });
    return Array.from(zonesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [allFarms]);

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

    // Cascade filters
    if (selectedZoneId) {
      data = data.filter((farm) => farm.zone?.id === selectedZoneId);
    }
    if (selectedFactoryId) {
      data = data.filter((farm) => farm.factory?.id === selectedFactoryId);
    }
    if (selectedClusterId) {
      data = data.filter((farm) => farm.cluster?.id === selectedClusterId);
    }
    if (selectedFarmId) {
      data = data.filter((farm) => farm.id === selectedFarmId);
    }

    return data;
  }, [selectedZoneId, selectedFactoryId, selectedClusterId, selectedFarmId, allFarms, user, isFarmer, isSupervisor]);

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

  // East Africa center
  const eastAfricaCenter: [number, number] = [0, 40];
  const defaultZoom = 5.5;

  const mapCenter = useMemo(() => {
    if (selectedFarm) {
      const coords = getCoordinates(selectedFarm);
      if (coords) return [coords.lat, coords.lng] as [number, number];
    }
    const farmsWithCoords = filteredFarms.filter((farm) => getCoordinates(farm));
    if (farmsWithCoords.length > 0) {
      const avgLat = farmsWithCoords.reduce((sum, farm) => {
        const coords = getCoordinates(farm);
        return sum + (coords?.lat || 0);
      }, 0) / farmsWithCoords.length;
      const avgLng = farmsWithCoords.reduce((sum, farm) => {
        const coords = getCoordinates(farm);
        return sum + (coords?.lng || 0);
      }, 0) / farmsWithCoords.length;
      return [avgLat, avgLng] as [number, number];
    }
    return eastAfricaCenter;
  }, [selectedFarm, filteredFarms]);

  const mapZoom = useMemo(() => {
    const farmsWithCoords = filteredFarms.filter((farm) => getCoordinates(farm));
    if (selectedFarm) return 12;
    if (farmsWithCoords.length === 0) return defaultZoom;
    if (farmsWithCoords.length === 1) return 10;
    if (farmsWithCoords.length <= 5) return 8;
    if (farmsWithCoords.length <= 20) return 6.5;
    return defaultZoom;
  }, [selectedFarm, filteredFarms]);

  const farmsWithCoords = useMemo(
    () => filteredFarms.filter((f) => getCoordinates(f)),
    [filteredFarms]
  );

  const hasActiveFilters = selectedZoneId || selectedFactoryId || selectedClusterId || selectedFarmId;

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
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="px-3 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                <MdAgriculture className="w-3.5 h-3.5" />
              </div>
              <h1 className="text-sm font-bold text-gray-900">{getDashboardTitle()}</h1>
            </div>
            <button
              onClick={handleRefresh}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MdRefresh className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          {/* Tab Toggle */}
          <div className="p-2 border-b border-slate-200">
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
              <button
                onClick={() => setActiveTab("map")}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                  activeTab === "map"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MdMap className="w-3 h-3" />
                Map View
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                  activeTab === "table"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MdViewList className="w-3 h-3" />
                Table View
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="p-2 border-b border-slate-200">
            <div className="flex gap-2">
              <div className="flex-1 bg-blue-50 rounded-lg px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MdLocationOn className="w-3 h-3 text-blue-500" />
                    <span className="text-[9px] text-gray-500">Farms</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatNumber(stats.totalFarms)}</span>
                </div>
              </div>
              <div className="flex-1 bg-amber-50 rounded-lg px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MdScale className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] text-gray-500">Size(Ha)</span>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{stats.totalSize}</span>
                </div>
              </div>
              <div className="flex-1 bg-purple-50 rounded-lg px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MdPerson className="w-3 h-3 text-purple-500" />
                    <span className="text-[9px] text-gray-500">Farmers</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{formatNumber(stats.uniqueFarmersCount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-2 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <MdFilterList className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium text-gray-700">Filters</span>
                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-0.5"
                >
                  <MdClear className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={selectedZoneId}
                onChange={(e) => {
                  setSelectedZoneId(e.target.value);
                  setSelectedFactoryId("");
                  setSelectedClusterId("");
                  setSelectedFarmId("");
                }}
                className="border-gray-200 focus:border-primary text-gray-900 focus:ring-primary rounded-md border px-2 py-1.5 text-[10px] bg-white truncate"
              >
                <option value="">All Zones</option>
                {uniqueZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedFactoryId}
                onChange={(e) => {
                  setSelectedFactoryId(e.target.value);
                  setSelectedClusterId("");
                  setSelectedFarmId("");
                }}
                className="border-gray-200 focus:border-primary text-gray-900 focus:ring-primary rounded-md border px-2 py-1.5 text-[10px] bg-white truncate"
                disabled={!selectedZoneId || factories.length === 0}
              >
                <option value="">All Factories</option>
                {factories.map((factory: any) => (
                  <option key={factory.id} value={factory.id}>
                    {factory.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedClusterId}
                onChange={(e) => {
                  setSelectedClusterId(e.target.value);
                  setSelectedFarmId("");
                }}
                className="border-gray-200 focus:border-primary text-gray-900 focus:ring-primary rounded-md border px-2 py-1.5 text-[10px] bg-white truncate"
                disabled={!selectedFactoryId || clusters.length === 0}
              >
                <option value="">All Clusters</option>
                {clusters.map((cluster: any) => (
                  <option key={cluster.id} value={cluster.id}>
                    {cluster.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="border-gray-200 focus:border-primary text-gray-900 focus:ring-primary rounded-md border px-2 py-1.5 text-[10px] bg-white truncate"
              >
                <option value="">All Farms</option>
                {filteredFarms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Farm Details */}
          <div className="flex-1 p-2">
            {!selectedFarm && (
              <div className="text-center py-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MdInfo className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-[10px] text-gray-500">Click on a farm marker</p>
                <p className="text-[9px] text-gray-400 mt-0.5">to view details here</p>
              </div>
            )}
            {selectedFarm && (
              <FarmDetailCard farm={selectedFarm} onViewDetails={handleViewFarmDetails} />
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Map or Table */}
        <div className="flex-1 relative bg-gray-100">
          {activeTab === "map" ? (
            <div className="h-full relative" key={`map-wrapper-${mapKey}`}>
              {farmsWithCoords.length > 0 ? (
                <MapContainer
                  key={mapKey}
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                  zoomControl={true}
                >
                  <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {farmsWithCoords.map((farm) => {
                    const coords = getCoordinates(farm);
                    if (!coords) return null;
                    const size = parseFloat(farm.size as any) || 0;
                    const radius = Math.max(6, Math.min(20, Math.sqrt(size) * 2.5));
                    const isSelected = selectedFarm?.id === farm.id;
                    const markerColor = getSizeColor(size);
                    return (
                      <CircleMarker
                        key={farm.id}
                        center={[coords.lat, coords.lng]}
                        radius={isSelected ? radius + 4 : radius}
                        fillColor={markerColor}
                        color={isSelected ? "#3b82f6" : markerColor}
                        weight={isSelected ? 2.5 : 1.5}
                        opacity={1}
                        fillOpacity={0.7}
                        eventHandlers={{
                          click: () => setSelectedFarm(farm),
                        }}
                      >
                        <Popup>
                          <MapPopup 
                            farm={farm} 
                            onViewDetails={handleViewFarmDetails}
                            onViewSchedules={handleViewSchedules}
                            onGetDirections={handleGetDirections}
                          />
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MdPublic className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs">No farms with coordinates available</p>
                  </div>
                </div>
              )}
              {/* Map Legend */}
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 px-2 py-1">
                <div className="flex gap-2 text-[9px]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>10+Ha</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>5-10Ha</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>2-5Ha</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>&lt;2Ha</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto bg-white m-2 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500">Name</th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500">Code</th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500">Zone</th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500">Farmer</th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500">Size</th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500">Actions</th>
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
                      <td className="px-2 py-1.5 whitespace-nowrap text-[11px] font-medium text-gray-900">
                        {farm.name}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-gray-500">
                        {farm.farm_code}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-gray-500">
                        {farm.zone?.name || "N/A"}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-gray-500">
                        {farm.farmer?.name || "N/A"}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-[10px] font-semibold text-gray-900">
                        {parseFloat(farm.size as any)?.toFixed(2) || "0"} Ha
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFarmDetails(farm.id);
                          }}
                          className="text-primary hover:text-primary/80 text-[10px] flex items-center gap-0.5"
                        >
                          View <MdArrowForward className="w-2.5 h-2.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredFarms.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-xs">No farms found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}