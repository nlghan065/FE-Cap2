import apiClient from "./apiClient";

// ===== LIST =====
export const getOrdersAdminApi = async ({ page = 0, size = 10 } = {}) => {
  try {
    const res = await apiClient.get("/admin/orders", {
      params: { page, size },
    });

    const data = res.data?.data;

    return {
      content: data?.content || [],
      totalPages: data?.totalPages || 1,
    };
  } catch (e) {
    console.error("Get orders error:", e);
    return { content: [], totalPages: 1 };
  }
};

// ===== FILTER STATUS =====
export const getOrdersByStatusApi = async (
  status,
  { page = 0, size = 10 } = {},
) => {
  try {
    const res = await apiClient.get(`/admin/orders/status/${status}`, {
      params: { page, size },
    });

    const data = res.data?.data;

    return {
      content: data?.content || [],
      totalPages: data?.totalPages || 1,
    };
  } catch (e) {
    console.error("Filter status error:", e);
    return { content: [], totalPages: 1 };
  }
};

// ===== SEARCH =====
export const searchOrdersAdminApi = async (params = {}) => {
  try {
    Object.keys(params).forEach(
      (k) =>
        (params[k] === "" || params[k] === null || params[k] === undefined) &&
        delete params[k],
    );

    const res = await apiClient.get("/admin/orders/search", { params });

    const data = res.data?.data;

    return {
      content: data?.content || [],
      totalPages: data?.totalPages || 1,
    };
  } catch (e) {
    console.error("Search orders error:", e);
    return { content: [], totalPages: 1 };
  }
};

// ===== UPDATE STATUS =====
export const updateOrderStatusApi = async (id, status) => {
  try {
    const res = await apiClient.put(`/admin/orders/${id}/status`, {
      status,
    });
    return res.data;
  } catch (e) {
    console.error("Update status error:", e);
    throw e;
  }
};

// GET BY ID
export const getOrderByIdAdminApi = async (id) => {
  const res = await apiClient.get(`/admin/orders/${id}`);
  return res.data?.data;
};
