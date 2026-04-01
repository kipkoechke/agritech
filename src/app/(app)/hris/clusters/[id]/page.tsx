"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MdArrowBack, MdHub } from "react-icons/md";
import Button from "@/components/common/Button";
import { useCluster } from "@/hooks/useCluster";

export default function ClusterDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: clusterResponse, isLoading } = useCluster(id);

  const cluster = clusterResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!cluster) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Cluster not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/hris/clusters"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Clusters
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdHub className="w-6 h-6 text-emerald-600" />
                  {cluster.name}
                </h1>
                <p className="text-gray-500 mt-1">Cluster Details</p>
              </div>
              <Button type="small" to={`/hris/clusters/${id}/edit`}>
                Edit
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Name
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {cluster.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Code
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {cluster.code}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Factory
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {cluster.factory?.name || "—"}
                </p>
                {cluster.factory?.code && (
                  <p className="text-xs text-gray-400">
                    {cluster.factory.code}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Zone
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {cluster.zone?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Farms Count
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {cluster.farms_count}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Farm Workers Count
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {cluster.farm_workers_count}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Coordinates
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {cluster.coordinates
                    ? `${cluster.coordinates[0]}, ${cluster.coordinates[1]}`
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Created At
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {new Date(cluster.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
