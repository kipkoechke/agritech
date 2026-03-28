import { LoginForm } from "../../../components/common/LoginForm";
import { Suspense } from "react";
import Image from "next/image";
import ENgaoLogo from "../../../components/common/ENgaoLogo";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-4">
          {/* Logo */}
          <div className="text-center">
            <Image
              className="mx-auto h-20 w-auto object-contain"
              src="/assets/tealeaf.webp"
              alt="SOKOCHAPP"
              width={150}
              height={100}
              priority
              quality={100}
            />
            <ENgaoLogo size="md" className="mt-2 justify-center" />
          </div>

          {/* Login Form */}
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
