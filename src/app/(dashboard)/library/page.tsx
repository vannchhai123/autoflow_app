"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Copy,
  FileText,
  Hash,
  ImageIcon,
  Layers,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface CaptionTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
}

interface HashtagSet {
  id: string;
  name: string;
  category: string;
  tags: string[];
}

const INITIAL_TEMPLATES: CaptionTemplate[] = [
  {
    id: "tpl-1",
    name: "Educational Short Hook",
    category: "General",
    template: `3 things you didn't know about {{topic}} 👇\n\n1. {{point_1}}\n2. {{point_2}}\n3. {{point_3}}\n\nWhich one surprised you most? Save this post and follow for more daily breakdowns!\n\n{{hashtags}}`,
  },
  {
    id: "tpl-2",
    name: "YouTube Chapters & Links",
    category: "YouTube",
    template: `In this video: {{title}}\n\n⏱️ Chapters:\n00:00 - Intro\n00:30 - Core Breakdown\n01:15 - Key Takeaway\n\n🔗 Blueprint & Free Checklist: {{link}}\n\n#ClipFlow #Productivity`,
  },
  {
    id: "tpl-3",
    name: "LinkedIn Thought Leadership",
    category: "LinkedIn",
    template: `Most teams struggle with {{topic}} because they focus on the wrong metric.\n\nHere is what the top 1% do differently:\n• Priority 1: Clear ownership\n• Priority 2: 24h feedback loops\n• Priority 3: Automated distribution with ClipFlow\n\nWhat is your team's biggest operational bottleneck this quarter?`,
  },
];

const INITIAL_HASHTAGS: HashtagSet[] = [
  {
    id: "ht-1",
    name: "Productivity & Habits",
    category: "Productivity",
    tags: ["#productivity", "#morningroutine", "#habits", "#deepwork", "#discipline", "#successmindset"],
  },
  {
    id: "ht-2",
    name: "AI & Tech Innovations",
    category: "Technology",
    tags: ["#ai", "#automation", "#techtrends", "#softwareengineering", "#futureofwork", "#coding"],
  },
  {
    id: "ht-3",
    name: "Reels & Shorts Growth",
    category: "Social Media",
    tags: ["#reelsviral", "#shorts", "#contentcreator", "#videomarketing", "#clipflow", "#socialstrategy"],
  },
];

