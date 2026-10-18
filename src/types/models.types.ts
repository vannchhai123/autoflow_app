import type { Platform } from "@/features/publishing/types/publishing.types";

export type { Platform };

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

export type ProjectStatus =
  "DRAFT" | "GENERATING" | "READY" | "RENDERING" | "RENDERED" | "FAILED";

export interface VideoProject {
  id: string;
  title: string;
  topic: string;
  status: ProjectStatus;
  thumbnailUrl?: string;
  outputUrl?: string;
  durationSec: number;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccount {
  id: string;
  platform: Platform;
  handle: string;
  avatarUrl?: string;
  connected: boolean;
  tokenExpiresAt?: string;
}
