import apiClient from "./apiClient";

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
