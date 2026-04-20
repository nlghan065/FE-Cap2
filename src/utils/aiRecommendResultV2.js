const DEFAULT_PALETTE = [
  { name: "Nen chinh", color: "#f3efe6", percentage: 58 },
  { name: "Trung tinh", color: "#837b73", percentage: 27 },
  { name: "Nhan", color: "#cf5c36", percentage: 15 },
];

const DEFAULT_ROOM_ANALYSIS = {
  width: "",
  length: "",
  height: "",
  reasoning: "Chua co du lieu",
  area: "Chua co du lieu",
  ceiling: "Chua co du lieu",
  windows: "Chua co du lieu",
  naturalLight: "Chua co du lieu",
  floorType: "Chua co du lieu",
};

const toNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const normalizeDimensions = (dimensions) => {
  if (!dimensions || typeof dimensions !== "object") {
    return null;
  }

  const width = toNumber(dimensions.width);
  const depth = toNumber(dimensions.depth ?? dimensions.length);
  const height = toNumber(dimensions.height);

  if (!width && !depth && !height) {
    return null;
  }

  return {
    width: width || 0,
    depth: depth || 0,
    height: height || 0,
  };
};

const formatAiProductDimensions = (dimensions) => {
  const normalized = normalizeDimensions(dimensions);

  if (!normalized) {
    return "Chua co du lieu";
  }

  return `${normalized.width} x ${normalized.depth} x ${normalized.height} cm`;
};

const buildAreaText = (dimensions) => {
  if (!dimensions) {
    return DEFAULT_ROOM_ANALYSIS.area;
  }

  const width = toNumber(dimensions.width);
  const length = toNumber(dimensions.length);
  const height = toNumber(dimensions.height);

  if (!width || !length || !height) {
    return DEFAULT_ROOM_ANALYSIS.area;
  }

  return `${width} x ${length} x ${height} m`;
};

const normalizeRoomAnalysis = (payload) => ({
  width: payload?.dimensions?.width ?? DEFAULT_ROOM_ANALYSIS.width,
  length: payload?.dimensions?.length ?? DEFAULT_ROOM_ANALYSIS.length,
  height: payload?.dimensions?.height ?? DEFAULT_ROOM_ANALYSIS.height,
  reasoning: payload?.reasoning || DEFAULT_ROOM_ANALYSIS.reasoning,
  area: buildAreaText(payload?.dimensions),
  ceiling: payload?.dimensions?.height
    ? `${payload.dimensions.height} m`
    : DEFAULT_ROOM_ANALYSIS.ceiling,
  windows: DEFAULT_ROOM_ANALYSIS.windows,
  naturalLight: DEFAULT_ROOM_ANALYSIS.naturalLight,
  floorType: DEFAULT_ROOM_ANALYSIS.floorType,
});

const normalizeRecommendations = (payload, products) => {
  if (payload?.reasoning) {
    return [String(payload.reasoning)];
  }

  if (products.length > 0) {
    return products
      .map((item) => item.reason)
      .filter(Boolean)
      .slice(0, 4);
  }

  return ["AI da tra ket qua nhung chua co phan giai thich chi tiet."];
};

const normalizeProducts = (payload) => {
  const rawProducts = Array.isArray(payload?.recommendedProducts)
    ? payload.recommendedProducts
    : Array.isArray(payload?.products)
      ? payload.products
      : [];

  return rawProducts.map((item, index) => {
    const dimensions =
      normalizeDimensions(item?.dimensions) ||
      normalizeDimensions(item?.product?.dimensions) ||
      null;

    return {
      id:
        item?.id ||
        item?._id ||
        item?.productId ||
        item?.product_id ||
        item?.product?.id ||
        `ai-product-${index + 1}`,
      name:
        item?.name ||
        item?.productName ||
        item?.title ||
        item?.product_title ||
        item?.product?.name ||
        `San pham goi y ${index + 1}`,
      category:
        item?.category ||
        item?.productCategory ||
        item?.product?.category ||
        "Noi that",
      styles: Array.isArray(item?.styles) ? item.styles : [],
      colors: Array.isArray(item?.colors) ? item.colors : [],
      price:
        toNumber(
          item?.price ||
            item?.productPrice ||
            item?.priceValue ||
            item?.estimatedPrice ||
            item?.product?.price,
        ) || 0,
      image:
        item?.imageUrl ||
        item?.images?.[0] ||
        item?.image ||
        item?.thumbnail ||
        item?.productImage ||
        item?.product?.imageUrl ||
        item?.product?.images?.[0] ||
        item?.product?.image ||
        item?.product?.thumbnail ||
        item?.product?.productImage ||
        null,
      imageUrl:
        item?.imageUrl ||
        item?.images?.[0] ||
        item?.image ||
        item?.thumbnail ||
        item?.productImage ||
        item?.product?.imageUrl ||
        item?.product?.images?.[0] ||
        item?.product?.image ||
        item?.product?.thumbnail ||
        item?.product?.productImage ||
        null,
      aiScore:
        toNumber(item?.aiScore || item?.score || item?.matchScore || 85) || 85,
      reason:
        item?.reason ||
        item?.reasoning ||
        item?.description ||
        item?.aiReason ||
        item?.recommendationReason ||
        item?.explanation ||
        payload?.reasoning ||
        "Phu hop voi bo cuc va phong cach khong gian.",
      materials:
        item?.materials ||
        item?.materialsText ||
        item?.material ||
        item?.product?.material ||
        "Chua co du lieu",
      dimensions,
      dimensionsText: formatAiProductDimensions(dimensions),
    };
  });
};

export function normalizeAiRecommendResult(payload) {
  const products = normalizeProducts(payload || {});
  const totalPrice = products.reduce((sum, item) => sum + (item.price || 0), 0);

  return {
    id:
      payload?.id ||
      payload?._id ||
      payload?.requestId ||
      payload?.designRequestId ||
      null,
    roomType: payload?.roomType || "",
    style: payload?.style || "",
    furnitureDensity: payload?.furnitureDensity || "",
    gender: payload?.gender || "",
    imageUrl: payload?.imageUrl || "",
    reasoning: payload?.reasoning || "",
    createdAt: payload?.createdAt || null,
    products,
    totalPrice,
    roomAnalysis: normalizeRoomAnalysis(payload || {}),
    colorPalette:
      Array.isArray(payload?.dominantColors) && payload.dominantColors.length
        ? payload.dominantColors.map((color, index) => ({
            name: `Màu ${index + 1}`,
            color,
            percentage: 0,
          }))
        : DEFAULT_PALETTE,
    recommendations: normalizeRecommendations(payload || {}, products),
    requestMeta: {
      id:
        payload?.id ||
        payload?._id ||
        payload?.requestId ||
        payload?.designRequestId ||
        null,
      status: products.length > 0 ? "COMPLETED" : "PENDING",
      message:
        products.length > 0
          ? "AI da tra ve phuong an thiet ke."
          : "Yeu cau thiet ke da duoc tao va dang cho AI xu ly.",
      createdAt: payload?.createdAt || null,
    },
  };
}
