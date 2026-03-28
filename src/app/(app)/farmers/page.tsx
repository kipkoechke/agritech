"use client";

import { useState } from "react";
import { MdPerson, MdAdd, MdSearch, MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import Link from "next/link";
import Button from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";

interface Farmer {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  acreage: number;
  farmCode: string;
  farmerCode: string;
  location: string;
}

const mockFarmers: Farmer[] = [
  {
    id: "1",
    name: "John Doe",
    nationalId: "12345678",
    phone: "254712345678",
    acreage: 5,
    farmCode: "F001",
    farmerCode: "FRM001",
    location: "Zone A",
  },
  {
    id: "2",
    name: "Jane Smith",
    nationalId: "87654321",
    phone: "254798765432",
    acreage: 10,
    farmCode: "F002",
    farmerCode: "FRM002",
    location: "Zone B",
  },
];

export default function FarmersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [farmers] = useState<Farmer[]>(mockFarmers);

  const filteredFarmers = farmers.filter((farmer) =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.farmerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.nationalId.includes(searchTerm)
  );

  return (
    <div className="min-h-screen p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MdPerson className="w-7 h-7 text-emerald-600" />
          Farmers
        </h1>
        <Link href="/farmers/new">
          <Button type="primary" className="flex items-center gap-2">
            <MdAdd className="w-5 h-5" />
            Add New Farmer
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search farmers by name, code, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Farmer Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  National ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acreage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFarmers.length > 0 ? (
                filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-emerald-600">
                      {farmer.farmerCode}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {farmer.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {farmer.nationalId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {farmer.phone}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {farmer.acreage} acres
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {farmer.location}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded">
                          <MdVisibility className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? "No farmers found matching your search" : "No farmers registered yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
