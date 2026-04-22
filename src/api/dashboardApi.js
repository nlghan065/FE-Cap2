import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://capstone02.onrender.com",
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

export const getRecentOrdersApi = async (limit = 5) => {
  try {
    console.log("CALL RECENT ORDERS DASHBOARD API");

    const res = await apiClient.get("/admin/dashboard/orders/recent", {
      params: { limit },
    });

    console.log("Recent orders:", res.data);

    return res.data.data; // 🔥 trả thẳng list
  } catch (error) {
    console.error("Recent orders API error:", error.response?.data || error);
    throw error;
  }
};

export const getBestSellingProductsApi = async (limit = 5) => {
  try {
    console.log("CALL BEST SELLING PRODUCTS API");

    const res = await apiClient.get("/admin/dashboard/products/best-selling", {
      params: { limit },
    });

    console.log("Best selling products:", res.data);

    return res.data.data;
  } catch (error) {
    console.error("Best selling API error:", error.response?.data || error);
    throw error;
  }
};
