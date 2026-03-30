"use client";

import React from "react";
import Link from "next/link";
import { useLoans } from "@/hooks/useLoans";
import { ActionMenu } from "@/components/common/ActionMenu";
import { MdMoreVert, MdVisibility, MdAdd } from "react-icons/md";
import type { Loan } from "@/types/loans";

export default function MyLoansPage() {
  const { data: loansData, isLoading: loansLoading } = useLoans();
  const loans = loansData || [];

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

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700">My Loans</h2>
        <Link
          href="/my-services/loans/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
        >
          <MdAdd className="w-4 h-4" />
          Apply for Loan
        </Link>
      </div>
      {loansLoading ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          Loading loans...
        </div>
      ) : loans.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Installments
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Deduction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan: Loan) => (
                <tr
                  key={loan.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {loan.loan_type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    KES {loan.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    KES {loan.balance.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {loan.installments}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    KES {loan.monthly_deduction.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        loan.status
                      )}`}
                    >
                      {loan.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {new Date(loan.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <ActionMenu menuId={`loan-menu-${loan.id}`}>
                      <ActionMenu.Trigger>
                        <MdMoreVert className="w-5 h-5 text-gray-600" />
                      </ActionMenu.Trigger>
                      <ActionMenu.Content>
                        <ActionMenu.Item
                          onClick={() =>
                            (window.location.href = `/my-services/loans/${loan.id}`)
                          }
                        >
                          <MdVisibility className="w-4 h-4" />
                          View Details
                        </ActionMenu.Item>
                      </ActionMenu.Content>
                    </ActionMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">No loans found</p>
          <Link
            href="/my-services/loans/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
          >
            <MdAdd className="w-4 h-4" />
            Apply for Loan
          </Link>
        </div>
      )}
    </div>
  );
}
