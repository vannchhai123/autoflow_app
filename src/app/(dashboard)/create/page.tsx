"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  videoApi,
  type AspectRatio as ApiAspectRatio,
  type ClonedVoiceResponse,
} from "@/features/video-editor/api/video-api";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HelpCircle,
  ImageIcon,
  Loader2,
  Mic,
  Monitor,
  Music2,
  Play,
  Plus,
  RotateCcw,
  Smartphone,
  Sparkles,
  Square,
  UploadCloud,
  Volume2,
  Wand2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";

type AspectRatio = "9:16" | "16:9" | "1:1";

interface BackgroundStyle {
  id: string;
  name: string;
  filename: string;
  gradient: string;
  accent: string;
}

const BACKGROUND_STYLES: BackgroundStyle[] = [
  {
    id: "neon_cyan",
    name: "Neon Cyan",
    filename: "neon_cyan.jpg",
    gradient: "from-sky-500 via-blue-800 to-slate-950",
    accent: "#38bdf8",
  },
  {
    id: "cyber_violet",
    name: "Cyber Violet",
    filename: "cyber_violet.jpg",
    gradient: "from-purple-500 via-violet-900 to-neutral-950",
    accent: "#a855f7",
  },
  {
    id: "sunset_ember",
    name: "Sunset Ember",
    filename: "sunset_ember.jpg",
    gradient: "from-orange-500 via-rose-800 to-neutral-950",
    accent: "#f97316",
  },
  {
    id: "emerald_forest",
    name: "Emerald Glow",
    filename: "emerald_forest.jpg",
    gradient: "from-emerald-500 via-teal-900 to-neutral-950",
    accent: "#10b981",
  },
];

const ASPECT_OPTIONS: {
  value: AspectRatio;
  label: string;
  sub: string;
  icon: typeof Smartphone;
  ratioClass: string;
}[] = [
  {
    value: "9:16",
    label: "Vertical 9:16",
    sub: "Shorts, Reels, TikTok",
    icon: Smartphone,
    ratioClass: "aspect-[9/16]",
  },
  {
    value: "16:9",
    label: "Horizontal 16:9",
    sub: "YouTube, Landscape",
    icon: Monitor,
    ratioClass: "aspect-[16/9]",
  },
  {
    value: "1:1",
    label: "Square 1:1",
    sub: "Instagram, Feed",
    icon: Square,
    ratioClass: "aspect-square",
  },
];

const BASE_CLONE_VOICES = [
  { value: "km-KH-PisethNeural", label: "🇰🇭 Khmer Male (Piseth - ខ្មែរ)" },
  { value: "km-KH-SreymomNeural", label: "🇰🇭 Khmer Female (Sreymom - ខ្មែរ)" },
  { value: "en-US-GuyNeural", label: "🇺🇸 English Male (Adam)" },
  { value: "en-US-JennyNeural", label: "🇺🇸 English Female (Rachel)" },
  { value: "en-US-ChristopherNeural", label: "🇺🇸 English Professional (Christopher)" },
];

const VOICE_OPTIONS = [
  { value: "km-KH-PisethNeural", label: "🇰🇭 Piseth (Natural Male - ខ្មែរ)" },
  { value: "km-KH-SreymomNeural", label: "🇰🇭 Sreymom (Clear Female - ខ្មែរ)" },

  { value: "en-US-GuyNeural", label: "🇺🇸 Adam (Energetic Male)" },
  { value: "en-US-JennyNeural", label: "🇺🇸 Rachel (Narrative Female)" },
  { value: "en-US-ChristopherNeural", label: "🇺🇸 Christopher (Explainer Male)" },
  { value: "en-US-AriaNeural", label: "🇺🇸 Aria (Confident Female)" },
  { value: "en-US-EricNeural", label: "🇺🇸 Josh (Calm & Deep)" },
  { value: "en-GB-RyanNeural", label: "🇬🇧 Ryan (British Male)" },
];

