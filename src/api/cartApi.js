import apiClient from "./apiClient";

// 🔥 Lấy giỏ hàng
export const getCartApi = async () => {
  try {
    const res = await apiClient.get("/cart");
    return res.data.data; // items, totalItems, totalPrice
  } catch (error) {
    console.error("Get Cart API error:", error.response?.data || error);
    throw error;
  }
};

// 🔥 Cập nhật số lượng sản phẩm (dùng POST)
export const updateCartApi = async (productId, quantity) => {
  try {
    const res = await apiClient.post("/cart/items", { productId, quantity });
    return res.data.data;
  } catch (error) {
    console.error("Update Cart API error:", error.response?.data || error);
    throw error;
  }
};

// 🔥 Xóa sản phẩm khỏi giỏ
export const deleteCartApi = async (productId) => {
  try {
    const res = await apiClient.delete(`/cart/items/${productId}`);
    return res.data.data;
  } catch (error) {
    console.error("Delete Cart API error:", error.response?.data || error);
    throw error;
  }
};

// 🔥 Thêm sản phẩm vào giỏ
export const addToCartApi = async ({ productId, quantity }) => {
  try {
    const res = await apiClient.post("/cart/items", { productId, quantity });
    return res.data.data;
  } catch (error) {
    console.error("Add To Cart API error:", error.response?.data || error);
    throw error;
  }
};
