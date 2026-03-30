"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

interface Loan {
  id: string;
  loan_type: string;
  amount: number;
  balance: number;
  installments: number;
  monthly_deduction: number;
  start_date: string;
  status: string;
  reason: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

// Dummy data
const DUMMY_LOANS: Loan[] = [
  {
    id: "1",
    loan_type: "Emergency Loan",
    amount: 50000,
    balance: 50000,
    installments: 6,
    monthly_deduction: 8333,
    start_date: "2026-04-01",
    status: "pending",
    reason: "Medical emergency - need funds for hospital bills",
    created_at: "2026-03-25T10:30:00",
    updated_at: "2026-03-25T10:30:00",
  },
  {
    id: "2",
    loan_type: "Farm Input Loan",
    amount: 150000,
    balance: 75000,
    installments: 12,
    monthly_deduction: 12500,
    start_date: "2026-01-15",
    status: "active",
    reason: "Purchase of fertilizers, seeds, and farming equipment",
    remarks: "First 6 installments paid successfully",
    created_at: "2025-12-20T09:15:00",
    updated_at: "2026-03-01T14:20:00",
  },
  {
    id: "3",
    loan_type: "Equipment Loan",
    amount: 250000,
    balance: 0,
    installments: 24,
    monthly_deduction: 10417,
    start_date: "2025-06-01",
    status: "completed",
    reason: "Purchase of irrigation system",
    remarks: "Loan fully repaid",
    created_at: "2025-05-15T11:00:00",
    updated_at: "2026-02-28T16:45:00",
  },
  {
    id: "4",
    loan_type: "Education Loan",
    amount: 80000,
    balance: 80000,
    installments: 8,
    monthly_deduction: 10000,
    start_date: "2026-04-15",
    status: "rejected",
    reason: "School fees for children",
    remarks: "Insufficient repayment capacity",
    created_at: "2026-03-10T13:20:00",
    updated_at: "2026-03-12T09:30:00",
  },
];

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [loan, setLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundLoan = DUMMY_LOANS.find(l => l.id === id);
      setLoan(foundLoan || null);
      setIsLoading(false);
    }, 500);
  }, [id]);

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

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProgressPercentage = () => {
    if (loan && loan.amount > 0) {
      const paid = loan.amount - loan.balance;
      return (paid / loan.amount) * 100;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
              <Link
                href="/my-services/loans"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600" />
              </Link>
              <h2 className="text-lg font-semibold text-gray-900">Loan Details</h2>
            </div>
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Loading loan details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
              <Link
                href="/my-services/loans"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600" />
              </Link>
              <h2 className="text-lg font-semibold text-gray-900">Loan Details</h2>
            </div>
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Loan application not found
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50 rounded-t-lg">
            <Link
              href="/my-services/loans"
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <MdArrowBack className="w-5 h-5 text-gray-600" />
            </Link>
            <h2 className="text-lg font-semibold text-gray-900">Loan Details</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Status and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Status
                </label>
                <div>
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
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Loan Type
                </label>
                <p className="text-gray-900 font-medium">{loan.loan_type}</p>
              </div>
            </div>

            {/* Amount Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Loan Amount
                </label>
                <p className="text-gray-900 text-xl font-bold">
                  {formatCurrency(loan.amount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Remaining Balance
                </label>
                <p className="text-gray-900 text-xl font-bold">
                  {formatCurrency(loan.balance)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {loan.status === "active" && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Repayment Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Installments
                </label>
                <p className="text-gray-900">{loan.installments} months</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Monthly Deduction
                </label>
                <p className="text-gray-900">{formatCurrency(loan.monthly_deduction)}</p>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">
                Start Date
              </label>
              <p className="text-gray-900">{formatDate(loan.start_date)}</p>
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">
                Reason
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {loan.reason}
                </p>
              </div>
            </div>

            {/* Remarks */}
            {loan.remarks && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Remarks
                </label>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-900 whitespace-pre-wrap">
                    {loan.remarks}
                  </p>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-gray-600">
                <div>
                  <span className="text-gray-500">Applied:</span>{" "}
                  <span className="text-gray-900">
                    {formatDateTime(loan.created_at)}
                  </span>
                </div>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{" "}
                  <span className="text-gray-900">
                    {formatDateTime(loan.updated_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions for pending loans */}
            {loan.status === "pending" && (
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => alert("Edit functionality would open here")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit Request
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel this loan request?")) {
                      alert("Loan request cancelled");
                      router.push("/my-services/loans");
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}