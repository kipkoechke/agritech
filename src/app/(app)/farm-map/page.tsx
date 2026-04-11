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
  MdPinDrop,
  MdStar,
  MdVerified,
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

// Beautiful Map Popup Component
const MapPopup = ({ farm, onViewDetails }: { farm: Farm; onViewDetails: (id: string) => void }) => {
  const size = parseFloat(farm.size as any) || 0;
  
  return (
    <div className="farm-popup">
      <div className="popup-header">
        <div className="popup-header-icon">
          <MdStore className="w-4 h-4" />
        </div>
        <div className="popup-header-content">
          <h3 className="popup-title">{farm.name}</h3>
          <p className="popup-subtitle">{farm.farm_code}</p>
        </div>
      </div>
      
      <div className="popup-body">
        <div className="popup-row">
          <span className="popup-label">Zone</span>
          <span className="popup-value">{farm.zone?.name || "N/A"}</span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Farmer</span>
          <span className="popup-value">{farm.farmer?.name || "N/A"}</span>
        </div>
        <div className="popup-row highlight">
          <span className="popup-label">Total Size</span>
          <span className="popup-value-highlight">{size.toFixed(2)} Hectares</span>
        </div>
      </div>
      
      <button className="popup-button" onClick={() => onViewDetails(farm.id)}>
        <MdInfo className="w-3.5 h-3.5" />
        View Complete Details
        <MdArrowForward className="w-3.5 h-3.5" />
      </button>

      <style jsx>{`
        .farm-popup {
          min-width: 260px;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        .popup-header {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .popup-header-icon {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .popup-header-content {
          flex: 1;
        }
        .popup-title {
          color: white;
          font-size: 14px;
          font-weight: 700;
          margin: 0;
          line-height: 1.3;
        }
        .popup-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 11px;
          margin: 2px 0 0;
        }
        .popup-body {
          padding: 12px 16px;
          background: white;
        }
        .popup-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .popup-row:last-child {
          border-bottom: none;
        }
        .popup-label {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .popup-value {
          font-size: 12px;
          color: #1f2937;
          font-weight: 500;
        }
        .popup-value-highlight {
          font-size: 13px;
          color: #059669;
          font-weight: 700;
        }
        .popup-row.highlight {
          margin-top: 4px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
        }
        .popup-button {
          width: 100%;
          padding: 10px;
          background: #f9fafb;
          border: none;
          border-top: 1px solid #e5e7eb;
          color: #059669;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .popup-button:hover {
          background: #f3f4f6;
        }
      `}</style>
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

  const hasActiveFilters = selectedZoneId || selectedFarmerId || selectedClusterId;

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

  // Center of Kenya coordinates
  const kenyaCenter: [number, number] = [0.0236, 37.9062];
  const defaultZoom = 7;

  // Calculate map center - use Kenya center by default, or center on selected farm
  const mapCenter = useMemo(() => {
    if (selectedFarm) {
      const coords = getCoordinates(selectedFarm);
      if (coords) return [coords.lat, coords.lng] as [number, number];
    }
    // If there are farms with coordinates, average them to show all
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

  // Calculate zoom level based on number of farms
  const mapZoom = useMemo(() => {
    const farmsWithCoords = filteredFarms.filter((farm) => getCoordinates(farm));
    if (selectedFarm) return 14;
    if (farmsWithCoords.length === 0) return defaultZoom;
    if (farmsWithCoords.length === 1) return 13;
    if (farmsWithCoords.length <= 5) return 11;
    if (farmsWithCoords.length <= 20) return 9;
    return defaultZoom;
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
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                <MdAgriculture className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {getDashboardTitle()}
                </h1>
                <p className="text-xs text-gray-500">Manage and monitor all farm locations</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <MdRefresh className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="px-4 py-3 bg-gray-100 shrink-0">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <MdLocationOn className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Farms</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(stats.totalFarms)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <MdScale className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Size</p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.totalSize} <span className="text-sm">Ha</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <MdPerson className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Farmers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatNumber(stats.uniqueFarmersCount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Row - Single Line */}
      <div className="px-4 py-2 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <MdFilterList className="w-4 h-4 text-gray-400" />
          
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="border-gray-300 focus:border-primary text-gray-900 focus:ring-primary rounded-lg border px-3 py-1.5 text-sm min-w-[120px]"
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
            className="border-gray-300 focus:border-primary text-gray-900 focus:ring-primary rounded-lg border px-3 py-1.5 text-sm min-w-[140px]"
          >
            <option value="">All Farmers</option>
            {uniqueFarmers.map((farmer) => (
              <option key={farmer.id} value={farmer.id}>
                {farmer.name}
              </option>
            ))}
          </select>

          <select
            value={selectedClusterId}
            onChange={(e) => setSelectedClusterId(e.target.value)}
            className="border-gray-300 focus:border-primary text-gray-900 focus:ring-primary rounded-lg border px-3 py-1.5 text-sm min-w-[140px]"
          >
            <option value="">All Clusters</option>
            {uniqueClusters.map((cluster) => (
              <option key={cluster.id} value={cluster.id}>
                {cluster.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MdClear className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="px-4 pt-3 bg-gray-100 shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all ${
              activeTab === "map"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <MdMap className="w-4 h-4" />
            Map View
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all ${
              activeTab === "table"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <MdViewList className="w-4 h-4" />
            Table View
          </button>
        </div>
      </div>

      {/* Main Content: Left Panel + Right Panel */}
      <div className="flex-1 flex overflow-hidden px-4 pb-4 gap-4 bg-gray-100">
        {/* LEFT PANEL - Selected Farm Details */}
        <div className="w-full lg:w-2/5 xl:w-1/3 bg-transparent overflow-y-auto space-y-4 pt-2">
          {/* Instructions Card when no farm selected */}
          {!selectedFarm && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdInfo className="w-8 h-8 text-gray-400" />
              </div>
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

        {/* RIGHT PANEL - Map or Table based on active tab */}
        <div className="flex-1 relative min-w-0 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {activeTab === "map" ? (
            // Map View
            <div className="h-full">
              <div className="h-full">
                {farmsWithCoords.length > 0 ? (
                  <MapContainer
                    key={`map-${selectedZoneId}-${selectedFarmerId}-${selectedClusterId}`}
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
                            <MapPopup farm={farm} onViewDetails={handleViewFarmDetails} />
                          </Popup>
                        </CircleMarker>
                      );
                    })}
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <MdPublic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No farms with coordinates available</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Map Legend */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 p-2">
                <div className="flex flex-col gap-1.5">
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
  );
}