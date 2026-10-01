// Shapes of the backend-go response envelopes.

export interface ApiListResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiItemResponse<T> {
  data: T;
  message?: string;
}

export interface ApiMessageResponse {
  message: string;
}

/** Error body: {statusCode, message, errors?: {field: message}} */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  errors?: Record<string, string>;
}
