"use client";

import { useState } from "react";
import { toast } from "sonner";
import { type WorkspaceRole } from "@/features/publishing/types/publishing.types";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  joinedAt: string;
  avatar: string;
}

interface PendingApproval {
  id: string;
  title: string;
  submittedBy: string;
  submittedAt: string;
  platforms: string[];
  scheduledFor: string;
  status: "PENDING_APPROVAL" | "CHANGES_REQUESTED" | "APPROVED";
  comment?: string;
}

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "tm-owner",
    name: "Workspace Owner",
    email: "creator@clipflow.app",
    role: "OWNER",
    joinedAt: "Active",
    avatar: "WO",
  },
];

const INITIAL_APPROVALS: PendingApproval[] = [];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [approvals, setApprovals] = useState<PendingApproval[]>(INITIAL_APPROVALS);

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("EDITOR");

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  const handleSendInvite = () => {
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      joinedAt: "Just now",
      avatar: inviteName.trim().slice(0, 2).toUpperCase(),
    };
    setMembers((prev) => [...prev, newMember]);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    setInviteName("");
    setInviteModalOpen(false);
  };

  const handleApprove = (id: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "APPROVED" } : a)),
    );
    toast.success("Post approved! It will proceed to automated scheduling.");
    setReviewModalOpen(false);
  };

  const handleRequestChanges = (id: string) => {
    if (!reviewComment.trim()) {
      toast.error("Please provide feedback for the requested changes.");
      return;
    }
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "CHANGES_REQUESTED", comment: reviewComment } : a,
      ),
    );
    toast.info("Changes requested. The editor has been notified.");
    setReviewModalOpen(false);
    setReviewComment("");
  };

  const roleBadge = (role: WorkspaceRole) => {
    const map = {
      OWNER: {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/30",
      },
      ADMIN: {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/30",
      },
      EDITOR: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
      },
      VIEWER: {
        bg: "bg-neutral-500/10",
        text: "text-neutral-400",
        border: "border-neutral-500/30",
      },
    };
    const c = map[role];
    return (
      <Badge variant="outline" className={cn("text-[11px]", c.bg, c.text, c.border)}>
        {role}
      </Badge>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
            <Users className="size-6 text-primary" /> Team &amp; Approval Governance
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage workspace roles (Owner, Admin, Editor, Viewer) and review publishing
            requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setInviteModalOpen(true)}
            className="gap-1.5 font-medium"
          >
            <UserPlus className="size-4" /> Invite Member
          </Button>
        </div>
      </div>

      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList className="h-10">
          <TabsTrigger value="approvals" className="gap-2">
            <ShieldCheck className="size-4" /> Pending Approvals (
            {approvals.filter((a) => a.status === "PENDING_APPROVAL").length})
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="size-4" /> Workspace Members ({members.length})
          </TabsTrigger>
        </TabsList>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Workspaces requiring approval prevent unreviewed posts from publishing
              automatically.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {approvals.map((appr) => (
              <Card key={appr.id} className="border shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        {appr.title}
                      </CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Submitted by{" "}
                        <span className="font-medium text-foreground">
                          {appr.submittedBy}
                        </span>{" "}
                        • {appr.submittedAt}
                      </p>
                    </div>
                    {appr.status === "PENDING_APPROVAL" && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-500"
                      >
                        <Clock className="size-3" /> Needs Review
                      </Badge>
                    )}
                    {appr.status === "CHANGES_REQUESTED" && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-rose-500/30 bg-rose-500/10 text-[11px] text-rose-500"
                      >
                        <AlertCircle className="size-3" /> Changes Requested
                      </Badge>
                    )}
                    {appr.status === "APPROVED" && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-500"
                      >
                        <CheckCircle2 className="size-3" /> Approved
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 rounded-lg bg-muted/30 p-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Target Platforms:</span>
                      <span className="font-semibold">{appr.platforms.join(", ")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Scheduled Time:</span>
                      <span className="font-semibold text-primary">
                        {appr.scheduledFor}
                      </span>
                    </div>
                  </div>

                  {appr.comment && (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
                      <strong>Admin Feedback:</strong> {appr.comment}
                    </div>
                  )}

                  {appr.status === "PENDING_APPROVAL" && (
                    <div className="flex items-center gap-2 border-t pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(appr.id)}
                        className="h-8 flex-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="mr-1 size-3" /> Approve Post
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedApproval(appr);
                          setReviewModalOpen(true);
                        }}
                        className="h-8 text-xs"
                      >
                        <MessageSquare className="mr-1 size-3" /> Request Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Active Workspace Collaborators
              </CardTitle>
              <CardDescription>
                Assign granular permissions to isolate client data or agency social
                channels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        Joined {member.joinedAt}
                      </span>
                      {roleBadge(member.role)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Member Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-primary" /> Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Invite a creator, social media manager, or client to your ClipFlow
              workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="inv-name">Full Name</Label>
              <Input
                id="inv-name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Rachel Green"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-email">Work Email</Label>
              <Input
                id="inv-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Workspace Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as WorkspaceRole)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="ADMIN">
                    Admin (Manage members, approve posts)
                  </SelectItem>
                  <SelectItem value="EDITOR">
                    Editor (Upload, draft, request approval)
                  </SelectItem>
                  <SelectItem value="VIEWER">
                    Viewer (Read-only access to analytics)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={!inviteEmail.trim() || !inviteName.trim()}
            >
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Feedback Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Provide clear feedback to the editor regarding what needs to be adjusted
              before publication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="rf-comment">Feedback &amp; Recommendations</Label>
            <Textarea
              id="rf-comment"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              placeholder="e.g. Please update the first line hook and add 3 hashtags..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedApproval && handleRequestChanges(selectedApproval.id)
              }
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