function CloneVoiceDialog({
  open,
  onOpenChange,
  onVoiceCloned,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoiceCloned: (voice: ClonedVoiceResponse) => void;
}) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) {
      toast.error("Please enter a voice name and select an audio sample.");
      return;
    }
    setIsCloning(true);
    try {
      toast.info("Extracting acoustic timbre profile...");
      const cloned = await videoApi.cloneVoice(name.trim(), baseVoice, file);
      toast.success(`Voice cloned: ${cloned.name}`);
      onVoiceCloned(cloned);
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to clone voice. Ensure backend is running.");
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <div className="space-y-1.5">
            <Label htmlFor="cv-name">Voice Profile Name</Label>
            <Input
              id="cv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Voice Memo / Sokha"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Language &amp; Gender Match</Label>
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
          </div>

          <div className="space-y-2">
            <Label>Voice Sample Recording</Label>
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
                <p className="text-sm font-medium">Click to select voice recording</p>
                <p className="text-xs text-muted-foreground">
                  Supports .mp3, .m4a, .wav, .ogg
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !file || isCloning}>
              {isCloning ? (
                <>
                  <Loader2 className="mr-1 size-4 animate-spin" /> Cloning...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1 size-4" /> Save Cloned Voice
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CreateVideoPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [aspect, setAspect] = useState<AspectRatio>("9:16");
  const [selectedBg, setSelectedBg] = useState<BackgroundStyle>(BACKGROUND_STYLES[0]);
  const [audioSource, setAudioSource] = useState<"ai" | "custom">("ai");
  const [voice, setVoice] = useState("km-KH-PisethNeural");
  const [duration, setDuration] = useState("30");

  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [clonedVoices, setClonedVoices] = useState<ClonedVoiceResponse[]>([]);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderSuccess, setRenderSuccess] = useState(false);
  const [renderedOutputUrl, setRenderedOutputUrl] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  useEffect(() => {
    videoApi
      .listClonedVoices()
      .then((res) => {
        if (Array.isArray(res)) setClonedVoices(res);
      })
      .catch(() => {});
  }, []);

  const wordCount = useMemo(() => {
    return script.trim().split(/\s+/).filter(Boolean).length;
  }, [script]);

  const estimatedSeconds = useMemo(() => {
    return wordCount === 0 ? 0 : Math.max(5, Math.round((wordCount / 140) * 60));
  }, [wordCount]);

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

  const handleAudioSelect = (file: File | undefined) => {
    if (!file) return;
    const allowed = [".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error("Unsupported audio format", {
        description: "Please upload an .mp3, .wav, .m4a, or .ogg file.",
      });
      return;
    }
    if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    setCustomAudioFile(file);
    setCustomAudioUrl(URL.createObjectURL(file));
    toast.success(`Loaded audio: ${file.name}`);
  };

  const handleVoiceCloned = (newVoice: ClonedVoiceResponse) => {
    setClonedVoices((prev) => [newVoice, ...prev]);
    setVoice(`cloned:${newVoice.id}`);
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a video title");
      return;
    }
    if (audioSource === "custom" && !customAudioFile) {
      toast.error("Please upload an audio file first");
      return;
    }

    setIsRendering(true);
    setRenderProgress(10);
    setRenderSuccess(false);

    const aspectMap: Record<AspectRatio, ApiAspectRatio> = {
      "9:16": "PORTRAIT_9_16",
      "16:9": "LANDSCAPE_16_9",
      "1:1": "SQUARE_1_1",
    };

    try {
      let uploadedAudioUrl: string | undefined = undefined;

      if (audioSource === "custom" && customAudioFile) {
        toast.info("Uploading audio file...", { description: customAudioFile.name });
        const uploadRes = await videoApi.uploadAudio(customAudioFile);
        uploadedAudioUrl = uploadRes.audioUrl;
        setRenderProgress(25);
      }

      toast.info("Creating video project...");
      const created = await videoApi.create({
        title: title.trim(),
        scriptText: script.trim() || title.trim(),
        durationSeconds: audioSource === "ai" ? Number(duration) : undefined,
        aspectRatio: aspectMap[aspect],
        voice: audioSource === "ai" ? voice : undefined,
        audioUrl: uploadedAudioUrl,
      });

      setCreatedProjectId(created.id);
      setRenderProgress(35);

      toast.info("Starting animated video rendering...");
      const renderJob = await videoApi.requestRender(created.id);

      const pollInterval = setInterval(async () => {
        try {
          const job = await videoApi.getJob(renderJob.jobId);
          if (job.status === "RUNNING") {
            setRenderProgress(Math.max(35, job.progressPercentage));
          } else if (job.status === "SUCCEEDED") {
            clearInterval(pollInterval);
            setRenderProgress(100);
            setIsRendering(false);
            setRenderSuccess(true);
            const updated = await videoApi.get(created.id);
            setRenderedOutputUrl(updated.outputUrl ?? null);
            toast.success("Video rendered successfully!", { description: title });
          } else if (job.status === "FAILED") {
            clearInterval(pollInterval);
            setIsRendering(false);
            toast.error("Rendering failed", { description: job.errorMessage });
          }
        } catch {
          clearInterval(pollInterval);
          setIsRendering(false);
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsRendering(false);
      toast.error("Failed to generate video. Make sure the backend API is running.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/projects")}
            className="size-8 p-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
              <Sparkles className="size-6 text-primary" /> Create AI Video
            </h1>
            <p className="text-sm text-muted-foreground">
              Customize voiceover, animations, visuals, and aspect ratio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTitle("");
              setScript("");
              setCustomAudioFile(null);
              setRenderSuccess(false);
            }}
          >
            <RotateCcw className="mr-1.5 size-3.5" /> Reset
          </Button>
          <Button
            size="default"
            onClick={handleGenerate}
            disabled={isRendering || !title.trim()}
            className="bg-primary px-5 font-medium shadow-md hover:bg-primary/90"
          >
            {isRendering ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Rendering{" "}
                {renderProgress}%
              </>
            ) : (
              <>
                <Wand2 className="mr-2 size-4" /> Generate Video
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4 text-primary" /> 1. Video Title &amp; Spoken
                Script
              </CardTitle>
              <CardDescription>
                The title will appear on-screen, and the script will be spoken by your
                chosen voice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-title">Project Title (On-Screen Text)</Label>
                <Input
                  id="create-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5 Morning Productivity Habits"
                  className="font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="create-script">
                    Spoken Voiceover Script (Khmer or English)
                  </Label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium tabular-nums">{wordCount} words</span>
                    <span>•</span>
                    <span className="font-medium text-primary tabular-nums">
                      ~{estimatedSeconds}s duration
                    </span>
                  </div>
                </div>
                <Textarea
                  id="create-script"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Type or paste the speech text for your video here..."
                  className="min-h-36 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Volume2 className="size-4 text-primary" /> 2. Audio &amp; Voiceover
                Studio
              </CardTitle>
              <CardDescription>
                Choose between AI-generated voice or upload a real voice memo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAudioSource("ai")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all",
                    audioSource === "ai"
                      ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  <Sparkles className="size-4" />
                  AI Voice (TTS &amp; Cloned)
                </button>
                <button
                  type="button"
                  onClick={() => setAudioSource("custom")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all",
                    audioSource === "custom"
                      ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  <Music2 className="size-4" />
                  Upload Real Audio Recording
                </button>
              </div>

              {audioSource === "ai" ? (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>Selected AI Voice</Label>
                      <button
                        type="button"
                        onClick={() => setCloneModalOpen(true)}
                        className="flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Plus className="size-3" /> Clone New Voice
                      </button>
                    </div>
                    <Select
                      value={voice}
                      onValueChange={(v) => setVoice(v ?? "km-KH-PisethNeural")}
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
                          Standard Khmer &amp; English Voices
                        </div>
                        {VOICE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Target Duration</Label>
                    <Select
                      value={duration}
                      onValueChange={(v) => setDuration(v ?? "30")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectItem value="15">15 Seconds (Micro-Short)</SelectItem>
                        <SelectItem value="30">30 Seconds (Standard Short)</SelectItem>
                        <SelectItem value="45">45 Seconds (In-Depth Story)</SelectItem>
                        <SelectItem value="60">60 Seconds (Full Reel)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <Label>Voice Chat Memo / Recorded Sound</Label>
                  {!customAudioFile ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => audioInputRef.current?.click()}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        audioInputRef.current?.click()
                      }
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center transition-colors hover:bg-primary/10"
                    >
                      <UploadCloud className="size-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          Click or drag &amp; drop voice memo
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Supports .mp3, .wav, .m4a, .ogg, .aac, .flac
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-3 shadow-xs">
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
                        <audio
                          src={customAudioUrl}
                          controls
                          className="mt-1 h-8 w-full"
                        />
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        ✨ Video length will automatically match the duration of this
                        audio recording.
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
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="size-4 text-primary" /> 3. Visual Background &amp;
                Motion Style
              </CardTitle>
              <CardDescription>
                Choose an animated background template with smooth Ken Burns camera zoom.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {BACKGROUND_STYLES.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setSelectedBg(bg)}
                    className={cn(
                      "flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all",
                      selectedBg.id === bg.id
                        ? "border-primary bg-primary/5 font-semibold ring-2 ring-primary/20"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <div
                      className={cn(
                        "size-12 rounded-lg border border-white/20 bg-gradient-to-br shadow-inner",
                        bg.gradient,
                      )}
                    />
                    <span className="text-xs font-medium">{bg.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <Sparkles className="size-4 shrink-0 text-primary" />
                <span>
                  Every video is enhanced with slow cinematic camera drift, electric audio
                  visualizer waves, and a bottom sweep line.
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Smartphone className="size-4 text-primary" /> 4. Aspect Ratio &amp;
                Target Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {ASPECT_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAspect(opt.value)}
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all",
                        aspect === opt.value
                          ? "border-primary bg-primary/5 font-semibold ring-2 ring-primary/20"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <IconComp
                        className={cn(
                          "size-5",
                          aspect === opt.value ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <div>
                        <div className="text-xs font-semibold">{opt.label}</div>
                        <div className="text-[10px] text-muted-foreground">{opt.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:col-span-5">
          <Card className="overflow-hidden border border-neutral-800 bg-neutral-950 text-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                  Live Preview Mockup
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-neutral-700 text-[10px] text-neutral-400"
              >
                {aspect}
              </Badge>
            </CardHeader>

            <CardContent className="flex flex-col items-center p-4">
              <div className="relative w-full max-w-[280px] overflow-hidden rounded-2xl border-4 border-neutral-800 bg-black shadow-2xl">
                <div
                  className={cn(
                    "relative flex aspect-[9/16] w-full flex-col justify-between bg-gradient-to-b p-4 transition-all duration-300",
                    selectedBg.gradient,
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] text-white/80">
                    <span className="font-semibold tracking-wide">AutoClip</span>
                    <Badge
                      variant="secondary"
                      className="h-4 border-0 bg-white/20 text-[9px] text-white backdrop-blur"
                    >
                      9:16 HD
                    </Badge>
                  </div>

                  <div className="my-auto rounded-xl border border-white/10 bg-black/60 p-4 text-center shadow-lg backdrop-blur-md">
                    <p className="line-clamp-3 text-sm leading-snug font-bold text-white">
                      {title.trim() || "Your Video Title Here"}
                    </p>
                    <p className="mt-2 text-[10px] font-medium text-sky-400">
                      AutoClip Studio • Short Video
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex h-7 items-center justify-center gap-1 px-4">
                      {[12, 24, 18, 30, 15, 28, 20, 32, 16, 26, 14, 28, 22].map(
                        (height, i) => (
                          <span
                            key={i}
                            style={{ height: `${height}px` }}
                            className="w-1 animate-pulse rounded-full bg-sky-400 opacity-90"
                          />
                        ),
                      )}
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                      <div className="h-full w-2/3 rounded-full bg-sky-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full space-y-3">
                {isRendering && (
                  <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-900 p-3">
                    <div className="flex items-center justify-between text-xs text-neutral-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Loader2 className="size-3.5 animate-spin text-primary" />{" "}
                        Rendering video...
                      </span>
                      <span className="font-mono text-primary">{renderProgress}%</span>
                    </div>
                    <Progress value={renderProgress} className="h-2 bg-neutral-800" />
                  </div>
                )}

                {renderSuccess && renderedOutputUrl && (
                  <div className="space-y-2 rounded-xl border border-emerald-800/80 bg-emerald-950/60 p-3.5 text-emerald-200">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <CheckCircle2 className="size-4 text-emerald-400" /> Video Rendered
                      Successfully!
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="h-8 flex-1 bg-emerald-600 text-xs text-white hover:bg-emerald-500"
                        onClick={() => window.open(renderedOutputUrl, "_blank")}
                      >
                        <Play className="mr-1 size-3 fill-current" /> Play / Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-neutral-700 text-xs text-neutral-200 hover:bg-neutral-800"
                        onClick={() => router.push("/projects")}
                      >
                        View in Projects
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isRendering || !title.trim()}
                  className="h-11 w-full bg-primary text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
                >
                  {isRendering ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Rendering Video...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" /> Generate Video Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CloneVoiceDialog
        open={cloneModalOpen}
        onOpenChange={setCloneModalOpen}
        onVoiceCloned={handleVoiceCloned}
      />
    </div>
  );
}
