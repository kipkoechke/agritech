import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  confirmAttendance,
  captureFarmQuantity,
  captureFactoryQuantity,
  workerSignOff,
  BookingsParams,
} from "@/services/bookingService";
import type { CreateBookingData, UpdateBookingData } from "@/types/booking";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/getApiError";

export const useBookings = (params: BookingsParams = {}) => {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => getBookings(params),
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => getBooking(id),
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingData) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create booking"));
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingData }) =>
      updateBooking(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["bookings", variables.id],
      });
      toast.success("Booking updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update booking"));
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete booking"));
    },
  });
};

export const useConfirmAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => confirmAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Attendance confirmed");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to confirm attendance"));
    },
  });
};

export const useCaptureFarmQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, farm_qty }: { id: string; farm_qty: number }) =>
      captureFarmQuantity(id, farm_qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Farm quantity captured");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to capture farm quantity"));
    },
  });
};

export const useCaptureFactoryQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, factory_qty }: { id: string; factory_qty: number }) =>
      captureFactoryQuantity(id, factory_qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Factory quantity captured");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to capture factory quantity"),
      );
    },
  });
};

export const useWorkerSignOff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workerSignOff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Worker signed off successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to sign off worker"));
    },
  });
};
