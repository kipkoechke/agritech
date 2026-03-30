"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

interface LeaveFormData {
  reason_id: string;
  leave_start: string;
  leave_end: string;
  description: string;
}

// Dummy leave reasons
const LEAVE_REASONS = [
  { id: "1", name: "Sick Leave" },
  { id: "2", name: "Annual Leave" },
  { id: "3", name: "Personal Leave" },
  { id: "4", name: "Maternity/Paternity Leave" },
  { id: "5", name: "Bereavement Leave" },
];

export default function AddLeavePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeaveFormData>({
    reason_id: "",
    leave_start: "",
    leave_end: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeaveFormData, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof LeaveFormData, string>> = {};
    
    if (!formData.reason_id) {
      newErrors.reason_id = "Leave reason is required";
    }
    if (!formData.leave_start) {
      newErrors.leave_start = "Start date is required";
    }
    if (!formData.leave_end) {
      newErrors.leave_end = "End date is required";
    }
    if (formData.leave_start && formData.leave_end) {
      if (new Date(formData.leave_start) > new Date(formData.leave_end)) {
        newErrors.leave_end = "End date must be after start date";
      }
    }
    if (!formData.description) {
      newErrors.description = "Description is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof LeaveFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const selectedReason = LEAVE_REASONS.find(r => r.id === formData.reason_id);
      
      // Create new leave application
      const newLeave = {
        id: Date.now().toString(),
        reason_id: formData.reason_id,
        reason_name: selectedReason?.name || "",
        leave_start: formData.leave_start,
        leave_end: formData.leave_end,
        description: formData.description,
        status: "pending",
        status_name: "Pending",
        created_at: new Date().toISOString(),
      };
      
      // In a real app, you would save this to localStorage or state management
      // For now, just show success and navigate
      console.log("Leave application submitted:", newLeave);
      
      setIsSubmitting(false);
      alert("Leave application submitted successfully!");
      router.push("/my-services/leave");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50 rounded-t-lg">
            <Link
              href="/my-services/leave"
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <MdArrowBack className="w-5 h-5 text-gray-600" />
            </Link>
            <h2 className="text-lg font-semibold text-gray-900">Apply for Leave</h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Reason *
                </label>
                <select
                  name="reason_id"
                  value={formData.reason_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                    errors.reason_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select leave reason</option>
                  {LEAVE_REASONS.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.name}
                    </option>
                  ))}
                </select>
                {errors.reason_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.reason_id}</p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="leave_start"
                    value={formData.leave_start}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                      errors.leave_start ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.leave_start && (
                    <p className="mt-1 text-xs text-red-600">{errors.leave_start}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="leave_end"
                    value={formData.leave_end}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                      errors.leave_end ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.leave_end && (
                    <p className="mt-1 text-xs text-red-600">{errors.leave_end}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Provide details about your leave request..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link
                  href="/my-services/leave"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit Leave Application"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Helpful Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Leave Policy Information</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Sick leave requires a doctor's note for absences longer than 3 days</li>
            <li>• Annual leave must be requested at least 2 weeks in advance</li>
            <li>• Personal leave requests are subject to manager approval</li>
            <li>• You will receive email notification once your request is reviewed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}