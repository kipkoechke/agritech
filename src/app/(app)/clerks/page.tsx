"use client";

import Link from "next/link";
import { MdFactory, MdAdd, MdVisibility } from "react-icons/md";
import { useState } from "react";

export default function FactoryClerksPage() {
  const [factoryclerks] = useState([
    {
      id: "1",
      name: "Kiptoo Rotich",
      location: "Kericho",
      supervisor: "John Doe",
      products: "Fertilizers, Seeds",
    },
    {
      id: "2",
      name: "Allan Kipkoech",
      location: "Nakuru",
      supervisor: "Jane Smith",
      products: "Grains, Pulses",
    },
  ]);

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MdFactory className="w-6 h-6 text-primary" />
          Factory Clerks
        </h1>
        <Link
          href="/factory-clerks/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <MdAdd className="w-5 h-5" />
          Add Factory Clerk
        </Link>
      </div>

      {factoryclerks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <MdFactory className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No factory clerks yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first factory clerk.</p>
          <Link
            href="/factory-clerks/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MdAdd className="w-5 h-5" />
            Add Factory Clerk
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
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {factoryclerks.map((factory) => (
                  <tr key={factory.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{factory.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{factory.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{factory.supervisor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{factory.products}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/factories/${factory.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <MdVisibility className="w-5 h-5" />
                        </Link>
                      </div>
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