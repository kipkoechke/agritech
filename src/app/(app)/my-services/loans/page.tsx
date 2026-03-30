"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MdVisibility, MdAdd } from "react-icons/md";

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
    created_at: "2026-03-10T13:20:00",
    updated_at: "2026-03-12T09:30:00",
  },
];

export default function MyLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoans(DUMMY_LOANS);
      setIsLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "ACTIVE";
      case "pending":
        return "PENDING";
      case "completed":
        return "COMPLETED";
      case "rejected":
        return "REJECTED";
      default:
        return status.toUpperCase();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
              <h2 className="text-sm font-semibold text-gray-700">My Loans</h2>
              <Link
                href="/my-services/loans/add"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <MdAdd className="w-4 h-4" />
                Apply for Loan
              </Link>
            </div>
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Loading loans...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">My Loans</h2>
              <p className="text-xs text-gray-500 mt-1">View and manage your loan applications</p>
            </div>
            <Link
              href="/my-services/loans/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <MdAdd className="w-4 h-4" />
              Apply for Loan
            </Link>
          </div>

          {loans.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Installments
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {loan.loan_type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatCurrency(loan.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            loan.balance === 0 ? "text-green-600" : "text-gray-600"
                          }`}>
                            {formatCurrency(loan.balance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {loan.installments} months
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatCurrency(loan.monthly_deduction)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              loan.status
                            )}`}
                          >
                            {getStatusLabel(loan.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(loan.start_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/my-services/loans/${loan.id}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                            title="View Details"
                          >
                            <MdVisibility className="w-5 h-5" />
                            <span className="text-sm">View</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-t border-gray-200 bg-gray-50">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Total Loans</p>
                  <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Total Borrowed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(loans.reduce((sum, l) => sum + l.amount, 0))}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Total Balance</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(loans.reduce((sum, l) => sum + l.balance, 0))}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Active Loans</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loans.filter(l => l.status === "active").length}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm mb-4">No loans found</p>
              <Link
                href="/my-services/loans/add"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <MdAdd className="w-4 h-4" />
                Apply for Loan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}