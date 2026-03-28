"use client";

import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { InputField } from "./InputField";
import Button from "./Button";
import Link from "next/link";
import { useDirectLogin } from "@/hooks/useAuth";
import { getDefaultDashboard } from "../../../middleware";


export const LoginForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectParam = searchParams?.get("redirect");
  const loginMutation = useDirectLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data: any) => {
    // Basic validation
    if (!data.email?.trim()) {
      return;
    }
    if (!data.password?.trim() || data.password.length < 6) {
      return;
    }

    loginMutation.mutate(
      {
        credentials: {
          email: data.email,
          password: data.password,
        },
        remember: data.remember || false,
      },
      {
        onSuccess: (response) => {
          reset();
          // Use redirect param if provided and not root, otherwise use role-based default
          const redirectUrl =
            redirectParam && redirectParam !== "/"
              ? redirectParam
              : getDefaultDashboard(response.role);
          router.push(redirectUrl);
        },
      },
    );
  };

  return (
    <div className="w-full">
      <div>
        <div className="text-center mb-4 mt-2">
          <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
          <p className="text-gray-600 mt-1">
            Access your SOKOCHAPP account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputField
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            register={register("email")}
            error={errors.email?.message as string}
            required
            disabled={loginMutation.isPending}
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            type="password"
            register={register("password")}
            error={errors.password?.message as string}
            required
            disabled={loginMutation.isPending}
          />

          {/* Remember me and Forgot password row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                {...register("remember")}
                disabled={loginMutation.isPending}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-gray-700">
                Remember me
              </label>
            </div>

            <div>
              <Link
                href="/forgot-password"
                className="text-primary hover:text-primary/90 font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Error Display */}
          {loginMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-600 text-sm">
                {(() => {
                  const error = loginMutation.error as any;

                  // Check if it's a validation error with errors array
                  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                    return (
                      <ul className="space-y-1">
                        {error.response.data.errors.map((errorMsg: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>{errorMsg}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  // Fallback to single error message
                  return (
                    <p>
                      {error?.response?.data?.message ||
                       error?.message ||
                       "Login failed. Please try again."}
                    </p>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="primary"
              htmlType="submit"
              disabled={loginMutation.isPending}
              className="w-full"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
