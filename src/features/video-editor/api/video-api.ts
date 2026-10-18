import { apiClient } from "@/lib/api-client";

export type AspectRatio = "PORTRAIT_9_16" | "LANDSCAPE_16_9" | "SQUARE_1_1";
export type VideoStatus = "DRAFT" | "PROCESSING" | "COMPLETED" | "FAILED";
export type RenderJobStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";

export interface VideoProjectRequest {
  title: string;
  scriptText?: string;
  durationSeconds?: number;
  aspectRatio: AspectRatio;
  voice?: string;
  audioUrl?: string;
}

export interface VideoProjectResponse {
  id: string;
  title: string;
  scriptText?: string;
  status: VideoStatus;
  durationSeconds?: number;
  aspectRatio: AspectRatio;
  voice?: string;
  audioUrl?: string;
  outputUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface RenderJobResponse {
  jobId: string;
  status: RenderJobStatus;
  progressPercentage: number;
  errorMessage?: string;
}

export interface AudioUploadResponse {
  audioUrl: string;
  filename: string;
}

export interface ClonedVoiceResponse {
  id: string;
  name: string;
  baseVoice: string;
  audioSampleUrl: string;
  createdAt: string;
}

export const videoApi = {
  list: (page = 0, size = 20) =>
    apiClient.get<PageResponse<VideoProjectResponse>>(`/videos?page=${page}&size=${size}`),
  get: (id: string) =>
    apiClient.get<VideoProjectResponse>(`/videos/${id}`),
  create: (body: VideoProjectRequest) =>
    apiClient.post<VideoProjectResponse, VideoProjectRequest>("/videos", body),
  update: (id: string, body: VideoProjectRequest) =>
    apiClient.put<VideoProjectResponse, VideoProjectRequest>(`/videos/${id}`, body),
  delete: (id: string) =>
    apiClient.delete(`/videos/${id}`),
  requestRender: (id: string) =>
    apiClient.post<RenderJobResponse>(`/videos/${id}/render`),
  getJob: (jobId: string) =>
    apiClient.get<RenderJobResponse>(`/videos/render-jobs/${jobId}`),
  uploadAudio: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<AudioUploadResponse, FormData>("/videos/upload-audio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  listClonedVoices: () =>
    apiClient.get<ClonedVoiceResponse[]>("/voices/cloned"),
  cloneVoice: (name: string, baseVoice: string, file: File) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("baseVoice", baseVoice);
    formData.append("file", file);
    return apiClient.post<ClonedVoiceResponse, FormData>("/voices/clone", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteClonedVoice: (id: string) =>
    apiClient.delete(`/voices/cloned/${id}`),
};
