import api from "@/lib/api";
import type { Admin, ApiResponse } from "./types";

export const getAdmins = async (): Promise<Admin[]> => {
  const { data } = await api.get<ApiResponse<Admin[]>>("/admin");
  return data.data ?? [];
};

export const createAdmin = async (input: { username: string; password: string }) => {
  const { data } = await api.post<ApiResponse<Admin>>("/admin", input);
  return data;
};

export const deleteAdmin = async (id: number) => {
  const { data } = await api.delete<ApiResponse<null>>(`/admin/${id}`);
  return data;
};