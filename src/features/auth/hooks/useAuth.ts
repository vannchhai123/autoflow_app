"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { tokenStorage } from "@/lib/api-client";
import { sanitizeRedirectUrl } from "@/lib/auth-token";
import type { ApiError } from "@/types/api.types";
import { authApi, type AuthResponse, type LoginRequest } from "../api/auth-api";

export function useLogin(redirectTo?: string | null) {
  const router = useRouter();
  return useMutation<AuthResponse, ApiError, LoginRequest>({
    mutationFn: authApi.login,
    onSuccess: (data, variables) => {
      tokenStorage.set(data.accessToken, data.refreshToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("autoclip.email", variables.email);
      }
      const destination = sanitizeRedirectUrl(redirectTo, "/dashboard");
      router.replace(destination);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  return () => {
    tokenStorage.clear();
    if (typeof window !== "undefined") {
      localStorage.removeItem("autoclip.email");
      localStorage.removeItem("autoclip.user");
    }
    router.replace("/login");
  };
}

export function useCurrentUserEmail(): string {
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("autoclip.email");
    if (stored && stored !== "demo@autoclip.app") {
      queueMicrotask(() => setEmail(stored));
      return;
    }
    const token = tokenStorage.getAccess();
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          while (base64.length % 4) {
            base64 += "=";
          }
          const payload = JSON.parse(atob(base64));
          if (payload.sub && payload.sub !== "demo@autoclip.app") {
            const sub = String(payload.sub);
            queueMicrotask(() => setEmail(sub));
            localStorage.setItem("autoclip.email", sub);
          }
        }
      } catch {}
    }
  }, []);

  return email;
}
