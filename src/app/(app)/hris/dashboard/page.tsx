"use client";

import React from "react";
import { HRISLayout } from "@/components/hris";
import { useRoles } from "@/hooks/useRole";
import {
  MdGroup,
  MdSecurity,
  MdPeople,
  MdLocalShipping,
  MdStorefront,
  MdBusiness,
  MdSupervisorAccount,
  MdInventory,
} from "react-icons/md";
import Link from "next/link";
import { useUsers } from "@/hooks/useUser";
import { useCustomers } from "@/hooks/useCustomer";
import { useSalesPersons } from "@/hooks/useSalesPerson";
import { useDepotManagers } from "@/hooks/useDepotManager";
import { useBusinessManagers } from "@/hooks/useBusinessManager";
import { useTransporters } from "@/hooks/useTransporter";
import { useProducts } from "@/hooks/useProduct";

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  count: number | string;
  href: string;
  color: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  count,
  href,
  color,
  isLoading,
}) => {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className={`w-10 h-10 md:w-14 md:h-14 ${color} rounded-lg flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-600 mb-0.5 md:mb-1">
              {title}
            </p>
            {isLoading ? (
              <div className="w-12 md:w-16 h-6 md:h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl md:text-3xl font-bold text-gray-900">
                {count}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function HRISDashboardPage() {
  const { data: usersData, isLoading: usersLoading } = useUsers(1);
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: customersData, isLoading: customersLoading } = useCustomers({});
  const { data: salesPersonsData, isLoading: salesPersonsLoading } =
    useSalesPersons({});
  const { data: depotManagersData, isLoading: depotManagersLoading } =
    useDepotManagers({});
  const { data: businessManagersData, isLoading: businessManagersLoading } =
    useBusinessManagers({});
  const { data: transportersData, isLoading: transportersLoading } =
    useTransporters({});
  const { data: productsData, isLoading: productsLoading } = useProducts({});

  return (
    <HRISLayout
      title="HRIS Dashboard"
      description="Overview of system resources and statistics"
    >
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          icon={MdGroup}
          title="Total Users"
          count={usersData?.pagination.total || 0}
          href="/hris/users"
          color="bg-blue-500"
          isLoading={usersLoading}
        />

        <StatCard
          icon={MdSecurity}
          title="Total Roles"
          count={rolesData?.data.length || 0}
          href="/hris/roles"
          color="bg-purple-500"
          isLoading={rolesLoading}
        />

        <StatCard
          icon={MdPeople}
          title="Customers"
          count={customersData?.pagination?.total || 0}
          href="/customers"
          color="bg-emerald-500"
          isLoading={customersLoading}
        />

        <StatCard
          icon={MdStorefront}
          title="Sales Representatives"
          count={salesPersonsData?.pagination?.total || 0}
          href="/sales-representatives"
          color="bg-orange-500"
          isLoading={salesPersonsLoading}
        />

        <StatCard
          icon={MdSupervisorAccount}
          title="Depot Managers"
          count={depotManagersData?.pagination?.total || 0}
          href="/depot-managers"
          color="bg-cyan-500"
          isLoading={depotManagersLoading}
        />

        <StatCard
          icon={MdBusiness}
          title="Business Managers"
          count={businessManagersData?.pagination?.total || 0}
          href="/hris/business-managers"
          color="bg-indigo-500"
          isLoading={businessManagersLoading}
        />

        <StatCard
          icon={MdLocalShipping}
          title="Transporters"
          count={transportersData?.pagination?.total || 0}
          href="/operational-controls?tab=transporters"
          color="bg-amber-500"
          isLoading={transportersLoading}
        />

        <StatCard
          icon={MdInventory}
          title="Products"
          count={productsData?.pagination?.total || 0}
          href="/products"
          color="bg-rose-500"
          isLoading={productsLoading}
        />
      </div>
    </HRISLayout>
  );
}
