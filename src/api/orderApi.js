import apiClient from "./apiClient";

// 🔥 CREATE ORDER
export const createOrderApi = async (data) => {
  try {
    const res = await apiClient.post("/orders", data);
    return res.data.data;
  } catch (error) {
    console.error("Create Order API error:", error.response?.data || error);
    throw error;
  }
};

// 🔥 GET LIST ORDERS
export const getOrdersApi = async (page = 0, size = 10) => {
  try {
    const res = await apiClient.get(`/orders?page=${page}&size=${size}`);
    return res.data.data;
  } catch (error) {
    console.error("Get Orders API error:", error.response?.data || error);
    throw error;
  }
};

// 🔥 CANCEL ORDER
export const cancelOrderApi = async (orderId) => {
  try {
    const res = await apiClient.post(`/orders/${orderId}/cancel`);
    return res.data.data;
  } catch (error) {
    console.error("Cancel Order API error:", error.response?.data || error);
    throw error;
  }
};
// 🔥 GET ORDER BY ID
export const getOrderByIdApi = async (orderId) => {
  try {
    const res = await apiClient.get(`/orders/${orderId}`);
    return res.data.data;
  } catch (error) {
    console.error("Get Order By ID API error:", error.response?.data || error);
    throw error;
  }
};
