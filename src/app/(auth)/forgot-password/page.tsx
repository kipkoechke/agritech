"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { MdArrowBack, MdEmail } from "react-icons/md";
import { InputField } from "@/components/common/InputField";
import Button from "@/components/common/Button";
import toast from "react-hot-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email = watch("email");

  const onSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call for password reset
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success state
      setEmailSent(true);
      toast.success("Password reset instructions sent to your email");
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-4">
          {/* Logo */}
          <div className="text-center">
            <Image
              className="mx-auto h-20 w-auto object-contain"
              src="/assets/logo.png"
              alt="SOKOCHAPP"
              width={535}
              height={100}
              priority
              quality={100}
            />
          </div>

          {/* Card */}
          <div className="mt-4">
            {!emailSent ? (
              <>
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Forgot Password?
                  </h2>
                  <p className="text-gray-600 mt-2 text-sm">
                    Enter your email address and we&apos;ll send you
                    instructions to reset your password.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <InputField
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    register={register("email")}
                    error={errors.email?.message}
                    required
                    disabled={isSubmitting}
                  />

                  <div className="pt-2">
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Sending..." : "Send Reset Instructions"}
                    </Button>
                  </div>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/90 font-medium"
                  >
                    <MdArrowBack className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MdEmail className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    We&apos;ve sent password reset instructions to{" "}
                    <span className="font-medium text-gray-900">{email}</span>
                  </p>

                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      Didn&apos;t receive the email? Check your spam folder or
                      try again.
                    </p>
                    <button
                      onClick={() => setEmailSent(false)}
                      className="text-sm text-primary hover:text-primary/90 font-medium"
                    >
                      Try another email
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <MdArrowBack className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
