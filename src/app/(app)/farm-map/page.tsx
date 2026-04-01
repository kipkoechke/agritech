"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
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
  MdTrendingUp,
} from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth, useIsAdmin, useIsFarmer, useIsSupervisor, useIsPlucker } from "@/hooks/useAuth";

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

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";
import React from "react";

// Dummy farm data
const FARMS_DATA = [
  { id: "F001", name: "Highland Farm", farmer: "John Doe", size: 12, zone: "Highland", lat: -1.2921, lng: 36.8219, totalKilos: 450, supervisor: "Kiprotich", factory: "Momul Tea Factory", rating: 4.8 },
  { id: "F002", name: "Lowland Farm", farmer: "Jane Smith", size: 8, zone: "Lowland", lat: -1.3000, lng: 36.8200, totalKilos: 320, supervisor: "Langat", factory: "Tegat Tea Factory", rating: 4.2 },
  { id: "F003", name: "Midland Farm", farmer: "Peter Mwangi", size: 15, zone: "Midland", lat: -1.2950, lng: 36.8250, totalKilos: 580, supervisor: "Kipkemboi", factory: "Toror Tea Factory", rating: 4.9 },
  { id: "F004", name: "Riverside Farm", farmer: "Alice Wanjiku", size: 20, zone: "Lowland", lat: -1.2880, lng: 36.8300, totalKilos: 280, supervisor: "Cherono", factory: "Litein Tea Factory", rating: 3.9 },
  { id: "F005", name: "Sunset Farm", farmer: "Michael Kariuki", size: 10, zone: "Highland", lat: -1.2980, lng: 36.8100, totalKilos: 620, supervisor: "Koech", factory: "Chelal Tea Factory", rating: 5.0 },
  { id: "F006", name: "Valley Farm", farmer: "Grace Njeri", size: 18, zone: "Midland", lat: -1.2935, lng: 36.8280, totalKilos: 490, supervisor: "Mutai", factory: "Kipkoimet Tea Factory", rating: 4.6 },
  { id: "F007", name: "Forest Farm", farmer: "David Otieno", size: 14, zone: "Highland", lat: -1.2900, lng: 36.8150, totalKilos: 380, supervisor: "Bett", factory: "Chemomi Tea Factory", rating: 4.3 },
  { id: "F008", name: "Meadow Farm", farmer: "Lilian Achieng", size: 9, zone: "Lowland", lat: -1.2960, lng: 36.8180, totalKilos: 290, supervisor: "Kiplagat", factory: "Kapsumbeiwa Tea Factory", rating: 4.0 },
  { id: "F009", name: "Hilltop Farm", farmer: "Kevin Mworia", size: 11, zone: "Highland", lat: -1.2890, lng: 36.8230, totalKilos: 350, supervisor: "Rono", factory: "Sotik Tea Factory", rating: 4.1 },
  { id: "F010", name: "Lakeside Farm", farmer: "Sarah Wambui", size: 16, zone: "Midland", lat: -1.2975, lng: 36.8275, totalKilos: 420, supervisor: "Korir", factory: "Kapsuser Tea Factory", rating: 4.4 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const RankingChart = ({ data, title, icon: Icon, valueLabel = "KG" }: { 
  data: Array<{ name: string; value: number }>;
  title: string;
  icon: any;
  valueLabel?: string;
}) => (
  <div className="bg-white rounded-lg border border-slate-200">
    <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-200">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm md:text-base">
        <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
        {title}
      </h2>
    </div>
    <div className="p-3 md:p-4">
      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 text-center">
                <span className={`text-sm font-bold ${
                  i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-500"
                }`}>
                  #{i + 1}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {item.value.toLocaleString()} {valueLabel}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(item.value / data[0].value) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No data available</p>
      )}
    </div>
  </div>
);

