import api from "@/lib/api";
import type { ApiResponse, Delivery } from "./types";

export const getDeliveries = async (): Promise<Delivery[]> => {
  const { data } = await api.get<ApiResponse<Delivery[]>>("/delivery");
  return data.data ?? [];
};

export const getDelivery = async (id: number | string): Promise<Delivery> => {
  const { data } = await api.get<ApiResponse<Delivery>>(`/delivery/${id}`);
  if (!data.data) throw new Error(data.message || "Delivery not found");
  return data.data;
};

export type DeliveryInput = Pick<
  Delivery,
  "delivery_name" | "courier" | "buy_price" | "sell_price" | "weight_limit" | "type" | "status"
>;

export const createDelivery = async (input: DeliveryInput) => {
  const { data } = await api.post<ApiResponse<Delivery>>("/delivery", input);
  return data;
};

export const updateDelivery = async (id: number, input: Partial<DeliveryInput>) => {
  const { data } = await api.put<ApiResponse<Delivery>>(`/delivery/${id}`, input);
  return data;
};

export const deleteDelivery = async (id: number) => {
  const { data } = await api.delete<ApiResponse<null>>(`/delivery/${id}`);
  return data;
};