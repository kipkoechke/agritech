"use client";

import {
  useIsAdmin,
  useIsFarmer,
  useIsSupervisor,
} from "@/hooks/useAuth";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import FarmerDashboard from "@/components/dashboard/FarmerDashboard";
import SupervisorDashboard from "@/components/dashboard/SupervisorDashboard";

export default function DashboardPage() {
  const isAdmin = useIsAdmin();
  const isFarmer = useIsFarmer();
  const isSupervisor = useIsSupervisor();

  if (isAdmin) return <AdminDashboard />;
  if (isFarmer) return <FarmerDashboard />;
  if (isSupervisor) return <SupervisorDashboard />;

  // Fallback for other roles (e.g., plucker)
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-500">Your dashboard is being set up.</p>
      </div>
    </div>
  );
}
