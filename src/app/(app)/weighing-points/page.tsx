"use client";

import { MdScale } from "react-icons/md";

export default function WeighingPointsPage() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <MdScale className="w-6 h-6 text-primary" />
        Weighing Points
      </h1>
      <p className="text-gray-600 mt-4">Weighing points management will be available once API is connected.</p>
    </div>
  );
}
