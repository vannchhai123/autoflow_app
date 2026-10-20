"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut, Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { useLogout, useCurrentUserEmail } from "@/features/auth/hooks/useAuth";
import { tokenStorage } from "@/lib/api-client";
import { isTokenValid } from "@/lib/auth-token";

const STORAGE_KEY = "autoclip.sidebarCollapsed";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
  const userEmail = useCurrentUserEmail();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) === "1";
    if (saved) {
      queueMicrotask(() => setCollapsed(true));
    }

    const token = tokenStorage.getAccess();
    if (!token || !isTokenValid(token)) {
      tokenStorage.clear();
      setIsAuthenticated(false);
      const search = typeof window !== "undefined" ? window.location.search : "";
      const returnUrl = encodeURIComponent(`${pathname}${search}`);
      router.replace(`/login?from=${returnUrl}`);
    }
  }, [pathname, router]);

  const toggle = () =>
    setCollapsed((c) => {
      localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      return !c;
    });

  return (
    <div className="flex h-dvh overflow-hidden">
      <AppSidebar
        collapsed={collapsed}
        onToggle={toggle}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 hover:bg-muted lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              ClipFlow Studio
            </span>
          </div>

          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="hidden font-mono text-xs text-muted-foreground md:inline">
                {userEmail}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="h-8 gap-1.5 px-3 text-xs text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              title="Log out"
            >
              <LogOut className="size-3.5" />
              <span>Log out</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {isAuthenticated ? (
            children
          ) : (
            <div className="flex h-96 w-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Redirecting to login...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
