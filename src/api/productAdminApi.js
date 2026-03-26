import apiClient from "./apiClient";

// ================= LIST =================
export const getProductsAdminApi = async ({
  page = 0,
  size = 10,
  keyword = "",
} = {}) => {
  try {
    let url = "/admin/products";
    let params = { page, size };

    if (keyword && keyword.trim() !== "") {
      url = "/admin/products/search";
    }

    const res = await apiClient.get(url, { params });
    const data = res.data?.data;

    return {
      content: data?.content || [],
      totalPages: data?.totalPages || 1,
    };
  } catch (error) {
    console.error("Get products admin error:", error);
    return { content: [], totalPages: 1 };
  }
};

// ================= DETAIL =================
export const getProductAdminByIdApi = async (id) => {
  try {
    const res = await apiClient.get(`/admin/products/${id}`);
    return res.data?.data;
  } catch (error) {
    console.error("Get product detail error:", error);
    return null;
  }
};

// ================= SAVE (CREATE + UPDATE) =================
export const saveProductAdminApi = async (body) => {
  try {
    // ⚠️ đảm bảo có source để BE nhận diện update
    if (!body.sourceUrl || !body.sourceProvider) {
      console.warn("Thiếu sourceUrl hoặc sourceProvider → sẽ luôn tạo mới!");
    }

    const res = await apiClient.post("/admin/products", body);
    return res.data;
  } catch (error) {
    console.error("Save product error:", error);
    throw error;
  }
};

// ================= DELETE =================
export const deleteProductAdminApi = async (id) => {
  try {
    return await apiClient.delete(`/admin/products/${id}`);
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
};

// ================= BATCH DELETE =================
export const deleteProductsBatchApi = async (ids) => {
  try {
    return await apiClient.post("/admin/products/batch", { ids });
  } catch (error) {
    console.error("Batch delete error:", error);
    throw error;
  }
};

export const searchProductsAdminApi = async ({
  page = 0,
  size = 10,
  keyword,
  category,
  minPrice,
  maxPrice,
  inStock,
  sortBy,
  sortDir,
} = {}) => {
  try {
    const params = {
      page,
      size,
      query: keyword, // 🔥 FIX Ở ĐÂY
      category,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      sortDir,
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === "" ||
          params[key] === null ||
          params[key] === undefined) &&
        delete params[key],
    );

    const res = await apiClient.get("/admin/products/search", { params });

    const data = res.data?.data;

    return {
      content: data?.content || [],
      totalPages: data?.totalPages || 1,
    };
  } catch (error) {
    console.error("Search products error:", error);
    return { content: [], totalPages: 1 };
  }
};