export default function LibraryPage() {
  const [templates, setTemplates] = useState<CaptionTemplate[]>(INITIAL_TEMPLATES);
  const [hashtagSets, setHashtagSets] = useState<HashtagSet[]>(INITIAL_HASHTAGS);

  // Modals
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplContent, setTplContent] = useState("");

  const [newHashtagOpen, setNewHashtagOpen] = useState(false);
  const [htName, setHtName] = useState("");
  const [htTags, setHtTags] = useState("");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const handleCreateTemplate = () => {
    if (!tplName.trim() || !tplContent.trim()) return;
    const item: CaptionTemplate = {
      id: `tpl-${Date.now()}`,
      name: tplName.trim(),
      category: "Custom",
      template: tplContent.trim(),
    };
    setTemplates((prev) => [item, ...prev]);
    toast.success(`Template "${tplName}" saved!`);
    setTplName("");
    setTplContent("");
    setNewTemplateOpen(false);
  };

  const handleCreateHashtagSet = () => {
    if (!htName.trim() || !htTags.trim()) return;
    const tagsArr = htTags
      .split(/[\s,]+/)
      .map((t) => (t.startsWith("#") ? t : `#${t}`))
      .filter((t) => t.length > 1);

    const item: HashtagSet = {
      id: `ht-${Date.now()}`,
      name: htName.trim(),
      category: "Custom",
      tags: tagsArr,
    };
    setHashtagSets((prev) => [item, ...prev]);
    toast.success(`Hashtag set "${htName}" saved!`);
    setHtName("");
    setHtTags("");
    setNewHashtagOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <BookOpen className="size-6 text-primary" /> Content Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Store reusable caption templates, saved hashtag bundles, and brand asset presets.
          </p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="h-10">
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="size-4" /> Caption Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="hashtags" className="gap-2">
            <Hash className="size-4" /> Hashtag Sets ({hashtagSets.length})
          </TabsTrigger>
          <TabsTrigger value="brand" className="gap-2">
            <ImageIcon className="size-4" /> Brand Assets
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Use variables like <code>{"{{title}}"}</code> or <code>{"{{topic}}"}</code> for automatic insertion in the Composer.
            </p>
            <Button size="sm" onClick={() => setNewTemplateOpen(true)} className="gap-1.5">
              <Plus className="size-3.5" /> New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="border shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{tpl.name}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      {tpl.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-muted/40 p-3 font-mono text-xs whitespace-pre-line text-muted-foreground line-clamp-6 leading-relaxed">
                    {tpl.template}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(tpl.template, tpl.name)}
                      className="text-xs h-7 gap-1"
                    >
                      <Copy className="size-3" /> Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
                        toast.success("Template deleted");
                      }}
                      className="size-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Hashtags Tab */}
        <TabsContent value="hashtags" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Curated tag bundles optimized for discoverability across YouTube, TikTok, and Instagram.
            </p>
            <Button size="sm" onClick={() => setNewHashtagOpen(true)} className="gap-1.5">
              <Plus className="size-3.5" /> New Hashtag Set
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hashtagSets.map((set) => (
              <Card key={set.id} className="border shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                      <Hash className="size-4 text-primary" /> {set.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {set.tags.length} tags
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5 p-2 bg-muted/20 rounded-lg min-h-20">
                    {set.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(set.tags.join(" "), set.name)}
                      className="text-xs h-7 gap-1"
                    >
                      <Copy className="size-3" /> Copy All Tags
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setHashtagSets((prev) => prev.filter((s) => s.id !== set.id));
                        toast.success("Hashtag set deleted");
                      }}
                      className="size-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Brand Assets Tab */}
        <TabsContent value="brand" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Video Watermark</CardTitle>
                <CardDescription className="text-xs">
                  Transparent PNG logo burned into video corner during FFmpeg rendering.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 flex flex-col items-center justify-center border-2 border-dashed rounded-lg m-4 mt-0 bg-muted/10 text-center">
                <ImageIcon className="size-8 text-muted-foreground/60 mb-2" />
                <p className="text-xs font-medium">watermark_logo.png (Configured)</p>
                <p className="text-[10px] text-muted-foreground">Applied at 15% opacity in top-right</p>
              </CardContent>
            </Card>

            <Card className="border shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Brand Intro Bumper</CardTitle>
                <CardDescription className="text-xs">
                  Optional 2-second motion intro stitched to beginnings.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 flex flex-col items-center justify-center border-2 border-dashed rounded-lg m-4 mt-0 bg-muted/10 text-center">
                <Sparkles className="size-8 text-muted-foreground/60 mb-2" />
                <p className="text-xs font-medium">clipflow_bumper_1080p.mp4</p>
                <p className="text-[10px] text-muted-foreground">Duration: 2.1s</p>
              </CardContent>
            </Card>

            <Card className="border shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Standard Outro Call to Action</CardTitle>
                <CardDescription className="text-xs">
                  Closing end-card prompting likes &amp; follows.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 flex flex-col items-center justify-center border-2 border-dashed rounded-lg m-4 mt-0 bg-muted/10 text-center">
                <Layers className="size-8 text-muted-foreground/60 mb-2" />
                <p className="text-xs font-medium">standard_outro_card.mp4</p>
                <p className="text-[10px] text-muted-foreground">Duration: 3.0s</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Template Modal */}
      <Dialog open={newTemplateOpen} onOpenChange={setNewTemplateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Caption Template</DialogTitle>
            <DialogDescription>
              Create a reusable caption pattern with placeholder variables.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nt-name">Template Name</Label>
              <Input
                id="nt-name"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                placeholder="e.g. Weekly Roundup"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nt-content">Template Body</Label>
              <Textarea
                id="nt-content"
                value={tplContent}
                onChange={(e) => setTplContent(e.target.value)}
                rows={6}
                placeholder="Type your caption here. Use {{title}} or {{topic}} as placeholders..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTemplateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={!tplName.trim() || !tplContent.trim()}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Hashtag Set Modal */}
      <Dialog open={newHashtagOpen} onOpenChange={setNewHashtagOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Hashtag Set</DialogTitle>
            <DialogDescription>
              Save a bundle of hashtags to quickly attach to your posts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nh-name">Set Name</Label>
              <Input
                id="nh-name"
                value={htName}
                onChange={(e) => setHtName(e.target.value)}
                placeholder="e.g. Fitness &amp; Diet"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nh-tags">Hashtags (Space or comma separated)</Label>
              <Textarea
                id="nh-tags"
                value={htTags}
                onChange={(e) => setHtTags(e.target.value)}
                rows={4}
                placeholder="#fitness #workout #healthylifestyle #gym"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewHashtagOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateHashtagSet} disabled={!htName.trim() || !htTags.trim()}>
              Save Hashtag Set
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
