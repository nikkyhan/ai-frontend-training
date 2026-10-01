import { isAxiosError } from "axios";
import type { ApiErrorBody } from "@/types/api";

export interface ParsedApiError {
  status: number | null;
  message: string;
  fieldErrors: Record<string, string>;
}

export const NETWORK_ERROR_MESSAGE = "Cannot reach the server. Please check your connection and try again.";

/** Turns any thrown error into a message the UI can show. Never hides the API's own message. */
export function parseApiError(error: unknown): ParsedApiError {
  if (isAxiosError<ApiErrorBody>(error)) {
    // Server answered with our standard error body
    if (error.response?.data?.message) {
      return {
        status: error.response.status,
        message: error.response.data.message,
        fieldErrors: error.response.data.errors ?? {},
      };
    }
    // No response at all: backend down, CORS, timeout
    if (!error.response) {
      return { status: null, message: NETWORK_ERROR_MESSAGE, fieldErrors: {} };
    }
    return { status: error.response.status, message: `Request failed (${error.response.status})`, fieldErrors: {} };
  }
  if (error instanceof MockApiError) {
    return { status: error.status, message: error.message, fieldErrors: error.fieldErrors };
  }
  if (error instanceof Error) {
    return { status: null, message: error.message, fieldErrors: {} };
  }
  return { status: null, message: "Something went wrong", fieldErrors: {} };
}

/** Error thrown by the mock service so mock mode behaves like the real API. */
export class MockApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}
