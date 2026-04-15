"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MdArrowBack,
  MdHub,
  MdEdit,
  MdInfo,
  MdLocationOn,
  MdFactory,
  MdMap,
  MdAgriculture,
  MdPeople,
  MdCalendarToday,
  MdUpdate,
} from "react-icons/md";
import { useCluster } from "@/hooks/useCluster";

interface InfoCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
}

function InfoCard({ label, value, icon: Icon }: InfoCardProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-800">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

export default function ClusterDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: clusterResponse, isLoading } = useCluster(id);

  const cluster = clusterResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading cluster…</p>
        </div>
      </div>
    );
  }

  if (!cluster) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Cluster not found
          </h2>
          <Link
            href="/hris/clusters"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MdArrowBack className="w-4 h-4" /> Back to Clusters
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = new Date(cluster.created_at).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedDate = new Date(cluster.updated_at).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/hris/clusters"
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            >
              <MdArrowBack className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {cluster.name}
              </h1>
              <p className="text-[11px] text-gray-400 leading-none mt-0.5">
                {cluster.code}
              </p>
            </div>
          </div>
          <Link
            href={`/hris/clusters/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <MdEdit className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Identity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdHub className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Cluster Identity
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoCard label="Name" value={cluster.name} icon={MdHub} />
            <InfoCard label="Code" value={cluster.code} icon={MdHub} />
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdLocationOn className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Location
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoCard
              label="Zone"
              value={cluster.zone?.name ?? "—"}
              icon={MdMap}
            />
            <InfoCard
              label="Factory"
              value={cluster.factory?.name ?? "—"}
              icon={MdFactory}
            />
            {cluster.factory?.code && (
              <InfoCard
                label="Factory Code"
                value={cluster.factory.code}
                icon={MdFactory}
              />
            )}
            <InfoCard
              label="Coordinates"
              value={
                cluster.coordinates
                  ? `${cluster.coordinates[0]}, ${cluster.coordinates[1]}`
                  : "—"
              }
              icon={MdLocationOn}
            />
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdPeople className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Statistics
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-700">
                {cluster.farms_count}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <MdAgriculture className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-[11px] text-emerald-600 font-medium">
                  Farms
                </p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-2xl font-bold text-blue-700">
                {cluster.farm_workers_count}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <MdPeople className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-[11px] text-blue-600 font-medium">
                  Farm Workers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdCalendarToday className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Timeline
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoCard
              label="Created"
              value={createdDate}
              icon={MdCalendarToday}
            />
            <InfoCard
              label="Last Updated"
              value={updatedDate}
              icon={MdUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
