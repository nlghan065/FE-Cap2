import apiClient from "./apiClient";

export const createVnpayPaymentApi = async (orderId) => {
  try {
    const res = await apiClient.post(
      `/payments/vnpay/create/${orderId}`, // 👈 đúng URL
    );

    return res.data.data;
  } catch (error) {
    console.error("VNPay API error:", error.response?.data || error);
    throw error;
  }
};
