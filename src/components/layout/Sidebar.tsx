"use client";

import {
  MdDashboard,
  MdLogout,
  MdClose,
  MdPeople,
  MdAgriculture,
  MdFactory,
  MdScale,
  MdMap,
  MdSupervisorAccount,
  MdPerson,
  MdDesignServices,
} from "react-icons/md";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { useLogout, useAuth, useIsAdmin, useIsFarmer, useIsSupervisor, useIsPlucker } from "@/hooks/useAuth";

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
  const isPlucker = useIsPlucker();

  const menuItems = useMemo(() => {
    // All menu items definition
    const allMenuItems = [
      {
        name: "Dashboard",
        icon: MdDashboard,
        href: "/dashboard",
        active: pathname === "/dashboard",
        visibleTo: ["admin", "farmer"],
      },
      {
        name: "Farms",
        icon: MdAgriculture,
        href: "/farms",
        active: pathname.startsWith("/farms"),
        visibleTo: ["admin", "farmer"],
      },
      {
        name: "Farmers",
        icon: MdPerson,
        href: "/farmers",
        active: pathname.startsWith("/farmers"),
        visibleTo: ["admin"],
      },
      {
        name: "Farm Supervisors",
        icon: MdSupervisorAccount,
        href: "/farm-supervisors",
        active: pathname.startsWith("/farm-supervisors"),
        visibleTo: ["admin", "farmer"],
      },
      {
        name: "Farm Workers",
        icon: MdPeople,
        href: "/farm-workers",
        active: pathname.startsWith("/farm-workers"),
        visibleTo: ["admin", "supervisor"],
      },    
      {
        name: "Factory",
        icon: MdFactory,
        href: "/factory",
        active: pathname.startsWith("/factory"),
        visibleTo: ["admin", "farmer"],
      },
      {
        name: "Clerks",
        icon: MdFactory,
        href: "/clerks",
        active: pathname.startsWith("/clerks"),
        visibleTo: ["admin", "farmer"],
      },

      {
        name: "Collection Centers",
        icon: MdScale,
        href: "/weighing-points",
        active: pathname.startsWith("/weighing-points"),
        visibleTo: ["admin", "farmer", "supervisor"],
      },
      {
        name: "Farm Map",
        icon: MdMap,
        href: "/farm-map",
        active: pathname === "/farm-map",
        visibleTo: ["admin", "supervisor"],
      },
      // {
      //   name: "My Services",
      //   icon: MdDesignServices,
      //   href: "/my-services",
      //   active: pathname.startsWith("/my-services"),
      //   visibleTo: ["admin", "farmer", "supervisor", "plucker"],
      // },
    ];

    // Filter menu items based on user role
    const role = user?.role;
    
    return allMenuItems.filter(item => {
      if (isAdmin) return true; // Admin sees everything
      if (role && item.visibleTo.includes(role)) return true;
      return false;
    });
  }, [pathname, user, isAdmin]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  if (isLoading) {
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
        w-64 md:w-auto
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
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={handleLinkClick}
                className={`group flex items-center rounded-lg transition-all duration-200 gap-2 px-2 py-1.5 ${
                  item.active
                    ? "bg-emerald-600 text-white border border-emerald-400/50 shadow-md"
                    : "text-white/80 hover:bg-emerald-700/50 hover:text-white hover:shadow-sm"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200 shrink-0 ${
                    item.active
                      ? "bg-white text-emerald-700 shadow-lg"
                      : "bg-emerald-600/40 text-white group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-[13px]">
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="py-2 border-t border-emerald-500/30 px-3 space-y-0.5">
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="group flex items-center rounded-lg transition-all duration-200 text-white/80 hover:bg-red-500/20 hover:text-red-400 hover:shadow-sm w-full disabled:opacity-50 gap-2 px-2 py-1.5"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-600/40 text-white group-hover:bg-red-500 group-hover:text-white group-hover:shadow-lg transition-all duration-200 shrink-0">
            <MdLogout className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-[13px]">
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;