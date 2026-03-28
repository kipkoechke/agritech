"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdBusiness,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdPerson,
  MdAccountBalance,
  MdLocalShipping,
  MdCreditCard,
  MdShoppingCart,
} from "react-icons/md";
import { useCustomer, useDeleteCustomer } from "@/hooks/useCustomer";
import Modal from "@/components/common/Modal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: customer, isLoading, error } = useCustomer(id);
  const deleteMutation = useDeleteCustomer();

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push("/customers");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Failed to load customer details</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-gray-50 px-4 md:px-8 py-2 pb-24 md:pb-4">
      <div className="container mx-auto flex-1 min-h-0 flex flex-col max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 md:mb-6 shrink-0">
          <div className="flex items-start gap-3">
            <Link
              href="/customers"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <MdArrowBack className="w-6 h-6" />
            </Link>
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <MdBusiness className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {customer.name}
                  </h1>
                  {customer.is_tax_exempt && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Tax Exempt
                    </span>
                  )}
                </div>
                {customer.account_number && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    Account: {customer.account_number}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-13 md:ml-0">
            <Link
              href={`/customers/${id}/edit`}
              className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm inline-flex items-center gap-2"
            >
              <MdEdit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
            <Modal>
              <Modal.Open opens="delete-customer">
                <button className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm inline-flex items-center gap-2">
                  <MdDelete className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </Modal.Open>
              <Modal.Window name="delete-customer">
                <DeleteConfirmationModal
                  itemName={customer.name}
                  itemType="Customer"
                  onConfirm={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              </Modal.Window>
            </Modal>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdCreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Credit</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {customer.is_credit_customer
                  ? `KES ${customer.credit_limit?.toLocaleString() || 0}`
                  : "Not Enabled"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdAccountBalance className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Total Spent</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {customer.total_spent ? `KES ${customer.total_spent}` : "KES 0"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <MdLocationOn className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Zone</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {customer.zone?.name || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdShoppingCart className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Orders</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {customer.order_count ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {(customer.contacts?.email ||
                    customer.contacts?.primary_phone) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MdEmail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {customer.contacts?.email}
                      </span>
                    </div>
                  )}
                  {(customer.contacts?.phone ||
                    customer.contacts?.primary_phone) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MdPhone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {customer.contacts?.phone ||
                          customer.contacts?.primary_phone}
                      </span>
                    </div>
                  )}
                  {customer.contacts?.secondary_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <MdPhone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {customer.contacts?.secondary_phone} (Secondary)
                      </span>
                    </div>
                  )}
                  {customer.contacts?.contact_person && (
                    <div className="flex items-center gap-2 text-sm">
                      <MdPerson className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {customer.contacts?.contact_person}
                        {customer.contacts?.designation &&
                          ` - ${customer.contacts?.designation}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Address
                </h3>
                <div className="space-y-2">
                  {(customer.address?.street || customer.address?.physical_address) && (
                    <div className="flex items-start gap-2 text-sm">
                      <MdLocationOn className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">
                        {customer.address?.street || customer.address?.physical_address}
                      </span>
                    </div>
                  )}
                  {(customer.address?.city || customer.address?.postal_address) && (
                    <p className="text-sm text-gray-600 ml-6">
                      {customer.address?.city || customer.address?.postal_address}
                      {customer.address?.postal_code && `, ${customer.address.postal_code}`}
                    </p>
                  )}
                  {(customer.address?.country || customer.address?.county) && (
                    <p className="text-sm text-gray-600 ml-6">
                      {customer.address?.country || customer.address?.county}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4"></div>

            {/* Associated Users */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customer.user && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    User Account
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {customer.user.name}
                    </p>
                    {customer.user.email && (
                      <p className="text-xs text-gray-500">
                        {customer.user.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {customer.sales_person && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Sales Person
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {customer.sales_person.name}
                    </p>
                    {customer.sales_person.email && (
                      <p className="text-xs text-gray-500">
                        {customer.sales_person.email}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* KRA PIN */}
            {customer.kra_pin && (
              <>
                <div className="border-t border-gray-100 my-4"></div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    KRA PIN
                  </h3>
                  <p className="text-sm text-gray-600">{customer.kra_pin}</p>
                </div>
              </>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Created:{" "}
                  {new Date(customer.created_at).toLocaleDateString("en-GB")}
                </span>
                <span>
                  Updated:{" "}
                  {new Date(customer.updated_at).toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
