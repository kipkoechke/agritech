"use client";

import React, { ReactNode } from "react";
import {
  MdGroup,
  MdPublic,
  MdPerson,
  MdSupervisorAccount,
  MdLocalActivity,
  MdInventory,
} from "react-icons/md";
import { HiUserGroup } from "react-icons/hi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import { useIsAdmin } from "@/hooks/useAuth";

interface HRISLayoutProps {
  children: ReactNode;
  title: string | ReactNode;
  description?: string;
  action?: ReactNode;
  search?: ReactNode;
  filters?: ReactNode;
}

const HRISLayout: React.FC<HRISLayoutProps> = ({
  children,
  title,
  action,
  search,
  filters,
}) => {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();

  const allTabs = [
    {
      name: "User Management",
      icon: MdGroup,
      href: "/hris/users",
      adminOnly: true,
      active:
        pathname.startsWith("/hris/users") ||
        pathname.startsWith("/hris/roles"),
    },
    {
      name: "Geo Hierarchy",
      icon: MdPublic,
      href: "/hris/geo-hierarchy",
      adminOnly: true,
      active: pathname.startsWith("/hris/geo-hierarchy"),
    },
    {
      name: "Farmers",
      icon: MdPerson,
      href: "/farmers",
      adminOnly: true,
      active: pathname.startsWith("/farmers"),
    },
    {
      name: "Work Groups",
      icon: HiUserGroup,
      href: "/work-groups",
      adminOnly: true,
      active: pathname.startsWith("/work-groups"),
    },
    {
      name: "Supervisors",
      icon: MdSupervisorAccount,
      href: "/farm-supervisors",
      adminOnly: true,
      active: pathname.startsWith("/farm-supervisors"),
    },
    {
      name: "Farm Activities",
      icon: MdLocalActivity,
      href: "/activities",
      adminOnly: true,
      active: pathname.startsWith("/activities"),
    },
    {
      name: "Products",
      icon: MdInventory,
      href: "/products",
      adminOnly: true,
      active: pathname.startsWith("/products"),
    },
  ];

  const tabs = allTabs.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Mobile Horizontal Tabs - Using TabBar styling pattern */}
      <div className="md:hidden shrink-0 px-2 pt-2">
        <div
          className="flex bg-primary rounded-xl shadow p-1 items-center w-full overflow-x-auto scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="flex gap-0.5 min-w-max">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center px-2 sm:px-3 py-2 transition-all duration-300 text-xs sm:text-sm relative outline-none whitespace-nowrap shrink-0 min-w-0 justify-center rounded-lg ${
                  tab.active
                    ? "text-white font-semibold bg-accent"
                    : "text-white/80 hover:text-white hover:bg-primary-dark"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-1 shrink-0" />
                <span className="truncate">{tab.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* HRIS Sidebar - Hidden on mobile */}
      <div className="hidden md:block bg-white border-r border-gray-200 shrink-0 h-screen overflow-y-auto">
        <nav className="p-2">
          <ul className="space-y-0.5">
            {tabs.map((tab) => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm whitespace-nowrap ${
                    tab.active
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pt-2">
        {/* Header - Fixed */}
        <div className="mx-3 md:mx-6 mb-4">
          <PageHeader
            title={title}
            search={search}
            action={action}
            filters={filters}
          />
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 px-3 md:px-6 pb-20 md:pb-6 overflow-y-auto min-h-0 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HRISLayout;
