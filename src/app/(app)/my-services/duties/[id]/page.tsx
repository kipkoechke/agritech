"use client";

import { useState } from "react";
import { MdPerson, MdAdd, MdVisibility, MdEdit, MdPhone, MdLocationOn } from "react-icons/md";

interface Worker {
  id: string;
  name: string;
  phone: string;
  zone: {
    id: string;
    name: string;
  };
  created_at: string;
}

// Dummy data
const DUMMY_WORKERS: Worker[] = [
  {
    id: "1",
    name: "John Kiprotich",
    phone: "0712345678",
    zone: {
      id: "zone1",
      name: "Highland",
    },
    created_at: "2026-03-15T08:00:00",
  },
  {
    id: "2",
    name: "Mary Wanjiku",
    phone: "0723456789",
    zone: {
      id: "zone2",
      name: "Lowland",
    },
    created_at: "2026-03-16T09:30:00",
  },
  {
    id: "3",
    name: "Peter Odhiambo",
    phone: "0734567890",
    zone: {
      id: "zone3",
      name: "Midland",
    },
    created_at: "2026-03-17T10:15:00",
  },
];

export default function FarmWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>(DUMMY_WORKERS);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this farm worker?")) {
      setIsLoading(true);
      setTimeout(() => {
        setWorkers(workers.filter(worker => worker.id !== id));
        setIsLoading(false);
        alert("Worker deleted successfully!");
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdPerson className="w-6 h-6 text-primary" />
            Farm Workers
          </h1>
          <button
            onClick={() => alert("Navigate to add worker page")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MdAdd className="w-5 h-5" />
            Add Farm Worker
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {workers.length === 0 && !isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MdPerson className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No farm workers yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first farm worker.</p>
            <button
              onClick={() => alert("Navigate to add worker page")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <MdAdd className="w-5 h-5" />
              Add Farm Worker
            </button>
          </div>
        )}

        {workers.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MdPhone className="w-4 h-4" />
                          {worker.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MdLocationOn className="w-4 h-4" />
                          {worker.zone.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(worker.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => alert(`View worker: ${worker.name}`)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                          >
                            <MdVisibility className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => alert(`Edit worker: ${worker.name}`)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Edit Worker"
                          >
                            <MdEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(worker.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete Worker"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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
    </div>
  );
}