const DEFAULT_PALETTE = [
  { name: "Nền chính", color: "#f3efe6", percentage: 58 },
  { name: "Trung tính", color: "#837b73", percentage: 27 },
  { name: "Nhấn", color: "#cf5c36", percentage: 15 },
];

const DEFAULT_ROOM_ANALYSIS = {
  width: "",
  length: "",
  height: "",
  reasoning: "Chưa có dữ liệu",
  reasoningDetails: null,
  area: "Chưa có dữ liệu",
  ceiling: "Chưa có dữ liệu",
  windows: "Chưa có dữ liệu",
  naturalLight: "Chưa có dữ liệu",
  floorType: "Chưa có dữ liệu",
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

const toFiniteNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const getFirstValue = (source, keys) => {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  return keys
    .map((key) => source[key])
    .find((value) => value !== undefined && value !== null);
};

const getFirstNumber = (source, keys) => {
  const value = getFirstValue(source, keys);
  const parsed = toFiniteNumber(value);

  return parsed === null ? undefined : parsed;
};

const normalizeIdValue = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  const normalized = String(value).trim();

  if (
    !normalized ||
    normalized.toLowerCase() === "undefined" ||
    normalized.toLowerCase() === "null"
  ) {
    return "";
  }

  return normalized;
};

const getProductIdCandidates = (item) =>
  Array.from(
    new Set(
      [
        item?.id,
        item?._id,
        item?.productId,
        item?.product_id,
        item?.product?.id,
        item?.product?._id,
        item?.product?.productId,
        item?.product?.product_id,
      ]
        .map(normalizeIdValue)
        .filter(Boolean),
    ),
  );

const getProductId = (item) => getProductIdCandidates(item)[0] || "";

const getProductImageUrl = (item) =>
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
  null;

const getProductModelUrl = (item) =>
  item?.modelUrl ||
  item?.model_url ||
  item?.glbUrl ||
  item?.glb_url ||
  item?.model?.url ||
  item?.product?.modelUrl ||
  item?.product?.model_url ||
  item?.product?.glbUrl ||
  item?.product?.glb_url ||
  "";

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

