import axios from "axios";
import { normalizeErrorResponse } from "../utils/errorMessage";

// ================= BASE CLIENT =================
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://capstone02.onrender.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= REQUEST INTERCEPTOR =================
apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ================= RESPONSE INTERCEPTOR =================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    normalizeErrorResponse(error);
    console.error("API ERROR:", error.response?.data || error);

    if (error.response?.status === 401) {
      console.warn("Unauthorized → redirect login");

      // 👉 tuỳ bạn:
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default apiClient;
