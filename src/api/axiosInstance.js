import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach JWT access_token from localStorage.
apiClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (token) {
      // Remove any wrapping quotes if stored as stringified JSON
      token = token.replace(/^"(.*)"$/, "$1");
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
