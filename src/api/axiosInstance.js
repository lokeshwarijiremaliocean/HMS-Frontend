import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Safely retrieve and sanitize the JWT token from the application's localStorage.
 * Handles storage keys, removes surrounding quotes/spaces, handles JSON object strings,
 * strips redundant "Bearer " prefixes, and discards literal "undefined"/"null" values.
 */
export const getAuthToken = () => {
  try {
    let token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt");

    if (!token) return null;

    token = String(token).trim();

    // Strip wrapping double or single quotes
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      token = token.slice(1, -1).trim();
    }

    // If stored as a JSON object string (e.g. {"access_token": "..."})
    if (token.startsWith("{") && token.endsWith("}")) {
      try {
        const parsed = JSON.parse(token);
        token =
          parsed.access_token ||
          parsed.token ||
          parsed.data?.access_token ||
          parsed.data?.token ||
          token;
      } catch (e) {
        // Not valid JSON, retain as is
      }
    }

    // Strip redundant "Bearer " prefix if already present
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7).trim();
    }

    // Filter out falsy literal string values
    if (
      token === "undefined" ||
      token === "null" ||
      token === "[object Object]" ||
      token === ""
    ) {
      return null;
    }

    return token;
  } catch (err) {
    console.error("Error reading auth token from localStorage:", err);
    return null;
  }
};

// Request interceptor to automatically attach valid JWT access_token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers?.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to log/catch unauthorized 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("401 Unauthorized: Invalid or expired token for request to:", error.config?.url);
    }
    return Promise.reject(error);
  }
);

/**
 * Safely extracts human-readable error message from backend responses,
 * supporting backend custom AppException format ({ error: { message: ... } }),
 * standard FastAPI validation errors ({ detail: ... }), and network errors.
 */
export const getApiErrorMessage = (err, fallbackMessage = "An error occurred. Please try again.") => {
  if (!err) return fallbackMessage;

  // 1. Backend Custom AppException structure: { success: false, error: { code: "...", message: "..." } }
  if (err.response?.data?.error?.message && typeof err.response.data.error.message === "string") {
    return err.response.data.error.message;
  }

  // 2. Direct message property: { success: false, message: "..." }
  if (err.response?.data?.message && typeof err.response.data.message === "string") {
    return err.response.data.message;
  }

  // 3. FastAPI HTTPException / ValidationError detail property: { detail: "..." } or { detail: [...] }
  if (err.response?.data?.detail) {
    const detail = err.response.data.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((d) => {
          if (typeof d === "string") return d;
          if (d.msg) {
            const field = d.loc ? d.loc.slice(-1)[0] : "";
            return field && field !== "body" ? `${field}: ${d.msg}` : d.msg;
          }
          return JSON.stringify(d);
        })
        .join("; ");
    }
    if (typeof detail === "object") {
      return detail.message || JSON.stringify(detail);
    }
  }

  // 4. Status code specific handling
  if (err.response?.status === 401) {
    return "Invalid or expired authentication session. Please log in again.";
  }
  if (err.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (err.response?.status === 404) {
    return "The requested record or endpoint was not found.";
  }

  // 5. Network / Server connection errors
  if (err.code === "ERR_NETWORK" || !err.response) {
    return "Cannot connect to backend server. Please verify the backend service is running.";
  }

  if (err.message && typeof err.message === "string" && err.message !== "Network Error") {
    return err.message;
  }

  return fallbackMessage;
};

export default apiClient;

