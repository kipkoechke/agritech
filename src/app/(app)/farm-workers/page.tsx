"use client";

import { MdPeople } from "react-icons/md";

export default function FarmWorkersPage() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <MdPeople className="w-6 h-6 text-primary" />
        Farm Workers
      </h1>
      <p className="text-gray-600 mt-4">Farm workers management will be available once API is connected.</p>
    </div>
  );
}
