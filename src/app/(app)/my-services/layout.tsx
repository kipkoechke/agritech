"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/common/TabBar";
import {
  MdAssignment,
  MdEventAvailable,
  MdAttachMoney,
  MdSchedule,
  MdAccessTime,
} from "react-icons/md";

export default function MyServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.includes("/tasks")) return "tasks";
    if (pathname.includes("/leave")) return "leave";
    if (pathname.includes("/loans")) return "loans";
    if (pathname.includes("/duties")) return "duties";
    if (pathname.includes("/attendance")) return "attendance";
    return "tasks";
  };

  const handleTabChange = (value: string) => {
    router.push(`/my-services/${value}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-sm text-gray-600 mt-1">
            View your tasks, leave applications, loans, and duty assignments
          </p>
        </div>

        <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="tasks" icon={<MdAssignment />}>
              My Tasks
            </TabsTrigger>
            <TabsTrigger value="attendance" icon={<MdAccessTime />}>
              Attendance
            </TabsTrigger>
            <TabsTrigger value="leave" icon={<MdEventAvailable />}>
              My Leave
            </TabsTrigger>
            <TabsTrigger value="loans" icon={<MdAttachMoney />}>
              My Loans
            </TabsTrigger>
            <TabsTrigger value="duties" icon={<MdSchedule />}>
              My Duties
            </TabsTrigger>
          </TabsList>

          <TabsContent value={getActiveTab()}>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {children}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
