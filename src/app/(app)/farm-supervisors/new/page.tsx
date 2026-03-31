// app/farm-supervisors/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdSave } from "react-icons/md";
import { useCreateUser } from "@/hooks/useUser";
import { useZones } from "@/hooks/useZone";
import Button from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";

export default function NewSupervisorPage() {
  const router = useRouter();
  const createUser = useCreateUser();
  const { data: zones, isLoading: zonesLoading } = useZones();
  
  const zonesList = zones || [];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    national_id: "",
    employee_id: "",
    zone_id: "",
    role: "farm_supervisor" as const,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Please enter supervisor name");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter email");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await createUser.mutateAsync(formData);
      router.push("/farm-supervisors");
    } catch (error: any) {
      console.error("Error creating supervisor:", error);
      alert(error.message || "Failed to create supervisor");
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <Link
          href="/farm-supervisors"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to Supervisors
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Farm Supervisor</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter supervisor's full name"
          />

          <InputField
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="supervisor@example.com"
          />

          <InputField
            label="Password *"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Minimum 6 characters"
          />

          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g., 0712345678"
          />

          <InputField
            label="National ID"
            name="national_id"
            value={formData.national_id}
            onChange={handleChange}
            placeholder="National ID number"
          />

          <InputField
            label="Employee ID"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            placeholder="Employee ID (optional)"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zone
            </label>
            <select
              name="zone_id"
              value={formData.zone_id}
              onChange={handleChange}
              disabled={zonesLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a zone</option>
              {zonesList.map((zone: any) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="primary" htmlType="submit" loading={createUser.isPending}>
              <MdSave className="w-5 h-5" />
              {createUser.isPending ? "Creating..." : "Create Supervisor"}
            </Button>
            <Link
              href="/farm-supervisors"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}