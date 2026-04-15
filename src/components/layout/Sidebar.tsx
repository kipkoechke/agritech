"use client";

import {
  MdDashboard,
  MdLogout,
  MdClose,
  MdPeople,
  MdFactory,
  MdMap,
  MdSupervisorAccount,
  MdPerson,
  MdGroup,
  MdSchedule,
  MdBookOnline,
  MdGroupWork,
  MdPayments,
  MdInventory,
  MdLocalActivity,
} from "react-icons/md";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useMemo, useEffect, useState } from "react";
import {
  useLogout,
  useAuth,
  useIsAdmin,
  useIsFarmer,
  useIsSupervisor,
} from "@/hooks/useAuth";

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, onClose }) => {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { user, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const isFarmer = useIsFarmer();
  const isSupervisor = useIsSupervisor();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const menuItems = useMemo(() => {
    // Define items with proper role-based visibility
    const allMenuItems = [
      // Common items for all roles
      {
        name: "Dashboard",
        icon: MdDashboard,
        href: "/dashboard",
        active: pathname === "/dashboard",
        roles: ["admin", "farmer", "supervisor"],
      },
      // Admin only items
      {
        name: "Farm Workers",
        icon: MdPeople,
        href: "/farm-workers",
        active: pathname.startsWith("/farm-workers"),
        roles: ["admin"],
      },
      {
        name: "Farmers",
        icon: MdPerson,
        href: "/farmers",
        active: pathname.startsWith("/farmers"),
        roles: ["admin"],
      },
      {
        name: "HRIS",
        icon: MdGroup,
        href: "/hris/users",
        active: pathname.startsWith("/hris"),
        roles: ["admin"],
      },
      // Admin & Farmer items (management views)
      {
        name: "Farm Supervisors",
        icon: MdSupervisorAccount,
        href: "/farm-supervisors",
        active: pathname.startsWith("/farm-supervisors"),
        roles: ["admin", "farmer"],
      },
      {
        name: "Factory",
        icon: MdFactory,
        href: "/factories",
        active: pathname.startsWith("/factories"),
        roles: ["admin"],
      },
      {
        name: "Schedules",
        icon: MdSchedule,
        href: "/schedules",
        active: pathname.startsWith("/schedules"),
        roles: ["admin", "farmer", "supervisor"],
      },
      {
        name: "Farms",
        icon: MdMap,
        href: "/farms",
        active: pathname.startsWith("/farms"),
        roles: ["admin", "farmer"],
      },
      {
        name: "Work Groups",
        icon: MdGroupWork,
        href: "/work-groups",
        active: pathname.startsWith("/work-groups"),
        roles: ["admin", "farmer"],
      },
      {
        name: "Worker Payments",
        icon: MdPayments,
        href: "/worker-payments",
        active: pathname.startsWith("/worker-payments"),
        roles: ["admin", "farmer"],
      },
      {
        name: "Products",
        icon: MdInventory,
        href: "/products",
        active: pathname.startsWith("/products"),
        roles: ["admin"],
      },
      {
        name: "Activities",
        icon: MdLocalActivity,
        href: "/activities",
        active: pathname.startsWith("/activities"),
        roles: ["admin"],
      },
      // Supervisor only items (personal views)
      {
        name: "My Farms",
        icon: MdMap,
        href: "/farms",
        active: pathname.startsWith("/farms"),
        roles: ["supervisor"],
      },
      {
        name: "My Work Groups",
        icon: MdGroupWork,
        href: "/work-groups",
        active: pathname.startsWith("/work-groups"),
        roles: ["supervisor"],
      },
    ];

    // Get user role
    const role = user?.role;

    // Filter based on role - NO special admin override
    return allMenuItems.filter((item) => {
      return role && item.roles.includes(role);
    });
  }, [pathname, user]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  // Collapse sidebar to icon-only when HRIS sub-sidebar is visible
  const isCollapsed = pathname.startsWith("/hris");

  if (!isClient || isLoading) {
    return (
      <div className="bg-primary-hover border-r border-primary-hover/20 h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-primary-hover border-r border-primary-hover/20 h-full overflow-y-auto flex flex-col shadow-lg
        fixed md:sticky top-0 left-0 z-50 md:z-auto
        transform transition-transform duration-300 ease-in-out
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }
        w-64 ${isCollapsed ? "md:w-14" : "md:w-auto"}
      `}
      style={
        {
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties
      }
    >
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-emerald-500/30">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/tealeaf.webp"
            alt="SOKOCHAPP"
            width={32}
            height={32}
            className="rounded-md"
          />
          <h2 className="text-lg font-semibold text-white">SOKOCHAPP</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-white/70 hover:text-white hover:bg-emerald-600/30"
        >
          <MdClose className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-2 px-3">
        <ul className="flex flex-col space-y-0.5">
          {menuItems.map((item) => (
            <li key={`${item.href}-${item.name}`}>
              <Link
                href={item.href}
                onClick={handleLinkClick}
                title={isCollapsed ? item.name : undefined}
                className={`group flex items-center rounded-lg transition-all duration-200 ${isCollapsed ? "justify-center px-0 py-1.5" : "gap-2 px-2 py-1.5"} ${
                  item.active
                    ? "bg-emerald-600 text-white border border-emerald-400/50 shadow-md"
                    : "text-white/80 hover:bg-emerald-700/50 hover:text-white hover:shadow-sm"
                }`}
              >
                <div
                  className={`flex items-center justify-center ${isCollapsed ? "w-7 h-7" : "w-5 h-5"} rounded-md transition-all duration-200 shrink-0 ${
                    item.active
                      ? "bg-white text-emerald-700 shadow-lg"
                      : "bg-emerald-600/40 text-white group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg"
                  }`}
                >
                  <item.icon
                    className={isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5"}
                  />
                </div>
                {!isCollapsed && (
                  <span className="font-medium text-[13px]">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="py-2 border-t border-emerald-500/30 px-3 space-y-0.5">
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          title={isCollapsed ? "Logout" : undefined}
          className={`group flex items-center rounded-lg transition-all duration-200 text-white/80 hover:bg-red-500/20 hover:text-red-400 hover:shadow-sm w-full disabled:opacity-50 ${isCollapsed ? "justify-center px-0 py-1.5" : "gap-2 px-2 py-1.5"}`}
        >
          <div
            className={`flex items-center justify-center ${isCollapsed ? "w-7 h-7" : "w-5 h-5"} rounded-md bg-emerald-600/40 text-white group-hover:bg-red-500 group-hover:text-white group-hover:shadow-lg transition-all duration-200 shrink-0`}
          >
            <MdLogout className={isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5"} />
          </div>
          {!isCollapsed && (
            <span className="font-medium text-[13px]">
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
