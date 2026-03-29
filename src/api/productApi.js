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
  size = 8,
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

      // ✅ match BE
      query: keyword,
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
      size: data?.size || size,
      totalElements: data?.totalElements || 0,
      totalPages: data?.totalPages || 1,
      first: data?.first ?? true,
      last: data?.last ?? true,
    };
  } catch (error) {
    console.error("Search products error:", error);
    return {
      content: [],
      totalPages: 1,
    };
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
