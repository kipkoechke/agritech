import axiosInstance from "@/lib/axios";
import type {
  Order,
  OrderListItem,
  OrdersResponse,
  OrderDetailResponse,
  OrderTransactionsResponse,
  CreateOrderPayload,
  UpdateOrderPayload,
  OrdersQueryParams,
} from "@/types/order";

// GET all orders (with pagination & filters)
export const getOrders = async (
  params: OrdersQueryParams = {},
): Promise<OrdersResponse> => {
  const response = await axiosInstance.get("/orders", { params });
  return response.data;
};

// GET single order by ID
export const getOrder = async (id: string): Promise<Order> => {
  const response = await axiosInstance.get<OrderDetailResponse>(
    `/orders/${id}`,
  );
  return response.data.data;
};

// GET order transactions
export const getOrderTransactions = async (
  id: string,
): Promise<OrderTransactionsResponse> => {
  const response = await axiosInstance.get<OrderTransactionsResponse>(
    `/orders/${id}/transactions`,
  );
  return response.data;
};

// POST create order
export const createOrder = async (data: CreateOrderPayload): Promise<Order> => {
  const response = await axiosInstance.post("/orders", data);
  return response.data.data || response.data;
};

// PATCH update order
export const updateOrder = async (
  id: string,
  data: UpdateOrderPayload,
): Promise<Order> => {
  const response = await axiosInstance.patch(`/orders/${id}`, data);
  return response.data.data || response.data;
};

// DELETE order (with cancellation message)
export const deleteOrder = async (params: { id: string; cancellation_message: string }): Promise<void> => {
  const { id, cancellation_message } = params;
  await axiosInstance.delete(`/orders/${id}`, {
    data: { cancellation_message },
  });
};
