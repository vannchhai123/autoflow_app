"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type DragEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  videoApi,
  type AspectRatio as ApiAspectRatio,
  type ClonedVoiceResponse,
} from "@/features/video-editor/api/video-api";
import { publishingApi } from "@/features/publishing/api/publishing-api";
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Film,
  Filter,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderSearch,
  Kanban,
  Layers,
  LayoutGrid,
  Link2,
  Loader2,
  Mic,
  MoreVertical,
  MoveRight,
  Music2,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Share2,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  UploadCloud,
  X,
  type LucideProps,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  PLATFORM_LABELS,
  type Platform,
} from "@/features/publishing/types/publishing.types";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type Icon = ComponentType<LucideProps>;
type Status = "DRAFT" | "RENDERING" | "READY" | "SCHEDULED" | "PUBLISHED" | "FAILED";
type StatusFilter = "ALL" | Status;
type PlatformFilter = "ALL" | Platform;
type VideoFormatFilter = "ALL" | "SHORT" | "LONG";
type ContentCategoryFilter = "ALL" | "VIDEOS" | "POSTS";
type ViewMode = "grid" | "kanban";

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

interface Project {
  id: string;
  title: string;
  topic: string;
  tags: string[];
  status: Status;
  duration: string;
  durationSeconds?: number;
  videoType: "SHORT" | "LONG";
  aspectRatio?: string;
  folderId?: string;
  resolution: string;
  platforms: Platform[];
  progress?: number;
  scheduledFor?: string;
  liveUrl?: string;
  outputUrl?: string;
  thumbnailUrl?: string;
  updatedAt: string;
  gradient: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Folders                                   */
/* -------------------------------------------------------------------------- */
const DEFAULT_FOLDERS: Folder[] = [
  { id: "all", name: "All Folders" },
  { id: "folder-shorts", name: "⚡ Viral Shorts & Reels", color: "text-amber-500" },
  { id: "folder-campaigns", name: "🎯 Brand Campaigns", color: "text-blue-500" },
  { id: "folder-tutorials", name: "📚 Tutorials & Guides", color: "text-emerald-500" },
  { id: "folder-explainers", name: "💡 AI Explainers", color: "text-purple-500" },
];

/* -------------------------------------------------------------------------- */
/*                               Mock data                                    */
/* -------------------------------------------------------------------------- */
const INITIAL_PROJECTS: Project[] = [];

/* -------------------------------------------------------------------------- */
/*                               Static config                                */
/* -------------------------------------------------------------------------- */

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "DRAFT", label: "Drafts" },
  { value: "RENDERING", label: "Rendering" },
  { value: "READY", label: "Ready to Publish" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "PUBLISHED", label: "Published" },
  { value: "FAILED", label: "Failed" },
];

const PLATFORM_FILTERS: { value: PlatformFilter; label: string }[] = [
  { value: "ALL", label: "All Platforms" },
  { value: "FACEBOOK", label: PLATFORM_LABELS.FACEBOOK },
  { value: "YOUTUBE_SHORTS", label: PLATFORM_LABELS.YOUTUBE_SHORTS },
  { value: "TIKTOK", label: PLATFORM_LABELS.TIKTOK },
  { value: "INSTAGRAM_REELS", label: PLATFORM_LABELS.INSTAGRAM_REELS },
  { value: "LINKEDIN", label: PLATFORM_LABELS.LINKEDIN },
];

const STATUS_BADGE: Record<Status, { label: string; dot: string }> = {
  DRAFT: { label: "Draft", dot: "bg-neutral-400" },
  RENDERING: { label: "Rendering", dot: "bg-amber-500 animate-pulse" },
  READY: { label: "Ready to Publish", dot: "bg-emerald-500" },
  SCHEDULED: { label: "Scheduled", dot: "bg-sky-500" },
  PUBLISHED: { label: "Published", dot: "bg-violet-500" },
  FAILED: { label: "Failed", dot: "bg-rose-500" },
};

const KANBAN_COLUMNS: { id: string; title: string; statuses: Status[] }[] = [
  { id: "drafts", title: "Drafts", statuses: ["DRAFT"] },
  { id: "production", title: "In Production / Rendering", statuses: ["RENDERING"] },
  { id: "review", title: "Ready for Review", statuses: ["READY"] },
  { id: "live", title: "Scheduled & Published", statuses: ["SCHEDULED", "PUBLISHED"] },
];

/* -------------------------------------------------------------------------- */
/*                              Platform icons                                */
/* -------------------------------------------------------------------------- */

// lucide-react v1 dropped brand icons, so these are inline SVGs.
const YoutubeIcon: Icon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM9.8 15.1V8.9l5.4 3.1-5.4 3.1Z" />
  </svg>
);

const InstagramIcon: Icon = ({ className }) => (
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

const FacebookIcon: Icon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
  </svg>
);

const LinkedinIcon: Icon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 1.63-1.64 1.64 1.64 0 0 0-3.27 0 1.64 1.64 0 0 0 1.64 1.64m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
  </svg>
);

const PLATFORM_META: Record<Platform, { icon: Icon; color: string }> = {
  YOUTUBE_SHORTS: { icon: YoutubeIcon, color: "text-red-600 bg-red-500/10" },
  INSTAGRAM_REELS: { icon: InstagramIcon, color: "text-pink-600 bg-pink-500/10" },
  TIKTOK: { icon: Music2, color: "text-foreground bg-muted" },
  FACEBOOK: { icon: FacebookIcon, color: "text-blue-600 bg-blue-500/10" },
  LINKEDIN: { icon: LinkedinIcon, color: "text-sky-600 bg-sky-500/10" },
};

