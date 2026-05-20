import api from "@/lib/api";
import type { AuthUser } from "@/lib/auth";

export interface LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: AuthUser;
}

export const login = async (username: string, password: string) => {
  const { data } = await api.post<LoginResponse>("/auth/login", { username, password });
  return data;
};