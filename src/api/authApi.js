import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000", // gọi thẳng BE
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
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
