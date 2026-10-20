export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  timestamp?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}
