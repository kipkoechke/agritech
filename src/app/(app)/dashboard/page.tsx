"use client";

import { useMemo, useState } from "react";
import {
  MdDashboard as DashboardIcon,
  MdAgriculture,
  MdPeople,
  MdScale,
  MdSupervisorAccount,
  MdFactory,
  MdMap,
} from "react-icons/md";
import StatCard from "@/components/common/StatCard";

const Dashboard = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const stats = useMemo(() => {
    return [
      {
        title: "Total Farms",
        mainValue: "0",
        subtitle: "Active farms",
        icon: MdAgriculture,
      },
      {
        title: "Farm Workers",
        mainValue: "0",
        subtitle: "Registered workers",
        icon: MdPeople,
      },
      {
        title: "Weighing Points",
        mainValue: "0",
        subtitle: "Active points",
        icon: MdScale,
      },
      {
        title: "Farm Supervisors",
        mainValue: "0",
        subtitle: "Active supervisors",
        icon: MdSupervisorAccount,
      },
    ];
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-2 md:px-4 py-2 pb-20 md:pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DashboardIcon className="w-6 h-6 text-primary" />
            Dashboard
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className={refreshing ? "animate-spin" : ""}>↻</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              mainValue={stat.mainValue}
              subtitle={stat.subtitle}
            >
              <stat.icon className="w-6 h-6 text-primary" />
            </StatCard>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MdFactory className="w-5 h-5 text-primary" />
            Welcome to SOKOCHAPP
          </h2>
          <p className="text-gray-600 mb-4">
            This is your central hub for managing farms, farm workers, supervisors,
            and weighing operations.
          </p>
        </div>

        <div className="mt-6 bg-white rounded-lg border border-gray-100 p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MdMap className="w-5 h-5 text-primary" />
            Farm Locations Map
          </h2>
          <p className="text-gray-600 mb-4">
            View farm locations on the map. Navigate to Farm Map from the sidebar to see
            farm concentrations and heat maps.
          </p>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Map will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
