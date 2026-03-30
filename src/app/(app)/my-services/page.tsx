"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyServicesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/my-services/tasks");
  }, [router]);

  return null;
}