function PlatformIcons({
  platforms,
  className,
}: {
  platforms: Platform[];
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {platforms.map((p) => {
        const { icon: PIcon, color } = PLATFORM_META[p];
        return (
          <span
            key={p}
            title={PLATFORM_LABELS[p]}
            className={cn("grid size-6 place-items-center rounded-full", color)}
          >
            <PIcon className="size-3.5" />
          </span>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Card components                              */
/* -------------------------------------------------------------------------- */

interface ProjectActions {
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onPlay?: (project: Project) => void;
  onMoveToFolder?: (project: Project) => void;
  onSelectFolder?: (folderId: string) => void;
  onPublish?: (project: Project) => void;
}

function StatusBadge({
  status,
  className,
}: {
  status: Status | string;
  className?: string;
}) {
  const badge = STATUS_BADGE[status as Status] ?? {
    label: status ?? "Draft",
    dot: "bg-neutral-400",
  };
  const { label, dot } = badge;
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1.5 border-white/20 bg-white/90 text-neutral-900 backdrop-blur",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </Badge>
  );
}

function ProjectMenu({
  project,
  actions,
  className,
}: {
  project: Project;
  actions: ProjectActions;
  className?: string;
}) {
  const canDownload = project.status !== "DRAFT" && project.status !== "RENDERING";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for ${project.title}`}
        className={cn(
          "grid size-7 place-items-center rounded-full bg-white/90 text-neutral-900 backdrop-blur transition hover:bg-white focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => actions.onPlay?.(project)}>
          <Play className="size-4" /> Preview Video
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onMoveToFolder?.(project)}>
          <FolderPlus className="size-4 text-primary" /> Move to Folder...
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onPublish?.(project)}>
          <Send className="size-4 text-sky-500" /> Compose &amp; Publish
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onDuplicate(project.id)}>
          <Copy className="size-4" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canDownload}
          onClick={() => {
            if (project.outputUrl) {
              window.open(project.outputUrl, "_blank");
            } else {
              toast.success("Download started");
            }
          }}
        >
          <Download className="size-4" /> Download MP4
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => actions.onDelete(project.id)}
        >
          <Trash2 className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProjectCard({
  project,
  actions,
  folderName,
}: {
  project: Project;
  actions: ProjectActions;
  folderName?: string;
}) {
  const { status, videoType } = project;
  return (
    <Card className="group flex h-full flex-col justify-between gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      {/* preview thumbnail with hover demo */}
      <HoverVideoPreview
        src={project.outputUrl}
        thumbnailUrl={project.thumbnailUrl}
        gradient={project.gradient}
        onClick={() => actions.onPlay?.(project)}
        className="aspect-[9/16] shrink-0"
      >
        <div className="absolute inset-x-2 top-2 z-10 flex items-start justify-between gap-1.5">
          <div className="flex flex-col items-start gap-1">
            <StatusBadge status={status} />
            {videoType === "SHORT" ? (
              <Badge className="h-5 gap-1 border-0 bg-cyan-500/90 text-[10px] font-medium text-white shadow-xs">
                <Smartphone className="size-2.5" /> Short
              </Badge>
            ) : (
              <Badge className="h-5 gap-1 border-0 bg-amber-600/90 text-[10px] font-medium text-white shadow-xs">
                <Film className="size-2.5" /> Long Form
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {folderName && (
              <Badge
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onSelectFolder?.(project.folderId || "all");
                }}
                className="h-6 max-w-[100px] cursor-pointer truncate border-white/20 bg-black/60 text-[10px] text-white backdrop-blur hover:bg-black/80"
                title={`Folder: ${folderName}`}
              >
                <Folder className="mr-1 size-2.5 shrink-0 text-primary" />
                <span className="truncate">{folderName}</span>
              </Badge>
            )}
            <ProjectMenu project={project} actions={actions} />
          </div>
        </div>

        {/* State-specific center content */}
        {status === "RENDERING" && (
          <div className="absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 space-y-3 rounded-xl bg-black/55 p-4 text-white backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Loader2 className="size-4 animate-spin" />
              Rendering video... {project.progress}%
            </div>
            <Progress
              value={project.progress ?? null}
              className="gap-0 [&_[data-slot=progress-indicator]]:bg-white [&_[data-slot=progress-track]]:bg-white/25"
            />
          </div>
        )}

        {(status === "READY" || status === "SCHEDULED" || status === "PUBLISHED") && (
          <button
            type="button"
            aria-label="Preview video"
            onClick={() => actions.onPlay?.(project)}
            className="absolute top-1/2 left-1/2 z-10 grid size-14 -translate-x-1/2 -translate-y-1/2 scale-90 cursor-pointer place-items-center rounded-full bg-white/90 text-neutral-900 opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100 hover:bg-white focus-visible:opacity-100"
          >
            <Play className="ml-0.5 size-6 fill-current" />
          </button>
        )}

        {status === "DRAFT" && (
          <div className="absolute inset-0 z-10 grid place-items-center">
            <div className="flex flex-col items-center gap-3 text-white/90">
              <span className="grid size-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <FileText className="size-7" />
              </span>
              <span className="text-xs">Script ready for review</span>
            </div>
          </div>
        )}

        {status === "FAILED" && (
          <div className="absolute inset-0 z-10 grid place-items-center p-4">
            <div className="flex flex-col items-center gap-2 rounded-xl bg-black/60 p-4 text-center text-rose-300 backdrop-blur">
              <span className="grid size-12 place-items-center rounded-full bg-rose-500/20 text-rose-400">
                <X className="size-6" />
              </span>
              <span className="text-xs font-medium">Rendering Failed</span>
            </div>
          </div>
        )}

        {status === "PUBLISHED" && (
          <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center">
            <PlatformIcons
              platforms={project.platforms}
              className="gap-2 [&_svg]:size-4 [&>span]:size-8"
            />
          </div>
        )}

        {/* Bottom overlays: duration + resolution */}
        <div className="absolute inset-x-2 bottom-2 z-10 flex items-center justify-between text-xs font-medium text-white">
          <span className="rounded bg-black/70 px-1.5 py-0.5 tabular-nums">
            {project.aspectRatio === "PORTRAIT_9_16"
              ? "9:16"
              : project.aspectRatio === "LANDSCAPE_16_9"
                ? "16:9"
                : "1080p"}
          </span>
          <span className="rounded bg-black/70 px-1.5 py-0.5 tabular-nums">
            {project.duration}
          </span>
        </div>
      </HoverVideoPreview>

      <CardContent className="flex flex-1 flex-col justify-between gap-2.5 p-3">
        <div className="space-y-1">
          <div className="flex h-5 items-center justify-between gap-1">
            <PlatformIcons platforms={project.platforms} />
            <span className="shrink-0 text-[10px] font-medium text-muted-foreground uppercase">
              {videoType === "SHORT" ? "Short (≤60s)" : "Long Form"}
            </span>
          </div>
          <div className="flex h-11 items-start overflow-hidden">
            <h3
              onClick={() => actions.onPlay?.(project)}
              className="line-clamp-2 cursor-pointer text-sm leading-snug font-medium transition-colors hover:text-primary"
              title={project.title}
            >
              {project.title}
            </h3>
          </div>
          <p className="flex h-4 items-center gap-1 text-xs text-muted-foreground">
            {status === "SCHEDULED" && project.scheduledFor ? (
              <>
                <Calendar className="size-3 shrink-0" />{" "}
                <span className="truncate">{project.scheduledFor}</span>
              </>
            ) : (
              <>
                <Clock className="size-3 shrink-0" />{" "}
                <span className="truncate">{project.updatedAt}</span>
              </>
            )}
          </p>
        </div>

        <div className="mt-auto pt-2">
          {status === "READY" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={() => actions.onPublish?.(project)}
              >
                <Send className="mr-1 size-3.5" /> Publish Post
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => actions.onPlay?.(project)}
              >
                <Play className="mr-1 size-3.5" /> Preview
              </Button>
            </div>
          )}
          {status === "DRAFT" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => actions.onPlay?.(project)}
            >
              <Pencil className="mr-1 size-3.5" /> View Script
            </Button>
          )}
          {(status === "SCHEDULED" || status === "PUBLISHED") && (
            <Button
              size="sm"
              variant="secondary"
              className="w-full text-xs"
              onClick={() => actions.onPlay?.(project)}
            >
              <Play className="mr-1 size-3.5" /> Preview Post
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanCard({
  project,
  actions,
  folderName,
}: {
  project: Project;
  actions: ProjectActions;
  folderName?: string;
}) {
  return (
    <Card size="sm" className="gap-0 py-0">
      <CardContent className="flex gap-3 p-3">
        <HoverVideoPreview
          src={project.outputUrl}
          thumbnailUrl={project.thumbnailUrl}
          gradient={project.gradient}
          showIndicator={false}
          onClick={() => actions.onPlay?.(project)}
          className="aspect-[9/16] w-14 shrink-0 rounded-md"
        >
          {project.status === "RENDERING" && (
            <span className="absolute inset-0 z-10 grid place-items-center bg-black/40">
              <Loader2 className="size-4 animate-spin text-white" />
            </span>
          )}
          <span className="absolute right-0.5 bottom-0.5 z-10 rounded bg-black/70 px-1 text-[10px] text-white tabular-nums">
            {project.duration}
          </span>
          <span className="absolute top-0.5 left-0.5 z-10">
            {project.videoType === "SHORT" ? (
              <span className="rounded bg-cyan-500/90 px-1 text-[9px] font-semibold text-white">
                Short
              </span>
            ) : (
              <span className="rounded bg-amber-600/90 px-1 text-[9px] font-semibold text-white">
                Long
              </span>
            )}
          </span>
        </HoverVideoPreview>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-1">
            <h4 className="line-clamp-2 text-sm leading-snug font-medium">
              {project.title}
            </h4>
            <ProjectMenu
              project={project}
              actions={actions}
              className="-mt-0.5 size-6 shrink-0 bg-muted hover:bg-accent"
            />
          </div>
          <div className="flex items-center justify-between gap-1">
            <PlatformIcons platforms={project.platforms} />
            {folderName && (
              <span className="max-w-[90px] truncate text-[10px] text-muted-foreground">
                📁 {folderName}
              </span>
            )}
          </div>
          {project.status === "RENDERING" && (
            <Progress value={project.progress ?? null} className="gap-0" />
          )}
          {(project.status === "SCHEDULED" || project.status === "PUBLISHED") && (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              {project.status === "SCHEDULED" ? (
                <>
                  <Calendar className="size-3" /> {project.scheduledFor}
                </>
              ) : (
                <>
                  <Share2 className="size-3" /> Published
                </>
              )}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanBoard({
  projects,
  actions,
  folders,
}: {
  projects: Project[];
  actions: ProjectActions;
  folders: Folder[];
}) {
  const getFolderName = (fId?: string) =>
    folders.find((f) => f.id === fId)?.name || "General";
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {KANBAN_COLUMNS.map((col) => {
        const items = projects.filter((p) => col.statuses.includes(p.status));
        return (
          <section
            key={col.id}
            aria-label={col.title}
            className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-3"
          >
            <header className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <Badge variant="secondary">{items.length}</Badge>
            </header>
            <div className="flex flex-col gap-3">
              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
                  Nothing here yet
                </p>
              ) : (
                items.map((p) => (
                  <KanbanCard
                    key={p.id}
                    project={p}
                    actions={actions}
                    folderName={getFolderName(p.folderId)}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function EmptyState({ onClear, onNew }: { onClear: () => void; onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-20 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-muted">
        <FolderSearch className="size-8 text-muted-foreground" />
      </span>
      <h2 className="mt-5 text-lg font-semibold">No projects found</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t find anything matching your search or filters. Try adjusting them
        or start fresh.
      </p>
      <div className="mt-6 flex gap-2">
        <Button variant="outline" onClick={onClear}>
          <X /> Clear Filters
        </Button>
        <Button onClick={onNew} className="gap-2">
          <Sparkles className="size-4" /> Create AI Video
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Dialog helpers                               */
/* -------------------------------------------------------------------------- */

type AspectRatio = "9:16" | "16:9" | "1:1";

const GRADIENTS = [
  "from-sky-500 via-sky-800 to-neutral-950",
  "from-amber-500 via-orange-800 to-neutral-950",
  "from-violet-500 via-violet-900 to-neutral-950",
  "from-rose-500 via-rose-900 to-neutral-950",
  "from-emerald-500 via-emerald-900 to-neutral-950",
  "from-indigo-500 via-indigo-900 to-neutral-950",
];

const randomGradient = () => GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;

/** ~150 spoken words per minute. */
const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const estimateSeconds = (words: number) => Math.round((words / 150) * 60);

const ASPECT_OPTIONS: {
  value: AspectRatio;
  hint: string;
  shape: string;
  platforms: Platform[];
}[] = [
  {
    value: "9:16",
    hint: "Vertical • Shorts, Reels, TikTok",
    shape: "h-8 w-[18px]",
    platforms: ["YOUTUBE_SHORTS", "INSTAGRAM_REELS", "TIKTOK"],
  },
  {
    value: "16:9",
    hint: "Horizontal • YouTube, Landscape",
    shape: "h-[18px] w-8",
    platforms: ["YOUTUBE_SHORTS"],
  },
  {
    value: "1:1",
    hint: "Square • LinkedIn, Feed",
    shape: "size-6",
    platforms: ["INSTAGRAM_REELS"],
  },
];

const DURATION_OPTIONS = [
  { value: "30", label: "30 Seconds" },
  { value: "45", label: "45 Seconds" },
  { value: "60", label: "60 Seconds" },
];

const VOICE_OPTIONS = [
  // Khmer (ភាសាខ្មែរ)
  { value: "km-KH-PisethNeural", label: "🇰🇭 Piseth (Natural Male - ខ្មែរ)" },
  { value: "km-KH-SreymomNeural", label: "🇰🇭 Sreymom (Clear Female - ខ្មែរ)" },
  // English
  { value: "en-US-GuyNeural", label: "🇺🇸 Adam (Energetic Male)" },
  { value: "en-US-JennyNeural", label: "🇺🇸 Rachel (Narrative Female)" },
  { value: "en-US-ChristopherNeural", label: "🇺🇸 Christopher (Professional Explainer)" },
  { value: "en-US-AriaNeural", label: "🇺🇸 Aria (Confident Female)" },
  { value: "en-US-EricNeural", label: "🇺🇸 Josh (Calm & Deep Male)" },
  { value: "en-GB-RyanNeural", label: "🇬🇧 Ryan (British Male)" },
];

const VOICEOVER_MODELS = [
  { value: "standard", label: "Standard TTS" },
  { value: "multilingual", label: "ElevenLabs Multilingual v2" },
  { value: "hd", label: "OpenAI TTS HD" },
];

const MEDIA_THEMES = [
  { value: "broll", label: "Stock B-Roll" },
  { value: "gameplay", label: "Gameplay" },
  { value: "abstract", label: "Abstract Minimal" },
];

const BASE_CLONE_VOICES = [
  { value: "km-KH-PisethNeural", label: "🇰🇭 Khmer Male (Piseth - ខ្មែរ)" },
  { value: "km-KH-SreymomNeural", label: "🇰🇭 Khmer Female (Sreymom - ខ្មែរ)" },
  { value: "en-US-GuyNeural", label: "🇺🇸 English Male (Adam)" },
  { value: "en-US-JennyNeural", label: "🇺🇸 English Female (Rachel)" },
  { value: "en-US-ChristopherNeural", label: "🇺🇸 English Professional (Christopher)" },
];

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (project: Project, jobId?: string) => void;
}

interface CloneVoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoiceCloned: (voice: ClonedVoiceResponse) => void;
}

function CloneVoiceDialog({ open, onOpenChange, onVoiceCloned }: CloneVoiceDialogProps) {
  const [name, setName] = useState("");
  const [baseVoice, setBaseVoice] = useState("km-KH-PisethNeural");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName("");
    setBaseVoice("km-KH-PisethNeural");
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setIsCloning(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const allowed = [".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac"];
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error("Unsupported audio format", {
        description: "Please upload an .mp3, .wav, .m4a, or .ogg file.",
      });
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    toast.success(`Voice sample loaded: ${f.name}`);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) {
      toast.error("Please enter a voice name and select an audio sample.");
      return;
    }
    setIsCloning(true);
    try {
      toast.info("Extracting pitch & acoustic profile from voice note...");
      const cloned = await videoApi.cloneVoice(name.trim(), baseVoice, file);
      toast.success(`Voice cloned successfully: ${cloned.name}`);
      onVoiceCloned(cloned);
      handleOpenChange(false);
    } catch {
      toast.error("Failed to clone voice. Ensure backend is running.");
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Mic className="size-5 text-primary" /> Clone New Voice
          </DialogTitle>
          <DialogDescription>
            Upload a short voice note (5-30s) from Telegram, Messenger, or phone recorder
            to clone the voice.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Voice Name" htmlFor="cv-name">
            <Input
              id="cv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Real Voice / Sokha"
              autoFocus
            />
          </Field>

          <Field label="Language & Gender Match">
            <Select
              value={baseVoice}
              onValueChange={(v) => setBaseVoice(v ?? "km-KH-PisethNeural")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {BASE_CLONE_VOICES.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="space-y-2">
            <Label>Voice Sample (Voice Note / Audio Clip)</Label>
            {!file ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()
                }
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center transition-colors hover:bg-primary/10"
              >
                <UploadCloud className="size-8 text-primary" />
                <p className="text-sm font-medium">Click to select voice note</p>
                <p className="text-xs text-muted-foreground">
                  Supports .mp3, .m4a, .wav, .ogg (Voice chat recordings)
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Music2 className="size-4 shrink-0 text-primary" />
                    <span className="truncate text-sm font-medium">{file.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="size-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setFile(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                {previewUrl && (
                  <audio src={previewUrl} controls className="mt-1 h-8 w-full" />
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,.ogg,.aac,.flac,audio/*"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !file || isCloning}>
              {isCloning ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Extracting &amp; Cloning...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Extract &amp; Save Cloned Voice
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewVideoDialog({ open, onOpenChange, onCreate }: DialogProps) {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<AspectRatio>("9:16");
  const [duration, setDuration] = useState("45");
  const [voice, setVoice] = useState("km-KH-PisethNeural");
  const [clonedVoices, setClonedVoices] = useState<ClonedVoiceResponse[]>([]);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [audioSource, setAudioSource] = useState<"ai" | "custom">("ai");
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Load user's cloned voices from backend
  useEffect(() => {
    if (open) {
      videoApi
        .listClonedVoices()
        .then((res) => {
          if (Array.isArray(res)) setClonedVoices(res);
        })
        .catch(() => {});
    }
  }, [open]);

  const combinedVoiceOptions = useMemo(() => {
    const list = [...VOICE_OPTIONS];
    if (clonedVoices.length > 0) {
      const clonedItems = clonedVoices.map((cv) => ({
        value: `cloned:${cv.id}`,
        label: `🎙️ ${cv.name} (Cloned Voice)`,
      }));
      return [...clonedItems, ...list];
    }
    return list;
  }, [clonedVoices]);

  const handleVoiceCloned = (newVoice: ClonedVoiceResponse) => {
    setClonedVoices((prev) => [newVoice, ...prev]);
    setVoice(`cloned:${newVoice.id}`);
  };

  const reset = () => {
    setTitle("");
    setPrompt("");
    setAspect("9:16");
    setDuration("45");
    setVoice(
      clonedVoices.length > 0 ? `cloned:${clonedVoices[0].id}` : "km-KH-PisethNeural",
    );
    setAudioSource("ai");
    setCustomAudioFile(null);
    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
    }
    setCustomAudioUrl(null);
    setIsSubmitting(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleAudioSelect = (file: File | undefined) => {
    if (!file) return;
    const allowed = [".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error("Unsupported audio format", {
        description: "Please upload an .mp3, .wav, .m4a, .ogg, or .aac file.",
      });
      return;
    }
    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
    }
    setCustomAudioFile(file);
    setCustomAudioUrl(URL.createObjectURL(file));
    toast.success(`Loaded audio: ${file.name}`);
  };

  const canSubmit =
    title.trim() !== "" &&
    !isSubmitting &&
    (audioSource === "ai" || (audioSource === "custom" && customAudioFile !== null));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    const opt = ASPECT_OPTIONS.find((a) => a.value === aspect)!;

    const aspectMap: Record<AspectRatio, ApiAspectRatio> = {
      "9:16": "PORTRAIT_9_16",
      "16:9": "LANDSCAPE_16_9",
      "1:1": "SQUARE_1_1",
    };

    const script = prompt.trim() || title.trim();

    try {
      let serverAudioUrl: string | undefined = undefined;

      // If user uploaded custom real audio, upload it first
      if (audioSource === "custom" && customAudioFile) {
        toast.info("Uploading audio file...", { description: customAudioFile.name });
        const uploadRes = await videoApi.uploadAudio(customAudioFile);
        serverAudioUrl = uploadRes.audioUrl;
      }

      // 1. Call Spring Boot to create video project
      const created = await videoApi.create({
        title: title.trim(),
        scriptText: script,
        durationSeconds: audioSource === "ai" ? Number(duration) : undefined,
        aspectRatio: aspectMap[aspect],
        voice: audioSource === "ai" ? voice : undefined,
        audioUrl: serverAudioUrl,
      });

      // 2. Request asynchronous render on the backend
      const renderJob = await videoApi.requestRender(created.id);

      onCreate(
        {
          id: created.id,
          title: created.title,
          topic: prompt.trim().slice(0, 60) || "Real Audio Track",
          tags: [aspect, audioSource === "custom" ? "Real Voice" : voice],
          status: "RENDERING",
          progress: 10,
          duration:
            audioSource === "ai" ? formatDuration(Number(duration)) : "Audio Track",
          durationSeconds: audioSource === "ai" ? Number(duration) : 45,
          videoType: aspect === "9:16" || Number(duration) <= 60 ? "SHORT" : "LONG",
          aspectRatio: created.aspectRatio,
          resolution: "1080p",
          platforms: opt.platforms,
          updatedAt: "Just now",
          gradient: randomGradient(),
        },
        renderJob.jobId,
      );

      toast.success("Video rendering started on backend", { description: title.trim() });
    } catch {
      // Fallback to local simulation if backend is not running or unauthenticated
      onCreate({
        id: `new-${Date.now()}`,
        title: title.trim(),
        topic: prompt.trim().slice(0, 60) || "Real Audio Track",
        tags: [aspect, audioSource === "custom" ? "Real Voice" : voice],
        status: "RENDERING",
        progress: 15,
        duration: audioSource === "ai" ? formatDuration(Number(duration)) : "Audio Track",
        durationSeconds: audioSource === "ai" ? Number(duration) : 45,
        videoType: aspect === "9:16" || Number(duration) <= 60 ? "SHORT" : "LONG",
        resolution: "1080p",
        platforms: opt.platforms,
        updatedAt: "Just now",
        gradient: randomGradient(),
      });
      toast.success("Video rendering started (local)", { description: title.trim() });
    } finally {
      setIsSubmitting(false);
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Create New Video Project</DialogTitle>
          <DialogDescription>
            Generate video using AI voiceover or upload your own real voice memo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Project Title" htmlFor="nv-title">
            <Input
              id="nv-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5 Daily Productivity Hacks"
              autoFocus
            />
          </Field>

          {/* Audio Source Selector */}
          <div className="space-y-1.5">
            <Label>Audio Source</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAudioSource("ai")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all sm:text-sm",
                  audioSource === "ai"
                    ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50",
                )}
              >
                <Sparkles className="size-4" />
                AI Voice (TTS)
              </button>
              <button
                type="button"
                onClick={() => setAudioSource("custom")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all sm:text-sm",
                  audioSource === "custom"
                    ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50",
                )}
              >
                <Music2 className="size-4" />
                Upload Real Audio
              </button>
            </div>
          </div>

          {audioSource === "custom" ? (
            <div className="space-y-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Real Audio / Voice Chat Memo
                </Label>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  100% Real Voice
                </Badge>
              </div>

              {!customAudioFile ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => audioInputRef.current?.click()}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && audioInputRef.current?.click()
                  }
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-background/50 px-4 py-6 text-center transition-colors hover:bg-muted/50"
                >
                  <UploadCloud className="size-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      Click to select audio or voice note
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Supports .mp3, .wav, .m4a, .ogg, .aac, .flac
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 rounded-lg border bg-background/80 p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <Music2 className="size-4 shrink-0 text-primary" />
                      <span className="truncate text-sm font-medium">
                        {customAudioFile.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        ({(customAudioFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="size-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setCustomAudioFile(null);
                        if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
                        setCustomAudioUrl(null);
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  {customAudioUrl && (
                    <audio src={customAudioUrl} controls className="mt-1 h-8 w-full" />
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    ✨ Video duration will automatically synchronize to this audio
                    recording length.
                  </p>
                </div>
              )}

              <input
                ref={audioInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,.ogg,.aac,.flac,audio/*"
                className="hidden"
                onChange={(e) => {
                  handleAudioSelect(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
          ) : (
            <Field label="Prompt / Spoken Script" htmlFor="nv-prompt">
              <Textarea
                id="nv-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter text script for the AI voice to speak (Khmer or English)..."
                className="min-h-24"
              />
            </Field>
          )}

          {audioSource === "custom" && (
            <Field
              label="On-Screen Captions / Subtitle (Optional)"
              htmlFor="nv-prompt-caption"
            >
              <Textarea
                id="nv-prompt-caption"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Subtitles or keywords to display on the video (optional)..."
                className="min-h-16"
              />
            </Field>
          )}

          <div className="space-y-1.5">
            <Label id="nv-aspect-label">Aspect Ratio</Label>
            <RadioGroup
              aria-labelledby="nv-aspect-label"
              value={aspect}
              onValueChange={(v) => setAspect(v as AspectRatio)}
              className="grid-cols-3 gap-2"
            >
              {ASPECT_OPTIONS.map((a) => (
                <label
                  key={a.value}
                  className="flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={cn("rounded-sm border-2 border-foreground/70", a.shape)}
                    />
                    <RadioGroupItem value={a.value} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{a.value}</div>
                    <div className="text-xs leading-snug text-muted-foreground">
                      {a.hint}
                    </div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {audioSource === "ai" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target Duration">
                <Select
                  value={duration}
                  onValueChange={(v) => setDuration(v ?? "45")}
                  items={DURATION_OPTIONS}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {DURATION_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>AI Voice</Label>
                  <button
                    type="button"
                    onClick={() => setCloneDialogOpen(true)}
                    className="flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Plus className="size-3" /> Clone Voice
                  </button>
                </div>
                <Select
                  value={voice}
                  onValueChange={(v) => setVoice(v ?? "km-KH-PisethNeural")}
                  items={combinedVoiceOptions}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {clonedVoices.length > 0 && (
                      <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-primary uppercase">
                        ⭐ Your Cloned Voices
                      </div>
                    )}
                    {clonedVoices.map((cv) => (
                      <SelectItem key={`cloned:${cv.id}`} value={`cloned:${cv.id}`}>
                        🎙️ {cv.name} (Cloned Voice)
                      </SelectItem>
                    ))}
                    <div className="mt-1 px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Standard Voices
                    </div>
                    {VOICE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Rendering...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate Video
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <CloneVoiceDialog
        open={cloneDialogOpen}
        onOpenChange={setCloneDialogOpen}
        onVoiceCloned={handleVoiceCloned}
      />
    </Dialog>
  );
}

/* ----------------------------- Import Script ----------------------------- */

type ImportTab = "paste" | "url" | "file";
const ACCEPTED_EXTENSIONS = [".txt", ".srt", ".json"];

/** Extracts plain spoken text from .txt / .srt / .json uploads. */
function parseScriptFile(name: string, raw: string): string {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  if (ext === ".srt") {
    return raw
      .split(/\r?\n/)
      .filter((l) => l.trim() && !/^\d+$/.test(l.trim()) && !/-->/.test(l))
      .join(" ");
  }
  if (ext === ".json") {
    try {
      const data: unknown = JSON.parse(raw);
      const pick = (v: unknown): string =>
        typeof v === "string"
          ? v
          : Array.isArray(v)
            ? v.map(pick).join(" ")
            : v && typeof v === "object"
              ? pick(
                  (v as Record<string, unknown>).text ??
                    (v as Record<string, unknown>).script ??
                    Object.values(v),
                )
              : "";
      return pick(data).trim() || raw;
    } catch {
      return raw;
    }
  }
  return raw;
}

function ImportScriptDialog({ open, onOpenChange, onCreate }: DialogProps) {
  const [tab, setTab] = useState<ImportTab>("paste");
  const [script, setScript] = useState("");
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [model, setModel] = useState("standard");
  const [theme, setTheme] = useState("broll");
  const fileInput = useRef<HTMLInputElement>(null);

  const words = countWords(script);
  const seconds = estimateSeconds(words);

  const reset = () => {
    setTab("paste");
    setScript("");
    setUrl("");
    setFetching(false);
    setDragging(false);
    setModel("standard");
    setTheme("broll");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFetch = () => {
    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid URL, e.g. https://medium.com/...");
      return;
    }
    setFetching(true);
    // Mock summarizer — replace with a call to the backend.
    setTimeout(() => {
      setScript(
        `Here's the quick version of the article. ${new URL(url).hostname} breaks down the key ideas into three simple takeaways. First, start small and stay consistent. Second, measure what matters instead of everything. Third, share what you learn with others. Follow for more ideas like this.`,
      );
      setFetching(false);
      setTab("paste");
      toast.success("Article summarized into a script");
    }, 900);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      toast.error("Unsupported file type", { description: "Use .txt, .srt or .json" });
      return;
    }
    setScript(parseScriptFile(file.name, await file.text()));
    setTab("paste");
    toast.success(`Loaded ${file.name}`);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    void handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (words === 0) return;
    const firstWords = script.trim().split(/\s+/).slice(0, 6).join(" ");
    const title =
      firstWords.length < script.trim().length ? `${firstWords}…` : firstWords;
    onCreate({
      id: `import-${Date.now()}`,
      title,
      topic: "Imported script",
      tags: ["imported", theme, model],
      status: "DRAFT",
      duration: formatDuration(seconds),
      durationSeconds: seconds,
      videoType: seconds <= 60 ? "SHORT" : "LONG",
      resolution: "1080p",
      platforms: ["YOUTUBE_SHORTS", "INSTAGRAM_REELS", "TIKTOK"],
      updatedAt: "Just now",
      gradient: randomGradient(),
    });
    toast.success("Script imported", { description: "Draft ready for review" });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Import Video Script</DialogTitle>
          <DialogDescription>
            Paste your own script or import from an article to generate video clips.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as ImportTab)}>
            <TabsList className="w-full">
              <TabsTrigger value="paste">Paste Script</TabsTrigger>
              <TabsTrigger value="url">Article / URL</TabsTrigger>
              <TabsTrigger value="file">Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="mt-2 space-y-2">
              <Textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your script here..."
                aria-label="Script"
                className="min-h-40"
              />
              <Badge variant="secondary" className="h-6 gap-1.5 tabular-nums">
                <Clock /> {words} words • ~{seconds}s audio duration
              </Badge>
            </TabsContent>

            <TabsContent value="url" className="mt-2 space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://medium.com/... or blog link"
                    aria-label="Article URL"
                    className="h-8 pl-9"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleFetch}
                  disabled={!url.trim() || fetching}
                >
                  {fetching ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  Fetch &amp; Summarize
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We&apos;ll read the article and turn it into a short, spoken script.
              </p>
            </TabsContent>

            <TabsContent value="file" className="mt-2">
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInput.current?.click()}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && fileInput.current?.click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors hover:bg-muted/50",
                  dragging && "border-primary bg-primary/5",
                )}
              >
                <UploadCloud className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drag &amp; drop a file, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports .txt, .srt and .json
                </p>
                <input
                  ref={fileInput}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    void handleFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Voiceover Model">
              <Select
                value={model}
                onValueChange={(v) => setModel(v ?? "standard")}
                items={VOICEOVER_MODELS}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {VOICEOVER_MODELS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Background Media">
              <Select
                value={theme}
                onValueChange={(v) => setTheme(v ?? "broll")}
                items={MEDIA_THEMES}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {MEDIA_THEMES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={words === 0}>
              <FileText /> Import Script
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Folder Dialogs                                  */
/* -------------------------------------------------------------------------- */

interface MoveToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  folders: Folder[];
  onMove: (projectId: string, folderId: string) => void;
  onOpenNewFolder: () => void;
}

function MoveToFolderDialog({
  open,
  onOpenChange,
  project,
  folders,
  onMove,
  onOpenNewFolder,
}: MoveToFolderDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");

  useEffect(() => {
    if (project) {
      setSelectedFolderId(project.folderId || "all");
    }
  }, [project]);

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="size-5 text-primary" /> Move Video to Directory
          </DialogTitle>
          <DialogDescription className="truncate">
            Organize &ldquo;{project.title}&rdquo; into a category folder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <RadioGroup
            value={selectedFolderId}
            onValueChange={setSelectedFolderId}
            className="space-y-1.5"
          >
            {folders.map((f) => (
              <label
                key={f.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg border p-3 transition hover:bg-muted/50",
                  selectedFolderId === f.id && "border-primary bg-primary/5",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg bg-muted",
                      f.color || "text-primary",
                    )}
                  >
                    {f.id === "all" ? (
                      <Layers className="size-4" />
                    ) : (
                      <Folder className="size-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm leading-none font-medium">{f.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {f.id === "all" ? "Root directory (Unfiled)" : "Folder category"}
                    </div>
                  </div>
                </div>
                <RadioGroupItem value={f.id} />
              </label>
            ))}
          </RadioGroup>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onOpenNewFolder();
            }}
            className="w-full cursor-pointer text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="mr-1 size-3.5 text-primary" /> Create New Directory / Folder
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onMove(project.id, selectedFolderId);
              onOpenChange(false);
            }}
          >
            <Check className="mr-1 size-4" /> Move Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface NewFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFolder: (name: string, color?: string) => void;
}

