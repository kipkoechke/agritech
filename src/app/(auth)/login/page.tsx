"use client";

import { LoginForm } from "../../../components/common/LoginForm";
import { Suspense } from "react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-md w-full">
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          
          {/* Logo */}
          <div className="text-center mb-4">
            <Image
              src="/assets/logo.webp" 
              alt="SOKOCHAPP"
              width={150}
              height={100}
              className="mx-auto object-contain"
              priority
            />

            {/* Optional Logo Component */}
            {/* <Logo size="md" className="mt-2 justify-center" /> */}
          </div>

          {/* Login Form */}
          <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
            <LoginForm />
          </Suspense>

        </div>

      </div>

    </div>
  );
}