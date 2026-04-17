"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdDashboard,
  MdMap,
  MdGroup,
  MdSchedule,
  MdPayments,
} from "react-icons/md";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const agritechNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: MdDashboard,
  },
  {
    name: "Schedules",
    href: "/schedules",
    icon: MdSchedule,
  },
  {
    name: "Payments",
    href: "/worker-payments",
    icon: MdPayments,
  },
  {
    name: "Farms",
    href: "/farms",
    icon: MdMap,
  },
  {
    name: "HRIS",
    href: "/hris/users",
    icon: MdGroup,
  },
];

const MobileFooterNav: React.FC = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {agritechNavItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                active ? "text-primary" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <item.icon
                className={`w-6 h-6 ${active ? "scale-110" : ""} transition-transform`}
              />
              <span
                className={`text-[10px] mt-0.5 font-medium ${active ? "font-semibold" : ""}`}
              >
                {item.name}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileFooterNav;
