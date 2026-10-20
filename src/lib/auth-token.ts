export const ACCESS_TOKEN_KEY = "autoclip.accessToken";
export const REFRESH_TOKEN_KEY = "autoclip.refreshToken";

/**
 * Validates whether a token string is a valid, unexpired JWT.
 */
export function isTokenValid(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload);
    if (typeof payload.exp === "number") {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp <= nowInSeconds) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a token is either missing, invalid, or expired.
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  return !isTokenValid(token);
}

/**
 * Ensures redirect URL is a safe internal relative path and not a loop back to login.
 */
export function sanitizeRedirectUrl(
  url: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }
  if (trimmed === "/login" || trimmed.startsWith("/login?")) {
    return fallback;
  }
  return trimmed;
}
