export type DeliveryStatus = "Processed" | "On The Way" | "Arrived";
export type DeliveryType = "Indonesia to Qatar" | "Qatar to Indonesia";

export const DELIVERY_STATUSES: DeliveryStatus[] = ["Processed", "On The Way", "Arrived"];
export const DELIVERY_TYPES: DeliveryType[] = ["Indonesia to Qatar", "Qatar to Indonesia"];

export interface Delivery {
  id: number;
  delivery_name: string;
  courier: string;
  buy_price: number;
  sell_price: number;
  weight_limit: number;
  item_amount: number;
  total_weight: number;
  profit: number;
  type: DeliveryType;
  status: DeliveryStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Item {
  id: number;
  delivery_id: number | null;
  delivery_name?: string | null;
  item_name: string;
  customer: string;
  item_weight: number;
  created_at?: string;
  updated_at?: string;
}

export interface Admin {
  id: number;
  username: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}