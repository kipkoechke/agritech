"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

interface LoanFormData {
  loan_type: string;
  amount: string;
  installments: string;
  reason: string;
}

// Dummy loan types
const LOAN_TYPES = [
  { id: "emergency", name: "Emergency Loan" },
  { id: "farm_input", name: "Farm Input Loan" },
  { id: "equipment", name: "Equipment Loan" },
  { id: "education", name: "Education Loan" },
  { id: "housing", name: "Housing Loan" },
];

export default function AddLoanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LoanFormData>({
    loan_type: "",
    amount: "",
    installments: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoanFormData, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof LoanFormData, string>> = {};
    
    if (!formData.loan_type) {
      newErrors.loan_type = "Loan type is required";
    }
    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.installments) {
      newErrors.installments = "Installments are required";
    } else if (Number(formData.installments) < 1) {
      newErrors.installments = "Installments must be at least 1 month";
    } else if (Number(formData.installments) > 60) {
      newErrors.installments = "Installments cannot exceed 60 months";
    }
    if (!formData.reason) {
      newErrors.reason = "Reason is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof LoanFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const calculateMonthlyDeduction = () => {
    const amount = Number(formData.amount);
    const installments = Number(formData.installments);
    if (amount > 0 && installments > 0) {
      return Math.round(amount / installments);
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const selectedType = LOAN_TYPES.find(t => t.id === formData.loan_type);
      
      // Create new loan application
      const newLoan = {
        id: Date.now().toString(),
        loan_type: selectedType?.name || formData.loan_type,
        amount: Number(formData.amount),
        balance: Number(formData.amount),
        installments: Number(formData.installments),
        monthly_deduction: calculateMonthlyDeduction(),
        start_date: new Date().toISOString().split('T')[0],
        status: "pending",
        reason: formData.reason,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // In a real app, you would save this to localStorage or state management
      console.log("Loan application submitted:", newLoan);
      
      setIsSubmitting(false);
      alert("Loan application submitted successfully!");
      router.push("/my-services/loans");
    }, 1000);
  };

  const monthlyDeduction = calculateMonthlyDeduction();

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
            <h2 className="text-lg font-semibold text-gray-900">Apply for Loan</h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Loan Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Type *
                </label>
                <select
                  name="loan_type"
                  value={formData.loan_type}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                    errors.loan_type ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select loan type</option>
                  {LOAN_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.loan_type && (
                  <p className="mt-1 text-xs text-red-600">{errors.loan_type}</p>
                )}
              </div>

              {/* Amount and Installments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Amount (KES) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="e.g., 50000"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                      errors.amount ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Installments (Months) *
                  </label>
                  <input
                    type="number"
                    name="installments"
                    value={formData.installments}
                    onChange={handleChange}
                    placeholder="e.g., 12"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                      errors.installments ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.installments && (
                    <p className="mt-1 text-xs text-red-600">{errors.installments}</p>
                  )}
                </div>
              </div>

              {/* Monthly Deduction Preview */}
              {monthlyDeduction > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Monthly Deduction:</span> KES {monthlyDeduction.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    This amount will be deducted from your salary each month for {formData.installments} months
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Loan *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Provide details about why you need this loan..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-none ${
                    errors.reason ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.reason && (
                  <p className="mt-1 text-xs text-red-600">{errors.reason}</p>
                )}
              </div>

              {/* Loan Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Important Information</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Loans are subject to approval based on your repayment capacity</li>
                  <li>• Interest rates vary by loan type and are calculated at approval</li>
                  <li>• Monthly deductions will start from your next salary cycle</li>
                  <li>• Early repayment is allowed with no penalty</li>
                  <li>• You will receive notification once your application is reviewed</li>
                </ul>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link
                  href="/my-services/loans"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit Loan Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}