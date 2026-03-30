"use client";

import React, { use } from "react";
import Link from "next/link";
import { useLoan } from "@/hooks/useLoans";
import { MdArrowBack } from "react-icons/md";

export default function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: loan, isLoading } = useLoan(id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loading loan details...
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loan application not found
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
        <Link
          href="/my-services/loans"
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MdArrowBack className="w-5 h-5 text-gray-600" />
        </Link>
        <h2 className="text-lg font-semibold text-gray-900">Loan Details</h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Status and Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  loan.status
                )}`}
              >
                {loan.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Loan Type
            </label>
            <p className="mt-1 text-gray-900">{loan.loan_type}</p>
          </div>
        </div>

        {/* Amount Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Loan Amount
            </label>
            <p className="mt-1 text-gray-900 text-lg font-semibold">
              KES {loan.amount.toLocaleString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Balance</label>
            <p className="mt-1 text-gray-900 text-lg font-semibold">
              KES {loan.balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Installments
            </label>
            <p className="mt-1 text-gray-900">{loan.installments} months</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Monthly Deduction
            </label>
            <p className="mt-1 text-gray-900">
              KES {loan.monthly_deduction.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="text-sm font-medium text-gray-500">
            Start Date
          </label>
          <p className="mt-1 text-gray-900">
            {new Date(loan.start_date).toLocaleDateString()}
          </p>
        </div>

        {/* Reason */}
        <div>
          <label className="text-sm font-medium text-gray-500">Reason</label>
          <p className="mt-1 text-gray-900 whitespace-pre-wrap">
            {loan.reason}
          </p>
        </div>

        {/* Remarks */}
        {loan.remarks && (
          <div>
            <label className="text-sm font-medium text-gray-500">Remarks</label>
            <p className="mt-1 text-gray-900 whitespace-pre-wrap">
              {loan.remarks}
            </p>
          </div>
        )}

        {/* Dates - Inline with vertical separators */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div>
              <span className="text-gray-500">Applied:</span>{" "}
              <span className="text-gray-900">
                {new Date(loan.created_at).toLocaleString()}
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div>
              <span className="text-gray-500">Updated:</span>{" "}
              <span className="text-gray-900">
                {new Date(loan.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
