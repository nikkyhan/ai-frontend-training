import axios from "axios";
import { API_BASE_URL } from "./api-integration";

// Shared axios client for every service in src/api-services.
export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});
