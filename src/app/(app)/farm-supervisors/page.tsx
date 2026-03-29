"use client";

import Link from "next/link";
import { MdSupervisorAccount, MdAdd, MdVisibility } from "react-icons/md";
import { useState } from "react";

// Dummy data
const DUMMY_SUPERVISORS = [
  { id: "S001", name: "Alice Njeri", zone: "Kericho", farms: 3, email: "alice.njeri@example.com" },
  { id: "S002", name: "Peter Kiptoo", zone: "Nandi", farms: 5, email: "peter.kiptoo@example.com" },
];

export default function FarmsSupervisorsPage() {
  const [supervisors, setSupervisors] = useState(DUMMY_SUPERVISORS);

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MdSupervisorAccount className="w-6 h-6 text-primary" />
          Farm Supervisors
        </h1>
        <Link
          href="/farm-supervisors/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <MdAdd className="w-5 h-5" />
          Add Supervisor
        </Link>
      </div>

      {supervisors.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <MdSupervisorAccount className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No supervisors yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first supervisor.</p>
          <Link
            href="/farm-supervisors/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MdAdd className="w-5 h-5" />
            Add Supervisor
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number of Farms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supervisors.map((sup) => (
                  <tr key={sup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sup.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{sup.zone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{sup.farms}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{sup.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/farm-supervisors/${sup.id}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <MdVisibility className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}