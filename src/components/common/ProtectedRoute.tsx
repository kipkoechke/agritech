"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useCanAccessRoute } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
  allowedRoles?: UserRole[];
  unauthorizedUrl?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackUrl = "/login",
  allowedRoles,
  unauthorizedUrl = "/unauthorized",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, user } = useAuth();
  const canAccessRoute = useCanAccessRoute(pathname);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isLoading) return;

    if (!isAuthenticated) {
      router.push(`${fallbackUrl}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user) {
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          router.push(unauthorizedUrl);
          return;
        }
      }

      if (!canAccessRoute) {
        router.push(unauthorizedUrl);
        return;
      }
    }
  }, [
    isClient,
    isLoading,
    isAuthenticated,
    user,
    router,
    fallbackUrl,
    allowedRoles,
    unauthorizedUrl,
    canAccessRoute,
    pathname,
  ]);

  // Don't render loading during SSR - return empty div
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-primary">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated or authorized, render nothing (redirect will happen)
  if (!isAuthenticated) return null;
  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) return null;
  if (!canAccessRoute) return null;

  return <>{children}</>;
};