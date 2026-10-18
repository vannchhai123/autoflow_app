"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { tokenStorage } from "@/lib/api-client";
import type { ApiError } from "@/types/api.types";
import { authApi, type AuthResponse, type LoginRequest } from "../api/auth-api";

export function useLogin() {
  const router = useRouter();
  return useMutation<AuthResponse, ApiError, LoginRequest>({
    mutationFn: authApi.login,
    onSuccess: (data, variables) => {
      tokenStorage.set(data.accessToken, data.refreshToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("autoclip.email", variables.email);
      }
      router.replace("/dashboard");
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
  const [email, setEmail] = useState<string>("vannchhai.dev@gmail.com");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("autoclip.email");
    if (stored && stored !== "demo@autoclip.app") {
      setEmail(stored);
      return;
    }
    const token = tokenStorage.getAccess();
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.sub && payload.sub !== "demo@autoclip.app") {
            setEmail(payload.sub);
            localStorage.setItem("autoclip.email", payload.sub);
            return;
          }
        }
      } catch {
        // ignore
      }
    }
    setEmail("vannchhai.dev@gmail.com");
  }, []);

  return email;
}
