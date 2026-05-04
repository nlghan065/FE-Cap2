import apiClient from "./apiClient";

export const trackBehaviorApi = async ({
  productId,
  designRequestId,
  eventType,
  rating,
  rankingScore,
}) => {
  if (!productId || !eventType) return false;

  try {
    await apiClient.post("/api/behaviors", {
      productId,
      designRequestId,
      eventType,
      rating,
      rankingScore,
    });
    return true;
  } catch (error) {
    console.error("Track behavior error:", error);
    return false;
  }
};
