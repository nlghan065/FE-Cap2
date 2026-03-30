import apiClient from "./apiClient";

/* ================= HELPER ================= */
const cleanParams = (params) => {
  Object.keys(params).forEach((key) => {
    if (
      params[key] === "" ||
      params[key] === null ||
      params[key] === undefined
    ) {
      delete params[key];
    }
  });
  return params;
};

/* ================= SEARCH + FILTER ================= */
export const searchProductsApi = async ({
  page = 0,
  size = 20,
  keyword,
  category,
  minPrice,
  maxPrice,
  inStock,
  sortBy,
  sortDir,
} = {}) => {
  try {
    const params = cleanParams({
      page,
      size,
      query: keyword, // 🔥 BE dùng query
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock:
        inStock === "true" ? true : inStock === "false" ? false : undefined,
      sortBy,
      sortDir,
    });

    const res = await apiClient.get("/products/search", { params });
    const data = res?.data?.data;

    return {
      content: data?.content || [],
      page: data?.page || 0,
      totalPages: data?.totalPages || 1,
      totalElements: data?.totalElements || 0,
    };
  } catch (error) {
    console.error("Search products error:", error);
    return { content: [], totalPages: 1 };
  }
};

/* ================= GET ALL ================= */
export const getProductsApi = async ({ page = 0, size = 20 } = {}) => {
  try {
    const res = await apiClient.get("/products", { params: { page, size } });
    const data = res?.data?.data;

    return {
      content: data?.content || [],
      totalPages: data?.totalPages || 1,
    };
  } catch (error) {
    console.error("Get products error:", error);
    return { content: [], totalPages: 1 };
  }
};

/* ================= GET DETAIL ================= */
export const getProductByIdApi = async (id) => {
  try {
    const res = await apiClient.get(`/products/${id}`);
    return res?.data?.data;
  } catch (error) {
    console.error("Get product detail error:", error);
    return null;
  }
};
