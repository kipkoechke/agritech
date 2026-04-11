// app/farms/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
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
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { useAuth, useIsAdmin, useIsFarmer, useIsSupervisor } from "@/hooks/useAuth";
import { useFarms } from "@/hooks/useFarm";
import type { Farm } from "@/types/farm";
import "leaflet/dist/leaflet.css";

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

// Farm Detail Card Component (Left Panel)
const FarmDetailCard = ({ farm, onViewDetails }: { farm: Farm | null; onViewDetails: (id: string) => void }) => {
  if (!farm) return null;

  const size = parseFloat(farm.size as any) || 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <MdStore className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900">Selected Farm</h3>
          </div>
          <button
            onClick={() => onViewDetails(farm.id)}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            View Details <MdArrowForward className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Farm Name</p>
          <p className="text-base font-bold text-gray-900">{farm.name}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Farm Code</p>
            <p className="text-sm font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded">{farm.farm_code}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Size</p>
            <p className="text-sm font-bold text-primary bg-primary/5 px-2 py-1 rounded inline-block">{size.toFixed(2)} Ha</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <span className="text-xs text-gray-500">Zone</span>
            <span className="text-sm font-medium text-gray-800">{farm.zone?.name || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-500">Farmer</span>
            <span className="text-sm font-medium text-gray-800">{farm.farmer?.name || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Map Popup Component
const MapPopup = ({ farm, onViewDetails, onViewSchedules, onGetDirections }: { 
  farm: Farm; 
  onViewDetails: (id: string) => void; 
  onViewSchedules: (id: string) => void;
  onGetDirections: (lat: number, lng: number, name: string) => void;
}) => {
  const size = parseFloat(farm.size as any) || 0;
  const coords = getCoordinates(farm);
  
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-w-[280px]">
      <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MdStore className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{farm.name}</h3>
            <p className="text-white/70 text-xs">{farm.farm_code}</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Zone</span>
          <span className="text-sm font-medium text-gray-800">{farm.zone?.name || "N/A"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Farmer</span>
          <span className="text-sm font-medium text-gray-800">{farm.farmer?.name || "N/A"}</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
          <span className="text-xs text-gray-500">Size</span>
          <span className="text-sm font-bold text-primary">{size.toFixed(2)} Ha</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1 p-2 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => onViewDetails(farm.id)}
          className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg hover:bg-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <MdVisibility className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[10px] font-medium text-gray-600">View</span>
        </button>
        
        <button
          onClick={() => onViewSchedules(farm.id)}
          className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg hover:bg-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
            <MdSchedule className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-[10px] font-medium text-gray-600">Schedules</span>
        </button>
        
        {coords && (
          <button
            onClick={() => onGetDirections(coords.lat, coords.lng, farm.name)}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg hover:bg-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <MdDirections className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[10px] font-medium text-gray-600">Directions</span>
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
  const [showFilters, setShowFilters] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>("");
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
    setSelectedFactoryId("");
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

  const hasActiveFilters = selectedZoneId || selectedFarmerId || selectedFactoryId;

  // Filter farms
  const filteredFarms = useMemo(() => {
    let data = allFarms;

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

    if (selectedZoneId) {
      data = data.filter((farm) => farm.zone?.id === selectedZoneId);
    }

    if (selectedFarmerId) {
      data = data.filter((farm) => farm.farmer?.id === selectedFarmerId);
    }

    if (selectedFactoryId) {
      data = data.filter((farm) => farm.factory?.id === selectedFactoryId);
    }

    return data;
  }, [selectedZoneId, selectedFarmerId, selectedFactoryId, allFarms, user, isFarmer, isSupervisor]);

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

  const uniqueFactories = useMemo(() => {
    const factoriesMap = new Map<string, string>();
    allFarms.forEach((farm) => {
      if (farm.factory?.id && farm.factory?.name) {
        factoriesMap.set(farm.factory.id, farm.factory.name);
      }
    });
    return Array.from(factoriesMap.entries()).map(([id, name]) => ({ id, name }));
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

  // Kenya/East Africa bounds
  const kenyaBounds: [[number, number], [number, number]] = [
    [-5, 34], // Southwest corner (Latitude, Longitude)
    [5, 42],  // Northeast corner
  ];
  
  const kenyaCenter: [number, number] = [0.0236, 37.9062];
  const defaultZoom = 6.5;

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
    return kenyaCenter;
  }, [selectedFarm, filteredFarms]);

  const mapZoom = useMemo(() => {
    const farmsWithCoords = filteredFarms.filter((farm) => getCoordinates(farm));
    if (selectedFarm) return 14;
    if (farmsWithCoords.length === 0) return defaultZoom;
    if (farmsWithCoords.length === 1) return 12;
    if (farmsWithCoords.length <= 5) return 10;
    if (farmsWithCoords.length <= 20) return 8;
    return defaultZoom;
  }, [selectedFarm, filteredFarms]);

  const farmsWithCoords = useMemo(
    () => filteredFarms.filter((f) => getCoordinates(f)),
    [filteredFarms]
  );

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
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                <MdAgriculture className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">{getDashboardTitle()}</h1>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MdRefresh className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          {/* Tab Toggle at top */}
          <div className="p-3 border-b border-slate-200">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("map")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === "map"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MdMap className="w-3.5 h-3.5" />
                Map
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === "table"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MdViewList className="w-3.5 h-3.5" />
                Table
              </button>
            </div>
          </div>

          {/* Stats - Horizontal row */}
          <div className="p-3 border-b border-slate-200">
            <div className="flex gap-2">
              <div className="flex-1 bg-gradient-to-r from-blue-50 to-white rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MdLocationOn className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-[10px] text-gray-500">Farms</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatNumber(stats.totalFarms)}</span>
                </div>
              </div>
              <div className="flex-1 bg-gradient-to-r from-amber-50 to-white rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                      <MdScale className="w-3 h-3 text-amber-600" />
                    </div>
                    <span className="text-[10px] text-gray-500">Size</span>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{stats.totalSize}H</span>
                </div>
              </div>
              <div className="flex-1 bg-gradient-to-r from-purple-50 to-white rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                      <MdPerson className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-[10px] text-gray-500">Farmers</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{formatNumber(stats.uniqueFarmersCount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full p-3 border-b border-slate-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MdFilterList className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-gray-700">Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </div>
            {showFilters ? (
              <MdChevronLeft className="w-4 h-4 text-gray-400" />
            ) : (
              <MdChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* Filters - Horizontal row when visible */}
          {showFilters && (
            <div className="p-3 border-b border-slate-200 space-y-2">
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full border-gray-200 focus:border-primary text-gray-900 focus:ring-primary rounded-lg border px-2 py-1.5 text-xs"
              >
                <option value="">All Zones</option>
                {uniqueZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedFarmerId}
                onChange={(e) => setSelectedFarmerId(e.target.value)}
                className="w-full border-gray-200 focus:border-primary text-gray-900 focus:ring-primary rounded-lg border px-2 py-1.5 text-xs"
              >
                <option value="">All Farmers</option>
                {uniqueFarmers.map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>
                    {farmer.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedFactoryId}
                onChange={(e) => setSelectedFactoryId(e.target.value)}
                className="w-full border-gray-200 focus:border-primary text-gray-900 focus:ring-primary rounded-lg border px-2 py-1.5 text-xs"
              >
                <option value="">All Factories</option>
                {uniqueFactories.map((factory) => (
                  <option key={factory.id} value={factory.id}>
                    {factory.name}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MdClear className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Selected Farm Details */}
          <div className="flex-1 p-3">
            {!selectedFarm && (
              <div className="text-center py-6">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MdInfo className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-500">
                  Click a marker or select from table
                </p>
              </div>
            )}
            {selectedFarm && (
              <FarmDetailCard farm={selectedFarm} onViewDetails={handleViewFarmDetails} />
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 relative bg-gray-100">
          {activeTab === "map" ? (
            <div className="h-full relative">
              {farmsWithCoords.length > 0 ? (
                <MapContainer
                  key={`map-${selectedZoneId}-${selectedFarmerId}-${selectedFactoryId}`}
                  center={mapCenter}
                  zoom={mapZoom}
                  maxBounds={kenyaBounds}
                  maxBoundsViscosity={1.0}
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
                    <MdPublic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No farms with coordinates available</p>
                  </div>
                </div>
              )}
              {/* Map Legend */}
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 p-1.5">
                <div className="flex gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-gray-600">10+Ha</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">5-10Ha</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-gray-600">2-5Ha</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">&lt;2Ha</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto bg-white m-3 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Code</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Zone</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Farmer</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Size</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
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
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                        {farm.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {farm.farm_code}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {farm.zone?.name || "N/A"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {farm.farmer?.name || "N/A"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-900">
                        {parseFloat(farm.size as any)?.toFixed(2) || "0"} Ha
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFarmDetails(farm.id);
                          }}
                          className="text-primary hover:text-primary/80 text-xs flex items-center gap-1"
                        >
                          View <MdArrowForward className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredFarms.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">No farms found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}