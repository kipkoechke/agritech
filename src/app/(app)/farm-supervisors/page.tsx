"use client";

import { MdSupervisorAccount } from "react-icons/md";

export default function FarmSupervisorsPage() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <MdSupervisorAccount className="w-6 h-6 text-primary" />
        Farm Supervisors
      </h1>
      <p className="text-gray-600 mt-4">Farm supervisors management will be available once API is connected.</p>
    </div>
  );
}
