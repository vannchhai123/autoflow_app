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
  AlertTriangle,
  ArrowRight,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Film,
  Loader2,
  MonitorPlay,
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
  DialogFooter,
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
  const [showAllShorts, setShowAllShorts] = useState(false);
  const [showAllLong, setShowAllLong] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    isTask?: boolean;
  } | null>(null);
  const [deletingItem, setDeletingItem] = useState(false);

  useEffect(() => {
    let active = true;

    let deletedIds: Set<string> = new Set();
    try {
      const savedDeleted = localStorage.getItem("clipflow_deleted_project_ids");
      if (savedDeleted) {
        deletedIds = new Set(JSON.parse(savedDeleted) as string[]);
      }
    } catch {}

    videoApi
      .list(0, 50)
      .then((res) => {
        if (!active) return;
        if (res && Array.isArray(res.content)) {
          const visible = res.content.filter((p) => !deletedIds.has(p.id));
          setProjects(visible);
          setTotalVideosCount(visible.length);
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

  const handleDeleteProject = (id: string, title: string) => {
    setDeleteTarget({ id, title, isTask: false });
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;
    setDeletingItem(true);
    try {
      if (deleteTarget.isTask) {
        await publishingApi.cancelTask(deleteTarget.id);
        setQueue((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        toast.success("Post removed from schedule", {
          description: deleteTarget.title,
        });
      } else {
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setTotalVideosCount((prev) => Math.max(0, prev - 1));
        try {
          const raw = localStorage.getItem("clipflow_deleted_project_ids");
          const list: string[] = raw ? JSON.parse(raw) : [];
          if (!list.includes(deleteTarget.id)) {
            list.push(deleteTarget.id);
            localStorage.setItem("clipflow_deleted_project_ids", JSON.stringify(list));
          }
        } catch {}
        await videoApi.delete(deleteTarget.id).catch(() => {});
        toast.success("Project deleted", { description: deleteTarget.title });
      }
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setDeletingItem(false);
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

  const handleCancelTask = (taskId: string, title?: string) => {
    setDeleteTarget({
      id: taskId,
      title: title || "Scheduled Post",
      isTask: true,
    });
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

  const readyDashboardItems = useMemo(
    () =>
      readyVideos.map((project) => ({
        id: project.id,
        taskId: project.id,
        videoProjectId: project.id,
        title: project.title,
        platforms: ["YOUTUBE_SHORTS"] as Platform[],
        channelName: null as string | null,
        status: "READY",
        scheduledTime: null as string | null,
        publishedAt: null as string | null,
        publicPostUrl: null as string | null,
        caption: project.scriptText || null,
        outputUrl: project.outputUrl,
        thumbnailUrl: project.outputUrl
          ? project.outputUrl
              .replace("/storage/videos/", "/storage/thumbnails/")
              .replace(/\.mp4(\?.*)?$/i, ".jpg")
          : undefined,
        durationSeconds: project.durationSeconds,
        aspectRatio: project.aspectRatio,
        createdAt: project.createdAt,
        gradient: getProjectGradient(project.id),
        rawProject: project,
      })),
    [readyVideos],
  );

  const allDashboardItems = useMemo(() => {
    const combined = [...postingVideos];
    const existingIds = new Set(postingVideos.map((v) => v.videoProjectId));
    projects.forEach((project) => {
      if (existingIds.has(project.id)) return;
      combined.push({
        id: project.id,
        taskId: project.id,
        videoProjectId: project.id,
        title: project.title,
        platforms: ["YOUTUBE_SHORTS"] as Platform[],
        channelName: null,
        status:
          project.status === "COMPLETED"
            ? "READY"
            : project.status === "PROCESSING"
              ? "RENDERING"
              : project.status,
        scheduledTime: null,
        publishedAt: null,
        publicPostUrl: null,
        caption: project.scriptText || null,
        outputUrl: project.outputUrl,
        thumbnailUrl: project.outputUrl
          ? project.outputUrl
              .replace("/storage/videos/", "/storage/thumbnails/")
              .replace(/\.mp4(\?.*)?$/i, ".jpg")
          : undefined,
        durationSeconds: project.durationSeconds,
        aspectRatio: project.aspectRatio,
        createdAt: project.createdAt,
        gradient: getProjectGradient(project.id),
        rawProject: project,
      });
    });
    return combined;
  }, [postingVideos, projects]);

  const activeItems = useMemo(() => {
    if (projectFilter === "POSTING") return postingVideos;
    if (projectFilter === "READY") return readyDashboardItems;
    return allDashboardItems;
  }, [projectFilter, postingVideos, readyDashboardItems, allDashboardItems]);

  const activeShorts = useMemo(
    () =>
      activeItems.filter(
        (item) =>
          (item.durationSeconds ?? 45) <= 60 || item.aspectRatio === "PORTRAIT_9_16",
      ),
    [activeItems],
  );

  const activeLongVideos = useMemo(
    () =>
      activeItems.filter(
        (item) =>
          (item.durationSeconds ?? 45) > 60 && item.aspectRatio !== "PORTRAIT_9_16",
      ),
    [activeItems],
  );

  const renderingCount = projects.filter((p) => p.status === "PROCESSING").length;
  const readyCount = projects.filter((p) => p.status === "COMPLETED").length;
  const connectedAccountsCount = accounts.filter((a) => a.status === "CONNECTED").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <section className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Welcome back, Creator 👋
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Generate AI shorts, manage your widescreen videos, and publish across
              channels.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/composer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "cursor-pointer gap-1.5",
              )}
            >
              <Send className="size-3.5" /> Schedule Post
            </Link>
            <Link
              href="/projects"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "cursor-pointer gap-1.5",
              )}
            >
              <Film className="size-3.5" /> All Videos ({allDashboardItems.length})
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleGenerate}
          className="mt-4 flex flex-col gap-2 rounded-xl border bg-muted/30 p-1.5 sm:flex-row"
        >
          <div className="relative flex-1">
            <Sparkles className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary" />
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a topic, script idea, or paste an article URL..."
              aria-label="Video prompt"
              className="h-10 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button type="submit" className="h-10 cursor-pointer gap-1.5 px-5">
            Generate Video <Zap className="size-4" />
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">
            Quick ideas:
          </span>
          {STARTERS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setPrompt(s.prompt)}
              className="cursor-pointer rounded-full border bg-background px-2.5 py-1 text-xs font-medium transition hover:border-primary/40 hover:bg-muted"
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card size="sm" className="border bg-card shadow-xs">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Total Videos</p>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {loadingProjects
                  ? "…"
                  : Math.max(totalVideosCount, allDashboardItems.length)}
              </div>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {activeShorts.length} shorts • {activeLongVideos.length} long-form
              </p>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Film className="size-5" />
            </span>
          </CardContent>
        </Card>

        <Card size="sm" className="border bg-card shadow-xs">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Rendering Queue</p>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {renderingCount} Active
              </div>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {renderingCount > 0 ? "Processing in background" : "Engine is idle"}
              </p>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
              <Loader2 className={cn("size-5", renderingCount > 0 && "animate-spin")} />
            </span>
          </CardContent>
        </Card>

        <Card size="sm" className="border bg-card shadow-xs">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Published Posts</p>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {Math.max(summary.publishedPosts ?? 0, postingVideos.length)}
              </div>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {(summary.totalViews ?? 0).toLocaleString()} total channel views
              </p>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Send className="size-5" />
            </span>
          </CardContent>
        </Card>

        <Card size="sm" className="border bg-card shadow-xs">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Connected Channels
              </p>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {loadingAccounts ? "…" : `${connectedAccountsCount} Active`}
              </div>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {connectedAccountsCount > 0
                  ? accounts
                      .filter((a) => a.status === "CONNECTED")
                      .map((a) => PLATFORM_LABELS[a.platform] || a.platform)
                      .join(", ")
                  : "Connect YouTube, TikTok, FB"}
              </p>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-500">
              <Share2 className="size-5" />
            </span>
          </CardContent>
        </Card>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="recent-projects" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5 pl-1">
              <h2 id="recent-projects" className="text-base font-semibold">
                Recent Projects
              </h2>
              <Badge
                variant="secondary"
                className="h-5 px-2 text-xs font-medium tabular-nums"
              >
                {activeItems.length}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
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
                  Published ({postingVideos.length})
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
                  Studio Ready ({readyDashboardItems.length})
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
                  All ({allDashboardItems.length})
                </button>
              </div>

              <Link
                href="/projects"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8 shrink-0 gap-1 text-xs font-medium",
                )}
              >
                View All <ArrowRight className="size-3.5" />
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
          ) : activeItems.length === 0 ? (
            <Card className="space-y-3 p-8 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Film className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">
                  {projectFilter === "POSTING"
                    ? "No posting videos yet"
                    : projectFilter === "READY"
                      ? "No ready videos waiting to post"
                      : "No videos found"}
                </h3>
                <p className="mx-auto max-w-sm text-xs text-muted-foreground">
                  {projectFilter === "POSTING"
                    ? "You haven't scheduled or published any videos yet. Pick a ready video or generate a new AI video to start posting."
                    : "Generate your first AI video using the prompt bar above or open the creator studio."}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Link
                  href="/create"
                  className={cn(buttonVariants({ size: "sm" }), "cursor-pointer gap-1.5")}
                >
                  <Plus className="size-3.5" /> Create Video
                </Link>
                <Link
                  href="/projects"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "cursor-pointer gap-1.5",
                  )}
                >
                  Open Projects Studio <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeShorts.length > 0 && (
                <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Smartphone className="size-3.5" />
                      </span>
                      <h3 className="text-sm font-semibold">
                        Vertical Shorts &amp; Reels (9:16)
                      </h3>
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-[11px] tabular-nums"
                      >
                        {activeShorts.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeShorts.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllShorts((prev) => !prev)}
                          className="h-7 cursor-pointer px-2 text-xs"
                        >
                          {showAllShorts
                            ? "Show Less"
                            : `Show All (${activeShorts.length})`}
                        </Button>
                      )}
                      <Link
                        href="/projects?format=SHORT"
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View All 9:16 <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {(showAllShorts ? activeShorts : activeShorts.slice(0, 5)).map(
                      (item) => {
                        const isPublished = item.status === "PUBLISHED";
                        const isPosting = item.status === "IN_PROGRESS";
                        const isScheduled = item.status === "PENDING";
                        const isReady =
                          item.status === "READY" || item.status === "COMPLETED";

                        const previewProj: VideoProjectResponse = item.rawProject || {
                          id: item.videoProjectId,
                          title: item.title,
                          status: "COMPLETED",
                          outputUrl: item.outputUrl,
                          durationSeconds: item.durationSeconds,
                          aspectRatio: "PORTRAIT_9_16",
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
                              className="flex aspect-[9/16] shrink-0 flex-col justify-between p-1.5"
                            >
                              <div className="z-20 flex items-start justify-between">
                                <div className="flex flex-col items-start gap-1">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "h-4.5 gap-1 border-white/20 px-1.5 text-[9px] font-semibold shadow-xs backdrop-blur",
                                      isPublished
                                        ? "bg-violet-500/90 text-white"
                                        : isPosting
                                          ? "animate-pulse bg-amber-500/90 text-white"
                                          : isScheduled
                                            ? "bg-sky-500/90 text-white"
                                            : isReady
                                              ? "bg-emerald-500/90 text-white"
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
                                          : isReady
                                            ? "Ready"
                                            : "Failed"}
                                  </Badge>

                                  <Badge className="h-4 gap-0.5 border-0 bg-cyan-500/90 px-1.5 text-[8px] font-medium text-white shadow-xs">
                                    <Smartphone className="size-2.5" /> 9:16
                                  </Badge>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    aria-label={`Actions for ${item.title}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="grid size-6 cursor-pointer place-items-center rounded-full bg-white/90 text-neutral-900 shadow-xs backdrop-blur transition hover:bg-white"
                                  >
                                    <MoreVertical className="size-3.5" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      onClick={() => setPreviewProject(previewProj)}
                                      className="cursor-pointer"
                                    >
                                      <Play className="size-4 text-emerald-500" /> Watch
                                      Video
                                    </DropdownMenuItem>
                                    {isPublished && item.publicPostUrl && (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          if (item.publicPostUrl)
                                            window.open(item.publicPostUrl, "_blank");
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <ExternalLink className="size-4 text-primary" />{" "}
                                        View Live Post
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
                                        onClick={() =>
                                          window.open(item.outputUrl, "_blank")
                                        }
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
                                            isScheduled
                                              ? handleCancelTask(item.taskId, item.title)
                                              : handleDeleteProject(
                                                  item.videoProjectId,
                                                  item.title,
                                                )
                                          }
                                          className="cursor-pointer text-destructive focus:text-destructive"
                                        >
                                          <Trash2 className="size-4" />{" "}
                                          {isScheduled ? "Remove Post" : "Delete Video"}
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
                                  className="absolute top-1/2 left-1/2 z-10 grid size-9 -translate-x-1/2 -translate-y-1/2 scale-90 cursor-pointer place-items-center rounded-full bg-white/95 text-neutral-900 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100 hover:bg-white focus-visible:opacity-100"
                                >
                                  <Play className="ml-0.5 size-4 fill-current" />
                                </button>
                              )}

                              <div className="z-10 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  {item.platforms.map((p) => (
                                    <span
                                      key={p}
                                      className="grid size-4.5 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-xs"
                                      title={PLATFORM_LABELS[p]}
                                    >
                                      <PlatformIcon platform={p} className="size-2.5" />
                                    </span>
                                  ))}
                                </div>
                                {item.durationSeconds && (
                                  <span className="rounded bg-black/75 px-1 py-0.5 text-[10px] font-medium text-white tabular-nums">
                                    {formatDuration(item.durationSeconds)}
                                  </span>
                                )}
                              </div>
                            </HoverVideoPreview>

                            <CardContent className="flex flex-1 flex-col justify-between gap-1.5 p-2.5">
                              <div className="space-y-0.5">
                                <div className="flex h-3.5 items-center gap-1 text-[10px] text-muted-foreground">
                                  {isScheduled ? (
                                    <span className="flex items-center gap-1 truncate font-medium text-sky-600 dark:text-sky-400">
                                      <Clock className="size-2.5 shrink-0" />
                                      {item.scheduledTime
                                        ? formatDate(item.scheduledTime)
                                        : "Scheduled"}
                                    </span>
                                  ) : isPublished ? (
                                    <span className="flex items-center gap-1 truncate font-medium text-violet-600 dark:text-violet-400">
                                      <CheckCircle2 className="size-2.5 shrink-0" />
                                      {item.publishedAt
                                        ? formatDate(item.publishedAt)
                                        : "Published"}
                                    </span>
                                  ) : (
                                    <span className="truncate">
                                      {formatDate(item.createdAt)}
                                    </span>
                                  )}
                                </div>
                                <h3
                                  onClick={() => setPreviewProject(previewProj)}
                                  className="line-clamp-1 cursor-pointer text-xs leading-snug font-medium transition-colors hover:text-primary"
                                  title={item.title}
                                >
                                  {item.title}
                                </h3>
                              </div>

                              <div className="mt-auto flex gap-1.5 pt-1">
                                {isScheduled ? (
                                  <Button
                                    size="sm"
                                    className="h-7 flex-1 cursor-pointer px-2 text-[11px]"
                                    onClick={() => {
                                      const foundTask = queue.find(
                                        (q) => q.id === item.taskId,
                                      );
                                      if (foundTask) handlePublishNow(foundTask);
                                    }}
                                  >
                                    <Send className="mr-1 size-3" /> Post Now
                                  </Button>
                                ) : isPublished ? (
                                  <Button
                                    size="sm"
                                    className="h-7 flex-1 cursor-pointer px-2 text-[11px]"
                                    onClick={() => setPreviewProject(previewProj)}
                                  >
                                    <Play className="mr-1 size-3" /> Watch
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="h-7 flex-1 cursor-pointer px-2 text-[11px]"
                                    onClick={() =>
                                      router.push(
                                        `/composer?projectId=${item.videoProjectId}`,
                                      )
                                    }
                                  >
                                    <Send className="mr-1 size-3" /> Post
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
                                      "h-7 cursor-pointer px-2 text-[11px]",
                                    )}
                                  >
                                    <ExternalLink className="size-3" />
                                  </a>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 cursor-pointer px-2 text-[11px]"
                                    title="Watch Preview"
                                    onClick={() => setPreviewProject(previewProj)}
                                  >
                                    <Play className="size-3" />
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              {activeLongVideos.length > 0 && (
                <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <MonitorPlay className="size-3.5" />
                      </span>
                      <h3 className="text-sm font-semibold">
                        Long-Form Widescreen Videos (16:9)
                      </h3>
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-[11px] tabular-nums"
                      >
                        {activeLongVideos.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeLongVideos.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllLong((prev) => !prev)}
                          className="h-7 cursor-pointer px-2 text-xs"
                        >
                          {showAllLong
                            ? "Show Less"
                            : `Show All (${activeLongVideos.length})`}
                        </Button>
                      )}
                      <Link
                        href="/projects?format=LONG"
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View All 16:9 <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {(showAllLong ? activeLongVideos : activeLongVideos.slice(0, 3)).map(
                      (item) => {
                        const isPublished = item.status === "PUBLISHED";
                        const isPosting = item.status === "IN_PROGRESS";
                        const isScheduled = item.status === "PENDING";
                        const isReady =
                          item.status === "READY" || item.status === "COMPLETED";

                        const previewProj: VideoProjectResponse = item.rawProject || {
                          id: item.videoProjectId,
                          title: item.title,
                          status: "COMPLETED",
                          outputUrl: item.outputUrl,
                          durationSeconds: item.durationSeconds,
                          aspectRatio: "LANDSCAPE_16_9",
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
                              className="flex aspect-video shrink-0 flex-col justify-between p-2"
                            >
                              <div className="z-20 flex items-start justify-between">
                                <div className="flex flex-wrap items-center gap-1">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "h-4.5 gap-1 border-white/20 px-1.5 text-[9px] font-semibold shadow-xs backdrop-blur",
                                      isPublished
                                        ? "bg-violet-500/90 text-white"
                                        : isPosting
                                          ? "animate-pulse bg-amber-500/90 text-white"
                                          : isScheduled
                                            ? "bg-sky-500/90 text-white"
                                            : isReady
                                              ? "bg-emerald-500/90 text-white"
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
                                          : isReady
                                            ? "Ready"
                                            : "Failed"}
                                  </Badge>

                                  <Badge className="h-4.5 gap-1 border-0 bg-indigo-600/90 px-1.5 text-[9px] font-medium text-white shadow-xs">
                                    <MonitorPlay className="size-2.5" /> 16:9
                                  </Badge>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    aria-label={`Actions for ${item.title}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="grid size-6 cursor-pointer place-items-center rounded-full bg-white/90 text-neutral-900 shadow-xs backdrop-blur transition hover:bg-white"
                                  >
                                    <MoreVertical className="size-3.5" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      onClick={() => setPreviewProject(previewProj)}
                                      className="cursor-pointer"
                                    >
                                      <Play className="size-4 text-emerald-500" /> Watch
                                      Video
                                    </DropdownMenuItem>
                                    {isPublished && item.publicPostUrl && (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          if (item.publicPostUrl)
                                            window.open(item.publicPostUrl, "_blank");
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <ExternalLink className="size-4 text-primary" />{" "}
                                        View Live Post
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
                                        onClick={() =>
                                          window.open(item.outputUrl, "_blank")
                                        }
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
                                            isScheduled
                                              ? handleCancelTask(item.taskId, item.title)
                                              : handleDeleteProject(
                                                  item.videoProjectId,
                                                  item.title,
                                                )
                                          }
                                          className="cursor-pointer text-destructive focus:text-destructive"
                                        >
                                          <Trash2 className="size-4" />{" "}
                                          {isScheduled ? "Remove Post" : "Delete Video"}
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
                                  className="absolute top-1/2 left-1/2 z-10 grid size-9 -translate-x-1/2 -translate-y-1/2 scale-90 cursor-pointer place-items-center rounded-full bg-white/95 text-neutral-900 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100 hover:bg-white focus-visible:opacity-100"
                                >
                                  <Play className="ml-0.5 size-4 fill-current" />
                                </button>
                              )}

                              <div className="z-10 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  {item.platforms.map((p) => (
                                    <span
                                      key={p}
                                      className="grid size-4.5 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-xs"
                                      title={PLATFORM_LABELS[p]}
                                    >
                                      <PlatformIcon platform={p} className="size-2.5" />
                                    </span>
                                  ))}
                                </div>
                                {item.durationSeconds && (
                                  <span className="rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white tabular-nums">
                                    {formatDuration(item.durationSeconds)}
                                  </span>
                                )}
                              </div>
                            </HoverVideoPreview>

                            <CardContent className="flex flex-1 flex-col justify-between gap-1.5 p-2.5">
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between gap-1.5 text-[10px] text-muted-foreground">
                                  {isScheduled ? (
                                    <span className="flex items-center gap-1 truncate font-medium text-sky-600 dark:text-sky-400">
                                      <Clock className="size-2.5 shrink-0" />
                                      {item.scheduledTime
                                        ? formatDate(item.scheduledTime)
                                        : "Scheduled"}
                                    </span>
                                  ) : isPublished ? (
                                    <span className="flex items-center gap-1 truncate font-medium text-violet-600 dark:text-violet-400">
                                      <CheckCircle2 className="size-2.5 shrink-0" />
                                      {item.publishedAt
                                        ? formatDate(item.publishedAt)
                                        : "Published"}
                                    </span>
                                  ) : (
                                    <span className="truncate">
                                      {formatDate(item.createdAt)}
                                    </span>
                                  )}
                                  {item.channelName && (
                                    <span className="truncate font-medium">
                                      {item.channelName}
                                    </span>
                                  )}
                                </div>
                                <h3
                                  onClick={() => setPreviewProject(previewProj)}
                                  className="line-clamp-1 cursor-pointer text-xs leading-snug font-semibold transition-colors hover:text-primary"
                                  title={item.title}
                                >
                                  {item.title}
                                </h3>
                              </div>

                              <div className="mt-auto flex gap-1.5 pt-1">
                                {isScheduled ? (
                                  <Button
                                    size="sm"
                                    className="h-7 flex-1 cursor-pointer px-2 text-[11px]"
                                    onClick={() => {
                                      const foundTask = queue.find(
                                        (q) => q.id === item.taskId,
                                      );
                                      if (foundTask) handlePublishNow(foundTask);
                                    }}
                                  >
                                    <Send className="mr-1 size-3" /> Post Now
                                  </Button>
                                ) : isPublished ? (
                                  <Button
                                    size="sm"
                                    className="h-7 flex-1 cursor-pointer px-2 text-[11px]"
                                    onClick={() => setPreviewProject(previewProj)}
                                  >
                                    <Play className="mr-1 size-3" /> Watch Video
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="h-7 flex-1 cursor-pointer px-2 text-[11px]"
                                    onClick={() =>
                                      router.push(
                                        `/composer?projectId=${item.videoProjectId}`,
                                      )
                                    }
                                  >
                                    <Send className="mr-1 size-3" /> Post Video
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
                                      "h-7 cursor-pointer px-2 text-[11px]",
                                    )}
                                  >
                                    <ExternalLink className="size-3" />
                                  </a>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 cursor-pointer px-2 text-[11px]"
                                    title="Watch Preview"
                                    onClick={() => setPreviewProject(previewProj)}
                                  >
                                    <Play className="size-3" />
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-1">
                <Link
                  href="/projects"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full cursor-pointer gap-2 sm:w-auto",
                  )}
                >
                  View All Projects &amp; Videos ({allDashboardItems.length}){" "}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
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

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !deletingItem && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="text-lg">
              {deleteTarget?.isTask ? "Remove Scheduled Post?" : "Delete Video Project?"}
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deleteTarget?.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={deletingItem}
              className="cursor-pointer"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deletingItem}
              className="cursor-pointer gap-1.5"
              onClick={() => void confirmDeleteAction()}
            >
              <Trash2 className="size-4" />
              {deletingItem ? "Removing…" : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
