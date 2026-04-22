import apiClient from "./apiClient";

const unwrapResponse = (res) => res?.data?.data ?? res?.data ?? null;

export const normalizeWishlistItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.wishlist)) return data.wishlist;
  return [];
};

export const getWishlistProduct = (item) =>
  item?.product || item?.productDetail || item?.productDto || item;

export const getWishlistProductId = (item) => {
  const product = getWishlistProduct(item);

  return (
    item?.productId ||
    item?.product?._id ||
    item?.product?.id ||
    product?._id ||
    product?.id ||
    item?._id ||
    item?.id ||
    null
  );
};

export const getWishlistApi = async () => {
  const res = await apiClient.get("/wishlist");
  return unwrapResponse(res);
};

export const addToWishlistApi = async (productId) => {
  const res = await apiClient.post(`/wishlist/${productId}`);
  return unwrapResponse(res);
};

export const removeFromWishlistApi = async (productId) => {
  const res = await apiClient.delete(`/wishlist/${productId}`);
  return unwrapResponse(res);
};

export const checkWishlistApi = async (productId) => {
  const res = await apiClient.get(`/wishlist/${productId}/check`);
  const data = unwrapResponse(res);

  if (typeof data === "boolean") return data;
  if (typeof data === "string") {
    return ["true", "1", "yes"].includes(data.toLowerCase());
  }

  return Boolean(
    data?.isWishlisted ??
      data?.wishlisted ??
      data?.inWishlist ??
      data?.favorite ??
      data?.exists ??
      data?.liked ??
      false,
  );
};
