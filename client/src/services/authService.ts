import { apiClient } from "./apiClient";

interface LoginResponse {
  token: string;
  username: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export async function login(username: string, password: string) {
  const { data } = await apiClient.post<ApiEnvelope<LoginResponse>>("/auth/login", {
    username,
    password,
  });
  if (!data.success || !data.data) {
    throw new Error(data.error ?? "Login failed");
  }
  return data.data;
}
