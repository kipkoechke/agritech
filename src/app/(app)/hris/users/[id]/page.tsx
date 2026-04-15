"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MdArrowBack,
  MdPerson,
  MdEdit,
  MdInfo,
  MdEmail,
  MdPhone,
  MdBadge,
  MdCreditCard,
  MdGroups,
  MdCalendarToday,
  MdUpdate,
  MdDescription,
} from "react-icons/md";
import { useHrisUser } from "@/hooks/useHrisUser";

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

const formatRole = (role: string) =>
  role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  supervisor: "bg-blue-100 text-blue-700",
  farmer: "bg-green-100 text-green-700",
  farm_worker: "bg-amber-100 text-amber-700",
};

export default function HrisUserDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: userResponse, isLoading } = useHrisUser(id);

  const user = userResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading user…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MdInfo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            User not found
          </h2>
          <Link
            href="/hris/users"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MdArrowBack className="w-4 h-4" /> Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = new Date(user.created_at).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedDate = new Date(user.updated_at).toLocaleDateString("en-KE", {
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
              href="/hris/users"
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            >
              <MdArrowBack className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {user.name}
              </h1>
              <p className="text-[11px] text-gray-400 leading-none mt-0.5">
                {formatRole(user.role)}
              </p>
            </div>
          </div>
          <Link
            href={`/hris/users/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <MdEdit className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Contact Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdPerson className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Contact Information
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoCard label="Full Name" value={user.name} icon={MdPerson} />
            <InfoCard label="Email" value={user.email} icon={MdEmail} />
            <InfoCard label="Phone" value={user.phone} icon={MdPhone} />
          </div>
        </div>

        {/* Role & Access Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MdBadge className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Role & Access
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {/* Role badge */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Role
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                  roleColors[user.role] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                <MdBadge className="w-3.5 h-3.5" />
                {formatRole(user.role)}
              </span>
            </div>
            {user.role_description && (
              <InfoCard
                label="Role Description"
                value={user.role_description}
                icon={MdDescription}
              />
            )}
            <InfoCard
              label="Account Number"
              value={user.account_number ?? "—"}
              icon={MdCreditCard}
            />
            <InfoCard
              label="Membership"
              value={user.membership ?? "—"}
              icon={MdGroups}
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