const formatReasoningText = (reasoning) => {
  if (!reasoning) {
    return DEFAULT_ROOM_ANALYSIS.reasoning;
  }

  if (typeof reasoning === "string") {
    return reasoning;
  }

  if (typeof reasoning === "object") {
    return [
      reasoning.styleJustification,
      reasoning.colorJustification,
      reasoning.densityJustification,
      reasoning.userProfileNote,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return String(reasoning);
};

const formatAiProductDimensions = (dimensions) => {
  const normalized = normalizeDimensions(dimensions);

  if (!normalized) {
    return "Chưa có dữ liệu";
  }

  return `${normalized.width} x ${normalized.depth} x ${normalized.height} cm`;
};

const buildAreaText = (dimensions) => {
  if (!dimensions) {
    return DEFAULT_ROOM_ANALYSIS.area;
  }

  const width = getFirstNumber(dimensions, ["width", "widthM", "width_m"]);
  const length = getFirstNumber(dimensions, [
    "length",
    "lengthM",
    "length_m",
    "depth",
    "depthM",
    "depth_m",
  ]);
  const height = getFirstNumber(dimensions, ["height", "heightM", "height_m"]);

  if (!width || !length || !height) {
    return DEFAULT_ROOM_ANALYSIS.area;
  }

  return `${width} x ${length} x ${height} m`;
};

const normalizeRoomAnalysis = (payload) => {
  const sourceDimensions =
    payload?.dimensions || payload?.room || payload || {};
  const width =
    getFirstNumber(sourceDimensions, ["width", "widthM", "width_m"]) ??
    DEFAULT_ROOM_ANALYSIS.width;
  const length =
    getFirstNumber(sourceDimensions, [
      "length",
      "lengthM",
      "length_m",
      "depth",
      "depthM",
      "depth_m",
    ]) ?? DEFAULT_ROOM_ANALYSIS.length;
  const height =
    getFirstNumber(sourceDimensions, ["height", "heightM", "height_m"]) ??
    DEFAULT_ROOM_ANALYSIS.height;

  return {
    width,
    length,
    height,
    reasoning: formatReasoningText(payload?.reasoning),
    reasoningDetails:
      payload?.reasoning && typeof payload.reasoning === "object"
        ? payload.reasoning
        : null,
    area: buildAreaText(sourceDimensions),
    ceiling: height ? `${height} m` : DEFAULT_ROOM_ANALYSIS.ceiling,
    windows: DEFAULT_ROOM_ANALYSIS.windows,
    naturalLight: DEFAULT_ROOM_ANALYSIS.naturalLight,
    floorType: DEFAULT_ROOM_ANALYSIS.floorType,
  };
};

const normalizeRecommendations = (payload, products) => {
  if (payload?.reasoning) {
    return [formatReasoningText(payload.reasoning)];
  }

  if (products.length > 0) {
    return products
      .map((item) => item.reason)
      .filter(Boolean)
      .slice(0, 4);
  }

  return ["AI đã trả kết quả nhưng chưa có phần giải thích chi tiết."];
};

const unwrapLayoutPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  if (
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
  ) {
    return payload.data;
  }

  if (
    payload.result &&
    typeof payload.result === "object" &&
    !Array.isArray(payload.result)
  ) {
    return payload.result;
  }

  return payload;
};

const extractLayoutItems = (payload) => {
  const source = unwrapLayoutPayload(payload);

  if (Array.isArray(source)) {
    return source;
  }

  const candidates = [
    source?.items,
    source?.placements,
    source?.products,
    source?.layoutItems,
    source?.furniture,
    source?.objects,
    source?.layouts,
    source?.layout,
    source?.layout?.items,
    source?.layout?.placements,
    source?.layout?.products,
    source?.layout?.furniture,
    source?.recommendation?.products,
  ];

  return candidates.find((value) => Array.isArray(value)) || [];
};

const getLayoutProductIdCandidates = (item) =>
  Array.from(
    new Set(
      [
        item?.productId,
        item?.product_id,
        item?.itemId,
        item?.item_id,
        item?.furnitureId,
        item?.furniture_id,
        item?.product?.id,
        item?.product?._id,
        item?.product?.productId,
        item?.product?.product_id,
        item?.id,
        item?._id,
      ]
        .map(normalizeIdValue)
        .filter(Boolean),
    ),
  );

const getLayoutProductId = (item) =>
  getLayoutProductIdCandidates(item)[0] || "";

const getLayoutProductName = (item) =>
  item?.name ||
  item?.productName ||
  item?.product_name ||
  item?.product?.name ||
  item?.furniture?.name ||
  "";

const findPositionSource = (item) => {
  const nested =
    item?.position ||
    item?.pos ||
    item?.coordinates ||
    item?.coordinate ||
    item?.center ||
    item?.location ||
    item?.translation ||
    item?.placement?.position ||
    item?.layout?.position ||
    item?.transform?.position;

  if (nested) {
    return nested;
  }

  const hasTopLevelX =
    getFirstValue(item, ["x", "xM", "x_m", "centerX", "center_x"]) !==
    undefined;
  const hasTopLevelZ =
    getFirstValue(item, [
      "z",
      "zM",
      "z_m",
      "centerZ",
      "center_z",
      "y",
      "yM",
      "y_m",
      "centerY",
      "center_y",
    ]) !== undefined;

  return hasTopLevelX && hasTopLevelZ ? item : null;
};

const normalizeLayoutPosition = (item) => {
  const source = findPositionSource(item);

  if (Array.isArray(source)) {
    const x = toFiniteNumber(source[0]);
    const y = source.length >= 3 ? toFiniteNumber(source[1]) : 0;
    const z =
      source.length >= 3
        ? toFiniteNumber(source[2])
        : toFiniteNumber(source[1]);

    if (x === null || z === null) {
      return null;
    }

    return [x, y ?? 0, z];
  }

  if (!source || typeof source !== "object") {
    return null;
  }

  const x = getFirstNumber(source, ["x", "xM", "x_m", "centerX", "center_x"]);
  const explicitZ = getFirstNumber(source, [
    "z",
    "zM",
    "z_m",
    "centerZ",
    "center_z",
    "depthM",
  ]);
  const floorY = getFirstNumber(source, [
    "y",
    "yM",
    "y_m",
    "centerY",
    "center_y",
  ]);
  const verticalY =
    getFirstNumber(source, [
      "positionY",
      "position_y",
      "verticalY",
      "vertical_y",
      "elevation",
      "elevationM",
    ]) ?? 0;
  const z = explicitZ ?? floorY;

  if (x === undefined || z === undefined) {
    return null;
  }

  return [x, explicitZ === undefined ? 0 : verticalY, z];
};

const normalizeLayoutRotation = (item) => {
  const source =
    item?.rotation ??
    item?.rotationY ??
    item?.rotation_y ??
    item?.orientation ??
    item?.angle ??
    item?.yaw ??
    item?.placement?.rotation ??
    item?.layout?.rotation ??
    item?.transform?.rotation;

  let value;
  let unit = item?.rotationUnit || item?.rotation_unit || "";

  if (typeof source === "number" || typeof source === "string") {
    value = toFiniteNumber(source);
  } else if (source && typeof source === "object") {
    value = getFirstNumber(source, [
      "y",
      "yaw",
      "angle",
      "rotationY",
      "rotation_y",
      "radians",
      "rad",
      "degrees",
      "deg",
    ]);
    unit = unit || source.unit || source.rotationUnit || "";
  }

  if (value === null || value === undefined) {
    return 0;
  }

  if (
    String(unit).toLowerCase().includes("deg") ||
    Math.abs(value) > Math.PI * 2
  ) {
    return (value * Math.PI) / 180;
  }

  return value;
};

const getLayoutModelUrl = (item) =>
  item?.modelUrl ||
  item?.model_url ||
  item?.glbUrl ||
  item?.glb_url ||
  item?.model?.url ||
  item?.product?.modelUrl ||
  item?.product?.model_url ||
  "";

const getLayoutScore = (item) => {
  const value = getFirstValue(item, [
    "score",
    "layoutScore",
    "layout_score",
    "confidence",
    "ranking_score",
  ]);

  return toFiniteNumber(value);
};

const extractLayoutRejected = (payload) => {
  const source = unwrapLayoutPayload(payload);
  const candidates = [
    source?.rejected,
    source?.rejections,
    source?.rejectedItems,
    source?.layout?.rejected,
    source?.layout?.rejections,
  ];
  const rawRejected = candidates.find((value) => Array.isArray(value)) || [];

  return rawRejected.map((item, index) => {
    if (typeof item === "string") {
      return {
        productId: "",
        name: item,
        reason: item,
        index,
      };
    }

    return {
      productId: String(getLayoutProductId(item) || ""),
      name: getLayoutProductName(item),
      reason:
        getFirstValue(item, [
          "reason",
          "message",
          "error",
          "cause",
          "rejectionReason",
          "rejection_reason",
        ]) || "",
      index,
    };
  });
};

const shouldTranslateCornerOrigin = (items, payload, roomAnalysis) => {
  const source = unwrapLayoutPayload(payload);
  const coordinateSystem = normalizeText(
    [
      source?.coordinateSystem,
      source?.coordinate_system,
      source?.origin,
      source?.layout?.coordinateSystem,
      source?.layout?.origin,
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (coordinateSystem.includes("center")) {
    return false;
  }

  if (
    coordinateSystem.includes("corner") ||
    coordinateSystem.includes("top_left") ||
    coordinateSystem.includes("room")
  ) {
    return true;
  }

  const roomWidth = toFiniteNumber(roomAnalysis?.width);
  const roomLength = toFiniteNumber(roomAnalysis?.length);

  if (!roomWidth || !roomLength || !items.length) {
    return false;
  }

  const positions = items.map((item) => item.position).filter(Boolean);
  const allNonNegative = positions.every(([x, , z]) => x >= 0 && z >= 0);
  const outsideCenteredRange = positions.some(
    ([x, , z]) => x > roomWidth / 2 || z > roomLength / 2,
  );

  return allNonNegative && outsideCenteredRange;
};

const translatePositionToRoomCenter = (position, roomAnalysis) => {
  const roomWidth = toFiniteNumber(roomAnalysis?.width);
  const roomLength = toFiniteNumber(roomAnalysis?.length);

  if (!roomWidth || !roomLength) {
    return position;
  }

  return [
    position[0] - roomWidth / 2,
    position[1],
    position[2] - roomLength / 2,
  ];
};

const normalizeAiLayoutResult = (layoutPayload, roomAnalysis) => {
  const source = unwrapLayoutPayload(layoutPayload);
  const rawItems = extractLayoutItems(source);

  console.log("[normalizeAiLayoutResult] rawItems count:", rawItems.length);
  if (rawItems.length > 0) {
    console.log("[normalizeAiLayoutResult] rawItems[0]:", rawItems[0]);
  }

  const items = rawItems
    .map((item, index) => {
      const position = normalizeLayoutPosition(item);
      const rotation = normalizeLayoutRotation(item);
      const idAliases = getLayoutProductIdCandidates(item);

      if (!position) {
        if (index < 3) {
          console.warn(
            `[normalizeAiLayoutResult] Item ${index} position is null. Item:`,
            item,
          );
        }
        return null;
      }

      const normalized = {
        productId: String(getLayoutProductId(item) || ""),
        idAliases,
        name: getLayoutProductName(item),
        position,
        rotation,
        rotationY: rotation,
        modelUrl: getLayoutModelUrl(item),
        score: getLayoutScore(item),
        index,
      };

      if (index < 3) {
        console.log(
          `[normalizeAiLayoutResult] Item ${index} normalized:`,
          normalized,
        );
      }

      return normalized;
    })
    .filter(Boolean);

  console.log(
    "[normalizeAiLayoutResult] After filter items count:",
    items.length,
  );

  const shouldTranslate = shouldTranslateCornerOrigin(
    items,
    source,
    roomAnalysis,
  );
  const normalizedItems = shouldTranslate
    ? items.map((item) => ({
        ...item,
        position: translatePositionToRoomCenter(item.position, roomAnalysis),
      }))
    : items;

  return {
    source: "generate-from-recommendation",
    message: source?.message || source?.layout?.message || "",
    room: source?.room || source?.layout?.room || null,
    items: normalizedItems,
    rejected: extractLayoutRejected(source),
  };
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
      id: getProductId(item) || `ai-product-${index + 1}`,
      _id: normalizeIdValue(item?._id || item?.product?._id) || null,
      productId:
        normalizeIdValue(
          item?.productId ||
            item?.product_id ||
            item?.product?.productId ||
            item?.product?.product_id,
        ) || null,
      idAliases: getProductIdCandidates(item),
      name:
        item?.name ||
        item?.productName ||
        item?.title ||
        item?.product_title ||
        item?.product?.name ||
        `Sản phẩm gợi ý ${index + 1}`,
      category:
        item?.category ||
        item?.productCategory ||
        item?.product?.category ||
        "Nội thất",
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
      image: getProductImageUrl(item),
      imageUrl: getProductImageUrl(item),
      aiScore:
        toNumber(item?.aiScore || item?.score || item?.matchScore || 85) || 85,
      rankingScore:
        toFiniteNumber(
          item?.ranking_score ||
            item?.rankingScore ||
            item?.rankScore ||
            item?.score ||
            item?.matchScore,
        ) || null,
      modelUrl: getProductModelUrl(item),
      reason:
        item?.reason ||
        item?.reasoning ||
        item?.description ||
        item?.aiReason ||
        item?.recommendationReason ||
        item?.explanation ||
        payload?.reasoning ||
        "Phù hợp với bố cục và phong cách không gian.",
      materials:
        item?.materials ||
        item?.materialsText ||
        item?.material ||
        item?.product?.material ||
        "Chưa có dữ liệu",
      dimensions,
      dimensionsText: formatAiProductDimensions(dimensions),
    };
  });
};

