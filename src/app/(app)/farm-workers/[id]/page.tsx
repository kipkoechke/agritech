"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MdArrowBack,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdFactory,
  MdCategory,
  MdCalendarToday,
  MdEdit,
  MdInfo,
} from "react-icons/md";
import { useWorker } from "@/hooks/useWorkers";

const InfoCard = ({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon?: any;
  accent?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
      {label}
    </span>
    <div className="flex items-center gap-1.5">
      {Icon && (
        <Icon
          className={`w-4 h-4 flex-shrink-0 ${accent ? "text-primary" : "text-gray-400"}`}
        />
      )}
      <span
        className={`text-sm font-medium ${accent ? "text-primary" : "text-gray-800"}`}
      >
        {value || "—"}
      </span>
    </div>
  </div>
);

export default function WorkerDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: workerResponse, isLoading } = useWorker(id);

  const worker = workerResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading worker details…</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Worker not found
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This worker doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/farm-workers"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MdArrowBack className="w-4 h-4" /> Back to Farm Workers
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = new Date(worker.created_at ?? "").toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedDate = new Date(worker.updated_at ?? "").toLocaleDateString("en-KE", {
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
              href="/farm-workers"
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            >
              <MdArrowBack className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-bold text-gray-900 truncate">
              {worker.name}
            </h1>
          </div>
          <Link
            href={`/farm-workers/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <MdEdit className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdPerson className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Worker Profile
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoCard label="Full Name" value={worker.name} icon={MdPerson} />
            <InfoCard
              label="Phone"
              value={worker.phone || "—"}
              icon={MdPhone}
            />
          </div>
        </div>

        {/* Assignment Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdLocationOn className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Assignment
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoCard
              label="Zone"
              value={worker.zone?.name || "Not assigned"}
              icon={MdLocationOn}
            />
            <InfoCard
              label="Factory"
              value={worker.factory?.name || "Not assigned"}
              icon={MdFactory}
            />
            <InfoCard
              label="Cluster"
              value={worker.cluster?.name || "Not assigned"}
              icon={MdCategory}
            />
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
          <div className="px-6 py-5 grid grid-cols-2 gap-6">
            <InfoCard
              label="Created"
              value={createdDate}
              icon={MdCalendarToday}
            />
            <InfoCard
              label="Last Updated"
              value={updatedDate}
              icon={MdCalendarToday}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
