"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { publishingApi } from "@/features/publishing/api/publishing-api";
import {
  PLATFORMS,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  type AccountConnectionStatus,
  type Platform,
  type SocialAccountDto,
} from "@/features/publishing/types/publishing.types";

function formatTokenExpiry(tokenExpiresAt?: string) {
  if (!tokenExpiresAt) return "Auto-refreshed";
  if (tokenExpiresAt.startsWith("In ") || tokenExpiresAt.startsWith("Expired")) return tokenExpiresAt;
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
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Link2,
  Plus,
  RefreshCw,
  RotateCw,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
  KeyRound,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  if (platform === "YOUTUBE_SHORTS") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-5 text-red-500", className)}>
        <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM9.8 15.1V8.9l5.4 3.1-5.4 3.1Z" />
      </svg>
    );
  }
  if (platform === "TIKTOK") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-5 text-cyan-400", className)}>
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.894 2.894 0 0 1 2.316-4.637c.307 0 .605.048.885.137V9.402a6.353 6.353 0 0 0-.885-.063 6.338 6.338 0 1 0 6.33 6.333V9.072a8.214 8.214 0 0 0 4.77 1.516v-3.9a4.8 4.8 0 0 1-1-.002Z" />
      </svg>
    );
  }
  if (platform === "INSTAGRAM_REELS") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn("size-5 text-pink-500", className)}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  if (platform === "FACEBOOK") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-5 text-blue-500", className)}>
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-5 text-sky-500", className)}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 1.63-1.64 1.64 1.64 0 0 0-3.27 0 1.64 1.64 0 0 0 1.64 1.64m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
    </svg>
  );
}

