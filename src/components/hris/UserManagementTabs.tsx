"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "../common/TabBar";
import { MdGroup, MdSecurity } from "react-icons/md";

const UserManagementTabs: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname.startsWith("/hris/users")) return "users";
    if (pathname.startsWith("/hris/roles")) return "roles";
    return "users";
  };

  const tabs = [
    {
      id: "users",
      label: "Users",
      icon: MdGroup,
      href: "/hris/users",
    },
    {
      id: "roles",
      label: "Roles",
      icon: MdSecurity,
      href: "/hris/roles",
    },
  ];

  const handleTabChange = (value: string) => {
    const tab = tabs.find((t) => t.id === value);
    if (tab) {
      router.push(tab.href);
    }
  };

  return (
    <Tabs defaultValue={getActiveTab()} onValueChange={handleTabChange}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} icon={<tab.icon />}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
