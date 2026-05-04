"use client";

import { useState } from "react";
import {
  MdMap,
  MdGroupWork,
  MdSupervisorAccount,
} from "react-icons/md";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/common/TabBar";
import PageHeader from "@/components/common/PageHeader";
import { useIsAdmin, useIsFarmer, useIsSupervisor } from "@/hooks/useAuth";
import dynamic from "next/dynamic";

const FarmsPage = dynamic(() => import("../farms/page"), { ssr: false });
const WorkGroupsPage = dynamic(() => import("../work-groups/page"), { ssr: false });
const FarmsSupervisorsPage = dynamic(() => import("../farm-supervisors/page"), { ssr: false });

export default function RegistrationPage() {
  const isAdmin = useIsAdmin();
  const isFarmer = useIsFarmer();
  const isSupervisor = useIsSupervisor();
  const [activeTab, setActiveTab] = useState("farms");

  const tabs = [
    {
      id: "farms",
      label: isAdmin ? "Farms" : "My Farms",
      icon: MdMap,
      visible: true,
    },
    {
      id: "work-groups",
      label: "My Work Groups",
      icon: MdGroupWork,
      visible: isFarmer || isSupervisor,
    },
    {
      id: "farm-supervisors",
      label: "My Supervisors",
      icon: MdSupervisorAccount,
      visible: isFarmer,
    },
  ].filter((tab) => tab.visible);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Registration"
        description="Manage your farms, work groups, and supervisors"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              icon={<tab.icon />}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="farms">
            <FarmsPage />
          </TabsContent>

          <TabsContent value="work-groups">
            <WorkGroupsPage />
          </TabsContent>

          <TabsContent value="farm-supervisors">
            <FarmsSupervisorsPage />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}