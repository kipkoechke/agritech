"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MdPhoneAndroid, MdCheckCircle, MdPending } from "react-icons/md";
import {
  useMpesaTransactions,
  useReconcileTransaction,
} from "@/hooks/useMpesaTransaction";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import type { MpesaTransaction } from "@/types/mpesaTransaction";

const STATUS_STYLES = {
  used: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unused: "bg-amber-50 text-amber-700 border-amber-200",
};

const reconcileSchema = z.object({
  account_number: z.string().min(1, "Account number is required"),
});

type ReconcileFormData = z.infer<typeof reconcileSchema>;

interface ReconcileModalContentProps {
  transaction: MpesaTransaction | null;
  onCloseModal?: () => void;
}

function ReconcileModalContent({
  transaction,
  onCloseModal,
}: ReconcileModalContentProps) {
  const reconcileMutation = useReconcileTransaction();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReconcileFormData>({
    resolver: zodResolver(reconcileSchema),
    defaultValues: {
      account_number: "",
    },
  });

  const formatAmount = (amount: string) => {
    return `KES ${amount}`;
  };

  const onSubmit = (data: ReconcileFormData) => {
    if (!transaction) return;

    reconcileMutation.mutate(
      {
        transId: transaction.trans_id || transaction.transaction_id,
        data: { account_number: data.account_number.trim() },
      },
      {
        onSuccess: () => {
          reset();
          onCloseModal?.();
        },
      },
    );
  };

  if (!transaction) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No transaction selected</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Reconcile Transaction
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Transaction ID</span>
            <span className="text-sm font-medium text-gray-900">
              {transaction.trans_id || transaction.transaction_id || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Customer</span>
            <span className="text-sm font-medium text-gray-900">
              {transaction.first_name || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="text-sm font-medium text-gray-900">
              {formatAmount(transaction.amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Bill Ref</span>
            <span className="text-sm font-medium text-gray-900">
              {transaction.bill_ref_number || "-"}
            </span>
          </div>
        </div>

        <InputField
          label="Account Number"
          type="text"
          placeholder="Enter account number"
          register={register("account_number")}
          error={errors.account_number?.message}
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
            {reconcileMutation.isPending ? "Reconciling..." : "Reconcile"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function MpesaTransactionsPage() {
  const [activeTab, setActiveTab] = useState<"unreconciled" | "reconciled">(
    "unreconciled",
  );
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useMpesaTransactions({
    page,
    per_page: 15,
    used: activeTab === "reconciled",
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

  const formatAmount = (amount: string) => {
    return `KES ${amount}`;
  };

  const handleTabChange = (tab: "unreconciled" | "reconciled") => {
    setActiveTab(tab);
    setPage(1);
  };

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Failed to load M-Pesa transactions</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600">
              <MdPhoneAndroid className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                M-Pesa Raw Transactions
              </h1>
              <p className="text-sm text-gray-600">
                {pagination?.total || 0} total transactions
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Search */}
            <SearchField
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search..."
              className="w-full sm:w-56"
            />

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0">
              <button
                onClick={() => handleTabChange("unreconciled")}
                className={`flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "unreconciled"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <MdPending className="w-4 h-4" />
                <span className="hidden sm:inline">Unreconciled</span>
                <span className="sm:hidden">Unreconciled</span>
              </button>
              <button
                onClick={() => handleTabChange("reconciled")}
                className={`flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "reconciled"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <MdCheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Reconciled</span>
                <span className="sm:hidden">Reconciled</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 flex-1 min-h-0 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden flex-1 overflow-auto p-3 space-y-3">
                {transactions.map((transaction: MpesaTransaction) => (
                  <div
                    key={transaction.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {transaction.first_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.trans_id || transaction.transaction_id}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${
                          transaction.used
                            ? STATUS_STYLES.used
                            : STATUS_STYLES.unused
                        }`}
                      >
                        {transaction.used ? "Used" : "Unused"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <p className="text-gray-400">Bill Ref</p>
                        <p className="text-gray-900 font-medium">
                          {transaction.bill_ref_number || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Amount</p>
                        <p className="text-gray-900 font-medium">
                          {formatAmount(transaction.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Type</p>
                        <p className="text-gray-900">
                          {transaction.transaction_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Date</p>
                        <p className="text-gray-900">
                          {formatDate(transaction.transaction_time || transaction.trans_time || transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    {activeTab === "reconciled" && transaction.reconciled_by && (
                      <div className="text-xs border-t border-gray-200 pt-2 mt-2">
                        <p className="text-gray-400">Reconciled by</p>
                        <p className="text-gray-900">
                          {transaction.reconciled_by.name}
                          {transaction.reconciled_at && (
                            <span className="text-gray-500">
                              {" "}
                              • {formatDate(transaction.reconciled_at)}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                    {activeTab === "unreconciled" && (
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <Modal>
                          <Modal.Open opens={`reconcile-mobile-${transaction.id}`}>
                            <button className="w-full px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                              Reconcile
                            </button>
                          </Modal.Open>
                          <Modal.Window name={`reconcile-mobile-${transaction.id}`}>
                            <ReconcileModalContent transaction={transaction} />
                          </Modal.Window>
                        </Modal>
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
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Bill Ref</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      {activeTab === "reconciled" && (
                        <th className="px-4 py-3">Reconciled By</th>
                      )}
                      {activeTab === "unreconciled" && (
                        <th className="px-4 py-3">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((transaction: MpesaTransaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-gray-950">
                          {transaction.trans_id || transaction.transaction_id}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.first_name}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">
                            {transaction.bill_ref_number}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">
                            {transaction.transaction_type}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            {formatAmount(transaction.amount)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${
                              transaction.used
                                ? STATUS_STYLES.used
                                : STATUS_STYLES.unused
                            }`}
                          >
                            {transaction.used ? "Used" : "Unused"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">
                            {formatDate(transaction.transaction_time || transaction.trans_time || transaction.created_at)}
                          </p>
                        </td>
                        {activeTab === "reconciled" && (
                          <td className="px-4 py-3">
                            {transaction.reconciled_by ? (
                              <div>
                                <p className="text-sm text-gray-900">
                                  {transaction.reconciled_by.name}
                                </p>
                                {transaction.reconciled_at && (
                                  <p className="text-xs text-gray-500">
                                    {formatDate(transaction.reconciled_at)}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">-</p>
                            )}
                          </td>
                        )}
                        {activeTab === "unreconciled" && (
                          <td className="px-4 py-3">
                            <Modal>
                              <Modal.Open opens={`reconcile-${transaction.id}`}>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                                  Reconcile
                                </button>
                              </Modal.Open>
                              <Modal.Window name={`reconcile-${transaction.id}`}>
                                <ReconcileModalContent
                                  transaction={transaction}
                                />
                              </Modal.Window>
                            </Modal>
                          </td>
                        )}
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
    </div>
  );
}
