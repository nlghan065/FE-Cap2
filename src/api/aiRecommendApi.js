import axios from "axios";

import apiClient from "./apiClient";

const AI_RECOMMEND_ENDPOINT = "/api/design-requests";
const AI_LAYOUT_ENDPOINT =
  import.meta.env.VITE_AI_LAYOUT_URL || "/api/ai-layout/generate";
const FALLBACK_LAYOUT_MODEL_URL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb";

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp01 = (value, fallback = 0.85) => {
  const parsed = toNumber(value, fallback);
  const normalized = parsed > 1 ? parsed / 100 : parsed;

  return Math.min(Math.max(normalized, 0), 1);
};

const normalizeDimensionValue = (value, minValue = 1) => {
  const num = toNumber(value, minValue);
  // Nếu > 20 (quá lớn cho phòng - assume là cm), convert sang m bằng chia 100
  if (num > 20) {
    console.log(
      `[normalizeDimensionValue] Converting ${num}cm to ${num / 100}m`,
    );
    return num / 100;
  }
  return num;
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const escapeRegExp = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matchesKeyword = (source, keyword) => {
  const normalizedKey = normalizeText(keyword).trim();

  if (!normalizedKey) return false;

  return new RegExp(
    `(^|[^a-z0-9])${escapeRegExp(normalizedKey)}([^a-z0-9]|$)`,
  ).test(source);
};

const hasAnyKeyword = (source, keywords) =>
  keywords.some((keyword) => matchesKeyword(source, keyword));

const getProductId = (product) =>
  product?.id ||
  product?._id ||
  product?.productId ||
  product?.product_id ||
  product?.product?.id ||
  product?.product?._id ||
  "";

const getProductModelUrl = (product) =>
  product?.modelUrl ||
  product?.model_url ||
  product?.glbUrl ||
  product?.glb_url ||
  product?.model?.url ||
  product?.product?.modelUrl ||
  product?.product?.model_url ||
  "";

const getLayoutModelUrl = (product, providedModelUrlById = {}) => {
  const id = String(getProductId(product) || "");

  return (
    providedModelUrlById[id] ||
    getProductModelUrl(product) ||
    FALLBACK_LAYOUT_MODEL_URL
  );
};

const normalizeLayoutRoomType = (roomType) => {
  const normalized = String(roomType || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const roomTypeMap = {
    living_room: "living_room",
    livingroom: "living_room",
    phong_khach: "living_room",
    bedroom: "bedroom",
    bed_room: "bedroom",
    phong_ngu: "bedroom",
  };

  return roomTypeMap[normalized] || normalized || "living_room";
};

const getLayoutCategory = (product) => {
  const source = normalizeText(
    `${product?.category || ""} ${product?.name || ""}`,
  );

  if (hasAnyKeyword(source, ["sofa", "couch", "sectional"])) return "Sofa";
  if (hasAnyKeyword(source, ["giuong", "bed", "nem"])) return "Bed";
  if (hasAnyKeyword(source, ["ban", "table", "desk"])) return "Table";
  if (hasAnyKeyword(source, ["ghe", "chair", "bench", "ottoman"]))
    return "Chair";
  if (hasAnyKeyword(source, ["guong", "mirror"])) return "Mirror";
  if (hasAnyKeyword(source, ["tham", "rug", "carpet"])) return "Rug";
  if (hasAnyKeyword(source, ["den", "lamp", "light"])) return "Lamp";
  if (hasAnyKeyword(source, ["cay", "plant", "hoa"])) return "Plant";
  if (
    hasAnyKeyword(source, [
      "ke",
      "gia",
      "tu",
      "shelf",
      "rack",
      "cabinet",
      "storage",
      "basket",
      "gio",
      "cart",
      "trolley",
      "banh xe",
      "do",
    ])
  ) {
    return "Storage";
  }

  return product?.category || "Furniture";
};

const buildLayoutRoomPayload = ({ roomType, dimensions, style }) => ({
  widthM: toNumber(dimensions?.width, 4),
  lengthM: toNumber(dimensions?.length, 5),
  heightM: toNumber(dimensions?.height, 3),
  type: normalizeLayoutRoomType(roomType),
  style: style || "",
});

const buildLayoutProductPayload = (
  product,
  index,
  providedModelUrlById = {},
) => {
  const id = String(getProductId(product) || `ai-product-${index + 1}`);
  const dimensions = product?.dimensions || {};
  const modelUrl =
    providedModelUrlById[id] ||
    getLayoutModelUrl(product, providedModelUrlById);

  return {
    id,
    name: product?.name || `Product ${index + 1}`,
    category: getLayoutCategory(product),
    modelUrl,
    dimensions: {
      width: toNumber(dimensions.width, 0),
      depth: toNumber(dimensions.depth ?? dimensions.length, 0),
      height: toNumber(dimensions.height, 0),
    },
    ranking_score: clamp01(
      product?.ranking_score ??
        product?.rankingScore ??
        product?.aiScore ??
        product?.score ??
        product?.matchScore,
    ),
    imageUrl: product?.imageUrl || product?.image || "",
  };
};

const buildModelUrlById = (products, providedModelUrlById = {}) =>
  products.reduce((acc, product, index) => {
    const id = String(getProductId(product) || `ai-product-${index + 1}`);
    const modelUrl = getLayoutModelUrl(product, providedModelUrlById);

    if (id && modelUrl) {
      acc[id] = modelUrl;
    }

    return acc;
  }, {});

const buildRecommendFormData = ({
  imageFile,
  roomType,
  dimensions,
  style,
  furnitureDensity,
  gender,
  age,
}) => {
  const formData = new FormData();

  const requestPayload = {
    roomType,
    dimensions: {
      width: toNumber(dimensions?.width, 4),
      length: toNumber(dimensions?.length, 5),
      height: toNumber(dimensions?.height, 3),
    },
    style,
    furnitureDensity,
    gender,
    age: toNumber(age, 25),
  };

  formData.append(
    "request",
    new Blob([JSON.stringify(requestPayload)], {
      type: "application/json",
    }),
  );

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
};

export async function postAiRecommendApi({
  imageFile,
  roomType,
  dimensions,
  style,
  furnitureDensity,
  gender,
  age,
}) {
  const formData = buildRecommendFormData({
    imageFile,
    roomType,
    dimensions,
    style,
    furnitureDensity,
    gender,
    age,
  });

  console.log("[AI Design FE] POST", AI_RECOMMEND_ENDPOINT);
  console.log("[AI Design FE] request payload", {
    roomType,
    dimensions,
    style,
    furnitureDensity,
    gender,
    age,
    imageName: imageFile?.name || null,
    imageType: imageFile?.type || null,
    imageSize: imageFile?.size || null,
  });

  const response = await apiClient.post(AI_RECOMMEND_ENDPOINT, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  console.log("[AI Design FE] response status", response?.status);
  console.log("[AI Design FE] response data", response?.data);

  return response?.data?.data || null;
}

export async function postAiLayoutFromRecommendationApi({
  roomType,
  dimensions,
  style,
  products,
  topK = 8,
  minScore = 0.55,
  modelUrlById = {},
}) {
  const normalizedProducts = Array.isArray(products)
    ? products.map((product, index) =>
        buildLayoutProductPayload(product, index, modelUrlById),
      )
    : [];

  const body = {
    room: buildLayoutRoomPayload({ roomType, dimensions, style }),
    recommendation: {
      products: normalizedProducts,
    },
    topK,
    minScore,
    modelUrlById: buildModelUrlById(products || [], modelUrlById),
  };

  console.log("[AI Layout FE] POST", AI_LAYOUT_ENDPOINT);
  console.log("[AI Layout FE] request payload", body);

  const client = AI_LAYOUT_ENDPOINT.startsWith("/") ? apiClient : axios;
  const response = await client.post(AI_LAYOUT_ENDPOINT, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("[AI Layout FE] response status", response?.status);
  console.log("[AI Layout FE] response data", response?.data);

  const data = response?.data?.data || response?.data || null;

  if (Array.isArray(data?.rejected) && data.rejected.length) {
    console.warn("[AI Layout FE] rejected products", data.rejected);
  }

  return data;
}
