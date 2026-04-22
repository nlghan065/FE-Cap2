const REVIEW_STORAGE_KEY = "reviewed_orders_v1";

export const getOrderProductId = (item) =>
  item?.productId ||
  item?.product?.id ||
  item?.product?._id ||
  item?.product?.productId ||
  null;

const getOrderCode = (order) =>
  order?.orderCode || order?.code || order?.id || order?._id || null;

const getStoredReviews = () => {
  try {
    return JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const setStoredReviews = (value) => {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(value));
};

const hasBackendReviewFlag = (value) =>
  Boolean(
    value?.reviewed ||
      value?.isReviewed ||
      value?.hasReview ||
      value?.hasReviewed ||
      value?.reviewId ||
      value?.review?.id ||
      value?.review?._id ||
      value?.reviewStatus === "REVIEWED",
  );

export const markOrderItemReviewed = (order, item) => {
  const orderCode = getOrderCode(order);
  const productId = getOrderProductId(item);

  if (!orderCode || !productId) return;

  const stored = getStoredReviews();
  const reviewedIds = new Set((stored[orderCode] || []).map(String));

  reviewedIds.add(String(productId));
  stored[orderCode] = Array.from(reviewedIds);
  setStoredReviews(stored);

  window.dispatchEvent(
    new CustomEvent("reviewUpdated", {
      detail: { orderCode, productId },
    }),
  );
};

export const isOrderItemReviewed = (order, item) => {
  const orderCode = getOrderCode(order);
  const productId = getOrderProductId(item);

  if (hasBackendReviewFlag(item)) return true;
  if (order?.reviewedProductIds?.map(String).includes(String(productId))) {
    return true;
  }

  if (!orderCode || !productId) return false;

  const stored = getStoredReviews();
  return (stored[orderCode] || []).map(String).includes(String(productId));
};

export const getOrderReviewStats = (order) => {
  const items = order?.items || [];
  const productIds = Array.from(
    new Set(items.map((item) => getOrderProductId(item)).filter(Boolean)),
  );
  const reviewedIds = new Set();

  items.forEach((item) => {
    const productId = getOrderProductId(item);
    if (productId && isOrderItemReviewed(order, item)) {
      reviewedIds.add(String(productId));
    }
  });

  const reviewedCount = reviewedIds.size;
  const totalCount = productIds.length;
  const fullyReviewed =
    hasBackendReviewFlag(order) ||
    (totalCount > 0 && reviewedCount >= totalCount);

  return {
    fullyReviewed,
    reviewedCount: fullyReviewed ? totalCount : reviewedCount,
    totalCount,
  };
};
