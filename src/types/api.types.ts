/** Spring Data `Page<T>` style response. */
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** Normalized error shape thrown by the API client. */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  timestamp?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}
