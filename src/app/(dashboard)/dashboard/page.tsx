"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  videoApi,
  type VideoProjectResponse,
} from "@/features/video-editor/api/video-api";
import {
  publishingApi,
  type AnalyticsSummaryResponse,
  type PublishedChannelVideo,
} from "@/features/publishing/api/publishing-api";
import {
  PLATFORM_LABELS,
  type Platform,
  type PostStatus,
  type PublishingTask,
  type SocialAccountDto,
} from "@/features/publishing/types/publishing.types";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Film,
  Loader2,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Send,
  Share2,
  Smartphone,
  Sparkles,
  Timer,
  Trash2,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverVideoPreview } from "@/components/ui/hover-video-preview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function PlatformIcon({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  if (platform === "YOUTUBE_SHORTS") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM9.8 15.1V8.9l5.4 3.1-5.4 3.1Z" />
      </svg>
    );
  }
  if (platform === "TIKTOK") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.894 2.894 0 0 1 2.316-4.637c.307 0 .605.048.885.137V9.402a6.353 6.353 0 0 0-.885-.063 6.338 6.338 0 1 0 6.33 6.333V9.072a8.214 8.214 0 0 0 4.77 1.516v-3.9a4.8 4.8 0 0 1-1-.002Z" />
      </svg>
    );
  }
  if (platform === "FACEBOOK") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
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
        className={className}
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 1.64-1.64 1.64 1.64 0 0 0-3.27 0 1.64 1.64 0 0 0 1.64 1.64m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
    </svg>
  );
}

const GRADIENTS = [
  "from-neutral-900 via-neutral-800 to-sky-700",
  "from-neutral-900 via-neutral-800 to-indigo-700",
  "from-neutral-900 via-neutral-800 to-violet-700",
  "from-neutral-900 via-neutral-800 to-rose-700",
  "from-neutral-900 via-neutral-800 to-amber-700",
  "from-neutral-900 via-neutral-800 to-emerald-700",
];

function getProjectGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "0:30";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recently";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return `Today, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }
    if (diffDays === 1) {
      return `Yesterday, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

const PRIORITY_PLATFORMS: { platform: Platform; label: string; color: string }[] = [
  {
    platform: "FACEBOOK",
    label: "Facebook",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
  },
  {
    platform: "YOUTUBE_SHORTS",
    label: "YouTube Shorts",
    color: "text-red-600 bg-red-50 dark:bg-red-950/40",
  },
  {
    platform: "TIKTOK",
    label: "TikTok",
    color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40",
  },
];

const STARTERS = [
  { emoji: "💡", label: "3 Fun Facts", prompt: "3 fun facts about " },
  {
    emoji: "📜",
    label: "Reddit Story",
    prompt: "Narrate a dramatic Reddit story about ",
  },
  { emoji: "📰", label: "News Summary", prompt: "Summarize today's news about " },
  { emoji: "🔥", label: "Viral Hook", prompt: "Write a viral hook for a video about " },
];

function StatusBadge({ status }: { status: string }) {
  const isReady = status === "COMPLETED" || status === "READY";
  const isRendering = status === "PROCESSING" || status === "RENDERING";
  const isFailed = status === "FAILED";

  const config = isReady
    ? { dot: "bg-emerald-500", text: "Ready to Publish" }
    : isRendering
      ? { dot: "bg-amber-500 animate-pulse", text: "Rendering…" }
      : isFailed
        ? { dot: "bg-rose-500", text: "Failed" }
        : { dot: "bg-neutral-400", text: "Draft" };

  return (
    <Badge
      variant="outline"
      className="h-6 gap-1.5 border-white/20 bg-white/90 text-neutral-900 shadow-xs backdrop-blur"
    >
      <span className={cn("size-1.5 rounded-full", config.dot)} />
      {config.text}
    </Badge>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const [projects, setProjects] = useState<VideoProjectResponse[]>([]);
  const [totalVideosCount, setTotalVideosCount] = useState<number>(0);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [summary, setSummary] = useState<AnalyticsSummaryResponse>({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    growthRate: "0%",
    connectedChannels: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
  });

  const [queue, setQueue] = useState<PublishingTask[]>([]);
  const [channelVideos, setChannelVideos] = useState<PublishedChannelVideo[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);

  const [accounts, setAccounts] = useState<SocialAccountDto[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null);

  const [previewProject, setPreviewProject] = useState<
    (VideoProjectResponse & { embedUrl?: string; publicPostUrl?: string }) | null
  >(null);

  const [projectFilter, setProjectFilter] = useState<"POSTING" | "READY" | "ALL">(
    "POSTING",
  );

  useEffect(() => {
    let active = true;

    videoApi
      .list(0, 50)
      .then((res) => {
        if (!active) return;
        if (res && Array.isArray(res.content)) {
          setProjects(res.content);
          setTotalVideosCount(res.totalElements ?? res.content.length);
        }
      })
      .catch((err) => {
        console.warn("Could not load real video projects:", err);
      })
      .finally(() => {
        if (active) setLoadingProjects(false);
      });

    publishingApi
      .getAnalyticsSummary()
      .then((data) => {
        if (!active) return;
        if (data) {
          setSummary(data);
        }
      })
      .catch((err) => {
        console.warn("Could not load real analytics summary:", err);
      });

    publishingApi
      .listScheduled()
      .then((tasks) => {
        if (!active) return;
        if (Array.isArray(tasks)) {
          setQueue(tasks);
        }
      })
      .catch((err) => {
        console.warn("Could not load real queue:", err);
      })
      .finally(() => {
        if (active) setLoadingQueue(false);
      });

    publishingApi
      .listAccounts()
      .then((accs) => {
        if (!active) return;
        if (Array.isArray(accs)) {
          setAccounts(accs);
        }
      })
      .catch((err) => {
        console.warn("Could not load real accounts:", err);
      })
      .finally(() => {
        if (active) setLoadingAccounts(false);
      });

    publishingApi
      .listChannelVideos()
      .then((vids) => {
        if (!active) return;
        if (Array.isArray(vids)) {
          setChannelVideos(vids);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleGenerate = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Enter a topic or idea first.");
      return;
    }
    router.push(`/create?prompt=${encodeURIComponent(prompt.trim())}`);
  };

  const handleConnect = async (p: Platform) => {
    try {
      setConnectingPlatform(p);
      toast.info(`Redirecting to ${PLATFORM_LABELS[p]} OAuth consent…`, {
        description: "ClipFlow connects directly with official APIs.",
      });
      const res = await publishingApi.connectAccount(p);
      if (res?.authorizationUrl) {
        if (res.authorizationUrl.startsWith("http")) {
          window.location.href = res.authorizationUrl;
          return;
        }
      }
      toast.success(`${PLATFORM_LABELS[p]} connected!`);
      const updated = await publishingApi.listAccounts();
      if (Array.isArray(updated)) setAccounts(updated);
    } catch {
      toast.error(`Failed to connect ${PLATFORM_LABELS[p]}`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    try {
      await videoApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTotalVideosCount((prev) => Math.max(0, prev - 1));
      toast.success("Project deleted", { description: title });
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handlePublishNow = async (task: PublishingTask) => {
    try {
      toast.info(`Publishing to ${PLATFORM_LABELS[task.platform]} now…`);
      if (task.videoProjectId) {
        await publishingApi.publishNow({
          videoProjectId: task.videoProjectId,
          platforms: [task.platform],
          title: task.title,
          caption: task.caption,
          hashtags: task.hashtags,
        });
        toast.success(`Published to ${PLATFORM_LABELS[task.platform]}!`);
        const updatedQ = await publishingApi.listScheduled();
        if (Array.isArray(updatedQ)) setQueue(updatedQ);
        const updatedSum = await publishingApi.getAnalyticsSummary();
        if (updatedSum) setSummary(updatedSum);
      }
    } catch {
      toast.error("Failed to publish post immediately");
    }
  };

  const handleCancelTask = async (taskId: string, title?: string) => {
    try {
      await publishingApi.cancelTask(taskId);
      setQueue((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Post removed from schedule", { description: title });
    } catch {
      toast.error("Failed to cancel scheduled post");
    }
  };

  const postingVideos = useMemo(() => {
    const videoMap = new Map<string, VideoProjectResponse>();
    projects.forEach((p) => videoMap.set(p.id, p));

    const list: Array<{
      id: string;
      taskId: string;
      videoProjectId: string;
      title: string;
      platforms: Platform[];
      channelName?: string | null;
      status: PostStatus | string;
      scheduledTime?: string | null;
      publishedAt?: string | null;
      publicPostUrl?: string | null;
      caption?: string | null;
      outputUrl?: string;
      thumbnailUrl?: string;
      durationSeconds?: number;
      aspectRatio?: string;
      createdAt?: string;
      gradient: string;
      rawProject?: VideoProjectResponse;
    }> = [];

    const seenVideoIds = new Set<string>();

    queue.forEach((task) => {
      const vId = task.videoProjectId || task.id;
      const vp = task.videoProjectId ? videoMap.get(task.videoProjectId) : null;

      if (seenVideoIds.has(vId)) {
        const item = list.find((it) => it.videoProjectId === vId);
        if (item && !item.platforms.includes(task.platform)) {
          item.platforms.push(task.platform);
        }
        if (item && task.status === "PUBLISHED") {
          item.status = "PUBLISHED";
        }
        if (item && task.publicPostUrl && !item.publicPostUrl) {
          item.publicPostUrl = task.publicPostUrl;
        }
      } else {
        seenVideoIds.add(vId);
        list.push({
          id: task.id,
          taskId: task.id,
          videoProjectId: vId,
          title: task.title || vp?.title || "Video Post",
          platforms: [task.platform],
          channelName: task.channelName,
          status: task.status,
          scheduledTime: task.scheduledTime,
          publishedAt: task.publishedAt,
          publicPostUrl: task.publicPostUrl,
          caption: task.caption,
          outputUrl: vp?.outputUrl,
          thumbnailUrl: vp?.outputUrl
            ? vp.outputUrl
                .replace("/storage/videos/", "/storage/thumbnails/")
                .replace(/\.mp4(\?.*)?$/i, ".jpg")
            : undefined,
          durationSeconds: vp?.durationSeconds,
          aspectRatio: vp?.aspectRatio,
          createdAt: task.scheduledTime || vp?.createdAt,
          gradient: getProjectGradient(vId),
          rawProject: vp || undefined,
        });
      }
    });

    channelVideos.forEach((cv) => {
      if (list.some((it) => it.publicPostUrl === cv.publicPostUrl)) {
        return;
      }
      const durSec = cv.durationSeconds ?? 45;
      const isShort = durSec <= 60;
      const aspect = isShort ? "PORTRAIT_9_16" : "LANDSCAPE_16_9";
      list.push({
        id: cv.id,
        taskId: cv.id,
        videoProjectId: cv.id,
        title: cv.title,
        platforms: [cv.platform || "YOUTUBE_SHORTS"],
        channelName: cv.channelName,
        status: "PUBLISHED",
        publishedAt: cv.publishedAt,
        publicPostUrl: cv.publicPostUrl,
        caption: cv.description,
        thumbnailUrl: cv.thumbnailUrl,
        durationSeconds: durSec,
        aspectRatio: aspect,
        createdAt: cv.publishedAt,
        gradient: getProjectGradient(cv.id),
        rawProject: {
          id: cv.id,
          title: cv.title,
          status: "COMPLETED",
          durationSeconds: durSec,
          aspectRatio: aspect as any,
          createdAt: cv.publishedAt || new Date().toISOString(),
          updatedAt: cv.publishedAt || new Date().toISOString(),
          embedUrl: cv.embedUrl,
          publicPostUrl: cv.publicPostUrl,
        } as any,
      });
    });

    return list;
  }, [projects, queue, channelVideos]);

  const readyVideos = useMemo(
    () => projects.filter((p) => p.status === "COMPLETED"),
    [projects],
  );

  const renderingCount = projects.filter((p) => p.status === "PROCESSING").length;
  const readyCount = projects.filter((p) => p.status === "COMPLETED").length;
  const connectedAccountsCount = accounts.filter((a) => a.status === "CONNECTED").length;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Welcome back, Creator 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Ready to create your next viral clip?
          </p>
        </div>

        <form
          onSubmit={handleGenerate}
          className="flex flex-col gap-2 rounded-2xl border bg-card p-2 shadow-xs sm:flex-row"
        >
          <div className="relative flex-1">
            <Sparkles className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a topic, script idea, or paste an article URL..."
              aria-label="Video prompt"
              className="h-11 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button type="submit" size="lg" className="h-11 cursor-pointer px-5">
            Generate Video <Zap className="size-4" />
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setPrompt(s.prompt)}
              className="cursor-pointer rounded-full border bg-background px-3 py-1.5 text-sm transition hover:border-foreground/30 hover:bg-muted"
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              Videos Created
              <Film className="size-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums">
                {loadingProjects ? "…" : totalVideosCount}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {readyCount > 0
                  ? `${readyCount} ready to publish`
                  : "All rendered videos"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              Rendering Now
              {renderingCount > 0 ? (
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
                </span>
              ) : (
                <Loader2 className="size-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums">
                {renderingCount} Active
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {renderingCount > 0 ? "Processing in background" : "Pipeline is idle"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              Auto-Published
              <Send className="size-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums">
                {summary.publishedPosts ?? 0} Posts
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Across active channels
              </p>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              Connected Channels
              <Share2 className="size-4 text-sky-500" />
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums">
                {loadingAccounts ? "…" : `${connectedAccountsCount} Active`}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {connectedAccountsCount > 0
                  ? accounts
                      .filter((a) => a.status === "CONNECTED")
                      .map((a) => PLATFORM_LABELS[a.platform] || a.platform)
                      .join(", ")
                  : "Facebook, YouTube, TikTok"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,13fr)_minmax(0,7fr)]">
        <section aria-labelledby="recent-projects" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 id="recent-projects" className="text-lg font-semibold">
                Recent Projects
              </h2>
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/10 text-xs text-primary"
              >
                {projectFilter === "POSTING"
                  ? `${postingVideos.length} Posting`
                  : projectFilter === "READY"
                    ? `${readyVideos.length} Ready`
                    : `${projects.length} Total`}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border bg-muted/60 p-1">
                <button
                  type="button"
                  onClick={() => setProjectFilter("POSTING")}
                  className={cn(
                    "flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition",
                    projectFilter === "POSTING"
                      ? "bg-background font-semibold text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Send className="size-3" /> Posting Videos ({postingVideos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProjectFilter("READY")}
                  className={cn(
                    "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition",
                    projectFilter === "READY"
                      ? "bg-background font-semibold text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Ready to Post ({readyVideos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProjectFilter("ALL")}
                  className={cn(
                    "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition",
                    projectFilter === "ALL"
                      ? "bg-background font-semibold text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  All ({projects.length})
                </button>
              </div>

              <Link
                href="/projects"
                className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View All →
              </Link>
            </div>
          </div>

          {loadingProjects || loadingQueue ? (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[9/16] animate-pulse rounded-xl bg-muted/60"
                />
              ))}
            </div>
          ) : projectFilter === "POSTING" ? (
            postingVideos.length === 0 ? (
              <Card className="space-y-3 p-8 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Send className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">No posting videos yet</h3>
                  <p className="mx-auto max-w-sm text-xs text-muted-foreground">
                    You haven&apos;t scheduled or published any videos to Facebook,
                    YouTube, or TikTok yet. Pick a ready video from your studio to start
                    posting.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Link
                    href="/composer"
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "cursor-pointer gap-1.5",
                    )}
                  >
                    <Send className="size-3.5" /> Schedule / Post a Video
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setProjectFilter("READY")}
                  >
                    View Ready Videos ({readyVideos.length})
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 items-stretch gap-4 xl:grid-cols-4">
                {postingVideos.map((item) => {
                  const isPublished = item.status === "PUBLISHED";
                  const isPosting = item.status === "IN_PROGRESS";
                  const isScheduled = item.status === "PENDING";
                  const isShort =
                    (item.durationSeconds ?? 45) <= 60 ||
                    item.aspectRatio === "PORTRAIT_9_16";

                  const previewProj: VideoProjectResponse = item.rawProject || {
                    id: item.videoProjectId,
                    title: item.title,
                    status: isPublished ? "COMPLETED" : "COMPLETED",
                    outputUrl: item.outputUrl,
                    durationSeconds: item.durationSeconds,
                    aspectRatio: (item.aspectRatio as any) || "PORTRAIT_9_16",
                    createdAt: item.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };

                  return (
                    <Card
                      key={item.id}
                      className="group flex h-full flex-col justify-between gap-0 overflow-hidden py-0 transition hover:shadow-md"
                    >
                      <HoverVideoPreview
                        src={item.outputUrl}
                        thumbnailUrl={item.thumbnailUrl}
                        gradient={item.gradient}
                        onClick={() => setPreviewProject(previewProj)}
                        className="flex aspect-[9/16] shrink-0 flex-col justify-between p-2"
                      >
                        <div className="z-20 flex items-start justify-between">
                          <div className="flex flex-col items-start gap-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-5 gap-1 border-white/20 text-[10px] font-semibold shadow-xs backdrop-blur",
                                isPublished
                                  ? "bg-violet-500/90 text-white"
                                  : isPosting
                                    ? "animate-pulse bg-amber-500/90 text-white"
                                    : isScheduled
                                      ? "bg-sky-500/90 text-white"
                                      : "bg-rose-500/90 text-white",
                              )}
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full bg-white",
                                  isPosting && "animate-ping",
                                )}
                              />
                              {isPublished
                                ? "Published"
                                : isPosting
                                  ? "Posting…"
                                  : isScheduled
                                    ? "Scheduled"
                                    : "Failed"}
                            </Badge>

                            <Badge className="h-4 gap-1 border-0 bg-cyan-500/90 text-[9px] font-medium text-white shadow-xs">
                              {isShort ? (
                                <>
                                  <Smartphone className="size-2.5" /> Short
                                </>
                              ) : (
                                <>
                                  <Film className="size-2.5" /> Long
                                </>
                              )}
                            </Badge>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label={`Actions for ${item.title}`}
                              onClick={(e) => e.stopPropagation()}
                              className="grid size-7 cursor-pointer place-items-center rounded-full bg-white/90 text-neutral-900 shadow-xs backdrop-blur transition hover:bg-white"
                            >
                              <MoreVertical className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {(item.outputUrl || item.publicPostUrl) && (
                                <DropdownMenuItem
                                  onClick={() => setPreviewProject(previewProj)}
                                  className="cursor-pointer"
                                >
                                  <Play className="size-4 text-emerald-500" /> Watch Video
                                </DropdownMenuItem>
                              )}
                              {isPublished && item.publicPostUrl && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (item.publicPostUrl)
                                      window.open(item.publicPostUrl, "_blank");
                                  }}
                                  className="cursor-pointer"
                                >
                                  <ExternalLink className="size-4 text-primary" /> View
                                  Live Post
                                </DropdownMenuItem>
                              )}
                              {!item.id.startsWith("yt-") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/composer?projectId=${item.videoProjectId}`,
                                    )
                                  }
                                  className="cursor-pointer"
                                >
                                  <Pencil className="size-4" /> Edit in Composer
                                </DropdownMenuItem>
                              )}
                              {item.outputUrl && (
                                <DropdownMenuItem
                                  onClick={() => window.open(item.outputUrl, "_blank")}
                                  className="cursor-pointer"
                                >
                                  <Download className="size-4" /> Download MP4
                                </DropdownMenuItem>
                              )}
                              {!item.id.startsWith("yt-") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() =>
                                      handleCancelTask(item.taskId, item.title)
                                    }
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="size-4" /> Remove Post
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {(item.outputUrl || item.publicPostUrl) && (
                          <button
                            type="button"
                            aria-label="Preview video"
                            onClick={() => setPreviewProject(previewProj)}
                            className="absolute top-1/2 left-1/2 z-10 grid size-12 -translate-x-1/2 -translate-y-1/2 scale-90 cursor-pointer place-items-center rounded-full bg-white/95 text-neutral-900 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100 hover:bg-white focus-visible:opacity-100"
                          >
                            <Play className="ml-0.5 size-5 fill-current" />
                          </button>
                        )}

                        <div className="z-10 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {item.platforms.map((p) => (
                              <span
                                key={p}
                                className="grid size-5 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-xs"
                                title={PLATFORM_LABELS[p]}
                              >
                                <PlatformIcon platform={p} className="size-3" />
                              </span>
                            ))}
                          </div>
                          {item.durationSeconds && (
                            <span className="rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white tabular-nums">
                              {formatDuration(item.durationSeconds)}
                            </span>
                          )}
                        </div>
                      </HoverVideoPreview>

                      <CardContent className="flex flex-1 flex-col justify-between gap-2.5 p-3">
                        <div className="space-y-1">
                          <div className="flex h-4 items-center gap-1 text-[11px] text-muted-foreground">
                            {isScheduled ? (
                              <span className="flex items-center gap-1 truncate font-medium text-sky-600 dark:text-sky-400">
                                <Clock className="size-3 shrink-0" />
                                {item.scheduledTime
                                  ? formatDate(item.scheduledTime)
                                  : "Scheduled"}
                              </span>
                            ) : isPublished ? (
                              <span className="flex items-center gap-1 truncate font-medium text-violet-600 dark:text-violet-400">
                                <CheckCircle2 className="size-3 shrink-0" />
                                {item.publishedAt
                                  ? formatDate(item.publishedAt)
                                  : "Published"}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                                <Loader2 className="size-3 shrink-0 animate-spin" />{" "}
                                Dispatching…
                              </span>
                            )}
                          </div>
                          <div className="flex h-11 items-start overflow-hidden">
                            <h3
                              onClick={() => setPreviewProject(previewProj)}
                              className="line-clamp-2 cursor-pointer text-sm leading-snug font-medium transition-colors hover:text-primary"
                              title={item.title}
                            >
                              {item.title}
                            </h3>
                          </div>
                        </div>

                        <div className="mt-auto flex gap-2 pt-2">
                          {isScheduled ? (
                            <Button
                              size="sm"
                              className="flex-1 cursor-pointer text-xs"
                              onClick={() => {
                                const foundTask = queue.find((q) => q.id === item.taskId);
                                if (foundTask) handlePublishNow(foundTask);
                              }}
                            >
                              <Send className="mr-1 size-3.5" /> Post Now
                            </Button>
                          ) : isPublished ? (
                            <Button
                              size="sm"
                              className="flex-1 cursor-pointer text-xs"
                              onClick={() => setPreviewProject(previewProj)}
                            >
                              <Play className="mr-1 size-3.5" /> Watch Video
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1 cursor-pointer text-xs"
                              onClick={() => setPreviewProject(previewProj)}
                            >
                              <Play className="mr-1 size-3.5" /> Preview
                            </Button>
                          )}

                          {isPublished && item.publicPostUrl ? (
                            <a
                              href={item.publicPostUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Open Live Video on Platform"
                              className={cn(
                                buttonVariants({ size: "sm", variant: "outline" }),
                                "cursor-pointer px-2.5 text-xs",
                              )}
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer px-2.5 text-xs"
                              title="Edit in Composer"
                              onClick={() =>
                                router.push(`/composer?projectId=${item.videoProjectId}`)
                              }
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )
          ) : (projectFilter === "READY" ? readyVideos : projects).length === 0 ? (
            <Card className="p-8 text-center">
              <Film className="mx-auto size-12 text-muted-foreground/40" />
              <h3 className="mt-3 text-base font-medium">No videos found</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                Generate your first AI video using the prompt bar above or open the
                creator studio.
              </p>
              <div className="mt-4">
                <Link href="/create" className={cn(buttonVariants({ size: "sm" }))}>
                  <Plus className="size-4" /> Create First Video
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 items-stretch gap-4 xl:grid-cols-4">
              {(projectFilter === "READY" ? readyVideos : projects).map((project) => {
                const gradient = getProjectGradient(project.id);
                const isReady = project.status === "COMPLETED";
                const isRendering = project.status === "PROCESSING";

                return (
                  <Card
                    key={project.id}
                    className="group flex h-full flex-col justify-between gap-0 overflow-hidden py-0 transition hover:shadow-md"
                  >
                    <HoverVideoPreview
                      src={project.outputUrl}
                      thumbnailUrl={
                        project.outputUrl
                          ? project.outputUrl
                              .replace("/storage/videos/", "/storage/thumbnails/")
                              .replace(/\.mp4(\?.*)?$/i, ".jpg")
                          : undefined
                      }
                      gradient={gradient}
                      onClick={() => setPreviewProject(project)}
                      className="flex aspect-[9/16] shrink-0 flex-col justify-between p-2"
                    >
                      <div className="z-20 flex items-start justify-between">
                        <StatusBadge status={project.status} />

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Actions for ${project.title}`}
                            onClick={(e) => e.stopPropagation()}
                            className="grid size-7 cursor-pointer place-items-center rounded-full bg-white/90 text-neutral-900 shadow-xs backdrop-blur transition hover:bg-white"
                          >
                            <MoreVertical className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => setPreviewProject(project)}
                              className="cursor-pointer"
                            >
                              <Play className="size-4 text-emerald-500" /> Preview Video
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/composer?projectId=${project.id}`)
                              }
                              className="cursor-pointer"
                            >
                              <Send className="size-4 text-sky-500" /> Compose &amp; Post
                            </DropdownMenuItem>
                            {project.outputUrl && (
                              <DropdownMenuItem
                                onClick={() => window.open(project.outputUrl, "_blank")}
                                className="cursor-pointer"
                              >
                                <Download className="size-4" /> Download MP4
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                handleDeleteProject(project.id, project.title)
                              }
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {isReady && (
                        <button
                          type="button"
                          aria-label="Preview video"
                          onClick={() => setPreviewProject(project)}
                          className="absolute top-1/2 left-1/2 z-10 grid size-12 -translate-x-1/2 -translate-y-1/2 scale-90 cursor-pointer place-items-center rounded-full bg-white/95 text-neutral-900 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100 hover:bg-white focus-visible:opacity-100"
                        >
                          <Play className="ml-0.5 size-5 fill-current" />
                        </button>
                      )}

                      {isRendering && (
                        <div className="absolute inset-x-3 top-1/2 z-10 -translate-y-1/2 space-y-2 rounded-lg bg-black/60 p-3 text-white backdrop-blur">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Loader2 className="size-3.5 animate-spin text-amber-400" />{" "}
                            Rendering…
                          </div>
                          <Progress
                            value={65}
                            className="gap-0 [&_[data-slot=progress-indicator]]:bg-amber-400 [&_[data-slot=progress-track]]:bg-white/20"
                          />
                        </div>
                      )}

                      <div className="z-10 flex justify-end">
                        <span className="rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white tabular-nums">
                          {formatDuration(project.durationSeconds)}
                        </span>
                      </div>
                    </HoverVideoPreview>

                    <CardContent className="flex flex-1 flex-col justify-between gap-2.5 p-3">
                      <div className="space-y-1">
                        <div className="flex h-11 items-start overflow-hidden">
                          <h3
                            onClick={() => setPreviewProject(project)}
                            className="line-clamp-2 cursor-pointer text-sm leading-snug font-medium transition-colors hover:text-primary"
                            title={project.title}
                          >
                            {project.title}
                          </h3>
                        </div>
                        <p className="flex h-4 items-center text-xs text-muted-foreground">
                          {formatDate(project.createdAt)}
                        </p>
                      </div>

                      <div className="mt-auto pt-2">
                        {isReady && (
                          <div className="flex gap-2">
                            <Link
                              href={`/composer?projectId=${project.id}`}
                              className={cn(
                                buttonVariants({ size: "sm" }),
                                "flex-1 cursor-pointer text-xs",
                              )}
                            >
                              <Send className="mr-1 size-3.5" /> Post Video
                            </Link>
                            {project.outputUrl && (
                              <a
                                href={project.outputUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                  buttonVariants({ size: "sm", variant: "outline" }),
                                  "px-2.5",
                                )}
                                title="Download MP4"
                              >
                                <Download className="size-3.5" />
                              </a>
                            )}
                          </div>
                        )}

                        {!isReady && !isRendering && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full cursor-pointer text-xs"
                            onClick={() =>
                              router.push(`/composer?projectId=${project.id}`)
                            }
                          >
                            <Pencil className="mr-1 size-3.5" /> Open Editor
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-primary" /> Publishing Queue
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {queue.length > 0 ? `${queue.length} Scheduled` : "Real-time"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingQueue ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 size-4 animate-spin text-muted-foreground/60" />
                  Loading schedule queue…
                </div>
              ) : queue.length === 0 ? (
                <div className="space-y-2 py-6 text-center">
                  <div className="mx-auto grid size-10 place-items-center rounded-full bg-muted/60 text-muted-foreground">
                    <CalendarCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Queue is Clear</p>
                    <p className="mx-auto mt-0.5 max-w-[220px] text-xs text-muted-foreground">
                      No posts currently scheduled. Ready clips can be scheduled anytime.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/projects"
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" }),
                        "text-xs",
                      )}
                    >
                      Schedule from Projects →
                    </Link>
                  </div>
                </div>
              ) : (
                <ol className="relative space-y-5 border-l pl-5">
                  {queue.map((item) => (
                    <li key={item.id} className="relative">
                      <span className="absolute top-0 -left-[34px] grid size-7 place-items-center rounded-full bg-neutral-100 ring-4 ring-card dark:bg-neutral-800">
                        <PlatformIcon platform={item.platform} className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">
                          {item.scheduledTime
                            ? formatDate(item.scheduledTime)
                            : "Scheduled soon"}
                        </p>
                        <p className="truncate text-sm font-medium">
                          {item.title || "ClipFlow Video"}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                            {item.status}
                          </Badge>
                          <button
                            type="button"
                            className="cursor-pointer text-xs text-primary underline-offset-2 hover:underline"
                            onClick={() => handlePublishNow(item)}
                          >
                            Post Now
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Share2 className="size-4 text-primary" /> Connected Channels
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {connectedAccountsCount} Connected
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {PRIORITY_PLATFORMS.map(({ platform, label, color }) => {
                const connectedAcc = accounts.find(
                  (a) => a.platform === platform && a.status === "CONNECTED",
                );

                return (
                  <div key={platform} className="flex items-center gap-3">
                    {connectedAcc?.avatarUrl ? (
                      <img
                        src={connectedAcc.avatarUrl}
                        alt={connectedAcc.accountName}
                        className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-border"
                      />
                    ) : (
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-lg",
                          color,
                        )}
                      >
                        <PlatformIcon platform={platform} className="size-4" />
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-none font-medium">{label}</p>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        {connectedAcc ? (
                          <>
                            <span className="truncate">{connectedAcc.accountName}</span>
                            <span className="flex shrink-0 items-center gap-0.5 font-medium text-emerald-500">
                              • Connected <CheckCircle2 className="size-3" />
                            </span>
                          </>
                        ) : (
                          "Disconnected"
                        )}
                      </p>
                    </div>

                    {!connectedAcc && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 cursor-pointer text-xs"
                        disabled={connectingPlatform === platform}
                        onClick={() => handleConnect(platform)}
                      >
                        {connectingPlatform === platform ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <>
                            Connect <Plus className="size-3" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}

              <div className="border-t pt-2 text-center">
                <Link
                  href="/settings/accounts"
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Manage Channels & Integrations →
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {previewProject && (
        <Dialog
          open={!!previewProject}
          onOpenChange={(open) => !open && setPreviewProject(null)}
        >
          <DialogContent
            className={cn(
              "border-neutral-800 bg-neutral-950 p-5 text-white shadow-2xl",
              previewProject.aspectRatio === "LANDSCAPE_16_9"
                ? "sm:max-w-2xl"
                : "sm:max-w-md",
            )}
          >
            <DialogHeader>
              <DialogTitle className="line-clamp-1">{previewProject.title}</DialogTitle>
              <DialogDescription className="text-xs text-neutral-400">
                {previewProject.durationSeconds
                  ? formatDuration(previewProject.durationSeconds)
                  : "Video"}{" "}
                • Created {formatDate(previewProject.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div
              className={cn(
                "relative mx-auto my-1 flex max-h-[55vh] w-full items-center justify-center overflow-hidden rounded-xl bg-black",
                previewProject.aspectRatio === "LANDSCAPE_16_9"
                  ? "aspect-video"
                  : "aspect-[9/16]",
              )}
            >
              {previewProject.outputUrl ? (
                <video
                  src={previewProject.outputUrl}
                  controls
                  autoPlay
                  className="size-full object-contain"
                />
              ) : previewProject.embedUrl ? (
                <iframe
                  src={`${previewProject.embedUrl}?autoplay=1`}
                  title={previewProject.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full border-0"
                />
              ) : (
                <div className="p-6 text-center text-neutral-400">
                  <Film className="mx-auto mb-2 size-10 opacity-50" />
                  <p className="text-sm">Video file is still being rendered.</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800 pt-3">
              <span className="text-xs text-neutral-400">
                {previewProject.aspectRatio === "LANDSCAPE_16_9"
                  ? "16:9 Landscape Video"
                  : "9:16 Vertical Short"}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {!previewProject.id.startsWith("yt-") && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => {
                      const id = previewProject.id;
                      const title = previewProject.title;
                      setPreviewProject(null);
                      handleDeleteProject(id, title);
                    }}
                  >
                    <Trash2 className="mr-1 size-3.5" /> Delete
                  </Button>
                )}
                {previewProject.outputUrl && (
                  <a
                    href={previewProject.outputUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white",
                    )}
                  >
                    <Download className="mr-1 size-3.5" /> Download MP4
                  </a>
                )}
                {previewProject.publicPostUrl && (
                  <a
                    href={previewProject.publicPostUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "bg-red-600 text-white hover:bg-red-700",
                    )}
                  >
                    <ExternalLink className="mr-1 size-3.5" /> Watch on YouTube
                  </a>
                )}
                {!previewProject.id.startsWith("yt-") && (
                  <Button
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => {
                      setPreviewProject(null);
                      router.push(`/composer?projectId=${previewProject.id}`);
                    }}
                  >
                    <Send className="mr-1 size-3.5" /> Compose Post
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
