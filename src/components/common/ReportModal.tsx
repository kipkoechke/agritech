"use client";

import { useState, useCallback } from "react";
import {
  MdClose,
  MdPictureAsPdf,
  MdShoppingCart,
  MdAccountBalanceWallet,
  MdCalendarToday,
} from "react-icons/md";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: {
    purpose: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
  isGenerating: boolean;
  title?: string;
}

const REPORT_OPTIONS = [
  {
    value: "",
    label: "All Transactions",
    description: "Includes both order payments and wallet top ups",
    icon: MdPictureAsPdf,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
  },
  {
    value: "order_payment",
    label: "Order Payments",
    description: "Payments made for specific orders",
    icon: MdShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    value: "wallet_credit",
    label: "Wallet Top Ups",
    description: "Prepaid wallet credit transactions",
    icon: MdAccountBalanceWallet,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

export default function ReportModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  title = "Generate Report",
}: ReportModalProps) {
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleGenerate = useCallback(() => {
    onGenerate({
      purpose: selectedPurpose,
      dateFrom,
      dateTo,
    });
  }, [selectedPurpose, dateFrom, dateTo, onGenerate]);

  const handleClose = useCallback(() => {
    if (!isGenerating) {
      setSelectedPurpose("");
      setDateFrom("");
      setDateTo("");
      onClose();
    }
  }, [isGenerating, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MdPictureAsPdf className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-5">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <div className="space-y-2">
              {REPORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedPurpose === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedPurpose(option.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-accent bg-accent/5"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${option.bgColor} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${option.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium ${isSelected ? "text-accent" : "text-gray-900"}`}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="ml-auto shrink-0">
                        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <div className="relative">
                  <MdCalendarToday className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <div className="relative">
                  <MdCalendarToday className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MdPictureAsPdf className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Generate PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
