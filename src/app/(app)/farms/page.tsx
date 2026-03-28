"use client";

import { MdAgriculture } from "react-icons/md";

export default function FarmsPage() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <MdAgriculture className="w-6 h-6 text-primary" />
        Farms
      </h1>
      <p className="text-gray-600 mt-4">Farms management will be available once API is connected.</p>
    </div>
  );
}