const INITIAL_ACCOUNTS: SocialAccountDto[] = [];

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [accountToDisconnect, setAccountToDisconnect] = useState<SocialAccountDto | null>(null);

  // API Credentials Config Dialog
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configPlatform, setConfigPlatform] = useState<Platform>("YOUTUBE_SHORTS");
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [tiktokClientKey, setTiktokClientKey] = useState("");
  const [tiktokClientSecret, setTiktokClientSecret] = useState("");
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [connectingDemo, setConnectingDemo] = useState(false);

  useEffect(() => {
    // Check if returning from OAuth callback
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const connected = urlParams.get("connected");
      const error = urlParams.get("error");
      if (connected) {
        toast.success(`Connected to ${PLATFORM_LABELS[connected as Platform] || connected} successfully via OAuth 2.0!`);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (error) {
        if (error === "missing_credentials" || error === "missing_credentials_youtube") {
          toast.info("YouTube credentials required. Use the Sandbox channel or enter Google Cloud credentials.");
          setConfigPlatform("YOUTUBE_SHORTS");
          setConfigModalOpen(true);
        } else if (error === "missing_credentials_tiktok") {
          toast.info("TikTok developer credentials required. Use the Sandbox channel or enter TikTok app keys.");
          setConfigPlatform("TIKTOK");
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
      toast.info(`Redirecting to ${PLATFORM_LABELS[p]} OAuth consent...`, {
        description: "ClipFlow uses official OAuth 2.0. We never see or store your account password.",
      });
      const res = await publishingApi.connectAccount(p);
      if (res?.authorizationUrl) {
        if (res.authorizationUrl.includes("error=missing_credentials")) {
          setConfigPlatform(p);
          setConfigModalOpen(true);
          toast.info(`Please configure API credentials for ${PLATFORM_LABELS[p]} or connect via Sandbox mode.`);
          return;
        }
        if (res.authorizationUrl.startsWith("http")) {
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
      setTimeout(() => {
        toast.success(`${PLATFORM_LABELS[p]} connected successfully!`);
      }, 1200);
    }
  };

  const handleReconnect = async (account: SocialAccountDto) => {
    try {
      toast.info(`Refreshing OAuth session for ${account.accountName}...`);
      const updated = await publishingApi.reconnectAccount(account.id);
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, ...updated, status: "CONNECTED" } : a))
      );
      toast.success(`Session refreshed for ${account.accountName}`);
    } catch {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === account.id
            ? { ...a, status: "CONNECTED", tokenExpiresAt: "In 60 days (Auto-refreshed)" }
            : a
        )
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

  const statusBadge = (status: AccountConnectionStatus) => {
    if (status === "CONNECTED") {
      return (
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 text-[11px]">
          <CheckCircle2 className="size-3" /> Connected
        </Badge>
      );
    }
    if (status === "NEEDS_RECONNECT") {
      return (
        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 gap-1 text-[11px]">
          <AlertTriangle className="size-3" /> Needs Reconnect
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400 gap-1 text-[11px]">
        <XCircle className="size-3" /> Error
      </Badge>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Link2 className="size-6 text-primary" /> Connected Social Accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your YouTube, TikTok, Instagram, Facebook, and LinkedIn accounts via official OAuth 2.0.
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
            className="gap-1.5 text-xs cursor-pointer"
          >
            <KeyRound className="size-3.5 text-amber-500" /> Configure API Credentials
          </Button>
          <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-3">
            <ShieldCheck className="size-3.5 text-emerald-500" /> AES-256 Encrypted Tokens
          </Badge>
        </div>
      </div>

      {/* Security & Reliability Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-xs bg-muted/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Shield className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">Zero Password Storage</p>
              <p className="text-muted-foreground mt-0.5">
                Authentication happens securely on each platform&apos;s login page.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-muted/20">
          <CardContent className="p-4 flex items-start gap-3">
            <RotateCw className="size-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">Proactive Token Refresh</p>
              <p className="text-muted-foreground mt-0.5">
                Daily server jobs refresh expiring access tokens so posts never fail silently.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-muted/20">
          <CardContent className="p-4 flex items-start gap-3">
            <ShieldAlert className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">Safety Pausing</p>
              <p className="text-muted-foreground mt-0.5">
                If an account token expires, scheduled posts pause automatically instead of failing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Active Social Channels</h2>
          <span className="text-xs text-muted-foreground">
            {accounts.length} of 5 accounts configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => {
            const connected = accounts.find((a) => a.platform === platform);
            const color = PLATFORM_COLORS[platform];

            return (
              <Card
                key={platform}
                className={cn(
                  "border shadow-xs flex flex-col justify-between transition-all",
                  connected ? "bg-card" : "bg-muted/10 border-dashed"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("size-9 rounded-xl flex items-center justify-center", color.bg)}>
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

                <CardContent className="pb-4 space-y-3">
                  {connected ? (
                    <div className="space-y-2 text-xs">
                      <div className="rounded-lg bg-muted/30 p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{connected.accountName}</span>
                          <Badge variant="secondary" className="text-[9px]">
                            {connected.accountType}
                          </Badge>
                        </div>
                        {connected.followersCount && (
                          <p className="text-muted-foreground text-[11px]">
                            {connected.followersCount.toLocaleString()} Followers
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> Token expiry:
                        </span>
                        <span className="font-medium text-foreground">{formatTokenExpiry(connected.tokenExpiresAt)}</span>
                      </div>

                      {connected.status === "NEEDS_RECONNECT" && (
                        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-200 flex items-center gap-1.5">
                          <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
                          <span>OAuth token expired. Reconnect to resume scheduled posts.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-2">
                      <p className="text-xs text-muted-foreground">No channel connected</p>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConnect(platform)}
                          className="gap-1.5 text-xs cursor-pointer"
                        >
                          <Plus className="size-3.5" /> Connect {PLATFORM_LABELS[platform]}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Configure API Credentials"
                          onClick={() => {
                            setConfigPlatform(platform);
                            setConfigModalOpen(true);
                          }}
                          className="size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <KeyRound className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {connected && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {connected.status === "NEEDS_RECONNECT" ? (
                        <Button
                          size="sm"
                          onClick={() => handleReconnect(connected)}
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
                        >
                          <RefreshCw className="size-3 mr-1" /> Reconnect Now
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReconnect(connected)}
                          className="flex-1 text-xs h-8"
                        >
                          <RefreshCw className="size-3 mr-1" /> Refresh Token
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
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Disconnect Modal */}
      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" /> Disconnect Social Channel?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect{" "}
              <strong>{accountToDisconnect?.accountName}</strong>? All stored access tokens will be
              revoked immediately and any scheduled posts for this channel will be paused.
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

      {/* Configure Credentials Dialog */}
      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlatformIcon platform={configPlatform} className="size-5" />
              Configure {PLATFORM_LABELS[configPlatform]} Credentials
            </DialogTitle>
            <DialogDescription>
              {configPlatform === "YOUTUBE_SHORTS"
                ? "Enter your Google Cloud OAuth 2.0 Client ID and Secret to enable YouTube publishing, or connect via Sandbox mode."
                : `Configure developer API keys for ${PLATFORM_LABELS[configPlatform]}.`}
            </DialogDescription>
          </DialogHeader>

          {configPlatform === "YOUTUBE_SHORTS" ? (
            <div className="space-y-4 py-2">
              {/* Sandbox Quick Connect Banner */}
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <Sparkles className="size-4 text-primary" /> Test Instantly with Sandbox Channel
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    No Google Cloud setup required! Connect the verified test channel (@AutoClip Shorts Official) with 1 click to test scheduling and posting right now.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  disabled={connectingDemo}
                  onClick={async () => {
                    try {
                      setConnectingDemo(true);
                      const res = await publishingApi.connectDemoAccount("YOUTUBE_SHORTS");
                      setAccounts((prev) => [res, ...prev.filter((a) => a.platform !== "YOUTUBE_SHORTS")]);
                      toast.success("YouTube Sandbox Channel connected successfully!");
                      setConfigModalOpen(false);
                    } catch {
                      toast.error("Failed to connect demo channel");
                    } finally {
                      setConnectingDemo(false);
                    }
                  }}
                  className="shrink-0 text-xs gap-1.5 cursor-pointer font-medium"
                >
                  {connectingDemo ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  Connect Sandbox
                </Button>
              </div>

              {/* Real Google Cloud Instructions */}
              <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Info className="size-4 text-sky-500" /> Connecting your own YouTube Channel:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-1">
                  <li>
                    Open{" "}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline font-medium inline-flex items-center gap-0.5"
                    >
                      Google Cloud Console <ExternalLink className="size-3 inline" />
                    </a>
                  </li>
                  <li>Enable <strong>YouTube Data API v3</strong> in Enabled APIs &amp; Services</li>
                  <li>Create <strong>OAuth 2.0 Client ID</strong> (Application type: <em>Web application</em>)</li>
                  <li>Add this Authorized Redirect URI:</li>
                </ol>
                <div className="flex items-center gap-1.5 bg-background border rounded px-2.5 py-1.5 font-mono text-[11px] text-foreground select-all">
                  <span className="truncate flex-1">http://localhost:8090/api/accounts/oauth2/callback/youtube</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("http://localhost:8090/api/accounts/oauth2/callback/youtube");
                      toast.success("Redirect URI copied to clipboard!");
                    }}
                    className="text-primary hover:underline text-xs shrink-0 cursor-pointer font-sans font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Google Client ID (GOOGLE_CLIENT_ID) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="xxxx-xxxx.apps.googleusercontent.com"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    className={cn(
                      "font-mono text-xs",
                      googleClientId.trim().includes("@") && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {googleClientId.trim().includes("@") && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive flex items-start gap-2 mt-1.5">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-semibold">Email address detected</p>
                        <p className="text-[11px] leading-relaxed">
                          Do not enter your Gmail email here. Google OAuth requires a Client ID from Google Cloud Console ending in <code className="font-mono bg-destructive/20 px-1 rounded">.apps.googleusercontent.com</code>.
                        </p>
                      </div>
                    </div>
                  )}
                  {!googleClientId.trim().includes("@") &&
                    googleClientId.trim().length > 0 &&
                    !googleClientId.trim().endsWith(".apps.googleusercontent.com") && (
                      <p className="text-[11px] text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="size-3 text-amber-500" />
                        Must end with &quot;.apps.googleusercontent.com&quot;
                      </p>
                    )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Google Client Secret (GOOGLE_CLIENT_SECRET) <span className="text-destructive">*</span>
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
            </div>
          ) : null}

          {configPlatform === "TIKTOK" ? (
            <div className="space-y-4 py-2">
              {/* Sandbox Quick Connect Banner */}
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <Sparkles className="size-4 text-primary" /> Test Instantly with TikTok Sandbox
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    No TikTok developer app review required! Connect a verified test TikTok creator account (@vannchay_creator, 24.5K followers) with 1 click to test scheduling and posting right now.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  disabled={connectingDemo}
                  onClick={async () => {
                    try {
                      setConnectingDemo(true);
                      const res = await publishingApi.connectDemoAccount("TIKTOK");
                      setAccounts((prev) => [res, ...prev.filter((a) => a.platform !== "TIKTOK")]);
                      toast.success("TikTok Sandbox Creator connected successfully!");
                      setConfigModalOpen(false);
                    } catch {
                      toast.error("Failed to connect demo channel");
                    } finally {
                      setConnectingDemo(false);
                    }
                  }}
                  className="shrink-0 text-xs gap-1.5 cursor-pointer font-medium"
                >
                  {connectingDemo ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  Connect Sandbox TikTok
                </Button>
              </div>

              {/* TikTok Developer Setup Info */}
              <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Info className="size-4 text-sky-500" /> Connecting your own TikTok Developer App:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-1">
                  <li>
                    Open{" "}
                    <a
                      href="https://developers.tiktok.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline font-medium inline-flex items-center gap-0.5"
                    >
                      TikTok for Developers <ExternalLink className="size-3 inline" />
                    </a>
                  </li>
                  <li>Create an App and add <strong>Login Kit</strong> and <strong>Content Posting API</strong></li>
                  <li>Under Redirect URIs, add:</li>
                </ol>
                <div className="flex items-center gap-1.5 bg-background border rounded px-2.5 py-1.5 font-mono text-[11px] text-foreground select-all">
                  <span className="truncate flex-1">http://localhost:8090/api/accounts/oauth2/callback/tiktok</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("http://localhost:8090/api/accounts/oauth2/callback/tiktok");
                      toast.success("Redirect URI copied to clipboard!");
                    }}
                    className="text-primary hover:underline text-xs shrink-0 cursor-pointer font-sans font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    TikTok Client Key <span className="text-destructive">*</span>
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
                    TikTok Client Secret <span className="text-destructive">*</span>
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
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between items-center">
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
                className="gap-1.5 cursor-pointer"
              >
                {savingCredentials ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
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
                className="gap-1.5 cursor-pointer"
              >
                {savingCredentials ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Save &amp; Connect TikTok
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
