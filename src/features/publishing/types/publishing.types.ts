export const PLATFORMS = [
  "YOUTUBE_SHORTS",
  "TIKTOK",
  "INSTAGRAM_REELS",
  "FACEBOOK",
  "LINKEDIN",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  YOUTUBE_SHORTS: "YouTube",
  TIKTOK: "TikTok",
  INSTAGRAM_REELS: "Instagram",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
};

export const PLATFORM_COLORS: Record<
  Platform,
  { bg: string; text: string; border: string }
> = {
  YOUTUBE_SHORTS: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/30",
  },
  TIKTOK: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
  INSTAGRAM_REELS: {
    bg: "bg-pink-500/10",
    text: "text-pink-500",
    border: "border-pink-500/30",
  },
  FACEBOOK: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  LINKEDIN: { bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/30" },
};

export type PostStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "CANCELLED";

export type PublishingStatus = PostStatus;

export type AccountConnectionStatus = "CONNECTED" | "NEEDS_RECONNECT" | "ERROR";

export type WorkspaceRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export interface SocialAccountDto {
  id: string;
  platform: Platform;
  accountName: string;
  avatarUrl?: string;
  status: AccountConnectionStatus;
  tokenExpiresAt?: string;
  accountType?: "PERSONAL" | "BUSINESS" | "CREATOR" | "COMPANY_PAGE";
  connectedAt: string;
  followersCount?: number;
  viewsCount?: number;
  videosCount?: number;
}

export interface YouTubeOptions {
  category: string;
  privacy: "PUBLIC" | "UNLISTED" | "PRIVATE";
  madeForKids: boolean;
  videoFormat?: "SHORTS" | "STANDARD_VIDEO";
  focusKeyword: string;
  hasChapters: boolean;
  hasLink: boolean;
}

export interface TikTokOptions {
  commercialContent: boolean;
  aiGenerated: boolean;
  privacy: "PRIVATE" | "PUBLIC";
}

export interface InstagramOptions {
  shareToFeed: boolean;
  altText: string;
  coverUrl?: string;
}

export interface FacebookOptions {
  targetPage: string;
  audience: "PUBLIC" | "RESTRICTED";
}

export interface LinkedInOptions {
  targetType: "PERSONAL_PROFILE" | "COMPANY_PAGE";
  companyPageId?: string;
}

export interface PlatformConfig {
  title: string;
  caption: string;
  hashtags: string[];
  thumbnailUrl?: string;
  youtube?: YouTubeOptions;
  tiktok?: TikTokOptions;
  instagram?: InstagramOptions;
  facebook?: FacebookOptions;
  linkedin?: LinkedInOptions;
}

export interface PublishingTask {
  id: string;
  projectId?: string;
  videoProjectId?: string;
  videoTitle?: string;
  socialAccountId?: string;
  channelName?: string;
  platform: Platform;
  status: PostStatus;
  title?: string;
  caption?: string;
  hashtags?: string[];
  scheduledAt?: string | null;
  scheduledTime?: string | null;
  publishedAt?: string | null;
  externalUrl?: string;
  publicPostUrl?: string;
  errorMessage?: string;
  retryCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchedulePostRequest {
  videoProjectId: string;
  platforms?: Platform[];
  title?: string;
  caption?: string;
  hashtags?: string[];
  thumbnailUrl?: string;
  isShort?: boolean;
  scheduledTime?: string;
}

export interface PublishNowRequest extends Omit<SchedulePostRequest, "scheduledTime"> {}

export interface ConnectAccountResponse {
  authorizationUrl: string;
}

export interface AnalyticsSnapshot {
  id: string;
  platform: Platform;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTimeSeconds?: number;
  reach?: number;
  impressions?: number;
  timestamp: string;
}
