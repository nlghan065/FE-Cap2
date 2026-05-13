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

const getProductId = (item) =>
  item?.id ||
  item?._id ||
  item?.productId ||
  item?.product_id ||
  item?.product?.id ||
  item?.product?._id ||
  "";

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

const getLayoutProductId = (item) =>
  item?.productId ||
  item?.product_id ||
  item?.itemId ||
  item?.item_id ||
  item?.furnitureId ||
  item?.furniture_id ||
  item?.product?.id ||
  item?.product?._id ||
  item?.product?.productId ||
  item?.product?.product_id ||
  item?.id ||
  item?._id ||
  "";

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
        name: getLayoutProductName(item),
        position,
        rotation: normalizeLayoutRotation(item),
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
    (item) => item.productId || normalizeText(item.name),
  );

  layout.items.forEach((item) => {
    if (item.productId) {
      layoutById.set(String(item.productId), item);
    }

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
    const productName = normalizeText(product?.name);

    const placement =
      layoutById.get(productId) ||
      layoutByName.get(productName) ||
      (!layoutHasIdentity ? layout.items[index] : null);

    if (!placement) {
      if (index < 3) {
        console.log(
          `[mergeAiLayoutResult] Product ${index} (${product?.name}) - NO placement found. productId:"${productId}" productName:"${productName}"`,
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
        productId: placement.productId || productId,
        position: placement.position,
        rotation: placement.rotation,
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
