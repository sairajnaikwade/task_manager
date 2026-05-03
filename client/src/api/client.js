import axios from "axios";
import { generateTraceId } from "../utils/traceId";

const client = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor ─────────────────────────────────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  config.headers["ver"] = "1";
  config.headers["X-TaskManager-Trace-ID"] = generateTraceId();
  return config;
});

// ─── Response interceptor ────────────────────────────────────────────────────
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Transport-level errors only (network down, 5xx)
    // Application errors arrive as HTTP 200 with status: "error"
    return Promise.reject(error);
  }
);

export default client;
