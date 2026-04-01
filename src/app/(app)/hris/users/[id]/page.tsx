"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MdArrowBack, MdGroup } from "react-icons/md";
import Button from "@/components/common/Button";
import { useHrisUser } from "@/hooks/useHrisUser";

const formatRole = (role: string) =>
  role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function HrisUserDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: userResponse, isLoading } = useHrisUser(id);

  const user = userResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/hris/users"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Users
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdGroup className="w-6 h-6 text-emerald-600" />
                  {user.name}
                </h1>
                <p className="text-gray-500 mt-1">User Details</p>
              </div>
              <Button type="small" to={`/hris/users/${id}/edit`}>
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
                  {user.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {user.phone}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Role
                </p>
                <span className="inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {formatRole(user.role)}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Role Description
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {user.role_description || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Account Number
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {user.account_number || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Membership
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {user.membership || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Created At
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
