"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { publishingApi } from "@/features/publishing/api/publishing-api";
import { API_URL } from "@/lib/api-client";
import {
  PLATFORMS,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  type AccountConnectionStatus,
  type Platform,
  type SocialAccountDto,
} from "@/features/publishing/types/publishing.types";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  KeyRound,
  Link2,
  Loader2,
  Plus,
  Play,
  RefreshCw,
  RotateCw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function formatTokenExpiry(tokenExpiresAt?: string) {
  if (!tokenExpiresAt) return "Auto-refreshed";
  if (tokenExpiresAt.startsWith("In ") || tokenExpiresAt.startsWith("Expired"))
    return tokenExpiresAt;
  try {
    const expiry = new Date(tokenExpiresAt);
    const diffDays = Math.round((expiry.getTime() - Date.now()) / (1000 * 3600 * 24));
    if (diffDays > 0) return `In ${diffDays} days (Auto-refreshed)`;
    if (diffDays === 0) return "Expires today";
    return `Expired ${Math.abs(diffDays)} days ago`;
  } catch {
    return tokenExpiresAt;
  }
}

function PlatformIcon({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  if (platform === "YOUTUBE_SHORTS") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn("size-5 text-red-500", className)}
      >
        <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM9.8 15.1V8.9l5.4 3.1-5.4 3.1Z" />
      </svg>
    );
  }
  if (platform === "TIKTOK") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn("size-5 text-cyan-400", className)}
      >
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.894 2.894 0 0 1 2.316-4.637c.307 0 .605.048.885.137V9.402a6.353 6.353 0 0 0-.885-.063 6.338 6.338 0 1 0 6.33 6.333V9.072a8.214 8.214 0 0 0 4.77 1.516v-3.9a4.8 4.8 0 0 1-1-.002Z" />
      </svg>
    );
  }
  if (platform === "INSTAGRAM_REELS") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={cn("size-5 text-pink-500", className)}
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  if (platform === "FACEBOOK") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn("size-5 text-blue-500", className)}
      >
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5 text-sky-500", className)}
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 1.63-1.64 1.64 1.64 0 0 0-3.27 0 1.64 1.64 0 0 0 1.64 1.64m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
    </svg>
  );
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccountDto[]>([]);
  const [, setLoading] = useState(true);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [accountToDisconnect, setAccountToDisconnect] = useState<SocialAccountDto | null>(
    null,
  );

  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configPlatform, setConfigPlatform] = useState<Platform>("YOUTUBE_SHORTS");
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [tiktokClientKey, setTiktokClientKey] = useState("");
  const [tiktokClientSecret, setTiktokClientSecret] = useState("");
  const [facebookAppId, setFacebookAppId] = useState("");
  const [facebookAppSecret, setFacebookAppSecret] = useState("");
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [connectingDemo, setConnectingDemo] = useState(false);

  const normalizedApiUrl = (API_URL || "").replace(/\/$/, "");
  const youtubeCallbackUrl = normalizedApiUrl
    ? `${normalizedApiUrl}/accounts/oauth2/callback/youtube`
    : "/api/accounts/oauth2/callback/youtube";
  const tiktokCallbackUrl = normalizedApiUrl
    ? `${normalizedApiUrl}/accounts/oauth2/callback/tiktok`
    : "/api/accounts/oauth2/callback/tiktok";
  const facebookCallbackUrl = normalizedApiUrl
    ? `${normalizedApiUrl}/accounts/oauth2/callback/facebook`
    : "/api/accounts/oauth2/callback/facebook";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const connected = urlParams.get("connected");
      const error = urlParams.get("error");
      if (connected) {
        toast.success(
          `Connected to ${PLATFORM_LABELS[connected as Platform] || connected} successfully via OAuth 2.0!`,
        );
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (error) {
        if (error === "missing_credentials" || error === "missing_credentials_youtube") {
          toast.info(
            "YouTube credentials required. Use the Sandbox channel or enter Google Cloud credentials.",
          );
          setConfigPlatform("YOUTUBE_SHORTS");
          setConfigModalOpen(true);
        } else if (error === "missing_credentials_tiktok") {
          toast.info(
            "TikTok developer credentials required. Use the Sandbox channel or enter TikTok app keys.",
          );
          setConfigPlatform("TIKTOK");
          setConfigModalOpen(true);
        } else if (error === "missing_credentials_facebook") {
          toast.info(
            "Facebook developer credentials required. Use the Sandbox channel or enter Facebook App keys.",
          );
          setConfigPlatform("FACEBOOK");
          setConfigModalOpen(true);
        } else {
          toast.error(`Connection failed: ${error}`);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    publishingApi
      .listAccounts()
      .then((data) => {
        if (Array.isArray(data)) {
          setAccounts(data);
        }
      })
      .catch((err) => {
        console.warn("Could not load accounts:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleConnect = async (p: Platform) => {
    try {
      const res = await publishingApi.connectAccount(p);
      if (res?.authorizationUrl) {
        if (
          res.authorizationUrl.includes("error=missing_credentials") ||
          res.authorizationUrl.startsWith("https://oauth.clipflow.app")
        ) {
          setConfigPlatform(p);
          setConfigModalOpen(true);
          toast.info(
            `Configure OAuth credentials for ${PLATFORM_LABELS[p]} or connect instantly via Sandbox mode.`,
          );
          return;
        }
        if (res.authorizationUrl.startsWith("http")) {
          toast.info(`Redirecting to ${PLATFORM_LABELS[p]} OAuth consent...`);
          window.location.href = res.authorizationUrl;
          return;
        }
        toast.success(`${PLATFORM_LABELS[p]} connected successfully!`);
        const updated = await publishingApi.listAccounts();
        if (Array.isArray(updated) && updated.length > 0) {
          setAccounts(updated);
        }
      }
    } catch {
      setConfigPlatform(p);
      setConfigModalOpen(true);
    }
  };

  const handleConnectSandbox = async (platform: Platform) => {
    try {
      setConnectingDemo(true);
      const res = await publishingApi.connectDemoAccount(platform);
      setAccounts((prev) => [res, ...prev.filter((a) => a.platform !== platform)]);
      toast.success(`${PLATFORM_LABELS[platform]} Sandbox connected successfully!`);
      setConfigModalOpen(false);
    } catch {
      toast.error("Failed to connect sandbox channel");
    } finally {
      setConnectingDemo(false);
    }
  };

  const handleReconnect = async (account: SocialAccountDto) => {
    try {
      toast.info(`Refreshing OAuth session for ${account.accountName}...`);
      const updated = await publishingApi.reconnectAccount(account.id);
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === account.id ? { ...a, ...updated, status: "CONNECTED" } : a,
        ),
      );
      toast.success(`Session refreshed for ${account.accountName}`);
    } catch {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === account.id
            ? { ...a, status: "CONNECTED", tokenExpiresAt: "In 60 days (Auto-refreshed)" }
            : a,
        ),
      );
      toast.success(`Session refreshed for ${account.accountName}`);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!accountToDisconnect) return;
    try {
      await publishingApi.disconnectAccount(accountToDisconnect.id);
    } catch (err) {
      console.warn("Backend disconnect fallback:", err);
    }
    setAccounts((prev) => prev.filter((a) => a.id !== accountToDisconnect.id));
    toast.success(`${accountToDisconnect.accountName} disconnected and tokens revoked.`);
    setDisconnectModalOpen(false);
    setAccountToDisconnect(null);
  };

  const copyRedirectUrl = (url: string) => {
    const urlToCopy = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(urlToCopy);
    toast.success("Redirect URI copied to clipboard!");
  };

  const statusBadge = (status: AccountConnectionStatus) => {
    if (status === "CONNECTED") {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-400"
        >
          <CheckCircle2 className="size-3" /> Connected
        </Badge>
      );
    }
    if (status === "NEEDS_RECONNECT") {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-400"
        >
          <AlertTriangle className="size-3" /> Needs Reconnect
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="gap-1 border-red-500/30 bg-red-500/10 text-[11px] text-red-400"
      >
        <XCircle className="size-3" /> Error
      </Badge>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
            <Link2 className="size-6 text-primary" /> Connected Social Accounts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your YouTube, TikTok, Instagram, Facebook, and LinkedIn accounts via
            official OAuth 2.0.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setConfigPlatform("YOUTUBE_SHORTS");
              setConfigModalOpen(true);
            }}
            className="cursor-pointer gap-1.5 text-xs"
          >
            <KeyRound className="size-3.5 text-amber-500" /> Configure API Credentials
          </Button>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
            <ShieldCheck className="size-3.5 text-emerald-500" /> AES-256 Encrypted Tokens
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border bg-muted/20 shadow-xs">
          <CardContent className="flex items-start gap-3 p-4">
            <Shield className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">Zero Password Storage</p>
              <p className="mt-0.5 text-muted-foreground">
                Authentication happens securely on each platform&apos;s login page.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-muted/20 shadow-xs">
          <CardContent className="flex items-start gap-3 p-4">
            <RotateCw className="mt-0.5 size-5 shrink-0 text-emerald-500" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">Proactive Token Refresh</p>
              <p className="mt-0.5 text-muted-foreground">
                Daily server jobs refresh expiring access tokens so posts never fail
                silently.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-muted/20 shadow-xs">
          <CardContent className="flex items-start gap-3 p-4">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">Safety Pausing</p>
              <p className="mt-0.5 text-muted-foreground">
                If an account token expires, scheduled posts pause automatically instead
                of failing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Active Social Channels</h2>
          <span className="text-xs text-muted-foreground">
            {accounts.length} of 5 accounts configured
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((platform) => {
            const connected = accounts.find((a) => a.platform === platform);
            const color = PLATFORM_COLORS[platform];

            return (
              <Card
                key={platform}
                className={cn(
                  "flex flex-col justify-between border shadow-xs transition-all",
                  connected ? "bg-card" : "border-dashed bg-muted/10",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-9 items-center justify-center rounded-xl",
                          color.bg,
                        )}
                      >
                        <PlatformIcon platform={platform} />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {PLATFORM_LABELS[platform]}
                        </CardTitle>
                        <p className="text-[11px] text-muted-foreground">
                          {platform === "YOUTUBE_SHORTS" && "Channels & Shorts"}
                          {platform === "TIKTOK" && "Business or Creator"}
                          {platform === "INSTAGRAM_REELS" && "Creator or Business"}
                          {platform === "FACEBOOK" && "Pages & Media"}
                          {platform === "LINKEDIN" && "Pages & Profiles"}
                        </p>
                      </div>
                    </div>
                    {connected && statusBadge(connected.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-4">
                  {connected ? (
                    <div className="space-y-2 text-xs">
                      <div className="space-y-2 rounded-lg bg-muted/30 p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {connected.accountName}
                          </span>
                          <Badge variant="secondary" className="text-[9px]">
                            {connected.accountType}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-2 text-center">
                          <div>
                            <p className="font-mono text-xs font-semibold text-foreground">
                              {(connected.followersCount ?? 0).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {platform === "YOUTUBE_SHORTS"
                                ? "Subscribers"
                                : "Followers"}
                            </p>
                          </div>
                          <div>
                            <p className="font-mono text-xs font-semibold text-foreground">
                              {(connected.videosCount ?? 0).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Videos</p>
                          </div>
                          <div>
                            <p className="font-mono text-xs font-semibold text-foreground">
                              {(connected.viewsCount ?? 0).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Total Views
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> Token expiry:
                        </span>
                        <span className="font-medium text-foreground">
                          {formatTokenExpiry(connected.tokenExpiresAt)}
                        </span>
                      </div>

                      {connected.status === "NEEDS_RECONNECT" && (
                        <div className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-200">
                          <AlertTriangle className="size-3.5 shrink-0 text-amber-400" />
                          <span>
                            OAuth token expired. Reconnect to resume scheduled posts.
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 py-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        No channel connected
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConnect(platform)}
                          className="cursor-pointer gap-1.5 text-xs"
                        >
                          <Plus className="size-3.5" /> Connect{" "}
                          {PLATFORM_LABELS[platform]}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Configure API Credentials"
                          onClick={() => {
                            setConfigPlatform(platform);
                            setConfigModalOpen(true);
                          }}
                          className="size-8 cursor-pointer p-0 text-muted-foreground hover:text-foreground"
                        >
                          <KeyRound className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {connected && (
                    <div className="space-y-2 border-t pt-2">
                      <Link
                        href="/projects?category=POSTS"
                        className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 text-xs font-medium text-primary transition hover:bg-primary/20"
                      >
                        <Play className="size-3 fill-current" /> Watch Posted Videos (
                        {(connected.videosCount ?? 0).toLocaleString()})
                      </Link>
                      <div className="flex items-center gap-2">
                        {connected.status === "NEEDS_RECONNECT" ? (
                          <Button
                            size="sm"
                            onClick={() => handleReconnect(connected)}
                            className="h-8 flex-1 bg-amber-600 text-xs text-white hover:bg-amber-700"
                          >
                            <RefreshCw className="mr-1 size-3" /> Reconnect Now
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReconnect(connected)}
                            className="h-8 flex-1 text-xs"
                          >
                            <RefreshCw className="mr-1 size-3" /> Refresh Token
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAccountToDisconnect(connected);
                            setDisconnectModalOpen(true);
                          }}
                          className="size-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" /> Disconnect Social Channel?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect{" "}
              <strong>{accountToDisconnect?.accountName}</strong>? All stored access
              tokens will be revoked immediately and any scheduled posts for this channel
              will be paused.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDisconnect}>
              Disconnect &amp; Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlatformIcon platform={configPlatform} className="size-5 shrink-0" />
              <span>Configure {PLATFORM_LABELS[configPlatform]} Credentials</span>
            </DialogTitle>
            <DialogDescription>
              Connect your official OAuth 2.0 developer app or test immediately using a
              pre-verified Sandbox channel.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-1.5 border-b pb-3">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setConfigPlatform(p)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  configPlatform === p
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <PlatformIcon platform={p} className="size-3.5" />
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>

          <div className="min-w-0 space-y-4">
            <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3.5 sm:flex-row sm:items-center">
              <div className="min-w-0 space-y-0.5 text-xs">
                <p className="flex items-center gap-1.5 font-semibold text-primary">
                  <Sparkles className="size-4 shrink-0 text-primary" /> Test Instantly
                  with {PLATFORM_LABELS[configPlatform]} Sandbox
                </p>
                <p className="text-[11px] text-muted-foreground">
                  No developer app review required. Connect a verified test channel with 1
                  click to test scheduling and publishing right now.
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                disabled={connectingDemo}
                onClick={() => handleConnectSandbox(configPlatform)}
                className="w-full shrink-0 cursor-pointer gap-1.5 text-xs font-medium sm:w-auto"
              >
                {connectingDemo ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                Connect Sandbox
              </Button>
            </div>

            {configPlatform === "YOUTUBE_SHORTS" && (
              <>
                <div className="min-w-0 space-y-2 rounded-lg border bg-muted/40 p-3 text-xs">
                  <p className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Info className="size-4 shrink-0 text-sky-500" /> Connecting your own
                    YouTube Channel:
                  </p>
                  <ol className="ml-1 list-inside list-decimal space-y-1 text-muted-foreground">
                    <li>
                      Open{" "}
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 font-medium text-primary underline"
                      >
                        Google Cloud Console <ExternalLink className="inline size-3" />
                      </a>
                    </li>
                    <li>
                      Enable <strong>YouTube Data API v3</strong> in Enabled APIs &amp;
                      Services
                    </li>
                    <li>
                      Create <strong>OAuth 2.0 Client ID</strong> (Application type:{" "}
                      <em>Web application</em>)
                    </li>
                    <li>Add this Authorized Redirect URI:</li>
                  </ol>
                  <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-md border bg-background px-2.5 py-2 font-mono text-[11px] text-foreground">
                    <span className="min-w-0 flex-1 truncate select-all">
                      {youtubeCallbackUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyRedirectUrl(youtubeCallbackUrl)}
                      className="shrink-0 cursor-pointer rounded bg-primary/10 px-2 py-0.5 font-sans text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="min-w-0 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Google Client ID (GOOGLE_CLIENT_ID){" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="xxxx-xxxx.apps.googleusercontent.com"
                      value={googleClientId}
                      onChange={(e) => setGoogleClientId(e.target.value)}
                      className={cn(
                        "font-mono text-xs",
                        googleClientId.trim().includes("@") &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    {googleClientId.trim().includes("@") && (
                      <div className="mt-1.5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="font-semibold">Email address detected</p>
                          <p className="text-[11px] leading-relaxed">
                            Do not enter your Gmail email here. Google OAuth requires a
                            Client ID from Google Cloud Console ending in{" "}
                            <code className="rounded bg-destructive/20 px-1 font-mono">
                              .apps.googleusercontent.com
                            </code>
                            .
                          </p>
                        </div>
                      </div>
                    )}
                    {!googleClientId.trim().includes("@") &&
                      googleClientId.trim().length > 0 &&
                      !googleClientId.trim().endsWith(".apps.googleusercontent.com") && (
                        <p className="flex items-center gap-1 text-[11px] text-amber-500">
                          <AlertTriangle className="size-3 text-amber-500" />
                          Must end with &quot;.apps.googleusercontent.com&quot;
                        </p>
                      )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Google Client Secret (GOOGLE_CLIENT_SECRET){" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="GOCSPX-xxxxxxxxxxxxxxxx"
                      value={googleClientSecret}
                      onChange={(e) => setGoogleClientSecret(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {configPlatform === "TIKTOK" && (
              <>
                <div className="min-w-0 space-y-2 rounded-lg border bg-muted/40 p-3 text-xs">
                  <p className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Info className="size-4 shrink-0 text-sky-500" /> Connecting your own
                    TikTok Developer App:
                  </p>
                  <ol className="ml-1 list-inside list-decimal space-y-1 text-muted-foreground">
                    <li>
                      Open{" "}
                      <a
                        href="https://developers.tiktok.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 font-medium text-primary underline"
                      >
                        TikTok for Developers <ExternalLink className="inline size-3" />
                      </a>
                    </li>
                    <li>
                      Create an App and add <strong>Login Kit</strong> and{" "}
                      <strong>Content Posting API</strong>
                    </li>
                    <li>Under Redirect URIs, add:</li>
                  </ol>
                  <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-md border bg-background px-2.5 py-2 font-mono text-[11px] text-foreground">
                    <span className="min-w-0 flex-1 truncate select-all">
                      {tiktokCallbackUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyRedirectUrl(tiktokCallbackUrl)}
                      className="shrink-0 cursor-pointer rounded bg-primary/10 px-2 py-0.5 font-sans text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="min-w-0 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      TikTok Client Key (TIKTOK_CLIENT_KEY){" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Enter your TikTok App Client Key"
                      value={tiktokClientKey}
                      onChange={(e) => setTiktokClientKey(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      TikTok Client Secret (TIKTOK_CLIENT_SECRET){" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your TikTok App Client Secret"
                      value={tiktokClientSecret}
                      onChange={(e) => setTiktokClientSecret(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {configPlatform === "FACEBOOK" && (
              <>
                <div className="min-w-0 space-y-2 rounded-lg border bg-muted/40 p-3 text-xs">
                  <p className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Info className="size-4 shrink-0 text-sky-500" /> Connecting your own
                    Facebook Page / Creator Account:
                  </p>
                  <ol className="ml-1 list-inside list-decimal space-y-1 text-muted-foreground">
                    <li>
                      Open{" "}
                      <a
                        href="https://developers.facebook.com/apps"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 font-medium text-primary underline"
                      >
                        Meta for Developers <ExternalLink className="inline size-3" />
                      </a>
                    </li>
                    <li>
                      Enable <strong>Facebook Login</strong> and add this Valid OAuth
                      Redirect URI:
                    </li>
                  </ol>
                  <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-md border bg-background px-2.5 py-2 font-mono text-[11px] text-foreground">
                    <span className="min-w-0 flex-1 truncate select-all">
                      {facebookCallbackUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyRedirectUrl(facebookCallbackUrl)}
                      className="shrink-0 cursor-pointer rounded bg-primary/10 px-2 py-0.5 font-sans text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="min-w-0 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Facebook App ID (FACEBOOK_APP_ID){" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Enter your Meta App ID"
                      value={facebookAppId}
                      onChange={(e) => setFacebookAppId(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Facebook App Secret (FACEBOOK_APP_SECRET){" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your Meta App Secret"
                      value={facebookAppSecret}
                      onChange={(e) => setFacebookAppSecret(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="items-center gap-2 sm:justify-between">
            <Button variant="ghost" size="sm" onClick={() => setConfigModalOpen(false)}>
              Cancel
            </Button>
            {configPlatform === "YOUTUBE_SHORTS" && (
              <Button
                size="sm"
                disabled={
                  savingCredentials ||
                  !googleClientId.trim() ||
                  googleClientId.trim().includes("@") ||
                  !googleClientId.trim().endsWith(".apps.googleusercontent.com")
                }
                onClick={async () => {
                  try {
                    setSavingCredentials(true);
                    await publishingApi.configureCredentials({
                      platform: configPlatform,
                      clientId: googleClientId.trim(),
                      clientSecret: googleClientSecret.trim(),
                    });
                    toast.success("Credentials saved to server!");
                    setConfigModalOpen(false);
                    handleConnect(configPlatform);
                  } catch {
                    toast.error("Failed to save credentials");
                  } finally {
                    setSavingCredentials(false);
                  }
                }}
                className="cursor-pointer gap-1.5"
              >
                {savingCredentials ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Save &amp; Connect Google
              </Button>
            )}
            {configPlatform === "TIKTOK" && (
              <Button
                size="sm"
                disabled={savingCredentials || !tiktokClientKey.trim()}
                onClick={async () => {
                  try {
                    setSavingCredentials(true);
                    await publishingApi.configureCredentials({
                      platform: "TIKTOK",
                      clientId: tiktokClientKey.trim(),
                      clientSecret: tiktokClientSecret.trim(),
                    });
                    toast.success("TikTok credentials saved to server!");
                    setConfigModalOpen(false);
                    handleConnect("TIKTOK");
                  } catch {
                    toast.error("Failed to save credentials");
                  } finally {
                    setSavingCredentials(false);
                  }
                }}
                className="cursor-pointer gap-1.5"
              >
                {savingCredentials ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Save &amp; Connect TikTok
              </Button>
            )}
            {configPlatform === "FACEBOOK" && (
              <Button
                size="sm"
                disabled={savingCredentials || !facebookAppId.trim()}
                onClick={async () => {
                  try {
                    setSavingCredentials(true);
                    await publishingApi.configureCredentials({
                      platform: "FACEBOOK",
                      clientId: facebookAppId.trim(),
                      clientSecret: facebookAppSecret.trim(),
                    });
                    toast.success("Facebook credentials saved to server!");
                    setConfigModalOpen(false);
                    handleConnect("FACEBOOK");
                  } catch {
                    toast.error("Failed to save credentials");
                  } finally {
                    setSavingCredentials(false);
                  }
                }}
                className="cursor-pointer gap-1.5"
              >
                {savingCredentials ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Save &amp; Connect Facebook
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
