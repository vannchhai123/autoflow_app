"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PLATFORMS,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  type Platform,
  type SocialAccountDto,
} from "@/features/publishing/types/publishing.types";
import { publishingApi } from "@/features/publishing/api/publishing-api";
import {
  videoApi,
  type VideoProjectResponse,
} from "@/features/video-editor/api/video-api";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Film,
  Filter,
  Flame,
  Layers,
  Loader2,
  MoreVertical,
  Play,
  Plus,
  RotateCw,
  Search,
  Send,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ----------------------------- Helpers & Brand Icons ----------------------------- */

function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  if (platform === "YOUTUBE_SHORTS") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-3.5 text-red-500", className)} aria-hidden>
        <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM9.8 15.1V8.9l5.4 3.1-5.4 3.1Z" />
      </svg>
    );
  }
  if (platform === "TIKTOK") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-3.5 text-cyan-400", className)} aria-hidden>
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.894 2.894 0 0 1 2.316-4.637c.307 0 .605.048.885.137V9.402a6.353 6.353 0 0 0-.885-.063 6.338 6.338 0 1 0 6.33 6.333V9.072a8.214 8.214 0 0 0 4.77 1.516v-3.9a4.8 4.8 0 0 1-1-.002Z" />
      </svg>
    );
  }
  if (platform === "FACEBOOK") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-3.5 text-blue-500", className)} aria-hidden>
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
      </svg>
    );
  }
  if (platform === "INSTAGRAM_REELS") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn("size-3.5 text-pink-500", className)} aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-3.5 text-sky-500", className)} aria-hidden>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 1.63-1.64 1.64 1.64 0 0 0-3.27 0 1.64 1.64 0 0 0 1.64 1.64m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
    </svg>
  );
}

interface ScheduledPost {
  id: string;
  videoProjectId?: string;
  title: string;
  caption?: string;
  platforms: Platform[];
  scheduledAt: string; // ISO string
  status: "SCHEDULED" | "PUBLISHED" | "FAILED";
  outputUrl?: string;
}

interface CalendarDay {
  date: Date;
  dayStr: string;
  weekday: string;
  fullWeekday: string;
  dayNum: number;
  isToday: boolean;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "0:30";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday is start of week
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(startDate: Date, todayStr: string): CalendarDay[] {
  const days: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push({
      date: d,
      dayStr: d.toDateString(),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      fullWeekday: d.toLocaleDateString(undefined, { weekday: "long" }),
      dayNum: d.getDate(),
      isToday: d.toDateString() === todayStr,
    });
  }
  return days;
}

