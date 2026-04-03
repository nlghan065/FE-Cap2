import apiClient from "./apiClient";

// 🔥 CREATE VNPAY PAYMENT
export const createVNPayPayment = async (orderId) => {
  try {
    const res = await apiClient.get(`/payments/vnpay/create/${orderId}`);
    return res.data.data;
  } catch (error) {
    console.error("VNPay API error:", error.response?.data || error);
    throw error;
  }
};
