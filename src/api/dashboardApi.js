import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000",
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

export const getRevenueMonthlyApi = async (months = 12) => {
  try {
    console.log("CALL REVENUE MONTHLY API");

    const res = await apiClient.get(
      `/admin/dashboard/revenue/monthly?months=${months}`,
    );

    console.log("Revenue monthly:", res.data);

    return res.data.data;
  } catch (error) {
    console.error("Revenue API error:", error.response?.data || error);
    throw error;
  }
};

export const getOrderStatusSummaryApi = async () => {
  try {
    console.log("CALL ORDER STATUS SUMMARY API");

    const res = await apiClient.get("/admin/dashboard/orders/status-summary");

    console.log("Order status response:", res.data);

    return res.data.data;
  } catch (error) {
    console.error("Order status API error:", error);
    throw error;
  }
};
export const getDashboardOverviewApi = async () => {
  try {
    console.log("CALL DASHBOARD OVERVIEW API");

    const res = await apiClient.get("/admin/dashboard/overview");

    console.log("Overview response:", res.data);

    return res.data.data;
  } catch (error) {
    console.error("Overview API error:", error.response?.data || error);
    throw error;
  }
};
