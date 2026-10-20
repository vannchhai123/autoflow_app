import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiError } from "@/types/api.types";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  isTokenExpired,
  isTokenValid,
} from "./auth-token";

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, isTokenExpired, isTokenValid };

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function syncCookie(token: string) {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
}

function clearCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

export const tokenStorage = {
  getAccess: () => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (
      token &&
      typeof document !== "undefined" &&
      !document.cookie.includes(`${ACCESS_TOKEN_KEY}=`)
    ) {
      syncCookie(token);
    }
    return token;
  },
  getRefresh: () =>
    typeof window === "undefined" ? null : localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (access: string, refresh?: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
      if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
    syncCookie(access);
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    clearCookie();
  },
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

// Inject Bearer token on every request if present
axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<{ accessToken: string; refreshToken?: string }>(
      `${API_URL}/auth/refresh`,
      { refreshToken },
    );
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const e = error as AxiosError<Partial<ApiError>>;
    return {
      status: e.response?.status ?? 0,
      message:
        e.response?.data?.message ??
        (e.response ? e.message : "Network error — is the API reachable?"),
      code: e.response?.data?.code,
      timestamp: e.response?.data?.timestamp,
      path: e.response?.data?.path,
      fieldErrors: e.response?.data?.fieldErrors,
    };
  }
  return { status: 0, message: error instanceof Error ? error.message : "Unknown error" };
}

// 401 -> try a single token refresh, then replay; otherwise redirect to login.
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isAuthCall = original?.url?.startsWith("/auth/");

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.set("Authorization", `Bearer ${newToken}`);
        return axiosInstance(original);
      }
      tokenStorage.clear();
      if (typeof window !== "undefined") window.location.assign("/login");
    }
    return Promise.reject(toApiError(error));
  },
);

/** Typed helpers — resolve to the response body, reject with `ApiError`. */
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T>(url, config).then((r) => r.data),
  post: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, body, config).then((r) => r.data),
  put: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    axiosInstance.put<T>(url, body, config).then((r) => r.data),
  patch: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    axiosInstance.patch<T>(url, body, config).then((r) => r.data),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(url, config).then((r) => r.data),
};

export default apiClient;
