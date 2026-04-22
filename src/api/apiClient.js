import axios from "axios";

// ================= BASE CLIENT =================
const apiClient = axios.create({
  baseURL: "https://capstone02.onrender.com",
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