export default function FarmMapPage() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const isFarmer = useIsFarmer();
  const isSupervisor = useIsSupervisor();

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [zone, setZone] = useState("");
  const [factory, setFactory] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
      });
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleClearFilters = () => {
    setZone("");
    setFactory("");
  };

  // Filter farms based on role and filters
  const filteredFarms = useMemo(() => {
    let data = FARMS_DATA;
    
    if (isFarmer && user?.zone_name) {
      data = data.filter((farm) => farm.zone === user.zone_name);
    }
    if (isSupervisor && user?.zone_name) {
      data = data.filter((farm) => farm.zone === user.zone_name);
    }
    
    return data.filter((farm) => {
      const matchesZone = !zone || farm.zone === zone;
      const matchesFactory = !factory || farm.factory === factory;
      return matchesZone && matchesFactory;
    });
  }, [zone, factory, user, isFarmer, isSupervisor]);

  const uniqueZones = [...new Set(FARMS_DATA.map(f => f.zone))];
  const uniqueFactories = [...new Set(FARMS_DATA.map(f => f.factory))];

  const getMarkerColor = (kilos: number) => {
    if (kilos >= 500) return "#10b981";
    if (kilos >= 400) return "#3b82f6";
    if (kilos >= 300) return "#f59e0b";
    return "#ef4444";
  };

  const formatNumber = (num: number) => num.toLocaleString("en-KE");
  const formatKilos = (kilos: number) => `${kilos.toLocaleString("en-KE")} KG`;

  // Stats
  const stats = useMemo(() => {
    const totalFarms = filteredFarms.length;
    const totalKilos = filteredFarms.reduce((sum, farm) => sum + farm.totalKilos, 0);
    return { totalFarms, totalKilos };
  }, [filteredFarms]);

  // Top farms by production
  const topFarms = useMemo(() => {
    return [...filteredFarms]
      .sort((a, b) => b.totalKilos - a.totalKilos)
      .slice(0, 5)
      .map(farm => ({ name: farm.name, value: farm.totalKilos }));
  }, [filteredFarms]);

  // Production by zone
  const zoneProduction = useMemo(() => {
    const map: Record<string, number> = {};
    filteredFarms.forEach((farm) => {
      map[farm.zone] = (map[farm.zone] || 0) + farm.totalKilos;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredFarms]);

  const getDashboardTitle = () => {
    if (isAdmin) return "Farm Map";
    if (isFarmer) return "My Farm Map";
    if (isSupervisor) return "Supervisor Farm Map";
    return "Farm Map";
  };

  const mapCenter = useMemo(() => {
    if ((isFarmer || isSupervisor) && filteredFarms.length > 0) {
      return [filteredFarms[0].lat, filteredFarms[0].lng] as [number, number];
    }
    return [-1.2921, 36.8219] as [number, number];
  }, [filteredFarms, isFarmer, isSupervisor]);

  // Show loading placeholder until mounted on client
  if (!isMounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-100">
      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div
          className="flex items-center justify-between px-3 md:px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/10 text-primary shrink-0">
              <MdMap className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-base md:text-lg font-bold text-gray-900">{getDashboardTitle()}</h1>
            <MdFilterList className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MdRefresh className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            {isFilterExpanded ? <MdExpandLess className="w-5 h-5 text-gray-500" /> : <MdExpandMore className="w-5 h-5 text-gray-500" />}
          </div>
        </div>

        {isFilterExpanded && (
          <div className="border-t border-gray-100 px-3 md:px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">Zone</label>
                <select value={zone} onChange={(e) => setZone(e.target.value)} className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm">
                  <option value="">All Zones</option>
                  {uniqueZones.map((z) => (<option key={z} value={z}>{z}</option>))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">Factory</label>
                <select value={factory} onChange={(e) => setFactory(e.target.value)} className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm">
                  <option value="">All Factories</option>
                  {uniqueFactories.map((f) => (<option key={f} value={f}>{f}</option>))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={handleClearFilters} disabled={!zone && !factory} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${zone || factory ? "text-gray-700 bg-gray-100 hover:bg-gray-200" : "text-gray-400 bg-gray-50 cursor-not-allowed"}`}>
                <MdClose className="w-4 h-4" /> Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-2 pb-20 md:pb-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <MdLocationOn className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-slate-500">Total Farms</p>
                <p className="text-lg md:text-2xl font-bold text-slate-900">{formatNumber(stats.totalFarms)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <MdScale className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-slate-500">Total Production</p>
                <p className="text-lg md:text-2xl font-bold text-amber-600">{formatKilos(stats.totalKilos)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Analytics - Top Farms & Production by Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <RankingChart 
            data={topFarms} 
            title="Top Performing Farms" 
            icon={MdTrendingUp} 
            valueLabel="KG" 
          />
          
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm md:text-base">
                <MdLocationOn className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                Production by Zone
              </h2>
            </div>
            <div className="p-3 md:p-4">
              {zoneProduction.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={zoneProduction}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.name}: ${entry.value} KG`}
                    >
                      {zoneProduction.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} KG`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg border border-slate-200 mb-4">
          <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm md:text-base">
              <MdMap className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              Farm Locations
            </h2>
          </div>
          <div className="p-3 md:p-4">
            <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
              <MapContainer
                center={mapCenter}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filteredFarms.map((farm) => (
                  <CircleMarker
                    key={farm.id}
                    center={[farm.lat, farm.lng]}
                    radius={Math.sqrt(farm.totalKilos) / 2}
                    fillColor={getMarkerColor(farm.totalKilos)}
                    color={getMarkerColor(farm.totalKilos)}
                    weight={2}
                    opacity={1}
                    fillOpacity={0.7}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold text-gray-900">{farm.name}</p>
                        <p className="text-gray-600">Farmer: {farm.farmer}</p>
                        <p className="text-gray-600">Zone: {farm.zone}</p>
                        <p className="text-gray-600">Factory: {farm.factory}</p>
                        <p className="text-gray-600">Supervisor: {farm.supervisor}</p>
                        <p className="text-gray-600">Size: {farm.size} Ha</p>
                        <p className="text-primary font-bold mt-1">{farm.totalKilos} KG total</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-xs text-gray-600">High (500+ KG)</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-xs text-gray-600">Medium (400-499 KG)</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-xs text-gray-600">Low (300-399 KG)</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs text-gray-600">Very Low (&lt;300 KG)</span></div>
            </div>
          </div>
        </div>

        {/* Farm List Table */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm md:text-base">
              <MdAgriculture className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              Farm Details
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size (Ha)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Production (KG)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFarms.map((farm) => (
                  <tr key={farm.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{farm.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{farm.zone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{farm.factory}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{farm.supervisor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{farm.size} Ha</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{formatKilos(farm.totalKilos)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}