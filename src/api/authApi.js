import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000", // gọi thẳng BE
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
/* ================= REGISTER ================= */

export const registerApi = async (data) => {
  try {
    console.log("CALL REGISTER API");
    console.log("Register payload:", data);

    const res = await apiClient.post("/users", data);

    console.log("Register success:", res.data);

    return res.data;
  } catch (error) {
    console.error("Register error:", error.response?.data || error);
    throw error;
  }
};

/* ================= LOGIN ================= */

export const loginApi = async (data) => {
  try {
    console.log("CALL LOGIN API");
    console.log("Login payload:", data);

    const res = await apiClient.post("/auth/login", data);

    console.log("Login success:", res.data);

    return res.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error);
    throw error;
  }
};

/* ================= FORGOT PASSWORD ================= */

export const forgotPasswordApi = async (data) => {
  try {
    console.log("CALL FORGOT PASSWORD API");
    console.log("Forgot password payload:", data);

    const res = await apiClient.post("/auth/forgot-password", data);

    console.log("OTP sent response:", res.data);

    return res.data;
  } catch (error) {
    console.error("Forgot password error:", error.response?.data || error);
    throw error;
  }
};
export const verifyOtpApi = (data) => {
  return axios.post("/auth/verify-otp", data);
};

/* ================= RESET PASSWORD ================= */

export const resetPasswordApi = async (data) => {
  try {
    console.log("CALL RESET PASSWORD API");
    console.log("Reset password payload:", data);

    const res = await apiClient.post("/auth/reset-password", {
      email: data.email,
      otp: data.otp,
      newPassword: data.newPassword,
    });

    console.log("Reset password success:", res.data);

    return res.data;
  } catch (error) {
    console.error("Reset password error:", error.response?.data || error);
    throw error;
  }
};

/* ================= CITIES ================= */

export const getCitiesApi = async () => {
  try {
    console.log("CALL GET CITIES API");

    const res = await apiClient.get("/locations/provinces");

    console.log("Cities response:", res.data);

    return res.data.data;
  } catch (error) {
    console.error("Load cities error:", error.response?.data || error);
    throw error;
  }
};

/* ================= WARDS ================= */

export const getWardsApi = async (provinceId) => {
  try {
    console.log("CALL GET WARDS API:", provinceId);

    const res = await apiClient.get(`/locations/provinces/${provinceId}/wards`);

    console.log("Wards response:", res.data);

    return res.data.data;
  } catch (error) {
    console.error("Load wards error:", error.response?.data || error);
    throw error;
  }
};

/* ================= GET USER BY ID ================= */

export const getUserByIdApi = async (id) => {
  try {
    console.log("CALL GET USER API:", id);

    const res = await apiClient.get(`/users/${id}`);

    console.log("User info:", res.data);

    return res.data.data;
  } catch (error) {
    console.error("Get user error:", error.response?.data || error);
    throw error;
  }
};
