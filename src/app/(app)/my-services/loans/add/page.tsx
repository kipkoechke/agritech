"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateLoan, useLoanTypeOptions } from "@/hooks/useLoans";
import { InputField } from "@/components/common/InputField";
import { TextAreaField } from "@/components/common/TextAreaField";
import { SelectField } from "@/components/common/SelectField";
import { MdArrowBack } from "react-icons/md";
import { useForm } from "react-hook-form";
import { CreateLoanPayload } from "@/types/loans";

export default function AddLoanPage() {
  const router = useRouter();
  const createLoanMutation = useCreateLoan();
  const { options: loanTypeOptions, isLoading: loanTypesLoading } =
    useLoanTypeOptions();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLoanPayload>();

  const onSubmit = handleSubmit((data) => {
    // Convert string inputs to numbers
    const payload = {
      ...data,
      amount: Number(data.amount),
      installments: Number(data.installments),
    };

    createLoanMutation.mutate(payload, {
      onSuccess: () => {
        router.push("/my-services/loans");
      },
    });
  });

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
        <Link
          href="/my-services/loans"
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MdArrowBack className="w-5 h-5 text-gray-600" />
        </Link>
        <h2 className="text-lg font-semibold text-gray-900">Apply for Loan</h2>
      </div>

      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
          <SelectField
            label="Loan Type"
            register={register("loan_type", {
              required: "Loan type is required",
            })}
            error={errors.loan_type?.message}
            options={loanTypeOptions}
            disabled={loanTypesLoading}
            placeholder={
              loanTypesLoading ? "Loading loan types..." : "Select loan type"
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Loan Amount (KES)"
              type="number"
              placeholder="e.g., 50000"
              register={register("amount", {
                required: "Amount is required",
                min: {
                  value: 1,
                  message: "Amount must be greater than 0",
                },
              })}
              error={errors.amount?.message}
            />

            <InputField
              label="Installments (Months)"
              type="number"
              placeholder="e.g., 12"
              register={register("installments", {
                required: "Installments are required",
                min: {
                  value: 1,
                  message: "Installments must be at least 1",
                },
                max: {
                  value: 60,
                  message: "Installments cannot exceed 60 months",
                },
              })}
              error={errors.installments?.message}
            />
          </div>

          <TextAreaField
            label="Reason for Loan"
            placeholder="Provide details about why you need this loan..."
            register={register("reason")}
            error={errors.reason?.message}
            rows={6}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              href="/my-services/loans"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createLoanMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoanMutation.isPending
                ? "Submitting..."
                : "Submit Loan Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
