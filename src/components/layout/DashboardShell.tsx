"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { useLogout, useCurrentUserEmail } from "@/features/auth/hooks/useAuth";

const STORAGE_KEY = "autoclip.sidebarCollapsed";

/** Client shell owning sidebar state; pages stay Server Components as `children`. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useLogout();
  const userEmail = useCurrentUserEmail();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

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
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
              ClipFlow Studio
            </span>
          </div>

          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="hidden text-xs text-muted-foreground md:inline font-mono">
                {userEmail}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="h-8 gap-1.5 px-3 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              title="Log out"
            >
              <LogOut className="size-3.5" />
              <span>Log out</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