const FOLDER_COLORS = [
  { value: "text-amber-500", bg: "bg-amber-500", label: "Amber" },
  { value: "text-blue-500", bg: "bg-blue-500", label: "Blue" },
  { value: "text-emerald-500", bg: "bg-emerald-500", label: "Emerald" },
  { value: "text-purple-500", bg: "bg-purple-500", label: "Purple" },
  { value: "text-rose-500", bg: "bg-rose-500", label: "Rose" },
  { value: "text-cyan-500", bg: "bg-cyan-500", label: "Cyan" },
];

function NewFolderDialog({ open, onOpenChange, onCreateFolder }: NewFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    onCreateFolder(folderName.trim(), folderColor);
    setFolderName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="size-5 text-primary" /> Create New Directory
          </DialogTitle>
          <DialogDescription>
            Create a custom directory or folder to organize your shorts, long videos, and
            posts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <Field label="Folder Name" htmlFor="new-folder-input">
            <Input
              id="new-folder-input"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. 📱 Daily TikTok Clips"
              autoFocus
            />
          </Field>

          <div className="space-y-1.5">
            <Label>Folder Accent Color</Label>
            <div className="flex items-center gap-2 pt-1">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFolderColor(c.value)}
                  className={cn(
                    "flex size-7 cursor-pointer items-center justify-center rounded-full border-2 transition",
                    c.bg,
                    folderColor === c.value
                      ? "scale-110 border-foreground ring-2 ring-ring"
                      : "border-transparent opacity-80 hover:opacity-100",
                  )}
                  title={c.label}
                >
                  {folderColor === c.value && <Check className="size-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              <FolderPlus className="mr-1 size-4" /> Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [platform, setPlatform] = useState<PlatformFilter>("ALL");
  const [formatFilter, setFormatFilter] = useState<VideoFormatFilter>("ALL");
  const [contentCategory, setContentCategory] = useState<ContentCategoryFilter>("ALL");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [folderMap, setFolderMap] = useState<Record<string, string>>({});
  const [view, setView] = useState<ViewMode>("grid");
  const [newOpen, setNewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [projectToMove, setProjectToMove] = useState<Project | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  // Load projects from Spring Boot backend and scheduled posts
  useEffect(() => {
    let active = true;
    let savedFolderMap: Record<string, string> = {};

    try {
      const savedFolders = localStorage.getItem("clipflow_video_folders");
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders));
      }
      const savedMap = localStorage.getItem("clipflow_video_folder_map");
      if (savedMap) {
        savedFolderMap = JSON.parse(savedMap);
        setFolderMap(savedFolderMap);
      }
    } catch {
      // ignore localStorage errors
    }

    Promise.allSettled([videoApi.list(0, 50), publishingApi.listScheduled()])
      .then(([resVideos, resScheduled]) => {
        if (!active) return;

        interface ScheduledTaskItem {
          videoProjectId?: string;
          platform?: Platform;
          scheduledTime?: string;
          status?: string;
        }
        let scheduledTasks: ScheduledTaskItem[] = [];
        if (resScheduled.status === "fulfilled" && Array.isArray(resScheduled.value)) {
          scheduledTasks = resScheduled.value as ScheduledTaskItem[];
        }

        if (
          resVideos.status === "fulfilled" &&
          resVideos.value &&
          Array.isArray(resVideos.value.content)
        ) {
          const fromBackend: Project[] = resVideos.value.content.map((p) => {
            const isShort =
              (p.durationSeconds ?? 45) <= 60 || p.aspectRatio === "PORTRAIT_9_16";
            const videoType: "SHORT" | "LONG" = isShort ? "SHORT" : "LONG";

            // Check if there is an associated scheduled publishing task
            const matchingTask = scheduledTasks.find((t) => t.videoProjectId === p.id);
            const itemStatus: Status = matchingTask
              ? matchingTask.status === "PUBLISHED"
                ? "PUBLISHED"
                : "SCHEDULED"
              : p.status === "COMPLETED"
                ? "READY"
                : p.status === "PROCESSING"
                  ? "RENDERING"
                  : p.status === "FAILED"
                    ? "FAILED"
                    : "DRAFT";

            const platforms: Platform[] = matchingTask?.platform
              ? [matchingTask.platform]
              : ["FACEBOOK", "YOUTUBE_SHORTS", "TIKTOK", "INSTAGRAM_REELS", "LINKEDIN"];

            return {
              id: p.id,
              title: p.title,
              topic: p.scriptText ? p.scriptText.slice(0, 60) : "AI Generated",
              tags: [
                p.aspectRatio === "PORTRAIT_9_16"
                  ? "9:16"
                  : p.aspectRatio === "LANDSCAPE_16_9"
                    ? "16:9"
                    : "1:1",
              ],
              status: itemStatus,
              duration: p.durationSeconds ? formatDuration(p.durationSeconds) : "0:45",
              durationSeconds: p.durationSeconds ?? 45,
              videoType,
              aspectRatio: p.aspectRatio,
              folderId: savedFolderMap[p.id] || "all",
              resolution: "1080p",
              platforms,
              scheduledFor: matchingTask?.scheduledTime
                ? new Date(matchingTask.scheduledTime).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined,
              outputUrl: p.outputUrl,
              thumbnailUrl: p.outputUrl
                ? p.outputUrl
                    .replace("/storage/videos/", "/storage/thumbnails/")
                    .replace(/\.mp4(\?.*)?$/i, ".jpg")
                : undefined,
              updatedAt: new Date(p.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              gradient: randomGradient(),
            };
          });

          setProjects(fromBackend);
        }
      })
      .catch(() => {
        // Backend offline or error
      });

    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const total = projects.length;
    const shorts = projects.filter((p) => p.videoType === "SHORT").length;
    const long = projects.filter((p) => p.videoType === "LONG").length;
    const posts = projects.filter(
      (p) => p.status === "SCHEDULED" || p.status === "PUBLISHED",
    ).length;
    const videos = projects.filter(
      (p) => p.status !== "SCHEDULED" && p.status !== "PUBLISHED",
    ).length;
    return { total, shorts, long, posts, videos };
  }, [projects]);

  const hasFilters =
    query.trim() !== "" ||
    status !== "ALL" ||
    platform !== "ALL" ||
    formatFilter !== "ALL" ||
    contentCategory !== "ALL" ||
    selectedFolder !== "all";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      // Content Category (All, Videos, Posts)
      if (contentCategory === "VIDEOS") {
        if (p.status === "SCHEDULED" || p.status === "PUBLISHED") return false;
      } else if (contentCategory === "POSTS") {
        if (p.status !== "SCHEDULED" && p.status !== "PUBLISHED") return false;
      }

      // Format (Short vs Long)
      if (formatFilter === "SHORT" && p.videoType !== "SHORT") return false;
      if (formatFilter === "LONG" && p.videoType !== "LONG") return false;

      // Folder / Directory
      if (selectedFolder !== "all") {
        if ((p.folderId || "all") !== selectedFolder) return false;
      }

      // Status Filter
      if (status !== "ALL" && p.status !== status) return false;

      // Platform Filter
      if (platform !== "ALL" && !p.platforms.includes(platform)) return false;

      // Query Search
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [projects, query, status, platform, formatFilter, contentCategory, selectedFolder]);

  const clearFilters = () => {
    setQuery("");
    setStatus("ALL");
    setPlatform("ALL");
    setFormatFilter("ALL");
    setContentCategory("ALL");
    setSelectedFolder("all");
  };

  const handleMoveProject = (projectId: string, folderId: string) => {
    const updatedMap = { ...folderMap, [projectId]: folderId };
    setFolderMap(updatedMap);
    try {
      localStorage.setItem("clipflow_video_folder_map", JSON.stringify(updatedMap));
    } catch {
      // ignore
    }
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, folderId } : p)));
    const targetFolder = folders.find((f) => f.id === folderId);
    toast.success(`Video moved to ${targetFolder?.name || "Folder"}`);
  };

  const handleCreateFolder = (name: string, color?: string) => {
    const newF: Folder = {
      id: `folder-${Date.now()}`,
      name,
      color: color || "text-primary",
    };
    const updated = [...folders, newF];
    setFolders(updated);
    try {
      localStorage.setItem("clipflow_video_folders", JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSelectedFolder(newF.id);
    toast.success(`Folder "${name}" created!`);
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    if (folderId === "all") return;
    const updated = folders.filter((f) => f.id !== folderId);
    setFolders(updated);
    if (selectedFolder === folderId) {
      setSelectedFolder("all");
    }
    try {
      localStorage.setItem("clipflow_video_folders", JSON.stringify(updated));
    } catch {
      // ignore
    }
    toast.info(`Folder "${folderName}" removed`);
  };

  /** Prepends a project and monitors backend render progress */
  const addProject = (project: Project, jobId?: string) => {
    const enrichedProject = {
      ...project,
      folderId: selectedFolder !== "all" ? selectedFolder : "all",
    };
    setProjects((prev) => [enrichedProject, ...prev]);
    clearFilters();
    setView("grid");

    if (jobId) {
      const timer = setInterval(async () => {
        try {
          const job = await videoApi.getJob(jobId);
          if (job.status === "RUNNING") {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === project.id ? { ...p, progress: job.progressPercentage } : p,
              ),
            );
          } else if (job.status === "SUCCEEDED") {
            clearInterval(timer);
            try {
              const updated = await videoApi.get(project.id);
              setProjects((prev) =>
                prev.map((p) =>
                  p.id === project.id
                    ? {
                        ...p,
                        status: "READY",
                        progress: 100,
                        outputUrl: updated.outputUrl,
                      }
                    : p,
                ),
              );
            } catch {
              setProjects((prev) =>
                prev.map((p) =>
                  p.id === project.id ? { ...p, status: "READY", progress: 100 } : p,
                ),
              );
            }
            toast.success("Video rendered successfully!", { description: project.title });
          } else if (job.status === "FAILED") {
            clearInterval(timer);
            setProjects((prev) =>
              prev.map((p) => (p.id === project.id ? { ...p, status: "DRAFT" } : p)),
            );
            toast.error("Video rendering failed", { description: job.errorMessage });
          }
        } catch {
          clearInterval(timer);
        }
      }, 1200);
    }
  };

  const actions: ProjectActions = {
    onPlay: (p) => {
      setPreviewProject(p);
    },
    onMoveToFolder: (p) => {
      setProjectToMove(p);
      setMoveDialogOpen(true);
    },
    onSelectFolder: (fId) => {
      setSelectedFolder(fId);
    },
    onPublish: (p) => {
      router.push(`/composer?projectId=${p.id}`);
    },
    onDuplicate: (id) => {
      setProjects((prev) => {
        const src = prev.find((p) => p.id === id);
        if (!src) return prev;
        const copy: Project = {
          ...src,
          id: `${id}-copy-${Date.now()}`,
          title: `${src.title} (Copy)`,
          status: "DRAFT",
          progress: undefined,
          scheduledFor: undefined,
          liveUrl: undefined,
          updatedAt: "Just now",
        };
        return [copy, ...prev];
      });
      toast.success("Project duplicated as draft");
    },
    onDelete: async (id) => {
      try {
        await videoApi.delete(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast.success("Project deleted successfully");
      } catch (err) {
        console.error("Failed to delete project:", err);
        toast.error("Failed to delete project", {
          description: "Could not remove project from the server. Please try again.",
        });
      }
    },
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Posts &amp; Videos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage, categorize, and organize your short clips, long videos, and social
            posts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNewFolderOpen(true)}
            className="cursor-pointer gap-1.5"
          >
            <FolderPlus className="size-4 text-primary" /> New Folder
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="cursor-pointer gap-1.5"
          >
            <Upload className="size-4" /> Import Script
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/create")}
            className="cursor-pointer gap-2"
          >
            <Sparkles className="size-4" /> Create AI Video
          </Button>
        </div>
      </header>

      {/* Top Level Category Mode: All vs Videos vs Posts */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-3">
        <button
          type="button"
          onClick={() => setContentCategory("ALL")}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
            contentCategory === "ALL"
              ? "bg-primary font-semibold text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <Layers className="size-4" />
          <span>All Content</span>
          <span
            className={cn(
              "py-0.2 rounded-full px-1.5 text-xs",
              contentCategory === "ALL"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {counts.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setContentCategory("VIDEOS")}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
            contentCategory === "VIDEOS"
              ? "bg-primary font-semibold text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <Film className="size-4" />
          <span>Videos &amp; Clips</span>
          <span
            className={cn(
              "py-0.2 rounded-full px-1.5 text-xs",
              contentCategory === "VIDEOS"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {counts.videos}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setContentCategory("POSTS")}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
            contentCategory === "POSTS"
              ? "bg-primary font-semibold text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <Send className="size-4" />
          <span>Social Posts</span>
          <span
            className={cn(
              "py-0.2 rounded-full px-1.5 text-xs",
              contentCategory === "POSTS"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {counts.posts}
          </span>
        </button>
      </div>

      {/* Directory & Folders Bar */}
      <div className="space-y-2.5 rounded-xl border bg-card p-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="size-4 text-primary" />
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Directories &amp; Folders
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNewFolderOpen(true)}
            className="flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <FolderPlus className="size-3.5" /> + New Folder
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {folders.map((f) => {
            const isSelected = selectedFolder === f.id;
            const folderCount =
              f.id === "all"
                ? projects.length
                : projects.filter((p) => (p.folderId || "all") === f.id).length;
            return (
              <div
                key={f.id}
                className={cn(
                  "group inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                  isSelected
                    ? "border-primary bg-primary/10 font-semibold text-primary ring-1 ring-primary/30"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                onClick={() => setSelectedFolder(f.id)}
              >
                {isSelected ? (
                  <FolderOpen className={cn("size-3.5", f.color || "text-primary")} />
                ) : (
                  <Folder
                    className={cn("size-3.5", f.color || "text-muted-foreground")}
                  />
                )}
                <span>{f.name}</span>
                <span
                  className={cn(
                    "py-0.2 ml-1 rounded-full px-1.5 text-[10px] tabular-nums",
                    isSelected
                      ? "bg-primary font-bold text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {folderCount}
                </span>
                {f.id !== "all" && !DEFAULT_FOLDERS.some((df) => df.id === f.id) && (
                  <button
                    type="button"
                    title="Delete folder"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(f.id, f.name);
                    }}
                    className="ml-1 p-0.5 opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbar: Search, Short/Long, Status, Platform, View */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, topic, or tags..."
              aria-label="Search projects"
              className="h-9 pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Format Filter Tabs (Short vs Long) */}
            <div className="flex items-center gap-1 rounded-lg border bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => setFormatFilter("ALL")}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition",
                  formatFilter === "ALL"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                All Formats
              </button>
              <button
                type="button"
                onClick={() => setFormatFilter("SHORT")}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition",
                  formatFilter === "SHORT"
                    ? "bg-cyan-500 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Smartphone className="size-3.5" /> Shorts (&le;60s) ({counts.shorts})
              </button>
              <button
                type="button"
                onClick={() => setFormatFilter("LONG")}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition",
                  formatFilter === "LONG"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Film className="size-3.5" /> Long Form (&gt;60s) ({counts.long})
              </button>
            </div>

            <Select
              value={status}
              onValueChange={(v) => setStatus((v ?? "ALL") as StatusFilter)}
              items={STATUS_FILTERS}
            >
              <SelectTrigger aria-label="Filter by status" className="h-9 w-40">
                <Filter className="text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tabs
              value={view}
              onValueChange={(v) => setView(v as ViewMode)}
              className="ml-auto"
            >
              <TabsList aria-label="View mode" className="h-9">
                <TabsTrigger value="grid" aria-label="Grid view" className="px-3">
                  <LayoutGrid className="size-4" />{" "}
                  <span className="hidden sm:inline">Grid</span>
                </TabsTrigger>
                <TabsTrigger value="kanban" aria-label="Kanban view" className="px-3">
                  <Kanban className="size-4" />{" "}
                  <span className="hidden sm:inline">Board</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Platform Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Share2 className="size-3.5" /> Platform:
          </span>
          {PLATFORM_FILTERS.map((p) => {
            const isActive = platform === p.value;
            const meta = p.value !== "ALL" ? PLATFORM_META[p.value] : null;
            const PIcon = meta?.icon;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPlatform(p.value)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition",
                  isActive
                    ? "border-foreground bg-foreground font-semibold text-background shadow-xs"
                    : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {PIcon && <PIcon className="size-3" />}
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            {filtered.length} item{filtered.length === 1 ? "" : "s"} found
          </span>
          {selectedFolder !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Folder className="size-3 text-primary" />
              Folder: {folders.find((f) => f.id === selectedFolder)?.name}
            </Badge>
          )}
          {formatFilter !== "ALL" && (
            <Badge variant="secondary" className="text-xs">
              {formatFilter === "SHORT" ? "⚡ Shorts (≤60s)" : "🎬 Long Form (>60s)"}
            </Badge>
          )}
        </div>
        {hasFilters && filtered.length > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer text-xs font-medium text-primary hover:text-foreground hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState onClear={clearFilters} onNew={() => router.push("/create")} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              actions={actions}
              folderName={folders.find((f) => f.id === p.folderId)?.name}
            />
          ))}
        </div>
      ) : (
        <KanbanBoard projects={filtered} actions={actions} folders={folders} />
      )}

      {/* Dialogs */}
      <NewVideoDialog open={newOpen} onOpenChange={setNewOpen} onCreate={addProject} />
      <ImportScriptDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onCreate={addProject}
      />
      <MoveToFolderDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        project={projectToMove}
        folders={folders}
        onMove={handleMoveProject}
        onOpenNewFolder={() => setNewFolderOpen(true)}
      />
      <NewFolderDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        onCreateFolder={handleCreateFolder}
      />

      {/* Video Preview Modal */}
      <Dialog
        open={!!previewProject}
        onOpenChange={(open) => !open && setPreviewProject(null)}
      >
        <DialogContent
          className={cn(
            "border-neutral-800 bg-neutral-950 p-5 text-white shadow-2xl",
            previewProject?.aspectRatio === "LANDSCAPE_16_9"
              ? "sm:max-w-2xl"
              : "sm:max-w-md",
          )}
        >
          <DialogHeader>
            <DialogTitle className="truncate text-base font-medium">
              {previewProject?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400">
              {previewProject?.duration} • Rendered via AutoClip Video Engine
            </DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              "relative mx-auto my-2 flex max-h-[70vh] w-full items-center justify-center overflow-hidden rounded-xl bg-black",
              previewProject?.aspectRatio === "LANDSCAPE_16_9"
                ? "aspect-video"
                : "aspect-[9/16]",
            )}
          >
            {previewProject?.outputUrl ? (
              <video
                src={previewProject.outputUrl}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="p-8 text-center text-sm text-neutral-500">
                No video stream available
              </div>
            )}
          </div>
          <DialogFooter className="mt-2 items-center gap-2 sm:justify-between">
            <span className="text-xs text-neutral-400">
              {previewProject?.aspectRatio === "PORTRAIT_9_16"
                ? "Format: 9:16 Vertical Short"
                : "Format: 16:9 Landscape Video"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-neutral-700 text-white hover:bg-neutral-800"
                onClick={() => {
                  if (previewProject?.outputUrl) {
                    window.open(previewProject.outputUrl, "_blank");
                  }
                }}
              >
                <Download className="mr-1 size-3.5" /> Download MP4
              </Button>
              {previewProject?.id && (
                <Button
                  size="sm"
                  onClick={() => router.push(`/composer?projectId=${previewProject.id}`)}
                >
                  <Send className="mr-1 size-3.5" /> Publish Post
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
