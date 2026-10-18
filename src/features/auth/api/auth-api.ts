import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/models.types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  displayName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: User;
}

export const authApi = {
  login: (body: LoginRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse, LoginRequest>("/auth/login", body),
  register: (body: RegisterRequest) =>
    apiClient.post<AuthResponse, RegisterRequest>("/auth/register", body),
  refreshToken: (refreshToken: string) =>
    apiClient.post<AuthResponse>("/auth/refresh", { refreshToken }),
};
