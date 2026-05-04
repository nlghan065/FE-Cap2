import apiClient from "./apiClient";

const unwrapResponse = (res) => res?.data?.data ?? res?.data ?? null;

export const createReviewApi = async ({
  productId,
  orderCode,
  rating,
  comment,
}) => {
  try {
    const res = await apiClient.post("/reviews", {
      productId,
      orderCode,
      rating,
      comment,
    });

    return unwrapResponse(res);
  } catch (error) {
    console.error("Create review error:", error.response?.data || error);
    throw error;
  }
};

export const getReviewsByProductApi = async ({
  productId,
  page = 0,
  size = 10,
}) => {
  try {
    const res = await apiClient.get(`/reviews/product/${productId}`, {
      params: { page, size },
    });

    const data = res?.data?.data;

    return {
      content: data?.content || [],
      totalPages: data?.totalPages || 1,
      totalElements: data?.totalElements || 0,
    };
  } catch (error) {
    console.error("Get reviews error:", error);
    return { content: [], totalPages: 1 };
  }
};

export const getReviewsAdminApi = async ({ page = 0, size = 10 } = {}) => {
  try {
    const res = await apiClient.get("/reviews/all", {
      params: { page, size },
    });

    const data = res?.data?.data;

    return {
      content: data?.content || [],
      page: data?.page || 0,
      size: data?.size || size,
      totalPages: data?.totalPages || 1,
      totalElements: data?.totalElements || 0,
      first: Boolean(data?.first),
      last: Boolean(data?.last),
    };
  } catch (error) {
    console.error("Get admin reviews error:", error.response?.data || error);
    throw error;
  }
};

export const getReviewSummaryByProductApi = async (productId) => {
  try {
    const res = await apiClient.get(`/reviews/product/${productId}/summary`);
    return unwrapResponse(res);
  } catch (error) {
    console.error("Get review summary error:", error);
    return null;
  }
};

export const deleteReviewApi = async (reviewId) => {
  try {
    const res = await apiClient.delete(`/reviews/${reviewId}`);
    return unwrapResponse(res);
  } catch (error) {
    console.error("Delete review error:", error.response?.data || error);
    throw error;
  }
};
