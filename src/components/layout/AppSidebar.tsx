"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  FolderKanban,
  LayoutDashboard,
  Link2,
  LogOut,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout, useCurrentUserEmail } from "@/features/auth/hooks/useAuth";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/composer", label: "Composer", icon: Send },
  { href: "/projects", label: "Posts & Videos", icon: FolderKanban },
  { href: "/create", label: "AI Video Studio", icon: Sparkles },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/library", label: "Content Library", icon: BookOpen },
  { href: "/settings/accounts", label: "Social Accounts", icon: Link2 },
  { href: "/team", label: "Team & Approvals", icon: Users },
] as const;

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  /** Mobile drawer open state (ignored on lg+). */
  mobileOpen: boolean;
  onNavigate: () => void;
}

export function AppSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onNavigate,
}: AppSidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();
  const userEmail = useCurrentUserEmail();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onNavigate}
        className={cn(
          "fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden
      />
      <aside
        aria-label="Primary"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-background transition-all duration-200",
          "lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-16" : "lg:w-64",
          "w-64",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-semibold"
            onClick={onNavigate}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xs">
              <Sparkles className="size-4" />
            </span>
            <div className={cn("flex flex-col", collapsed && "lg:hidden")}>
              <span className="font-bold tracking-tight text-sm">ClipFlow</span>
              <span className="text-[10px] text-muted-foreground font-medium -mt-1">Publish &amp; Monitor</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "lg:justify-center lg:px-2",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className={cn(collapsed && "lg:hidden")}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Account & Actions Footer */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 border-t py-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 font-bold text-xs text-white shadow-xs"
              title={userEmail}
            >
              {userEmail ? userEmail.charAt(0).toUpperCase() : "V"}
            </div>
            <button
              type="button"
              onClick={logout}
              title="Log out"
              aria-label="Log out"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="size-4" />
            </button>
            <button
              type="button"
              onClick={onToggle}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="hidden lg:flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <ChevronsRight className="size-4" />
            </button>
          </div>
        ) : (
          <div className="border-t p-3 space-y-2">
            <div className="flex items-center justify-between gap-2.5 rounded-lg border bg-muted/40 p-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 font-bold text-xs text-white shadow-xs"
                  title={userEmail}
                >
                  {userEmail ? userEmail.charAt(0).toUpperCase() : "V"}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-semibold text-foreground leading-tight"
                    title={userEmail}
                  >
                    {userEmail}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Admin Account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Log out"
                aria-label="Log out"
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className="hidden lg:flex w-full items-center justify-center gap-2 rounded-lg p-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronsLeft className="size-4" />
              <span>Collapse sidebar</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
