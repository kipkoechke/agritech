"use client";

import { useState, useMemo } from "react";
import {
  MdClose,
  MdDashboard,
  MdAgriculture,
  MdScale,
  MdSupervisorAccount,
  MdFactory,
  MdMap,
  MdRefresh,
  MdFilterList,
  MdExpandMore,
  MdExpandLess,
  MdCalendarToday,
  MdTrendingUp,
  MdLocationOn,
  MdBusiness,
  MdPerson,
  MdDesignServices,
  MdPeople,
} from "react-icons/md";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth, useIsAdmin, useIsFarmer, useIsSupervisor, useIsPlucker } from "@/hooks/useAuth";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Updated data with realistic Kenyan names
const ALL_DATA = [
  // Kericho Data
  { zone: "Kericho", factory: "Momul Tea Factory", supervisor: "Wilson Kipruto", plucker: "James Kipkemoi", kilos: 145, date: "2026-03-01", lat: -0.368, lng: 35.283, farmerName: "John Kiprotich", farmerId: "F001" },
  { zone: "Kericho", factory: "Momul Tea Factory", supervisor: "Wilson Kipruto", plucker: "James Kipkemoi", kilos: 152, date: "2026-03-02", lat: -0.368, lng: 35.283, farmerName: "John Kiprotich", farmerId: "F001" },
  { zone: "Kericho", factory: "Momul Tea Factory", supervisor: "Wilson Kipruto", plucker: "James Kipkemoi", kilos: 148, date: "2026-03-03", lat: -0.368, lng: 35.283, farmerName: "John Kiprotich", farmerId: "F001" },
  { zone: "Kericho", factory: "Tegat Tea Factory", supervisor: "Joseph Langat", plucker: "Peter Kiprono", kilos: 98, date: "2026-03-01", lat: -0.382, lng: 35.292, farmerName: "Mary Langat", farmerId: "F002" },
  { zone: "Kericho", factory: "Tegat Tea Factory", supervisor: "Joseph Langat", plucker: "Peter Kiprono", kilos: 105, date: "2026-03-02", lat: -0.382, lng: 35.292, farmerName: "Mary Langat", farmerId: "F002" },
  { zone: "Kericho", factory: "Tegat Tea Factory", supervisor: "Joseph Langat", plucker: "Peter Kiprono", kilos: 112, date: "2026-03-03", lat: -0.382, lng: 35.292, farmerName: "Mary Langat", farmerId: "F002" },
  { zone: "Kericho", factory: "Toror Tea Factory", supervisor: "David Kipkemboi", plucker: "Samuel Kipkurui", kilos: 180, date: "2026-03-01", lat: -0.375, lng: 35.278, farmerName: "Peter Kipkemboi", farmerId: "F003" },
  { zone: "Kericho", factory: "Toror Tea Factory", supervisor: "David Kipkemboi", plucker: "Samuel Kipkurui", kilos: 175, date: "2026-03-02", lat: -0.375, lng: 35.278, farmerName: "Peter Kipkemboi", farmerId: "F003" },
  { zone: "Kericho", factory: "Toror Tea Factory", supervisor: "David Kipkemboi", plucker: "Samuel Kipkurui", kilos: 190, date: "2026-03-03", lat: -0.375, lng: 35.278, farmerName: "Peter Kipkemboi", farmerId: "F003" },
  { zone: "Kericho", factory: "Litein Tea Factory", supervisor: "Grace Cherono", plucker: "Esther Chepchumba", kilos: 75, date: "2026-03-01", lat: -0.395, lng: 35.301, farmerName: "Grace Cherono", farmerId: "F004" },
  { zone: "Kericho", factory: "Litein Tea Factory", supervisor: "Grace Cherono", plucker: "Esther Chepchumba", kilos: 82, date: "2026-03-02", lat: -0.395, lng: 35.301, farmerName: "Grace Cherono", farmerId: "F004" },
  { zone: "Kericho", factory: "Litein Tea Factory", supervisor: "Grace Cherono", plucker: "Esther Chepchumba", kilos: 78, date: "2026-03-03", lat: -0.395, lng: 35.301, farmerName: "Grace Cherono", farmerId: "F004" },
  { zone: "Kericho", factory: "Chelal Tea Factory", supervisor: "Daniel Koech", plucker: "Joseph Kipngetich", kilos: 210, date: "2026-03-01", lat: -0.388, lng: 35.288, farmerName: "David Koech", farmerId: "F005" },
  { zone: "Kericho", factory: "Chelal Tea Factory", supervisor: "Daniel Koech", plucker: "Joseph Kipngetich", kilos: 205, date: "2026-03-02", lat: -0.388, lng: 35.288, farmerName: "David Koech", farmerId: "F005" },
  { zone: "Kericho", factory: "Chelal Tea Factory", supervisor: "Daniel Koech", plucker: "Joseph Kipngetich", kilos: 215, date: "2026-03-03", lat: -0.388, lng: 35.288, farmerName: "David Koech", farmerId: "F005" },
  
  // Nandi Data
  { zone: "Nandi", factory: "Kipkoimet Tea Factory", supervisor: "Joshua Mutai", plucker: "Wilson Kipsang", kilos: 160, date: "2026-03-01", lat: 0.152, lng: 35.025, farmerName: "Sarah Mutai", farmerId: "F006" },
  { zone: "Nandi", factory: "Kipkoimet Tea Factory", supervisor: "Joshua Mutai", plucker: "Wilson Kipsang", kilos: 155, date: "2026-03-02", lat: 0.152, lng: 35.025, farmerName: "Sarah Mutai", farmerId: "F006" },
  { zone: "Nandi", factory: "Kipkoimet Tea Factory", supervisor: "Joshua Mutai", plucker: "Wilson Kipsang", kilos: 168, date: "2026-03-03", lat: 0.152, lng: 35.025, farmerName: "Sarah Mutai", farmerId: "F006" },
  { zone: "Nandi", factory: "Chemomi Tea Factory", supervisor: "Catherine Bett", plucker: "Eliud Kipchoge", kilos: 130, date: "2026-03-01", lat: 0.145, lng: 35.018, farmerName: "James Bett", farmerId: "F007" },
  { zone: "Nandi", factory: "Chemomi Tea Factory", supervisor: "Catherine Bett", plucker: "Eliud Kipchoge", kilos: 125, date: "2026-03-02", lat: 0.145, lng: 35.018, farmerName: "James Bett", farmerId: "F007" },
  { zone: "Nandi", factory: "Chemomi Tea Factory", supervisor: "Catherine Bett", plucker: "Eliud Kipchoge", kilos: 135, date: "2026-03-03", lat: 0.145, lng: 35.018, farmerName: "James Bett", farmerId: "F007" },
  { zone: "Nandi", factory: "Kapsumbeiwa Tea Factory", supervisor: "Fredrick Kiplagat", plucker: "Hellen Chebet", kilos: 95, date: "2026-03-01", lat: 0.158, lng: 35.032, farmerName: "Esther Kiplagat", farmerId: "F008" },
  { zone: "Nandi", factory: "Kapsumbeiwa Tea Factory", supervisor: "Fredrick Kiplagat", plucker: "Hellen Chebet", kilos: 100, date: "2026-03-02", lat: 0.158, lng: 35.032, farmerName: "Esther Kiplagat", farmerId: "F008" },
  { zone: "Nandi", factory: "Kapsumbeiwa Tea Factory", supervisor: "Fredrick Kiplagat", plucker: "Hellen Chebet", kilos: 92, date: "2026-03-03", lat: 0.158, lng: 35.032, farmerName: "Esther Kiplagat", farmerId: "F008" },
  
  // Bomet Data
  { zone: "Bomet", factory: "Sotik Tea Factory", supervisor: "Patrick Rono", plucker: "Moses Kirui", kilos: 112, date: "2026-03-01", lat: -0.858, lng: 35.119, farmerName: "Samuel Rono", farmerId: "F009" },
  { zone: "Bomet", factory: "Sotik Tea Factory", supervisor: "Patrick Rono", plucker: "Moses Kirui", kilos: 118, date: "2026-03-02", lat: -0.858, lng: 35.119, farmerName: "Samuel Rono", farmerId: "F009" },
  { zone: "Bomet", factory: "Sotik Tea Factory", supervisor: "Patrick Rono", plucker: "Moses Kirui", kilos: 115, date: "2026-03-03", lat: -0.858, lng: 35.119, farmerName: "Samuel Rono", farmerId: "F009" },
  { zone: "Bomet", factory: "Kapsuser Tea Factory", supervisor: "Nancy Korir", plucker: "Beatrice Chepngeno", kilos: 88, date: "2026-03-01", lat: -0.842, lng: 35.108, farmerName: "Rebecca Korir", farmerId: "F010" },
  { zone: "Bomet", factory: "Kapsuser Tea Factory", supervisor: "Nancy Korir", plucker: "Beatrice Chepngeno", kilos: 92, date: "2026-03-02", lat: -0.842, lng: 35.108, farmerName: "Rebecca Korir", farmerId: "F010" },
  { zone: "Bomet", factory: "Kapsuser Tea Factory", supervisor: "Nancy Korir", plucker: "Beatrice Chepngeno", kilos: 85, date: "2026-03-03", lat: -0.842, lng: 35.108, farmerName: "Rebecca Korir", farmerId: "F010" },
  
  // Kiambu Data
  { zone: "Kiambu", factory: "Githambo Tea Factory", supervisor: "Peter Mwangi", plucker: "John Kamau", kilos: 67, date: "2026-03-01", lat: -1.158, lng: 36.788, farmerName: "Patrick Mwangi", farmerId: "F011" },
  { zone: "Kiambu", factory: "Githambo Tea Factory", supervisor: "Peter Mwangi", plucker: "John Kamau", kilos: 72, date: "2026-03-02", lat: -1.158, lng: 36.788, farmerName: "Patrick Mwangi", farmerId: "F011" },
  { zone: "Kiambu", factory: "Githambo Tea Factory", supervisor: "Peter Mwangi", plucker: "John Kamau", kilos: 70, date: "2026-03-03", lat: -1.158, lng: 36.788, farmerName: "Patrick Mwangi", farmerId: "F011" },
  { zone: "Kiambu", factory: "Kiamara Tea Factory", supervisor: "Lucy Wanjiku", plucker: "Grace Njeri", kilos: 54, date: "2026-03-01", lat: -1.165, lng: 36.795, farmerName: "Lucy Wanjiku", farmerId: "F012" },
  { zone: "Kiambu", factory: "Kiamara Tea Factory", supervisor: "Lucy Wanjiku", plucker: "Grace Njeri", kilos: 58, date: "2026-03-02", lat: -1.165, lng: 36.795, farmerName: "Lucy Wanjiku", farmerId: "F012" },
  { zone: "Kiambu", factory: "Kiamara Tea Factory", supervisor: "Lucy Wanjiku", plucker: "Grace Njeri", kilos: 56, date: "2026-03-03", lat: -1.165, lng: 36.795, farmerName: "Lucy Wanjiku", farmerId: "F012" },
  
  // Additional data for April
  { zone: "Kericho", factory: "Momul Tea Factory", supervisor: "Wilson Kipruto", plucker: "James Kipkemoi", kilos: 158, date: "2026-04-01", lat: -0.368, lng: 35.283, farmerName: "John Kiprotich", farmerId: "F001" },
  { zone: "Kericho", factory: "Momul Tea Factory", supervisor: "Wilson Kipruto", plucker: "James Kipkemoi", kilos: 162, date: "2026-04-02", lat: -0.368, lng: 35.283, farmerName: "John Kiprotich", farmerId: "F001" },
  { zone: "Kericho", factory: "Chelal Tea Factory", supervisor: "Daniel Koech", plucker: "Joseph Kipngetich", kilos: 225, date: "2026-04-01", lat: -0.388, lng: 35.288, farmerName: "David Koech", farmerId: "F005" },
  { zone: "Kericho", factory: "Chelal Tea Factory", supervisor: "Daniel Koech", plucker: "Joseph Kipngetich", kilos: 230, date: "2026-04-02", lat: -0.388, lng: 35.288, farmerName: "David Koech", farmerId: "F005" },
  { zone: "Nandi", factory: "Kipkoimet Tea Factory", supervisor: "Joshua Mutai", plucker: "Wilson Kipsang", kilos: 175, date: "2026-04-01", lat: 0.152, lng: 35.025, farmerName: "Sarah Mutai", farmerId: "F006" },
  { zone: "Nandi", factory: "Kipkoimet Tea Factory", supervisor: "Joshua Mutai", plucker: "Wilson Kipsang", kilos: 180, date: "2026-04-02", lat: 0.152, lng: 35.025, farmerName: "Sarah Mutai", farmerId: "F006" },
  { zone: "Bomet", factory: "Sotik Tea Factory", supervisor: "Patrick Rono", plucker: "Moses Kirui", kilos: 125, date: "2026-04-01", lat: -0.858, lng: 35.119, farmerName: "Samuel Rono", farmerId: "F009" },
  { zone: "Bomet", factory: "Sotik Tea Factory", supervisor: "Patrick Rono", plucker: "Moses Kirui", kilos: 130, date: "2026-04-02", lat: -0.858, lng: 35.119, farmerName: "Samuel Rono", farmerId: "F009" },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const ZONE_COLORS: Record<string, string> = {
  Kericho: "#3b82f6",
  Nandi: "#10b981",
  Bomet: "#f59e0b",
  Kiambu: "#ef4444",
};

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

export default function TeaDashboardPage() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const isFarmer = useIsFarmer();
  const isSupervisor = useIsSupervisor();
  const isPlucker = useIsPlucker();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [zone, setZone] = useState("");
  const [farmer, setFarmer] = useState("");
  const [factory, setFactory] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [plucker, setPlucker] = useState("");

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleClearFilters = () => {
    setZone("");
    setFarmer("");
    setFactory("");
    setSupervisor("");
    setPlucker("");
    setStartDate("");
    setEndDate("");
  };

  const filteredData = useMemo(() => {
    let data = ALL_DATA;
    
    if (isFarmer && user?.zone_id) {
      data = data.filter((item) => item.zone === user?.zone_name);
    }
    if (isSupervisor && user?.zone_id) {
      data = data.filter((item) => item.zone === user?.zone_name);
    }
    
    return data.filter((item) => {
      const matchesZone = !zone || item.zone === zone;
      const matchesFarmer = !farmer || item.farmerName === farmer;
      const matchesFactory = !factory || item.factory === factory;
      const matchesSupervisor = !supervisor || item.supervisor === supervisor;
      const matchesPlucker = !plucker || item.plucker === plucker;
      let matchesDate = true;
      if (startDate && endDate) {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDate = itemDate >= start && itemDate <= end;
      }
      return matchesZone && matchesFarmer && matchesFactory && matchesSupervisor && matchesPlucker && matchesDate;
    });
  }, [zone, farmer, factory, supervisor, plucker, startDate, endDate, user, isFarmer, isSupervisor]);

  const stats = useMemo(() => {
    const farmers = new Set(filteredData.map((d) => d.plucker)).size;
    const supervisors = new Set(filteredData.map((d) => d.supervisor)).size;
    const factories = new Set(filteredData.map((d) => d.factory)).size;
    const zones = new Set(filteredData.map((d) => d.zone)).size;
    const totalKilos = filteredData.reduce((sum, d) => sum + d.kilos, 0);
    const avgKilosPerFarmer = farmers > 0 ? totalKilos / farmers : 0;
    return { farmers, supervisors, factories, zones, totalKilos, avgKilosPerFarmer };
  }, [filteredData]);

  const trendData = useMemo(() => {
    const zonesMap: Record<string, Record<string, number>> = {};
    const uniqueZones = [...new Set(filteredData.map(d => d.zone))];
    filteredData.forEach((item) => {
      if (!zonesMap[item.zone]) zonesMap[item.zone] = {};
      zonesMap[item.zone][item.date] = (zonesMap[item.zone][item.date] || 0) + item.kilos;
    });
    const allDates = [...new Set(filteredData.map(d => d.date))].sort();
    return allDates.map(date => {
      const dataPoint: any = { date };
      uniqueZones.forEach(zoneName => {
        dataPoint[zoneName] = zonesMap[zoneName]?.[date] || 0;
      });
      return dataPoint;
    });
  }, [filteredData]);

  const trendZones = useMemo(() => [...new Set(filteredData.map(d => d.zone))], [filteredData]);

  const topFactories = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach((d) => { map[d.factory] = (map[d.factory] || 0) + d.kilos; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [filteredData]);

  const topFarmers = useMemo(() => {
    const map: Record<string, { name: string; kilos: number }> = {};
    filteredData.forEach((d) => {
      if (!map[d.plucker]) map[d.plucker] = { name: d.farmerName, kilos: 0 };
      map[d.plucker].kilos += d.kilos;
    });
    return Object.values(map).sort((a, b) => b.kilos - a.kilos).slice(0, 5);
  }, [filteredData]);

  const zoneDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach((d) => { map[d.zone] = (map[d.zone] || 0) + d.kilos; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const supervisorPerformance = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach((d) => { map[d.supervisor] = (map[d.supervisor] || 0) + d.kilos; });
    return Object.entries(map).map(([name, kilos]) => ({ name, kilos })).sort((a, b) => b.kilos - a.kilos).slice(0, 5);
  }, [filteredData]);

  const mapMarkers = useMemo(() => {
    const farmMap = new Map();
    filteredData.forEach((farm) => {
      if (!farmMap.has(farm.farmerId)) {
        farmMap.set(farm.farmerId, {
          id: farm.farmerId,
          lat: farm.lat,
          lng: farm.lng,
          name: farm.farmerName,
          zone: farm.zone,
          totalKilos: 0,
          factory: farm.factory,
          supervisor: farm.supervisor,
        });
      }
      farmMap.get(farm.farmerId).totalKilos += farm.kilos;
    });
    return Array.from(farmMap.values());
  }, [filteredData]);

  const formatNumber = (num: number) => num.toLocaleString("en-KE");
  const formatKilos = (kilos: number) => `${kilos.toLocaleString("en-KE")} KG`;

  const uniqueZones = [...new Set(ALL_DATA.map(d => d.zone))];
  const uniqueFarmers = [...new Set(ALL_DATA.map(d => d.farmerName))];
  const uniqueFactories = [...new Set(ALL_DATA.map(d => d.factory))];
  const uniqueSupervisors = [...new Set(ALL_DATA.map(d => d.supervisor))];
  const uniquePluckers = [...new Set(ALL_DATA.map(d => d.plucker))];
  
  const dateRangeText = startDate && endDate 
    ? `${new Date(startDate).toLocaleDateString("en-GB")} - ${new Date(endDate).toLocaleDateString("en-GB")}`
    : "All time";

  const getMarkerColor = (kilos: number) => {
    if (kilos >= 400) return "#10b981";
    if (kilos >= 300) return "#3b82f6";
    if (kilos >= 200) return "#f59e0b";
    return "#ef4444";
  };

  const getDashboardTitle = () => {
    if (isAdmin) return " Dashboard";
    if (isFarmer) return "Farm Dashboard";
    if (isSupervisor) return "Supervisor Dashboard";
    if (isPlucker) return "Dashboard";
    return "Dashboard";
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-100">
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div
          className="flex items-center justify-between px-3 md:px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/10 text-primary shrink-0">
              <MdDashboard className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-base md:text-lg font-bold text-gray-900">{getDashboardTitle()}</h1>
            <MdFilterList className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="hidden md:flex items-center gap-2 ml-2 px-3 py-1 bg-blue-50 rounded-full">
              <MdCalendarToday className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">{dateRangeText}</span>
            </div>
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
            <div className="md:hidden flex items-center gap-2 mb-3 px-3 py-1.5 bg-blue-50 rounded-lg w-fit">
              <MdCalendarToday className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">{dateRangeText}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">Zone</label>
                <select value={zone} onChange={(e) => setZone(e.target.value)} className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm">
                  <option value="">All Zones</option>
                  {uniqueZones.map((z) => (<option key={z} value={z}>{z}</option>))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">Farmer</label>
                <select value={farmer} onChange={(e) => setFarmer(e.target.value)} className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm">
                  <option value="">All Farmers</option>
                  {uniqueFarmers.map((f) => (<option key={f} value={f}>{f}</option>))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">Factory</label>
                <select value={factory} onChange={(e) => setFactory(e.target.value)} className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm">
                  <option value="">All Factories</option>
                  {uniqueFactories.map((f) => (<option key={f} value={f}>{f}</option>))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">Supervisor</label>
                <select value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm">
                  <option value="">All Supervisors</option>
                  {uniqueSupervisors.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 mb-1 flex text-xs font-medium">Farm Worker/Plucker</label>
                <select value={plucker} onChange={(e) => setPlucker(e.target.value)} className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm">
                  <option value="">All Workers</option>
                  {uniquePluckers.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-700 mb-1 flex text-xs font-medium">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-gray-700 mb-1 flex text-xs font-medium">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-gray-300 focus:border-indigo-500 text-gray-900 focus:ring-indigo-500 hover:border-gray-400 w-full rounded-lg border px-2 md:px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button 
                onClick={handleClearFilters} 
                disabled={!zone && !farmer && !factory && !supervisor && !plucker && !startDate && !endDate} 
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdClose className="w-4 h-4" /> Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-2 pb-20 md:pb-4">
        {/* Stats Cards - Only show for Admin and Farmer */}
        {(isAdmin || isFarmer) && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <MdAgriculture className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div><p className="text-[10px] md:text-xs text-slate-500">Total Farmers</p><p className="text-lg md:text-2xl font-bold text-slate-900">{formatNumber(stats.farmers)}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <MdSupervisorAccount className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                </div>
                <div><p className="text-[10px] md:text-xs text-slate-500">Supervisors</p><p className="text-lg md:text-2xl font-bold text-emerald-600">{formatNumber(stats.supervisors)}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <MdFactory className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                </div>
                <div><p className="text-[10px] md:text-xs text-slate-500">Factories</p><p className="text-lg md:text-2xl font-bold text-purple-600">{formatNumber(stats.factories)}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <MdLocationOn className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                </div>
                <div><p className="text-[10px] md:text-xs text-slate-500">Zones</p><p className="text-lg md:text-2xl font-bold text-orange-600">{formatNumber(stats.zones)}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <MdScale className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                </div>
                <div><p className="text-[10px] md:text-xs text-slate-500">Total Tea</p><p className="text-lg md:text-2xl font-bold text-amber-600">{formatKilos(stats.totalKilos)}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 md:p-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <MdTrendingUp className="w-4 h-4 md:w-5 md:h-5 text-teal-600" />
                </div>
                <div><p className="text-[10px] md:text-xs text-slate-500">Avg/Farmer</p><p className="text-lg md:text-2xl font-bold text-teal-600">{formatKilos(Math.round(stats.avgKilosPerFarmer))}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Tea Collection Trend - Show for Admin and Farmer */}
        {(isAdmin || isFarmer) && (
                    <div className="bg-white rounded-lg border border-slate-200 mb-4">
  <ResponsiveContainer width="100%" height={260}>
    <LineChart data={trendData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip formatter={(value) => `${value} KG`} />
      {trendZones.length > 0 && <Legend />}
      {trendZones.map((zone) => (
        <Line
          key={zone}
          type="monotone"
          dataKey={zone}
          stroke={ZONE_COLORS[zone]}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      ))}
    </LineChart>
  </ResponsiveContainer>
</div>
        )}

        {/* Rankings - Show for Admin and Farmer */}
        {(isAdmin || isFarmer) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <RankingChart 
              data={topFactories} 
              title={isFarmer ? "My Factories by Collection" : "Top Factories by Collection"} 
              icon={MdBusiness} 
              valueLabel="KG" 
            />
            <RankingChart 
              data={topFarmers.map(f => ({ name: f.name, value: f.kilos }))} 
              title={isFarmer ? "My Farmers by Production" : "Top Farmers by Production"} 
              icon={MdPerson} 
              valueLabel="KG" 
            />
          </div>
        )}

        {/* Farm Locations Map - Show for Admin and Farmer */}
        {(isAdmin || isFarmer) && (
          <div className="bg-white rounded-lg border border-slate-200 mb-4">
            <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm md:text-base">
                <MdMap className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                {isFarmer ? "My Farm Locations Map" : "Farm Locations Map"}
              </h2>
            </div>
            <div className="p-3 md:p-4">
              <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
                <MapContainer center={[0.2, 35.5] as L.LatLngExpression} zoom={7} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {mapMarkers.map((marker) => (
                    <CircleMarker key={marker.id} center={[marker.lat, marker.lng] as L.LatLngExpression} radius={Math.sqrt(marker.totalKilos) / 2} fillColor={getMarkerColor(marker.totalKilos)} color={getMarkerColor(marker.totalKilos)} weight={2} opacity={1} fillOpacity={0.7}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold text-gray-900">{marker.name}</p>
                          <p className="text-gray-600">Zone: {marker.zone}</p>
                          <p className="text-gray-600">Factory: {marker.factory}</p>
                          <p className="text-gray-600">Supervisor: {marker.supervisor}</p>
                          <p className="text-primary font-bold mt-1">{marker.totalKilos} KG total</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-xs text-gray-600">High (400+ KG)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-xs text-gray-600">Medium (300-399 KG)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-xs text-gray-600">Low (200-299 KG)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs text-gray-600">Very Low (&lt;200 KG)</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs"><span className="text-primary">●</span></div><span className="text-xs text-gray-600">Circle size = total production</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Zone Distribution and Supervisor Performance - Show for Admin and Farmer */}
        {(isAdmin || isFarmer) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm md:text-base">
                  <MdLocationOn className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  Zone Distribution
                </h2>
              </div>
              <div className="p-3 md:p-4">
                {zoneDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={zoneDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(entry) => `${entry.name}: ${entry.value} KG`}>
                        {zoneDistribution.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} KG`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (<p className="text-gray-500 text-center py-8">No data available</p>)}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm md:text-base">
                  <MdSupervisorAccount className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  {isFarmer ? "My Supervisors Performance" : "Supervisor Performance"}
                </h2>
              </div>
              <div className="p-3 md:p-4">
                {supervisorPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={supervisorPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value} KG`} />
                      <Bar dataKey="kilos" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (<p className="text-gray-500 text-center py-8">No data available</p>)}
              </div>
            </div>
          </div>
        )}

        {/* For Plucker - Show My Services only */}
        {isPlucker && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <MdDesignServices className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">My Services</h2>
            <p className="text-gray-500">Your services and tasks will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
//zone, factory, farmer,cell,  supervisor, plucker, start date, end date,