export function mergeAiLayoutResult(aiResult, layoutPayload) {
  if (!aiResult || !layoutPayload) {
    return aiResult;
  }

  const layout = normalizeAiLayoutResult(layoutPayload, aiResult.roomAnalysis);

  if (!layout.items.length) {
    console.warn(
      "[mergeAiLayoutResult] No layout items found in normalized layout",
      layout,
    );
    return {
      ...aiResult,
      layout,
    };
  }

  console.log("[mergeAiLayoutResult] layout.items count:", layout.items.length);
  console.log("[mergeAiLayoutResult] layout.items sample:", layout.items[0]);

  const layoutById = new Map();
  const layoutByName = new Map();
  const layoutHasIdentity = layout.items.some(
    (item) =>
      (Array.isArray(item.idAliases) && item.idAliases.length > 0) ||
      item.productId ||
      normalizeText(item.name),
  );

  layout.items.forEach((item) => {
    const itemIds =
      Array.isArray(item.idAliases) && item.idAliases.length > 0
        ? item.idAliases
        : getLayoutProductIdCandidates(item);

    itemIds.forEach((id) => {
      layoutById.set(String(id), item);
    });

    const nameKey = normalizeText(item.name);
    if (nameKey) {
      layoutByName.set(nameKey, item);
    }
  });

  console.log(
    "[mergeAiLayoutResult] layoutById map size:",
    layoutById.size,
    "layoutByName map size:",
    layoutByName.size,
  );

  const products = (aiResult.products || []).map((product, index) => {
    const productId = String(getProductId(product) || "");
    const productIds =
      Array.isArray(product?.idAliases) && product.idAliases.length > 0
        ? product.idAliases.map((id) => String(id))
        : getProductIdCandidates(product).map((id) => String(id));
    const productName = normalizeText(product?.name);
    const matchedProductId = productIds.find((id) => layoutById.has(id));

    const placement =
      (matchedProductId ? layoutById.get(matchedProductId) : null) ||
      layoutById.get(productId) ||
      layoutByName.get(productName) ||
      (!layoutHasIdentity ? layout.items[index] : null);

    if (!placement) {
      if (index < 3) {
        console.log(
          `[mergeAiLayoutResult] Product ${index} (${product?.name}) - NO placement found. productId:"${productId}" productIds:${JSON.stringify(productIds)} productName:"${productName}"`,
        );
      }
      return product;
    }

    console.log(
      `[mergeAiLayoutResult] Product ${index} (${product?.name}) - PLACED position:`,
      placement.position,
    );

    return {
      ...product,
      modelUrl: product.modelUrl || placement.modelUrl || "",
      layoutPlacement: {
        ...placement,
        productId: placement.productId || matchedProductId || productId,
        position: placement.position,
        rotation: placement.rotation,
        rotationY: placement.rotation,
        score: placement.score,
        modelUrl: placement.modelUrl || product.modelUrl || "",
      },
    };
  });

  const placedCount = products.filter((p) => p.layoutPlacement).length;
  console.log(
    `[mergeAiLayoutResult] Result: ${placedCount}/${products.length} products placed`,
  );

  return {
    ...aiResult,
    products,
    layout,
  };
}

export function normalizeAiRecommendResult(payload) {
  const products = normalizeProducts(payload || {});
  const totalPrice = products.reduce((sum, item) => sum + (item.price || 0), 0);
  const topLevelReasoning = formatReasoningText(payload?.reasoning);
  const requestStatus =
    payload?.status || (products.length > 0 ? "COMPLETED" : "PENDING");

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
    age: payload?.age || "",
    imageUrl: payload?.imageUrl || "",
    layout: payload?.layout || null,
    reasoning: topLevelReasoning,
    reasoningDetails:
      payload?.reasoning && typeof payload.reasoning === "object"
        ? payload.reasoning
        : null,
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
      status: requestStatus,
      message:
        payload?.message ||
        (products.length > 0
          ? "AI đã trả về phương án thiết kế."
          : "Yêu cầu thiết kế đã được tạo và đang chờ AI xử lý."),
      createdAt: payload?.createdAt || null,
    },
  };
}
