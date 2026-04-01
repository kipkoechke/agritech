import axiosInstance from "@/lib/axios";
import type {
  CreateBookingData,
  UpdateBookingData,
  BookingsResponse,
  BookingResponse,
} from "@/types/booking";

export interface BookingsParams {
  page?: number;
  per_page?: number;
  schedule_id?: string;
  worker_id?: string;
  status?: string;
  sort_by?: string;
  sort_order?: string;
}

export const getBookings = async (
  params: BookingsParams = {},
): Promise<BookingsResponse> => {
  const response = await axiosInstance.get<BookingsResponse>("/bookings", {
    params,
  });
  return response.data;
};

export const getBooking = async (id: string): Promise<BookingResponse> => {
  const response = await axiosInstance.get<BookingResponse>(`/bookings/${id}`);
  return response.data;
};

export const createBooking = async (
  data: CreateBookingData,
): Promise<BookingResponse> => {
  const response = await axiosInstance.post<BookingResponse>(
    "/bookings",
    data,
  );
  return response.data;
};

export const updateBooking = async (
  id: string,
  data: UpdateBookingData,
): Promise<BookingResponse> => {
  const response = await axiosInstance.patch<BookingResponse>(
    `/bookings/${id}`,
    data,
  );
  return response.data;
};

export const deleteBooking = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/bookings/${id}`,
  );
  return response.data;
};

export const confirmAttendance = async (
  id: string,
): Promise<BookingResponse> => {
  const response = await axiosInstance.post<BookingResponse>(
    `/bookings/${id}/confirm-attendance`,
  );
  return response.data;
};

export const captureFarmQuantity = async (
  id: string,
  farm_qty: number,
): Promise<BookingResponse> => {
  const response = await axiosInstance.post<BookingResponse>(
    `/bookings/${id}/farm-quantity`,
    { farm_qty },
  );
  return response.data;
};

export const captureFactoryQuantity = async (
  id: string,
  factory_qty: number,
): Promise<BookingResponse> => {
  const response = await axiosInstance.post<BookingResponse>(
    `/bookings/${id}/factory-quantity`,
    { factory_qty },
  );
  return response.data;
};

export const workerSignOff = async (
  id: string,
): Promise<BookingResponse> => {
  const response = await axiosInstance.post<BookingResponse>(
    `/bookings/${id}/sign-off`,
  );
  return response.data;
};