function getMonthDays(currentDate: Date, todayStr: string): (CalendarDay & { isCurrentMonth: boolean })[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const firstDayWeekIndex = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const totalDays = lastDayOfMonth.getDate();

  const cells: (CalendarDay & { isCurrentMonth: boolean })[] = [];

  // Previous month trailing days
  for (let i = firstDayWeekIndex - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({
      date: d,
      dayStr: d.toDateString(),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      fullWeekday: d.toLocaleDateString(undefined, { weekday: "long" }),
      dayNum: d.getDate(),
      isToday: d.toDateString() === todayStr,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i);
    cells.push({
      date: d,
      dayStr: d.toDateString(),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      fullWeekday: d.toLocaleDateString(undefined, { weekday: "long" }),
      dayNum: d.getDate(),
      isToday: d.toDateString() === todayStr,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    cells.push({
      date: d,
      dayStr: d.toDateString(),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      fullWeekday: d.toLocaleDateString(undefined, { weekday: "long" }),
      dayNum: d.getDate(),
      isToday: d.toDateString() === todayStr,
      isCurrentMonth: false,
    });
  }

  return cells;
}

/* --------------------------------- Page --------------------------------- */

export default function CalendarPage() {
  const router = useRouter();

  // Active anchor date & view mode (stably initialized for Next.js prerendering)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date("2026-10-17T00:00:00Z"));
  const [todayStr, setTodayStr] = useState<string>("Sat Oct 17 2026");
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");

  // Live data states
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [videoProjects, setVideoProjects] = useState<VideoProjectResponse[]>([]);
  const [accounts, setAccounts] = useState<SocialAccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTimeZone, setUserTimeZone] = useState("UTC");

  // Search filter for draft videos in right sidebar
  const [draftSearchQuery, setDraftSearchQuery] = useState("");

  // Modals state
  // 1. Reschedule modal
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [newTime, setNewTime] = useState<string>("");

  // 2. Post detail & preview modal
  const [detailPost, setDetailPost] = useState<ScheduledPost | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // 3. Quick Schedule modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [schedulePostTitle, setSchedulePostTitle] = useState("");
  const [schedulePostCaption, setSchedulePostCaption] = useState("");
  const [scheduleDateTime, setScheduleDateTime] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["FACEBOOK"]);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  // 4. Video player preview modal (from sidebar or draft)
  const [videoPreviewProject, setVideoPreviewProject] = useState<VideoProjectResponse | null>(null);

  // Initial load
  useEffect(() => {
    try {
      setUserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const now = new Date();
      setCurrentDate(now);
      setTodayStr(now.toDateString());
    } catch {}

    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [tasks, videoRes, accountsRes] = await Promise.all([
        publishingApi.listScheduled().catch(() => []),
        videoApi.list(0, 50).catch(() => ({ content: [], totalElements: 0 })),
        publishingApi.listAccounts().catch(() => []),
      ]);

      if (Array.isArray(accountsRes)) {
        setAccounts(accountsRes);
        const connectedOnly = accountsRes.filter((a) => a.status === "CONNECTED").map((a) => a.platform);
        if (connectedOnly.length > 0) {
          setSelectedPlatforms(connectedOnly);
        }
      }

      const allVideos = videoRes?.content || [];
      setVideoProjects(allVideos);

      // Build scheduled posts map
      if (Array.isArray(tasks)) {
        const mapByGroup = new Map<string, ScheduledPost>();
        const mapped: ScheduledPost[] = [];

        tasks.forEach((task) => {
          const time = task.scheduledTime || task.scheduledAt || "2026-10-17T18:00:00Z";
          const key = (task.videoProjectId || task.videoTitle || task.id) + "_" + time;
          const plat = task.platform;
          const matchingVideo = allVideos.find((v) => v.id === task.videoProjectId);

          const title =
            task.videoTitle ||
            task.title ||
            matchingVideo?.title ||
            (task.caption ? task.caption.slice(0, 50) : "Social Video Post");

          const status =
            task.status === "PUBLISHED"
              ? "PUBLISHED"
              : task.status === "FAILED"
              ? "FAILED"
              : "SCHEDULED";

          if (mapByGroup.has(key)) {
            const existing = mapByGroup.get(key)!;
            if (plat && !existing.platforms.includes(plat)) {
              existing.platforms.push(plat);
            }
          } else {
            const sp: ScheduledPost = {
              id: task.id,
              videoProjectId: task.videoProjectId,
              title,
              caption: task.caption,
              platforms: plat ? [plat] : ["FACEBOOK"],
              scheduledAt: time,
              status,
              outputUrl: matchingVideo?.outputUrl,
            };
            mapByGroup.set(key, sp);
            mapped.push(sp);
          }
        });

        setScheduledPosts(mapped);
      }
    } catch (err) {
      console.warn("Failed to load calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "week") {
        d.setDate(d.getDate() - 7);
      } else {
        d.setMonth(d.getMonth() - 1);
      }
      return d;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "week") {
        d.setDate(d.getDate() + 7);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      return d;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Open quick schedule modal with pre-selected date/video
  const handleOpenScheduleModal = (video?: VideoProjectResponse, targetDate?: Date) => {
    if (video) {
      setSelectedVideoId(video.id);
      setSchedulePostTitle(video.title);
      setSchedulePostCaption(video.scriptText ? video.scriptText.slice(0, 180) : "");
    } else if (videoProjects.length > 0 && !selectedVideoId) {
      const first = videoProjects.find((v) => v.status === "COMPLETED") || videoProjects[0];
      setSelectedVideoId(first.id);
      setSchedulePostTitle(first.title);
      setSchedulePostCaption(first.scriptText ? first.scriptText.slice(0, 180) : "");
    }

    // Ensure only connected accounts are selected
    const connectedActive = accounts.filter((a) => a.status === "CONNECTED").map((a) => a.platform);
    if (connectedActive.length > 0) {
      setSelectedPlatforms(connectedActive);
    }

    // Default time: targetDate at 18:30 (peak hour) or tomorrow 18:30
    const base = targetDate ? new Date(targetDate) : new Date(Date.now() + 24 * 3600 * 1000);
    base.setHours(18, 30, 0, 0);

    // Format for datetime-local (YYYY-MM-DDTHH:mm)
    const localIso = new Date(base.getTime() - base.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setScheduleDateTime(localIso);

    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async () => {
    if (!selectedVideoId) {
      toast.error("Please select a video project");
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one connected platform");
      return;
    }
    if (!scheduleDateTime) {
      toast.error("Please select a publishing time");
      return;
    }

    const unconnected = selectedPlatforms.filter(
      (p) => !accounts.some((a) => a.platform === p && a.status === "CONNECTED")
    );
    if (unconnected.length > 0) {
      toast.error(
        `Channel ${unconnected.map((p) => PLATFORM_LABELS[p]).join(", ")} is not connected. Please connect it in Settings first or deselect it.`
      );
      return;
    }

    setSubmittingSchedule(true);
    try {
      const targetTime = new Date(scheduleDateTime).toISOString();
      await publishingApi.schedulePost({
        videoProjectId: selectedVideoId,
        platforms: selectedPlatforms,
        title: schedulePostTitle.trim(),
        caption: schedulePostCaption.trim(),
        scheduledTime: targetTime,
      });

      toast.success("Post scheduled successfully!", {
        description: `Queued across ${selectedPlatforms.map((p) => PLATFORM_LABELS[p]).join(", ")}`,
      });

      setScheduleModalOpen(false);
      await loadAllData();
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.message || "Failed to schedule post";
      toast.error(msg);
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleCancelPost = async (id: string) => {
    try {
      await publishingApi.cancelTask(id);
      toast.success("Scheduled post cancelled");
      setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
      if (detailPost?.id === id) setDetailPost(null);
    } catch (err) {
      toast.error("Failed to cancel scheduled task");
    }
  };

  const handlePublishNow = async (post: ScheduledPost) => {
    setPublishingId(post.id);
    toast.info(`Publishing to ${post.platforms.map((p) => PLATFORM_LABELS[p]).join(", ")} now…`);

    try {
      await publishingApi.publishNow({
        videoProjectId: post.videoProjectId || post.id,
        platforms: post.platforms,
        title: post.title,
        caption: post.caption,
      });

      toast.success("Video published successfully!");
      if (detailPost?.id === post.id) setDetailPost(null);
      await loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish post immediately");
    } finally {
      setPublishingId(null);
    }
  };

  // Filtered scheduled posts
  const filteredScheduled = useMemo(() => {
    if (platformFilter === "ALL") return scheduledPosts;
    return scheduledPosts.filter((p) => p.platforms.includes(platformFilter as Platform));
  }, [scheduledPosts, platformFilter]);

  // Filtered draft videos
  const readyVideos = useMemo(() => {
    return videoProjects.filter((v) => {
      const matchStatus = v.status === "COMPLETED";
      const matchSearch =
        draftSearchQuery.trim() === "" ||
        v.title.toLowerCase().includes(draftSearchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [videoProjects, draftSearchQuery]);

  // Calendar dates
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekDays = useMemo(() => getWeekDays(weekStart, todayStr), [weekStart, todayStr]);
  const monthDays = useMemo(() => getMonthDays(currentDate, todayStr), [currentDate, todayStr]);

  // Date range title
  const dateRangeLabel = useMemo(() => {
    if (viewMode === "week") {
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 6);
      const startMonth = weekStart.toLocaleDateString(undefined, { month: "short" });
      const endMonth = end.toLocaleDateString(undefined, { month: "short" });
      const year = end.getFullYear();

      if (startMonth === endMonth) {
        return `${startMonth} ${weekStart.getDate()} – ${end.getDate()}, ${year}`;
      }
      return `${startMonth} ${weekStart.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
    }
    return currentDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [viewMode, weekStart, currentDate]);

  const connectedAccountsCount = accounts.filter((a) => a.status === "CONNECTED").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2.5">
            <CalendarDays className="size-6 text-primary" /> Scheduling Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated multi-platform posting pipeline synced in UTC and converted to {userTimeZone}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Week / Month view toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "week" | "month")}>
            <TabsList className="h-9">
              <TabsTrigger value="week" className="cursor-pointer">Week View</TabsTrigger>
              <TabsTrigger value="month" className="cursor-pointer">Month View</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={() => handleOpenScheduleModal()}
            className="gap-1.5 font-medium cursor-pointer"
          >
            <Plus className="size-4" /> Schedule Post
          </Button>
        </div>
      </div>

      {/* 2. Status & Metric Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border shadow-xs text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="size-4 text-primary" />
            <span>{scheduledPosts.length} Scheduled</span>
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Film className="size-4 text-emerald-500" />
            <span>{readyVideos.length} Ready Clips</span>
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="size-4 text-sky-500" />
            <span>{connectedAccountsCount} Connected Channels</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Worker Active (Cron 60s)
          </span>
          <span>•</span>
          <span className="truncate max-w-[150px]">{userTimeZone}</span>
        </div>
      </div>

      {/* 3. Navigation & Platform Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Previous, Today, Next controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border bg-card p-0.5 shadow-xs">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 cursor-pointer"
              onClick={handlePrev}
              title="Previous period"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs font-semibold cursor-pointer"
              onClick={handleToday}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 cursor-pointer"
              onClick={handleNext}
              title="Next period"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <span className="text-sm font-semibold tracking-tight px-1">
            {dateRangeLabel}
          </span>
        </div>

        {/* Platform filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={platformFilter} onValueChange={(v) => v && setPlatformFilter(v)}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="ALL">All Platforms</SelectItem>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            className="size-9 p-0 cursor-pointer"
            title="Refresh schedule"
          >
            <RotateCw className={cn("size-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* 4. Main Layout: Calendar Grid (8 cols) + Ready to Schedule Library (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar View */}
        <div className="lg:col-span-8 space-y-4">
          {viewMode === "week" ? (
            /* ================= Week View ================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
              {weekDays.map((day) => {
                const postsForDay = filteredScheduled.filter(
                  (p) => new Date(p.scheduledAt).toDateString() === day.dayStr
                );

                return (
                  <div
                    key={day.dayStr}
                    className={cn(
                      "flex flex-col rounded-xl border p-2.5 min-h-72 transition-all bg-card shadow-2xs",
                      day.isToday
                        ? "border-primary/60 ring-1 ring-primary/20 bg-primary/5"
                        : "border-border"
                    )}
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between pb-2 border-b mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">
                          {day.weekday}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Flame className="size-2.5 text-amber-500 inline" /> 18:30
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenScheduleModal(undefined, day.date)}
                          className="grid size-5 place-items-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title={`Schedule post for ${day.weekday}`}
                        >
                          <Plus className="size-3" />
                        </button>
                        <span
                          className={cn(
                            "text-xs font-mono size-5 grid place-items-center rounded-full text-center leading-none",
                            day.isToday
                              ? "bg-primary text-primary-foreground font-bold"
                              : "text-muted-foreground"
                          )}
                        >
                          {day.dayNum}
                        </span>
                      </div>
                    </div>

                    {/* Day Posts List */}
                    <div className="space-y-2 flex-1">
                      {postsForDay.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => setDetailPost(post)}
                          className="group relative rounded-lg border bg-background p-2 shadow-xs space-y-1.5 hover:border-primary/50 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                              <Clock className="size-2.5 text-primary" />
                              {new Date(post.scheduledAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label="Actions"
                                onClick={(e) => e.stopPropagation()}
                                className="grid size-5 place-items-center rounded-md hover:bg-muted text-muted-foreground"
                              >
                                <MoreVertical className="size-3" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setDetailPost(post)}>
                                  <Play className="size-3.5 text-emerald-500" /> Preview Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePublishNow(post)}>
                                  <Send className="size-3.5 text-primary" /> Publish Now
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingPost(post);
                                    setNewTime(new Date(post.scheduledAt).toISOString().slice(0, 16));
                                  }}
                                >
                                  <RotateCw className="size-3.5" /> Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleCancelPost(post.id)}
                                >
                                  <Trash2 className="size-3.5" /> Cancel Post
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <p className="text-xs font-semibold line-clamp-2 leading-snug">
                            {post.title}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1">
                              {post.platforms.map((p) => (
                                <PlatformIcon key={p} platform={p} className="size-3" />
                              ))}
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[9px] py-0 px-1 font-mono",
                                post.status === "PUBLISHED" && "bg-emerald-500/10 text-emerald-500",
                                post.status === "FAILED" && "bg-rose-500/10 text-rose-500"
                              )}
                            >
                              {post.status}
                            </Badge>
                          </div>
                        </div>
                      ))}

                      {postsForDay.length === 0 && (
                        <div
                          onClick={() => handleOpenScheduleModal(undefined, day.date)}
                          className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-2 rounded-lg border border-dashed border-border/40 hover:border-primary/40 hover:bg-muted/10 transition-colors cursor-pointer group"
                        >
                          <Plus className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors mb-1" />
                          <span className="text-[11px] text-muted-foreground/60 group-hover:text-foreground">
                            Slot Available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= Month View ================= */
            <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
              {/* Month Day Names */}
              <div className="grid grid-cols-7 border-b text-center text-xs font-semibold text-muted-foreground py-2.5 bg-muted/20">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Month Day Cells */}
              <div className="grid grid-cols-7 divide-x divide-y">
                {monthDays.map((cell) => {
                  const postsForDay = filteredScheduled.filter(
                    (p) => new Date(p.scheduledAt).toDateString() === cell.dayStr
                  );

                  return (
                    <div
                      key={cell.dayStr}
                      className={cn(
                        "min-h-28 p-2 flex flex-col justify-between transition-colors group relative",
                        !cell.isCurrentMonth && "bg-muted/15 opacity-40",
                        cell.isToday && "bg-primary/5 font-semibold"
                      )}
                    >
                      {/* Top Day Number & Quick Add */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleOpenScheduleModal(undefined, cell.date)}
                          className="opacity-0 group-hover:opacity-100 size-4 grid place-items-center rounded bg-primary text-primary-foreground text-xs transition-opacity cursor-pointer"
                          title="Schedule post"
                        >
                          +
                        </button>
                        <span
                          className={cn(
                            "text-xs font-mono size-5 grid place-items-center rounded-full ml-auto",
                            cell.isToday && "bg-primary text-primary-foreground font-bold"
                          )}
                        >
                          {cell.dayNum}
                        </span>
                      </div>

                      {/* Post Pills */}
                      <div className="space-y-1 my-1 flex-1">
                        {postsForDay.slice(0, 3).map((post) => (
                          <div
                            key={post.id}
                            onClick={() => setDetailPost(post)}
                            className="flex items-center gap-1 rounded bg-muted/70 hover:bg-primary/10 hover:border-primary/40 border border-transparent px-1.5 py-0.5 text-[10px] truncate cursor-pointer transition-colors"
                            title={`${post.title} (${new Date(post.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`}
                          >
                            <PlatformIcon platform={post.platforms[0]} className="size-2.5 shrink-0" />
                            <span className="font-mono text-[9px] text-muted-foreground">
                              {new Date(post.scheduledAt).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="truncate font-medium">{post.title}</span>
                          </div>
                        ))}

                        {postsForDay.length > 3 && (
                          <div className="text-[9px] text-muted-foreground text-center font-medium">
                            +{postsForDay.length - 3} more
                          </div>
                        )}
                      </div>

                      <div className="h-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ready to Schedule Library */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="size-4 text-primary" /> Ready to Schedule
                </CardTitle>
                <Badge variant="secondary" className="text-xs font-mono">
                  {readyVideos.length} clips
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Pick rendered video drafts to assign into optimal publishing slots.
              </CardDescription>

              {/* Search filter for drafts */}
              <div className="relative pt-2">
                <Search className="absolute left-2.5 top-5 size-3.5 text-muted-foreground" />
                <Input
                  value={draftSearchQuery}
                  onChange={(e) => setDraftSearchQuery(e.target.value)}
                  placeholder="Search rendered videos…"
                  className="h-8 text-xs pl-8 bg-muted/20"
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {readyVideos.map((video) => (
                <div
                  key={video.id}
                  className="group rounded-xl border bg-muted/20 p-3 space-y-2 hover:bg-muted/40 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {video.outputUrl ? (
                        <button
                          type="button"
                          onClick={() => setVideoPreviewProject(video)}
                          className="size-8 rounded-lg bg-black/80 text-white grid place-items-center shrink-0 hover:bg-primary transition-colors cursor-pointer"
                          title="Preview video"
                        >
                          <Play className="size-3.5 fill-current ml-0.5" />
                        </button>
                      ) : (
                        <div className="size-8 rounded-lg bg-muted grid place-items-center shrink-0">
                          <Film className="size-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-xs font-semibold leading-snug line-clamp-2" title={video.title}>
                        {video.title}
                      </p>
                    </div>

                    <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                      {formatDuration(video.durationSeconds)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {video.aspectRatio === "PORTRAIT_9_16" ? "9:16 Vertical" : "16:9 Landscape"}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => handleOpenScheduleModal(video)}
                      className="h-7 text-xs gap-1 cursor-pointer"
                    >
                      <CalendarIcon className="size-3" /> Schedule
                    </Button>
                  </div>
                </div>
              ))}

              {readyVideos.length === 0 && (
                <div className="py-8 text-center space-y-2">
                  <Film className="size-8 mx-auto text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    {draftSearchQuery ? "No matching videos found." : "No rendered drafts ready."}
                  </p>
                  <Link
                    href="/create"
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }), "text-xs")}
                  >
                    Generate Video in Studio →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================= MODAL 1: Quick Schedule Post ================= */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="sm:max-w-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" /> Schedule Publishing Slot
            </DialogTitle>
            <DialogDescription>
              Select platforms and assign an automated release timestamp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Video selector */}
            <div className="space-y-1.5">
              <Label className="text-xs">Target Video</Label>
              <Select value={selectedVideoId} onValueChange={(val) => {
                if (!val) return;
                setSelectedVideoId(val);
                const v = videoProjects.find((p) => p.id === val);
                if (v) {
                  setSchedulePostTitle(v.title);
                  setSchedulePostCaption(v.scriptText ? v.scriptText.slice(0, 180) : "");
                }
              }}>
                <SelectTrigger className="h-9 w-full text-xs">
                  <SelectValue placeholder="Choose a video project…" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {videoProjects
                    .filter((v) => v.status === "COMPLETED")
                    .map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-xs">
                        {v.title} ({formatDuration(v.durationSeconds)})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform toggles */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Publish To Platforms</Label>
                <span className="text-[10px] text-muted-foreground">
                  {selectedPlatforms.length} selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLATFORMS.map((p) => {
                  const isSelected = selectedPlatforms.includes(p);
                  const isConnected = accounts.some(
                    (a) => a.platform === p && a.status === "CONNECTED"
                  );

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        if (!isConnected) {
                          toast.warning(
                            `${PLATFORM_LABELS[p]} is not connected. Connect it in Settings → Connected Accounts to publish here.`
                          );
                          return;
                        }
                        setSelectedPlatforms((prev) =>
                          prev.includes(p)
                            ? prev.filter((item) => item !== p)
                            : [...prev, p]
                        );
                      }}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                        isSelected && isConnected
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                          : isConnected
                          ? "border-border/60 hover:bg-muted/40 text-muted-foreground"
                          : "border-dashed border-border/40 opacity-60 text-muted-foreground/70 hover:opacity-100"
                      )}
                    >
                      <PlatformIcon platform={p} className="size-3.5" />
                      <span className="truncate">{PLATFORM_LABELS[p]}</span>
                      {isConnected ? (
                        <CheckCircle2 className="size-3 text-emerald-500 ml-auto shrink-0" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60 ml-auto font-normal">Offline</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Title & Caption */}
            <div className="space-y-2">
              <div>
                <Label htmlFor="sched-title" className="text-xs">Post Title</Label>
                <Input
                  id="sched-title"
                  value={schedulePostTitle}
                  onChange={(e) => setSchedulePostTitle(e.target.value)}
                  placeholder="e.g. 5 Facts You Didn't Know"
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div>
                <Label htmlFor="sched-caption" className="text-xs">Caption &amp; Hashtags</Label>
                <Textarea
                  id="sched-caption"
                  rows={2}
                  value={schedulePostCaption}
                  onChange={(e) => setSchedulePostCaption(e.target.value)}
                  placeholder="Add a viral caption or hashtags (#shorts #viral)..."
                  className="text-xs mt-1 resize-none"
                />
              </div>
            </div>

            {/* Time selection & Quick Presets */}
            <div className="space-y-2">
              <Label htmlFor="sched-datetime" className="text-xs">Publish Date &amp; Time ({userTimeZone})</Label>
              <Input
                id="sched-datetime"
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                className="h-9 text-xs"
              />

              {/* Quick time recommendation pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setHours(18, 30, 0, 0);
                    setScheduleDateTime(
                      new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                    );
                  }}
                  className="text-[11px] px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  🔥 Today Prime (18:30)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(Date.now() + 24 * 3600 * 1000);
                    d.setHours(9, 0, 0, 0);
                    setScheduleDateTime(
                      new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                    );
                  }}
                  className="text-[11px] px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  🌅 Tomorrow (09:00)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(Date.now() + 24 * 3600 * 1000);
                    d.setHours(18, 30, 0, 0);
                    setScheduleDateTime(
                      new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                    );
                  }}
                  className="text-[11px] px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  🔥 Tomorrow Peak (18:30)
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleScheduleSubmit}
              disabled={submittingSchedule}
              className="gap-1.5 cursor-pointer"
            >
              {submittingSchedule ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Scheduling…
                </>
              ) : (
                <>
                  <CalendarIcon className="size-3.5" /> Confirm Schedule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 2: Post Detail & Video Preview ================= */}
      {detailPost && (
        <Dialog open={!!detailPost} onOpenChange={(open) => !open && setDetailPost(null)}>
          <DialogContent className="sm:max-w-lg p-5">
            <DialogHeader>
              <div className="flex items-center justify-between pr-4">
                <DialogTitle className="line-clamp-1">{detailPost.title}</DialogTitle>
                <Badge
                  variant="secondary"
                  className={cn(
                    "font-mono text-xs",
                    detailPost.status === "PUBLISHED" && "bg-emerald-500/10 text-emerald-500",
                    detailPost.status === "FAILED" && "bg-rose-500/10 text-rose-500"
                  )}
                >
                  {detailPost.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Scheduled for {new Date(detailPost.scheduledAt).toLocaleString()} ({userTimeZone})
              </DialogDescription>
            </DialogHeader>

            {/* Video preview player */}
            {detailPost.outputUrl ? (
              <div className="relative aspect-[9/16] max-h-[45vh] w-full overflow-hidden rounded-xl bg-black flex items-center justify-center mx-auto my-2">
                <video
                  src={detailPost.outputUrl}
                  controls
                  autoPlay
                  className="size-full object-contain"
                />
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground bg-muted/20 rounded-xl">
                <Film className="size-8 mx-auto mb-1 opacity-40" />
                <p className="text-xs">Rendered video stream ready in background.</p>
              </div>
            )}

            {/* Target platforms */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-muted-foreground">Target Platforms:</span>
              <div className="flex flex-wrap gap-1.5">
                {detailPost.platforms.map((p) => (
                  <Badge key={p} variant="outline" className="gap-1 py-1 px-2 text-xs">
                    <PlatformIcon platform={p} className="size-3" />
                    {PLATFORM_LABELS[p]}
                  </Badge>
                ))}
              </div>

              {detailPost.caption && (
                <div className="pt-2">
                  <span className="font-semibold text-muted-foreground">Caption:</span>
                  <p className="mt-1 p-2 rounded-lg bg-muted/30 text-xs whitespace-pre-wrap">
                    {detailPost.caption}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelPost(detailPost.id)}
                className="cursor-pointer"
              >
                <Trash2 className="size-3.5" /> Cancel Post
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingPost(detailPost);
                  setNewTime(new Date(detailPost.scheduledAt).toISOString().slice(0, 16));
                  setDetailPost(null);
                }}
                className="cursor-pointer"
              >
                <Clock className="size-3.5" /> Reschedule
              </Button>
              <Button
                size="sm"
                onClick={() => handlePublishNow(detailPost)}
                disabled={publishingId === detailPost.id}
                className="gap-1.5 cursor-pointer"
              >
                {publishingId === detailPost.id ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Publishing…
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" /> Publish Now
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ================= MODAL 3: Reschedule Post Time ================= */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="sm:max-w-md p-5">
          <DialogHeader>
            <DialogTitle>Reschedule Post Time</DialogTitle>
            <DialogDescription className="line-clamp-1">
              Select a new automated release time for: <strong>{editingPost?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="resched-time" className="text-xs">
              New Date &amp; Time ({userTimeZone})
            </Label>
            <Input
              id="resched-time"
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingPost && newTime) {
                  const updatedIso = new Date(newTime).toISOString();
                  setScheduledPosts((prev) =>
                    prev.map((p) =>
                      p.id === editingPost.id ? { ...p, scheduledAt: updatedIso } : p
                    )
                  );
                  toast.success("Post rescheduled successfully!");
                  setEditingPost(null);
                }
              }}
            >
              Update Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 4: Video Draft Player Preview ================= */}
      {videoPreviewProject && (
        <Dialog open={!!videoPreviewProject} onOpenChange={(open) => !open && setVideoPreviewProject(null)}>
          <DialogContent className="sm:max-w-md p-5">
            <DialogHeader>
              <DialogTitle className="line-clamp-1">{videoPreviewProject.title}</DialogTitle>
              <DialogDescription className="text-xs">
                {formatDuration(videoPreviewProject.durationSeconds)} • Created{" "}
                {new Date(videoPreviewProject.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="relative aspect-[9/16] max-h-[50vh] w-full overflow-hidden rounded-xl bg-black flex items-center justify-center mx-auto my-2">
              {videoPreviewProject.outputUrl ? (
                <video
                  src={videoPreviewProject.outputUrl}
                  controls
                  autoPlay
                  className="size-full object-contain"
                />
              ) : (
                <p className="text-xs text-muted-foreground">Video stream unavailable</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setVideoPreviewProject(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  const v = videoPreviewProject;
                  setVideoPreviewProject(null);
                  handleOpenScheduleModal(v);
                }}
                className="gap-1.5 cursor-pointer"
              >
                <CalendarIcon className="size-3.5" /> Schedule This Clip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
