import apiClient from "./apiClient";

/* ================= GET PRODUCTS ================= */
export const getProductsApi = async (page = 0, size = 8) => {
  try {
    const res = await apiClient.get("/products", {
      params: { page, size },
    });

    console.log("FULL RESPONSE:", res.data);

    const data = res?.data?.data;

    return {
      content: data?.content || [],
      page: data?.page || 0,
      size: data?.size || size,
      totalElements: data?.totalElements || 0,
      totalPages: data?.totalPages || 0,
      first: data?.first ?? true,
      last: data?.last ?? true,
    };
  } catch (error) {
    console.error("Get products error:", error.response?.data || error);

    return {
      content: [],
      page: 0,
      size: size,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
  }
};

/* ================= GET PRODUCT DETAIL ================= */
export const getProductByIdApi = async (id) => {
  try {
    const res = await apiClient.get(`/products/${id}`);

    console.log("PRODUCT DETAIL:", res.data);

    return res?.data?.data || null;
  } catch (error) {
    console.error("Get product detail error:", error.response?.data || error);

    return null;
  }
};

/* ================= SEARCH ================= */
export const searchProductsApi = async ({
  page = 0,
  size = 8,
  keyword = "",
  category = "",
  style = "",
}) => {
  try {
    const res = await apiClient.get("/products", {
      params: { page, size, keyword, category, style },
    });

    const data = res?.data?.data;

    return {
      content: data?.content || [],
      page: data?.page || 0,
      size: data?.size || size,
      totalElements: data?.totalElements || 0,
      totalPages: data?.totalPages || 0,
      first: data?.first ?? true,
      last: data?.last ?? true,
    };
  } catch {
    return {
      content: [],
      page: 0,
      size,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
  }
};
