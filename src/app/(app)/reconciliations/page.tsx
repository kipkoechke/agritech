"use client";

import { useState } from "react";
import { MdPhoneAndroid, MdAccountBalance } from "react-icons/md";
import MpesaReconciliationsTab from "./components/MpesaReconciliationsTab";
import BankReconciliationsTab from "./components/BankReconciliationsTab";

export default function ReconciliationsPage() {
  const [activeTab, setActiveTab] = useState<"mpesa" | "bank">("mpesa");

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
              {activeTab === "mpesa" ? (
                <MdPhoneAndroid className="w-6 h-6" />
              ) : (
                <MdAccountBalance className="w-6 h-6" />
              )}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Reconciliations
              </h1>
              <p className="text-sm text-gray-600">
                Manage M-Pesa and Bank reconciliations
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab("mpesa")}
              className={`flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeTab === "mpesa"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MdPhoneAndroid className="w-4 h-4" />
              <span>M-Pesa</span>
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={`flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeTab === "bank"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MdAccountBalance className="w-4 h-4" />
              <span>Bank</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0">
          {activeTab === "mpesa" ? (
            <MpesaReconciliationsTab />
          ) : (
            <BankReconciliationsTab />
          )}
        </div>
      </div>
    </div>
  );
}

