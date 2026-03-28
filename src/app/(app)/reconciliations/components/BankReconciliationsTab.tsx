"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MdAdd } from "react-icons/md";
import {
  useBankTransactions,
  useReconcileBankTransaction,
} from "@/hooks/useBankReconciliation";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import type { BankTransaction } from "@/types/bankReconciliation";

const reconcileSchema = z.object({
  account_number: z.string().min(1, "Account number is required"),
  amount: z.string().min(1, "Amount is required"),
  transaction_date: z.string().min(1, "Transaction date is required"),
  reference_code: z.string().min(1, "Reference code is required"),
});

type ReconcileFormData = z.infer<typeof reconcileSchema>;

interface AddReconciliationModalContentProps {
  onCloseModal?: () => void;
}

function AddReconciliationModalContent({
  onCloseModal,
}: AddReconciliationModalContentProps) {
  const reconcileMutation = useReconcileBankTransaction();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReconcileFormData>({
    resolver: zodResolver(reconcileSchema),
    defaultValues: {
      account_number: "",
      amount: "",
      transaction_date: "",
      reference_code: "",
    },
  });

  const onSubmit = (data: ReconcileFormData) => {
    reconcileMutation.mutate(
      {
         account_number: data.account_number.trim(),
      amount: data.amount.trim(),
      transaction_date: new Date(data.transaction_date), // Convert to Date
      reference_code: data.reference_code.trim(),
      },
      {
        onSuccess: () => {
          reset();
          onCloseModal?.();
        },
      },
    );
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Add Bank Reconciliation
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          label="Account Number"
          type="text"
          placeholder="e.g. 01000014"
          register={register("account_number")}
          error={errors.account_number?.message}
          required
        />

        <InputField
          label="Amount"
          type="text"
          placeholder="e.g. 2000"
          register={register("amount")}
          error={errors.amount?.message}
          required
        />
        <InputField
          label="Transaction Date & Time"
          type="datetime-local"
          placeholder="e.g 2024-01-01T12:00"
           register={register("transaction_date")}
  error={errors.transaction_date?.message}
  required
        />
        

        <InputField
          label="Reference Code"
          type="text"
          placeholder="e.g. VXRT3EDDSSD4R"
          register={register("reference_code")}
          error={errors.reference_code?.message}
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCloseModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <Button htmlType="submit" disabled={reconcileMutation.isPending}>
            {reconcileMutation.isPending ? "Adding..." : "Add Reconciliation"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function BankReconciliationsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useBankTransactions({
    page,
    per_page: 15,
    search: search || undefined,
  });

  const transactions = data?.data || [];
  const pagination = data?.pagination;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number, currency: string = "KES") => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-red-500">Failed to load bank transactions</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 shrink-0">
        {/* Search */}
        <SearchField
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search..."
          className="w-full sm:flex-1"
        />

        {/* Add Button */}
        <Modal>
          <Modal.Open opens="add-reconciliation">
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0">
              <MdAdd className="w-5 h-5" />
              <span>Add Reconciliation</span>
            </button>
          </Modal.Open>
          <Modal.Window name="add-reconciliation">
            <AddReconciliationModalContent />
          </Modal.Window>
        </Modal>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 flex-1 min-h-0 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No bank transactions found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden flex-1 overflow-auto p-3 space-y-3">
              {transactions.map((transaction: BankTransaction) => (
                <div
                  key={transaction.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {transaction.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.transaction_id}
                      </p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${
                        transaction.status === "SUCCESS"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-gray-400">Account Number</p>
                      <p className="text-gray-900 font-medium">
                        {transaction.merchant_reference || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="text-gray-900 font-medium">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Phone</p>
                      <p className="text-gray-900">{transaction.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Transaction Date</p>
                      <p className="text-gray-900">
                        {formatDate(transaction.transaction_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Reconciled At</p>
                      <p className="text-gray-900">
                        {transaction.reconciled_at
                          ? formatDate(transaction.reconciled_at)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Reconciled By</p>
                      <p className="text-gray-900">
                        {transaction.reconciled_by?.name || "-"}
                      </p>
                    </div>
                  </div>
                  {transaction.narration && (
                    <div className="text-xs mb-2">
                      <p className="text-gray-400">Narration</p>
                      <p className="text-gray-900">{transaction.narration}</p>
                    </div>
                  )}
                  {transaction.customer && (
                    <div className="text-xs border-t border-gray-200 pt-2 mt-2">
                      <p className="text-gray-400">Customer</p>
                      <p className="text-gray-900">
                        {transaction.customer.name}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block flex-1 overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Transaction Date</th>
                    <th className="px-4 py-3">Reconciled At</th>
                    <th className="px-4 py-3">Reconciled By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((transaction: BankTransaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-950">
                          {transaction.transaction_id}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.name}
                          </p>
                          {transaction.customer && (
                            <p className="text-xs text-gray-500">
                              {transaction.customer.name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">
                          {transaction.merchant_reference || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">
                          {transaction.phone_number}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {formatAmount(transaction.amount, transaction.currency)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${
                            transaction.status === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">
                          {formatDate(transaction.transaction_date)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {transaction.reconciled_at ? (
                          <p className="text-sm text-gray-600">
                            {formatDate(transaction.reconciled_at)}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {transaction.reconciled_by ? (
                          <p className="text-sm text-gray-900">
                            {transaction.reconciled_by.name}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            totalItems={pagination.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

