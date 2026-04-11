import { getProductByIdApi } from "../api/productApi";
import { resolveImageUrl } from "./imageUrl";

const getRawOrderItemImage = (item) =>
  item?.resolvedProductImage ||
  item?.images?.[0] ||
  item?.productImage ||
  item?.image ||
  item?.thumbnail ||
  item?.product?.images?.[0] ||
  item?.product?.image ||
  item?.product?.productImage ||
  null;

const getOrderItemProductId = (item) =>
  item?.productId ||
  item?.product?.id ||
  item?.product?._id ||
  item?.id ||
  null;

export const getResolvedOrderItemImage = (item) =>
  resolveImageUrl(getRawOrderItemImage(item));

export async function hydrateOrderItemsWithImages(
  items = [],
  cache = new Map(),
) {
  return Promise.all(
    items.map(async (item) => {
      const currentImage = getResolvedOrderItemImage(item);
      if (currentImage) {
        return { ...item, resolvedProductImage: currentImage };
      }

      const productId = getOrderItemProductId(item);
      if (!productId) {
        return item;
      }

      if (cache.has(productId)) {
        return {
          ...item,
          resolvedProductImage: cache.get(productId),
        };
      }

      try {
        const product = await getProductByIdApi(productId);
        const resolvedImage = resolveImageUrl(
          product?.images?.[0] ||
            product?.image ||
            product?.productImage ||
            product?.thumbnail,
        );

        cache.set(productId, resolvedImage || null);

        return {
          ...item,
          resolvedProductImage: resolvedImage || null,
        };
      } catch (error) {
        console.error("Hydrate order item image error:", error);
        cache.set(productId, null);
        return item;
      }
    }),
  );
}
