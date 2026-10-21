import { apiClient } from "@/lib/api-client";
import {
  type Platform,
  type SocialAccountDto,
  type PublishingTask,
  type SchedulePostRequest,
} from "../types/publishing.types";

export interface AnalyticsChannelPerformance {
  id: string;
  platform: Platform;
  channelName: string;
  avatarUrl: string;
  status: string;
  followers: number;
  publishedPosts: number;
  views: number;
  likes: number;
  shares: number;
  avgWatch: string;
  trend: string;
}

export interface AnalyticsDailyGrowth {
  date: string;
  day: string;
  posts: number;
  views: number;
}

export interface AnalyticsSummaryResponse {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollowers?: number;
  growthRate: string;
  connectedChannels?: number;
  publishedPosts?: number;
  scheduledPosts?: number;
  channels?: AnalyticsChannelPerformance[];
  dailyGrowth?: AnalyticsDailyGrowth[];
}

export interface PublishedChannelVideo {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  publicPostUrl: string;
  embedUrl?: string;
  publishedAt?: string;
  durationSeconds?: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  platform: Platform;
  channelName?: string;
  status: string;
}

export const publishingApi = {
  listAccounts: () => apiClient.get<SocialAccountDto[]>("/accounts"),

  listChannelVideos: () => apiClient.get<PublishedChannelVideo[]>("/accounts/videos"),

  deleteChannelVideo: (videoId: string) =>
    apiClient.delete<{ deleted: boolean; deletedFromSource: boolean }>(
      `/accounts/videos/${encodeURIComponent(videoId)}`,
    ),

  connectAccount: (platform: Platform) =>
    apiClient.post<{ authorizationUrl: string }>(`/accounts/connect/${platform}`),

  reconnectAccount: (id: string) =>
    apiClient.post<SocialAccountDto>(`/accounts/${id}/reconnect`),

  disconnectAccount: (id: string) => apiClient.delete(`/accounts/${id}`),

  schedulePost: (body: SchedulePostRequest) =>
    apiClient.post<PublishingTask[], SchedulePostRequest>("/posts/schedule", body),

  publishNow: (body: SchedulePostRequest) =>
    apiClient.post<PublishingTask[], SchedulePostRequest>("/posts/publish-now", body),

  listScheduled: () => apiClient.get<PublishingTask[]>("/posts/scheduled"),

  cancelTask: (id: string) => apiClient.delete(`/posts/${id}`),

  getAnalyticsSummary: () =>
    apiClient.get<AnalyticsSummaryResponse>("/posts/analytics/summary"),

  configureCredentials: (body: {
    platform: string;
    clientId: string;
    clientSecret: string;
  }) =>
    apiClient.post<{ success: boolean; configured: boolean }>(
      "/accounts/config/credentials",
      body,
    ),

  connectDemoAccount: (platform: Platform) =>
    apiClient.post<SocialAccountDto>(`/accounts/connect-demo/${platform}`),
};
