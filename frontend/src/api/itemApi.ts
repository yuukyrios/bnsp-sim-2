import api from "@/lib/api";
import type { ApiResponse, Item } from "./types";

export const getItems = async (): Promise<Item[]> => {
  const { data } = await api.get<ApiResponse<Item[]>>("/item");
  return data.data ?? [];
};

export interface ItemInput {
  delivery_id: number | null;
  item_name: string;
  customer: string;
  item_weight: number;
}

export const createItem = async (input: ItemInput) => {
  const { data } = await api.post<ApiResponse<Item>>("/item", input);
  return data;
};

export const updateItem = async (id: number, input: Partial<ItemInput>) => {
  const { data } = await api.put<ApiResponse<Item>>(`/item/${id}`, input);
  return data;
};

export const deleteItem = async (id: number) => {
  const { data } = await api.delete<ApiResponse<null>>(`/item/${id}`);
  return data;
};