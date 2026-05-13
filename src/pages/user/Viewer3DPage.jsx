import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Grid,
  Html,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
} from "@react-three/drei";
import {
  ArrowLeft,
  Box,
  ChevronRight,
  Home,
  Loader2,
  Maximize2,
  RotateCcw,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { Plane, Vector3 } from "three";

import { postAiLayoutFromRecommendationApi } from "../../api/aiRecommendApi";
import { addToCartApi } from "../../api/cartApi";
import { mergeAiLayoutResult } from "../../utils/aiRecommendResultV2";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "../../styles/Viewer3D.module.css";

const STORAGE_KEY = "cap2-ai-viewer-state";
const LAYOUT_REQUEST_VERSION = "layout-model-url-v3";
const DEFAULT_CAMERA_POSITION = [5.3, 3.7, 6.4];
const DEFAULT_CAMERA_TARGET = [0, 0.55, 0];
const DEFAULT_ROOM_DIMENSIONS = { width: 4.8, length: 5.8, height: 3 };
const DRAG_ROOM_PADDING = 0.08;
const TV_STAND_KEYS = [
  "tv stand",
  "tv cabinet",
  "tv console",
  "media console",
  "media unit",
  "entertainment unit",
  "ke tivi",
  "tu tivi",
  "tivi",
];
const SHELF_KEYS = [
  "shelf",
  "bookcase",
  "bookshelf",
  "rack",
  "ke",
  "etagere",
  "display shelf",
  "display rack",
  "ke sach",
  "ke trung bay",
  "ke do",
];
const TALL_SHELF_KEYS = [
  "hangar cao",
  "cao",
  "etagere",
  "bookcase",
  "bookshelf",
];
const WIDE_SHELF_KEYS = [
  "hangar",
  "cube shelf",
  "storage shelf",
  "display shelf",
  "ke trung bay",
];
const DECOR_KEYS = [
  "statue",
  "sculpture",
  "figurine",
  "ornament",
  "bust",
  "vase",
  "decor statue",
  "decor object",
  "cay trang tri",
  "bird",
  "tree tray",
  "tuong",
  "tuong trang tri",
];
const BENCH_KEYS = [
  "bench",
  "ottoman",
  "footstool",
  "pouf",
  "don gac chan",
  "ghe bang",
  "ghe bench",
];
const BEANBAG_KEYS = [
  "ghe luoi",
  "vo ghe luoi",
  "bean bag",
  "beanbag",
  "lounger",
];
const TEXTILE_KEYS = [
  "tam phu",
  "phu sofa",
  "sofa cover",
  "tam lot",
  "mattress pad",
  "bed pad",
  "rem",
  "curtain",
  "drape",
  "khan trai",
  "tablecloth",
  "lot dia",
  "placemat",
];
const COMPONENT_KEYS = [
  "tay vin cho",
  "chan go",
  "dau giuong",
  "vach ben",
  "thanh inox",
  "mam ke",
  "khung thep",
  "phan gia",
  "bo dieu chinh",
  "gia de do",
];
const RUG_KEYS = ["tham", "rug", "carpet", "runner"];
const MIRROR_KEYS = ["guong", "mirror"];
const VASE_KEYS = ["binh", "vase", "urn", "jar"];
const TRAY_KEYS = [
  "khay trang tri",
  "serving tray",
  "decor tray",
  "khay",
  "tray",
];
const BASKET_KEYS = ["gio", "basket", "crate", "organizer bin"];
const BOX_KEYS = [
  "hop tre",
  "hop vai",
  "hop phan vung",
  "hop luu tru co quai",
  "hop luu tru",
  "hop luu tru nhua",
  "ngan keo",
  "hoc keo",
  "xep chong",
  "nap hop",
  "storage box",
  "container box",
  "co quai",
  "gio thep",
  "gio",
  "gio dan",
  "basket",
  "organizer",
  "crate",
  "bin",
];
const DOLLY_KEYS = [
  "banh xe hop",
  "banh xe hop luu tru",
  "pallet",
  "dolly",
  "roller base",
  "platform cart",
];
const COAT_RACK_KEYS = [
  "gia treo ao",
  "gia treo ao go cao su",
  "coat rack",
  "clothes rack",
  "garment rack",
  "tich hop ke",
];
const FLOOR_CHAIR_KEYS = [
  "ghe ngoi bet",
  "ngoi bet",
  "floor chair",
  "zaisu",
  "tua lung cao",
];
const SHELF_CATEGORY_KEYS = ["ke phong khach", "ke sach"];
const DISPLAY_CABINET_KEYS = ["trung bay", "display cabinet", "china cabinet"];
const ROLLING_STORAGE_KEYS = [
  "co banh xe",
  "stocker",
  "utility cart",
  "trolley",
  "xe day",
];
const WIRE_RACK_KEYS = [
  "ke luu tru bang thep",
  "ke giay dep bang thep",
  "ke thep khong gi",
  "khung inox",
  "wire rack",
  "shoe rack",
];
const GLASS_CABINET_KEYS = ["tu ly", ...DISPLAY_CABINET_KEYS];
const CATEGORY_TYPE_RULES = [
  { categories: ["tham"], type: "rug", color: "#c6b39b" },
  { categories: ["khung guong"], type: "mirror", color: "#cfbfac" },
  { categories: ["binh trang tri"], type: "vase", color: "#8ea99f" },
  { categories: ["ghe dai & don"], type: "bench", color: "#b8885e" },
  {
    categories: ["ghe an", "armchair", "ghe thu gian", "ghe lam viec"],
    type: "chair",
    color: "#ce8c63",
  },
  { categories: ["sofa", "sofa goc"], type: "sofa", color: "#c57a51" },
  { categories: ["giuong", "nem"], type: "bed", color: "#ddd0bd" },
  {
    categories: [
      "ban ben",
      "ban nuoc",
      "ban an",
      "ban lam viec",
      "ban console",
      "ban dau giuong",
      "ban trang diem",
    ],
    type: "table",
    color: "#a5744c",
  },
  {
    categories: [
      "tu tivi",
      "tu ly",
      "tu bep",
      "tu am tuong",
      "tu hoc keo",
      "ke sach",
      "ke phong khach",
      "xe day",
    ],
    type: "storage",
    color: "#a75e33",
  },
  { categories: ["den trang tri"], type: "lamp", color: "#2f333c" },
  {
    categories: ["tuong trang tri", "do trang tri noel"],
    type: "decor",
    color: "#c6c0b5",
  },
  { categories: ["hoa & cay"], type: "plant", color: "#3f7751" },
];

const CATEGORY_TYPES = [
  {
    keys: TEXTILE_KEYS,
    type: "textile",
    color: "#d6c9ba",
  },
  {
    keys: ["sofa", "couch", "loveseat", "sectional"],
    type: "sofa",
    color: "#c57a51",
  },
  {
    keys: FLOOR_CHAIR_KEYS,
    type: "floorChair",
    color: "#8e725f",
  },
  {
    keys: BEANBAG_KEYS,
    type: "beanbag",
    color: "#a28f83",
  },
  {
    keys: BENCH_KEYS,
    type: "bench",
    color: "#b8885e",
  },
  {
    keys: COMPONENT_KEYS,
    type: "component",
    color: "#9b9489",
  },
  {
    keys: ["armchair", "accent chair", "lounge chair", "chair", "ghe"],
    type: "chair",
    color: "#ce8c63",
  },
  {
    keys: TRAY_KEYS,
    type: "tray",
    color: "#d6c3a4",
  },
  {
    keys: RUG_KEYS,
    type: "rug",
    color: "#c6b39b",
  },
  {
    keys: MIRROR_KEYS,
    type: "mirror",
    color: "#cfbfac",
  },
  {
    keys: [
      "coffee table",
      "side table",
      "end table",
      "desk",
      "table",
      "ban go",
      "ban an",
      "ban nuoc",
      "ban ben",
      "ban lam viec",
      "ban console",
      "ban dau giuong",
      "ban phan",
    ],
    type: "table",
    color: "#a5744c",
  },
  {
    keys: VASE_KEYS,
    type: "vase",
    color: "#8ea99f",
  },
  {
    keys: BOX_KEYS,
    type: "storageBox",
    color: "#5a5c62",
  },
  {
    keys: DOLLY_KEYS,
    type: "dolly",
    color: "#2f3438",
  },
  {
    keys: COAT_RACK_KEYS,
    type: "coatRack",
    color: "#d5bb96",
  },
  {
    keys: ["giuong", "bed"],
    type: "bed",
    color: "#ddd0bd",
  },
  {
    keys: [
      ...TV_STAND_KEYS,
      ...SHELF_KEYS,
      "wardrobe",
      "cabinet",
      "closet",
      "tu",
      "drawer",
      "dresser",
      "sideboard",
      "buffet",
      "console",
    ],
    type: "storage",
    color: "#a75e33",
  },
  {
    keys: DECOR_KEYS,
    type: "decor",
    color: "#c6c0b5",
  },
  {
    keys: ["lamp", "light", "den"],
    type: "lamp",
    color: "#2f333c",
  },
  {
    keys: ["plant", "cay"],
    type: "plant",
    color: "#3f7751",
  },
];

const TYPE_DEFAULT_DIMENSIONS = {
  textile: { width: 0.74, height: 0.08, depth: 0.46 },
  sofa: { width: 2.2, height: 0.92, depth: 0.96 },
  floorChair: { width: 0.68, height: 0.62, depth: 0.74 },
  beanbag: { width: 0.92, height: 0.52, depth: 1.04 },
  bench: { width: 1.24, height: 0.48, depth: 0.46 },
  component: { width: 0.56, height: 0.12, depth: 0.28 },
  chair: { width: 0.72, height: 0.95, depth: 0.7 },
  tray: { width: 0.42, height: 0.06, depth: 0.3 },
  rug: { width: 1.8, height: 0.02, depth: 2.6 },
  mirror: { width: 0.78, height: 1.65, depth: 0.1 },
  table: { width: 1.1, height: 0.48, depth: 0.68 },
  vase: { width: 0.3, height: 0.54, depth: 0.3 },
  storageBox: { width: 0.37, height: 0.18, depth: 0.26 },
  dolly: { width: 0.37, height: 0.08, depth: 0.26 },
  coatRack: { width: 0.6, height: 1.7, depth: 0.3 },
  bed: { width: 1.8, height: 0.82, depth: 2.1 },
  storage: { width: 1.1, height: 1.9, depth: 0.52 },
  decor: { width: 0.48, height: 1.18, depth: 0.48 },
  lamp: { width: 0.34, height: 1.6, depth: 0.34 },
  plant: { width: 0.42, height: 0.8, depth: 0.42 },
};

const STORAGE_VARIANT_DEFAULT_DIMENSIONS = {
  tvStand: { width: 1.75, height: 0.62, depth: 0.46 },
  shelfTall: { width: 0.96, height: 1.95, depth: 0.38 },
  shelfWide: { width: 1.72, height: 0.96, depth: 0.36 },
  displayShelf: { width: 1.21, height: 1.81, depth: 0.36 },
  rollingShelf: { width: 0.74, height: 1.42, depth: 0.38 },
  wireRack: { width: 0.58, height: 1.55, depth: 0.3 },
  glassCabinet: { width: 1.08, height: 1.88, depth: 0.44 },
  wardrobe: { width: 1.1, height: 1.9, depth: 0.52 },
};

const TYPE_DIMENSION_LIMITS = {
  textile: {
    width: [0.34, 1.45],
    height: [0.02, 0.22],
    depth: [0.22, 1.2],
  },
  sofa: {
    width: [1.6, 2.8],
    height: [0.78, 1.05],
    depth: [0.82, 1.18],
  },
  floorChair: {
    width: [0.5, 0.9],
    height: [0.42, 0.88],
    depth: [0.58, 0.95],
  },
  beanbag: {
    width: [0.68, 1.25],
    height: [0.34, 0.78],
    depth: [0.72, 1.3],
  },
  bench: {
    width: [0.7, 1.9],
    height: [0.36, 0.72],
    depth: [0.34, 0.82],
  },
  component: {
    width: [0.08, 1.2],
    height: [0.02, 0.7],
    depth: [0.04, 0.5],
  },
  chair: {
    width: [0.58, 0.95],
    height: [0.8, 1.12],
    depth: [0.56, 0.88],
  },
  tray: {
    width: [0.28, 0.7],
    height: [0.035, 0.1],
    depth: [0.2, 0.48],
  },
  rug: {
    width: [1.2, 3.2],
    height: [0.01, 0.06],
    depth: [1.6, 4],
  },
  mirror: {
    width: [0.12, 1.25],
    height: [0.18, 2.1],
    depth: [0.02, 0.22],
  },
  table: {
    width: [0.55, 1.8],
    height: [0.38, 0.82],
    depth: [0.45, 1.2],
  },
  vase: {
    width: [0.18, 0.7],
    height: [0.24, 0.98],
    depth: [0.18, 0.7],
  },
  storageBox: {
    width: [0.28, 0.55],
    height: [0.12, 0.48],
    depth: [0.22, 0.45],
  },
  dolly: {
    width: [0.25, 0.5],
    height: [0.04, 0.12],
    depth: [0.2, 0.4],
  },
  coatRack: {
    width: [0.45, 0.9],
    height: [1.35, 2],
    depth: [0.24, 0.5],
  },
  bed: {
    width: [1.35, 2.2],
    height: [0.5, 1.02],
    depth: [1.9, 2.45],
  },
  storage: {
    width: [0.8, 1.5],
    height: [1.25, 2.2],
    depth: [0.38, 0.7],
  },
  decor: {
    width: [0.28, 0.85],
    height: [0.72, 1.45],
    depth: [0.28, 0.85],
  },
  lamp: {
    width: [0.24, 0.55],
    height: [1.15, 1.95],
    depth: [0.24, 0.55],
  },
  plant: {
    width: [0.3, 0.75],
    height: [0.55, 1.15],
    depth: [0.3, 0.75],
  },
};

const STORAGE_VARIANT_DIMENSION_LIMITS = {
  tvStand: {
    width: [1.3, 2.2],
    height: [0.45, 0.82],
    depth: [0.34, 0.6],
  },
  shelfTall: {
    width: [0.72, 1.28],
    height: [1.45, 2.25],
    depth: [0.26, 0.52],
  },
  shelfWide: {
    width: [1.2, 2.2],
    height: [0.72, 1.22],
    depth: [0.26, 0.52],
  },
  displayShelf: {
    width: [0.9, 1.4],
    height: [1.45, 2.05],
    depth: [0.26, 0.52],
  },
  rollingShelf: {
    width: [0.5, 1.02],
    height: [0.88, 1.86],
    depth: [0.26, 0.52],
  },
  wireRack: {
    width: [0.34, 1.02],
    height: [0.9, 1.95],
    depth: [0.18, 0.48],
  },
  glassCabinet: {
    width: [0.8, 1.45],
    height: [1.45, 2.2],
    depth: [0.34, 0.58],
  },
  wardrobe: {
    width: [0.8, 1.5],
    height: [1.25, 2.2],
    depth: [0.38, 0.7],
  },
};

const TYPE_LAYOUTS = {
  textile: [
    { position: [-0.85, 0, 1.08], rotation: 0.08 },
    { position: [1.1, 0, 1.05], rotation: -0.1 },
    { position: [0.9, 0, -0.85], rotation: 0.18 },
  ],
  sofa: [
    { position: [-1.55, 0, 1.15], rotation: 0.45 },
    { position: [1.55, 0, 0.85], rotation: -0.45 },
    { position: [0, 0, -1.15], rotation: Math.PI },
  ],
  floorChair: [
    { position: [-0.85, 0, 0.4], rotation: 0.5 },
    { position: [1.25, 0, 0.1], rotation: -0.55 },
  ],
  beanbag: [
    { position: [-0.4, 0, 0.95], rotation: 0.22 },
    { position: [1.35, 0, 0.85], rotation: -0.35 },
  ],
  bench: [
    { position: [0.1, 0, 0.7], rotation: 0.08 },
    { position: [-1.3, 0, -0.6], rotation: 0.28 },
  ],
  component: [
    { position: [-2.05, 0, -1.75], rotation: Math.PI / 2 },
    { position: [2.05, 0, -1.7], rotation: -Math.PI / 2 },
    { position: [-2.05, 0, 0.3], rotation: Math.PI / 2 },
  ],
  chair: [
    { position: [0.15, 0, 0.35], rotation: Math.PI },
    { position: [-2.05, 0, -0.15], rotation: 0.95 },
    { position: [2.05, 0, -0.35], rotation: -0.95 },
    { position: [0.1, 0, 1.85], rotation: Math.PI },
  ],
  tray: [
    { position: [0.2, 0, 1.08], rotation: 0.15 },
    { position: [1.05, 0, -0.58], rotation: -0.2 },
  ],
  rug: [
    { position: [0, 0, 0.35], rotation: 0 },
    { position: [0.25, 0, -0.95], rotation: 0.18 },
  ],
  mirror: [
    { position: [-2.18, 0, -0.2], rotation: Math.PI / 2 },
    { position: [2.18, 0, -0.4], rotation: -Math.PI / 2 },
  ],
  table: [
    { position: [0, 0, 1.25], rotation: 0 },
    { position: [-0.85, 0, -0.1], rotation: 0.1 },
    { position: [0.95, 0, -0.65], rotation: -0.1 },
    { position: [0, 0, -2.05], rotation: 0 },
  ],
  vase: [
    { position: [1.55, 0, 1.35], rotation: 0.18 },
    { position: [-1.5, 0, 1.3], rotation: -0.2 },
    { position: [0.95, 0, -1.2], rotation: 0.15 },
  ],
  storageBox: [
    { position: [-1.45, 0, -0.45], rotation: 0.16 },
    { position: [1.45, 0, -0.88], rotation: -0.18 },
  ],
  dolly: [{ position: [0.8, 0, -1.52], rotation: 0.08 }],
  coatRack: [
    { position: [-2.1, 0, 0.95], rotation: 0.18 },
    { position: [2.05, 0, 1.1], rotation: -0.18 },
  ],
  bed: [
    { position: [0.15, 0, -1.75], rotation: 0 },
    { position: [-1.3, 0, -1.55], rotation: 0.15 },
  ],
  storage: [
    { position: [2.2, 0, -1.35], rotation: -Math.PI / 2 },
    { position: [-2.15, 0, -1.4], rotation: Math.PI / 2 },
    { position: [2.2, 0, 1.8], rotation: -Math.PI / 2 },
  ],
  tvStand: [
    { position: [0, 0, -2.05], rotation: 0 },
    { position: [1.85, 0, -1.8], rotation: -0.15 },
  ],
  shelfTall: [
    { position: [2.2, 0, -1.25], rotation: -Math.PI / 2 },
    { position: [-2.15, 0, -1.1], rotation: Math.PI / 2 },
    { position: [2.15, 0, 1.65], rotation: -Math.PI / 2 },
  ],
  shelfWide: [
    { position: [1.95, 0, 1.2], rotation: -Math.PI / 2 },
    { position: [-1.9, 0, 1.1], rotation: Math.PI / 2 },
  ],
  displayShelf: [{ position: [2.15, 0, -0.4], rotation: -Math.PI / 2 }],
  rollingShelf: [
    { position: [2.15, 0, -0.25], rotation: -Math.PI / 2 },
    { position: [-2.1, 0, 0.55], rotation: Math.PI / 2 },
  ],
  wireRack: [
    { position: [2.2, 0, -1.2], rotation: -Math.PI / 2 },
    { position: [-2.1, 0, -1.1], rotation: Math.PI / 2 },
    { position: [2.15, 0, 1.55], rotation: -Math.PI / 2 },
  ],
  glassCabinet: [{ position: [-2.15, 0, -0.95], rotation: Math.PI / 2 }],
  decor: [
    { position: [1.85, 0, 1.6], rotation: 0.25 },
    { position: [-1.85, 0, 1.55], rotation: -0.25 },
    { position: [0.95, 0, -1.35], rotation: 0.1 },
  ],
  lamp: [
    { position: [2.1, 0, 1.8], rotation: 0 },
    { position: [-2.1, 0, 1.8], rotation: 0 },
  ],
  plant: [
    { position: [1.55, 0, 1.6], rotation: 0 },
    { position: [-1.7, 0, 1.7], rotation: 0 },
    { position: [2.2, 0, 0.6], rotation: 0 },
  ],
};

const GENERAL_LAYOUTS = [
  { position: [-1.45, 0, 0.95], rotation: 0.35 },
  { position: [0, 0, 0.15], rotation: Math.PI },
  { position: [1.45, 0, -0.45], rotation: -0.35 },
  { position: [-1.55, 0, -1.25], rotation: 0.15 },
  { position: [1.65, 0, 1.45], rotation: -0.6 },
  { position: [0, 0, -1.8], rotation: 0 },
];

const getSavedAiViewerState = () => {
  if (typeof window === "undefined" || !window.sessionStorage) return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Load saved AI viewer state error:", error);
    return null;
  }
};

const saveAiViewerState = (state) => {
  if (typeof window === "undefined" || !window.sessionStorage) return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Save AI viewer state error:", error);
  }
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const parseDimension = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const toMeters = (value, fallback) => {
  if (!value) return fallback;
  return value > 10 ? value / 100 : value;
};

const getRoomMetrics = (dimensions) => ({
  width: toMeters(
    parseDimension(dimensions?.width),
    DEFAULT_ROOM_DIMENSIONS.width,
  ),
  length: toMeters(
    parseDimension(dimensions?.length ?? dimensions?.depth),
    DEFAULT_ROOM_DIMENSIONS.length,
  ),
  height: toMeters(
    parseDimension(dimensions?.height),
    DEFAULT_ROOM_DIMENSIONS.height,
  ),
});

const getItemFloorOffset = (item) => (item?.type === "rug" ? 0.01 : 0);

const clampItemPositionToRoom = (
  position,
  itemDimensions,
  roomDimensions,
  item,
) => {
  const room = getRoomMetrics(roomDimensions);
  const rotation = item?.rotation || 0;
  const cos = Math.abs(Math.cos(rotation));
  const sin = Math.abs(Math.sin(rotation));
  const footprintWidth =
    itemDimensions.width * cos + itemDimensions.depth * sin;
  const footprintDepth =
    itemDimensions.width * sin + itemDimensions.depth * cos;
  const minX = -room.width / 2 + footprintWidth / 2 + DRAG_ROOM_PADDING;
  const maxX = room.width / 2 - footprintWidth / 2 - DRAG_ROOM_PADDING;
  const minZ = -room.length / 2 + footprintDepth / 2 + DRAG_ROOM_PADDING;
  const maxZ = room.length / 2 - footprintDepth / 2 - DRAG_ROOM_PADDING;

  return [
    clamp(position[0], Math.min(minX, maxX), Math.max(minX, maxX)),
    getItemFloorOffset(item),
    clamp(position[2], Math.min(minZ, maxZ), Math.max(minZ, maxZ)),
  ];
};

const extractPlanarSizeFromText = (item) => {
  const source = normalizeText(
    `${item?.name || ""} ${item?.description || ""}`,
  );
  const match = source.match(
    /(\d+(?:[.,]\d+)?)\s*m\s*x\s*(\d+(?:[.,]\d+)?)\s*m/,
  );

  if (!match) return null;

  const sizeA = Number(match[1].replace(",", "."));
  const sizeB = Number(match[2].replace(",", "."));

  if (!Number.isFinite(sizeA) || !Number.isFinite(sizeB)) return null;

  return {
    width: Math.min(sizeA, sizeB) * 100,
    depth: Math.max(sizeA, sizeB) * 100,
  };
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

const escapeRegExp = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matchesKeyword = (source, keyword) => {
  const normalizedKey = normalizeText(keyword).trim();

  if (!normalizedKey) return false;

  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapeRegExp(normalizedKey)}([^a-z0-9]|$)`,
  );

  return pattern.test(source);
};

const getProductId = (product) =>
  product?.id || product?._id || product?.productId || product?.product?.id;

const sourceTextOf = (product) =>
  normalizeText(`${product?.category || ""} ${product?.name || ""}`);

const categoryTextOf = (product) => normalizeText(product?.category || "");

const isLikelyCssColor = (value) =>
  typeof value === "string" &&
  (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim()) ||
    /^rgb/i.test(value.trim()) ||
    /^[a-zA-Z\s]+$/.test(value.trim()));

const getItemType = (product) => {
  const source = sourceTextOf(product);
  const category = categoryTextOf(product);
  const standaloneFramePart =
    (matchesKeyword(source, "khung inox") ||
      matchesKeyword(source, "khung thep")) &&
    ![
      "ke thep",
      "ke go",
      "ke luu tru",
      "ke giay dep",
      "wire rack",
      "shoe rack",
    ].some((keyword) => matchesKeyword(source, keyword));

  const categoryMatch = CATEGORY_TYPE_RULES.find((item) =>
    item.categories.some((value) => category.includes(normalizeText(value))),
  );

  if (categoryMatch) {
    return categoryMatch;
  }

  if (standaloneFramePart) {
    return { type: "component", color: "#9b9489" };
  }

  return (
    CATEGORY_TYPES.find((item) =>
      item.keys.some((key) => matchesKeyword(source, key)),
    ) ||
    CATEGORY_TYPES.find((item) => item.type === "chair") ||
    CATEGORY_TYPES[0]
  );
};

const getStorageVariant = (product) => {
  const source = sourceTextOf(product);
  const category = categoryTextOf(product);
  const rawHeight = parseDimension(product?.dimensions?.height);
  const rawWidth = parseDimension(
    product?.dimensions?.width ?? product?.dimensions?.length,
  );
  const rawDepth = parseDimension(
    product?.dimensions?.depth ?? product?.dimensions?.length,
  );

  if (
    category.includes("xe day") ||
    ROLLING_STORAGE_KEYS.some((keyword) => matchesKeyword(source, keyword))
  ) {
    return "rollingShelf";
  }

  if (WIRE_RACK_KEYS.some((keyword) => matchesKeyword(source, keyword))) {
    return "wireRack";
  }

  if (
    category.includes("tu tivi") ||
    TV_STAND_KEYS.some((keyword) => matchesKeyword(source, keyword)) ||
    (rawWidth >= 120 && rawHeight > 0 && rawHeight <= 90 && rawDepth <= 65)
  ) {
    return "tvStand";
  }

  if (
    category.includes("tu ly") ||
    GLASS_CABINET_KEYS.some((keyword) => matchesKeyword(source, keyword))
  ) {
    return "glassCabinet";
  }

  if (
    SHELF_KEYS.some((keyword) => matchesKeyword(source, keyword)) ||
    SHELF_CATEGORY_KEYS.some((keyword) => category.includes(keyword)) ||
    source.includes("hangar")
  ) {
    if (
      source.includes("3 tang gold") ||
      (source.includes("gold") && rawHeight >= 150 && rawWidth >= 100)
    ) {
      return "displayShelf";
    }

    if (
      TALL_SHELF_KEYS.some((keyword) => matchesKeyword(source, keyword)) ||
      rawHeight >= 145
    ) {
      return "shelfTall";
    }

    if (
      WIDE_SHELF_KEYS.some((keyword) => matchesKeyword(source, keyword)) ||
      (rawWidth >= 120 && rawHeight >= 70 && rawHeight <= 125)
    ) {
      return "shelfWide";
    }

    return "shelfWide";
  }

  if (
    ["drawer", "dresser", "sideboard", "buffet"].some((keyword) =>
      matchesKeyword(source, keyword),
    )
  ) {
    return "wardrobe";
  }

  return "wardrobe";
};

const getStorageBoxVariant = (product) => {
  const source = sourceTextOf(product);
  const material = normalizeText(product?.material || "");

  if (
    matchesKeyword(source, "nap hoc keo") ||
    matchesKeyword(source, "nap hop")
  ) {
    return "lidBox";
  }

  if (
    matchesKeyword(source, "bo 3 ngan keo") ||
    matchesKeyword(source, "3 ngan keo") ||
    matchesKeyword(source, "3 drawer")
  ) {
    return "drawerTower";
  }

  if (
    matchesKeyword(source, "ngan keo") ||
    matchesKeyword(source, "hoc keo") ||
    matchesKeyword(source, "drawer")
  ) {
    return "drawerBox";
  }

  if (
    matchesKeyword(source, "hop tre") ||
    matchesKeyword(source, "xep chong") ||
    material.includes("tre")
  ) {
    return "bambooBox";
  }

  if (
    matchesKeyword(source, "hop vai") ||
    matchesKeyword(source, "phan vung") ||
    matchesKeyword(source, "tui") ||
    material.includes("linen") ||
    material.includes("vai")
  ) {
    return "softBox";
  }

  if (
    BASKET_KEYS.some((keyword) => matchesKeyword(source, keyword)) ||
    matchesKeyword(source, "gio thep") ||
    matchesKeyword(source, "gio dan")
  ) {
    return "basketBox";
  }

  if (matchesKeyword(source, "co quai") || matchesKeyword(source, "handle")) {
    return "handledBin";
  }

  if (
    matchesKeyword(source, "hop luu tru nhua") ||
    matchesKeyword(source, "storage case") ||
    material.includes("nhua") ||
    material.includes("pp")
  ) {
    return "plasticBox";
  }

  return "handledBin";
};

const getTextileVariant = (item) => {
  const source = sourceTextOf(item);

  if (
    ["rem", "curtain", "drape"].some((keyword) =>
      matchesKeyword(source, keyword),
    )
  ) {
    return "curtain";
  }

  if (
    ["khan trai", "tablecloth", "lot dia", "placemat"].some((keyword) =>
      matchesKeyword(source, keyword),
    )
  ) {
    return "runner";
  }

  if (
    ["tam lot", "mattress pad", "bed pad"].some((keyword) =>
      matchesKeyword(source, keyword),
    )
  ) {
    return "pad";
  }

  return "folded";
};

const getComponentVariant = (item) => {
  const source = sourceTextOf(item);

  if (matchesKeyword(source, "chan go")) {
    return "legs";
  }

  if (matchesKeyword(source, "tay vin cho")) {
    return "armrest";
  }

  if (
    ["vach ben", "thanh inox", "khung inox", "khung thep"].some((keyword) =>
      matchesKeyword(source, keyword),
    )
  ) {
    return "frame";
  }

  if (matchesKeyword(source, "dau giuong")) {
    return "headboard";
  }

  return "panel";
};

const getRawDimensionSet = (item) => {
  const rawWidth = parseDimension(
    item?.dimensions?.width ?? item?.dimensions?.length,
  );
  const rawHeight = parseDimension(item?.dimensions?.height);
  const rawDepth = parseDimension(
    item?.dimensions?.depth ?? item?.dimensions?.length,
  );
  const sorted = [rawWidth, rawHeight, rawDepth]
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (item?.type === "rug") {
    const textSize = extractPlanarSizeFromText(item);

    return {
      width: rawWidth || textSize?.width || 180,
      height: rawHeight || 2,
      depth: rawDepth || textSize?.depth || 260,
    };
  }

  if (item?.type === "mirror" && sorted.length === 3) {
    return {
      width: sorted[1],
      height: sorted[2],
      depth: sorted[0],
    };
  }

  if (item?.type === "bench" && sorted.length === 3) {
    return {
      width: sorted[2],
      height: sorted[1],
      depth: sorted[0],
    };
  }

  if (item?.type === "beanbag") {
    const footprint = Math.max(rawWidth || 0, rawDepth || 0, sorted[2] || 0);

    return {
      width: footprint,
      height: rawHeight || sorted[1] || 0,
      depth: footprint,
    };
  }

  if (item?.type === "vase" && sorted.length === 3) {
    return {
      width: sorted[1],
      height: sorted[2],
      depth: sorted[1],
    };
  }

  if (item?.type === "textile" && sorted.length === 3) {
    return {
      width: sorted[2],
      height: sorted[0],
      depth: sorted[1],
    };
  }

  if (
    ["tray", "storageBox", "dolly"].includes(item?.type) &&
    sorted.length === 3
  ) {
    if (item?.boxVariant === "drawerTower") {
      return {
        width: sorted[2],
        height: sorted[0] * 3 + 2,
        depth: sorted[1],
      };
    }

    return {
      width: sorted[2],
      height: sorted[0],
      depth: sorted[1],
    };
  }

  if (item?.type === "component" && sorted.length === 3) {
    return {
      width: sorted[2],
      height: sorted[0],
      depth: sorted[1],
    };
  }

  if (item?.type === "coatRack") {
    return {
      width: Math.max(rawWidth, rawDepth),
      height: rawHeight || rawWidth || 0,
      depth: Math.min(rawWidth || rawDepth || 0, rawDepth || rawWidth || 0),
    };
  }

  if (item?.type === "floorChair") {
    return {
      width: Math.max(rawWidth, rawDepth),
      height: rawHeight || Math.min(rawWidth, rawDepth),
      depth: Math.min(rawWidth || rawDepth || 0, rawDepth || rawWidth || 0),
    };
  }

  if (item?.type === "storage" && rawDepth && rawWidth && rawDepth > rawWidth) {
    return {
      width: rawDepth,
      height: rawHeight,
      depth: rawWidth,
    };
  }

  return {
    width: rawWidth,
    height: rawHeight,
    depth: rawDepth,
  };
};

const formatItemDimensionsText = (item) => {
  const raw = getRawDimensionSet(item);

  if (!raw.width && !raw.height && !raw.depth) {
    return item?.dimensionsText || "Chưa có dữ liệu";
  }

  return `${raw.width || 0} x ${raw.depth || 0} x ${raw.height || 0} cm`;
};

const getItemDimensions = (item) => {
  const defaults =
    item.type === "storage"
      ? STORAGE_VARIANT_DEFAULT_DIMENSIONS[item.storageVariant || "wardrobe"] ||
        STORAGE_VARIANT_DEFAULT_DIMENSIONS.wardrobe
      : TYPE_DEFAULT_DIMENSIONS[item.type] || TYPE_DEFAULT_DIMENSIONS.chair;
  const limits =
    item.type === "storage"
      ? STORAGE_VARIANT_DIMENSION_LIMITS[item.storageVariant || "wardrobe"] ||
        STORAGE_VARIANT_DIMENSION_LIMITS.wardrobe
      : TYPE_DIMENSION_LIMITS[item.type] || TYPE_DIMENSION_LIMITS.chair;
  const raw = getRawDimensionSet(item);

  return {
    width: clamp(
      toMeters(raw.width, defaults.width),
      limits.width[0],
      limits.width[1],
    ),
    height: clamp(
      toMeters(raw.height, defaults.height),
      limits.height[0],
      limits.height[1],
    ),
    depth: clamp(
      toMeters(raw.depth, defaults.depth),
      limits.depth[0],
      limits.depth[1],
    ),
  };
};

const getPlacement = (type, typeIndex, overallIndex) => {
  const byType = TYPE_LAYOUTS[type] || [];

  if (byType[typeIndex]) {
    return byType[typeIndex];
  }

  if (GENERAL_LAYOUTS[overallIndex]) {
    return GENERAL_LAYOUTS[overallIndex];
  }

  const row = Math.floor(overallIndex / 3);
  const column = overallIndex % 3;

  return {
    position: [-1.5 + column * 1.5, 0, -0.4 - row * 1.35],
    rotation: column === 1 ? Math.PI : 0,
  };
};

const parseOptionalNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const pickOptionalNumber = (source, keys) => {
  if (!source || typeof source !== "object") return undefined;

  for (const key of keys) {
    if (source[key] === undefined || source[key] === null) continue;

    const parsed = parseOptionalNumber(source[key]);
    if (parsed !== null) return parsed;
  }

  return undefined;
};

const normalizeViewerLayoutPosition = (value) => {
  if (Array.isArray(value)) {
    const x = parseOptionalNumber(value[0]);
    const y = value.length >= 3 ? parseOptionalNumber(value[1]) : 0;
    const z =
      value.length >= 3
        ? parseOptionalNumber(value[2])
        : parseOptionalNumber(value[1]);

    return x === null || z === null ? null : [x, y ?? 0, z];
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const x = pickOptionalNumber(value, [
    "x",
    "xM",
    "x_m",
    "centerX",
    "center_x",
  ]);
  const explicitZ = pickOptionalNumber(value, [
    "z",
    "zM",
    "z_m",
    "centerZ",
    "center_z",
  ]);
  const floorY = pickOptionalNumber(value, [
    "y",
    "yM",
    "y_m",
    "centerY",
    "center_y",
  ]);
  const verticalY =
    pickOptionalNumber(value, [
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

const normalizeViewerLayoutRotation = (value) => {
  let parsed;
  let unit = "";

  if (typeof value === "number" || typeof value === "string") {
    parsed = parseOptionalNumber(value);
  } else if (value && typeof value === "object") {
    parsed = pickOptionalNumber(value, [
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
    unit = value.unit || value.rotationUnit || "";
  }

  if (parsed === null || parsed === undefined) {
    return 0;
  }

  if (
    String(unit).toLowerCase().includes("deg") ||
    Math.abs(parsed) > Math.PI * 2
  ) {
    return (parsed * Math.PI) / 180;
  }

  return parsed;
};

const getAiLayoutPlacement = (product) => {
  const source =
    product?.layoutPlacement ||
    product?.aiLayout ||
    product?.layout ||
    product?.placement;
  const positionSource =
    source?.position ||
    source?.coordinates ||
    source?.coordinate ||
    source?.center ||
    source?.location ||
    product?.position;
  const position = normalizeViewerLayoutPosition(positionSource);

  if (!position) {
    return null;
  }

  return {
    position,
    rotation: normalizeViewerLayoutRotation(
      source?.rotation ?? product?.rotation,
    ),
    modelUrl: source?.modelUrl || product?.modelUrl || "",
    score: source?.score ?? product?.layoutScore,
  };
};

const getSurfacePlacementForAccessory = (item, anchors, accessoryIndex) => {
  const itemDimensions = getItemDimensions(item);
  const textileVariant =
    item.type === "textile" ? getTextileVariant(item) : null;
  const eligibleAnchors = anchors.filter((anchor) => {
    if (item.type === "textile") {
      if (textileVariant === "curtain") return false;

      if (["table", "sofa", "bench", "bed"].includes(anchor.type)) return true;

      if (anchor.type !== "storage") return false;

      return [
        "tvStand",
        "shelfWide",
        "displayShelf",
        "rollingShelf",
        "wireRack",
      ].includes(anchor.storageVariant);
    }

    if (item.type === "storageBox") {
      if (anchor.type === "table") return true;
      if (anchor.type !== "storage") return false;

      return [
        "tvStand",
        "shelfWide",
        "displayShelf",
        "rollingShelf",
        "wireRack",
        "glassCabinet",
        "shelfTall",
      ].includes(anchor.storageVariant);
    }

    if (anchor.type === "table") return true;
    if (anchor.type !== "storage") return false;

    const allowedVariants =
      item.type === "tray"
        ? ["tvStand", "shelfWide", "displayShelf", "rollingShelf", "wireRack"]
        : [
            "tvStand",
            "shelfWide",
            "displayShelf",
            "rollingShelf",
            "wireRack",
            "glassCabinet",
          ];

    return allowedVariants.includes(anchor.storageVariant);
  });

  if (!eligibleAnchors.length) return null;

  const anchor = eligibleAnchors[accessoryIndex % eligibleAnchors.length];
  const dimensions = getItemDimensions(anchor);
  const rotation = anchor.rotation || 0;
  const offsetPatterns =
    item.type === "tray"
      ? [
          [0, 0],
          [0.16, -0.08],
          [-0.16, 0.08],
        ]
      : item.type === "storageBox"
        ? [
            [-0.18, 0.1],
            [0.18, -0.08],
            [0, -0.18],
          ]
        : item.type === "textile"
          ? [
              [0, 0],
              [0.18, 0.08],
              [-0.16, -0.1],
            ]
          : [
              [0.2, 0.12],
              [-0.18, -0.1],
              [0, -0.18],
            ];
  const [offsetXFactor, offsetZFactor] =
    offsetPatterns[accessoryIndex % offsetPatterns.length];

  const localOffsetX = dimensions.width * offsetXFactor;
  const localOffsetZ = dimensions.depth * offsetZFactor;
  let positionY = anchor.position[1] || 0;

  if (anchor.type === "table") {
    positionY += dimensions.height + itemDimensions.height / 2 + 0.02;
  } else if (anchor.type === "sofa") {
    positionY += dimensions.height * 0.48 + itemDimensions.height / 2 + 0.02;
  } else if (anchor.type === "bench") {
    positionY += dimensions.height * 0.78 + itemDimensions.height / 2 + 0.02;
  } else if (anchor.type === "bed") {
    positionY += 0.3 + itemDimensions.height / 2;
  } else {
    switch (anchor.storageVariant) {
      case "tvStand":
        positionY += dimensions.height + itemDimensions.height / 2 + 0.03;
        break;
      case "shelfWide":
        positionY +=
          dimensions.height *
            (item.type === "storageBox"
              ? accessoryIndex % 2 === 0
                ? 0.23
                : 0.77
              : 1) +
          itemDimensions.height / 2 +
          0.03;
        break;
      case "displayShelf":
        positionY +=
          dimensions.height * [0.14, 0.46, 0.8][accessoryIndex % 3] +
          itemDimensions.height / 2 +
          0.03;
        break;
      case "rollingShelf":
        positionY +=
          dimensions.height * [0.16, 0.48, 0.8][accessoryIndex % 3] +
          itemDimensions.height / 2 +
          0.03;
        break;
      case "wireRack":
        positionY +=
          dimensions.height * [0.16, 0.38, 0.6, 0.82][accessoryIndex % 4] +
          itemDimensions.height / 2 +
          0.03;
        break;
      case "shelfTall":
        positionY +=
          dimensions.height *
            [0.06, 0.26, 0.46, 0.66, 0.86][accessoryIndex % 5] +
          itemDimensions.height / 2 +
          0.03;
        break;
      case "glassCabinet":
        positionY +=
          dimensions.height * [0.18, 0.42, 0.66][accessoryIndex % 3] +
          itemDimensions.height / 2 +
          0.03;
        break;
      default:
        positionY += dimensions.height + itemDimensions.height / 2 + 0.02;
        break;
    }
  }

  const rotatedOffsetX =
    localOffsetX * Math.cos(rotation) - localOffsetZ * Math.sin(rotation);
  const rotatedOffsetZ =
    localOffsetX * Math.sin(rotation) + localOffsetZ * Math.cos(rotation);

  return {
    position: [
      anchor.position[0] + rotatedOffsetX,
      positionY,
      anchor.position[2] + rotatedOffsetZ,
    ],
    rotation: rotation + (item.type === "tray" ? 0.14 : 0.08),
  };
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price) || 0);

function ModelMaterial({ color, roughness = 0.5, metalness = 0 }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      clearcoat={0.12}
      clearcoatRoughness={0.28}
      reflectivity={0.25}
      envMapIntensity={0.65}
    />
  );
}

function Room({ dimensions }) {
  const width = Number(dimensions?.width) || 4.8;
  const length = Number(dimensions?.length) || 5.8;
  const height = Number(dimensions?.height) || 3;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#eee7dc" roughness={0.84} />
      </mesh>

      <mesh position={[0, height / 2, -length / 2]} receiveShadow>
        <boxGeometry args={[width, height, 0.08]} />
        <meshStandardMaterial color="#fbfaf6" roughness={0.92} />
      </mesh>

      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.08, height, length]} />
        <meshStandardMaterial color="#f5f2eb" roughness={0.92} />
      </mesh>
    </group>
  );
}

function ProductLabel({ item, y }) {
  return (
    <Html center distanceFactor={8} position={[0, y, 0]}>
      <div className={`${styles.sceneLabel} ${styles.sceneLabelActive}`}>
        <span>{item.name}</span>
        <strong>{formatPrice(item.price)}</strong>
      </div>
    </Html>
  );
}

function KeyboardNavigation({ controlsRef, enabled = true }) {
  const { camera } = useThree();
  const pressedRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const forwardVector = useMemo(() => new Vector3(), []);
  const rightVector = useMemo(() => new Vector3(), []);
  const moveDelta = useMemo(() => new Vector3(), []);

  useEffect(() => {
    const handleKeyChange = (event, active) => {
      const tagName = event.target?.tagName?.toLowerCase();

      if (tagName === "input" || tagName === "textarea") return;

      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          pressedRef.current.forward = active;
          break;
        case "s":
        case "arrowdown":
          pressedRef.current.backward = active;
          break;
        case "a":
        case "arrowleft":
          pressedRef.current.left = active;
          break;
        case "d":
        case "arrowright":
          pressedRef.current.right = active;
          break;
        default:
          return;
      }

      event.preventDefault();
    };

    const handleKeyDown = (event) => handleKeyChange(event, true);
    const handleKeyUp = (event) => handleKeyChange(event, false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!enabled || !controlsRef.current) return;

    const { forward, backward, left, right } = pressedRef.current;

    if (!forward && !backward && !left && !right) return;

    forwardVector
      .subVectors(controlsRef.current.target, camera.position)
      .setY(0);

    if (forwardVector.lengthSq() === 0) {
      forwardVector.set(0, 0, -1);
    } else {
      forwardVector.normalize();
    }

    rightVector.crossVectors(forwardVector, camera.up).normalize();
    moveDelta.set(0, 0, 0);

    if (forward) moveDelta.add(forwardVector);
    if (backward) moveDelta.sub(forwardVector);
    if (right) moveDelta.add(rightVector);
    if (left) moveDelta.sub(rightVector);

    if (moveDelta.lengthSq() === 0) return;

    moveDelta.normalize().multiplyScalar(delta * 2.6);
    camera.position.add(moveDelta);
    controlsRef.current.target.add(moveDelta);
    controlsRef.current.update();
  });

  return null;
}

function FurnitureModel({
  item,
  selected,
  onDragStateChange,
  onMoveItem,
  onSelect,
  roomDimensions,
}) {
  const groupRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const dragPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), []);
  const dragIntersection = useMemo(() => new Vector3(), []);
  const dragOffsetRef = useRef(new Vector3());
  const draggedRef = useRef(false);
  const active = selected || hovered;
  const dimensions = useMemo(() => getItemDimensions(item), [item]);
  const highlightRadius = Math.max(
    0.48,
    Math.max(dimensions.width, dimensions.depth) * 0.58,
  );
  const labelHeight = Math.min(1.9, dimensions.height + 0.5);
  const baseColor = item.color;
  const woodColor = "#7b583e";
  const darkWoodColor = "#4d3727";
  const softAccent = "#f6efe6";
  const metalColor = "#e5dacc";
  const plantPotColor = "#8f5e3f";
  const storageVariant = item.storageVariant || "wardrobe";
  const boxVariant = item.boxVariant || "handledBin";
  const normalizedSource = sourceTextOf(item);
  const textileVariant =
    item.type === "textile" ? getTextileVariant(item) : "folded";
  const componentVariant =
    item.type === "component" ? getComponentVariant(item) : "panel";
  const mirrorVariant =
    item.type === "mirror"
      ? /treo tuong/.test(normalizedSource)
        ? "wall"
        : /guong gap|folding mirror/.test(normalizedSource) ||
            (dimensions.width <= 0.22 && dimensions.height <= 0.4)
          ? "table"
          : "standing"
      : "standing";

  useFrame((state) => {
    if (!groupRef.current) return;

    const targetY =
      active && !draggedRef.current
        ? Math.sin(state.clock.elapsedTime * 2.4) * 0.018
        : 0;
    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * 0.18;
  });

  return (
    <group
      ref={groupRef}
      position={item.position}
      rotation={[0, item.rotation || 0, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(item);
      }}
      onPointerDown={(event) => {
        if (event.button !== undefined && event.button !== 0) return;

        event.stopPropagation();
        onSelect(item);

        if (!event.ray.intersectPlane(dragPlane, dragIntersection)) return;

        dragOffsetRef.current.set(
          dragIntersection.x - item.position[0],
          0,
          dragIntersection.z - item.position[2],
        );
        draggedRef.current = true;
        onDragStateChange?.(item.id);
        event.target.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!draggedRef.current) return;

        event.stopPropagation();

        if (!event.ray.intersectPlane(dragPlane, dragIntersection)) return;

        const clampedPosition = clampItemPositionToRoom(
          [
            dragIntersection.x - dragOffsetRef.current.x,
            0,
            dragIntersection.z - dragOffsetRef.current.z,
          ],
          dimensions,
          roomDimensions,
          item,
        );

        onMoveItem?.(item.id, clampedPosition);
      }}
      onPointerOut={() => {
        if (!draggedRef.current) {
          setHovered(false);
        }
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerUp={(event) => {
        if (!draggedRef.current) return;

        event.stopPropagation();
        draggedRef.current = false;
        onDragStateChange?.(null);
        event.target.releasePointerCapture?.(event.pointerId);
      }}
      onPointerCancel={(event) => {
        if (!draggedRef.current) return;

        draggedRef.current = false;
        onDragStateChange?.(null);
        event.target.releasePointerCapture?.(event.pointerId);
      }}
    >
      {item.type === "sofa" && (
        <>
          <RoundedBox
            castShadow
            args={[dimensions.width, 0.24, dimensions.depth * 0.72]}
            radius={0.08}
            position={[0, 0.22, 0.04]}
          >
            <ModelMaterial color={baseColor} roughness={0.44} />
          </RoundedBox>
          <RoundedBox
            castShadow
            args={[dimensions.width * 0.96, 0.46, 0.16]}
            radius={0.07}
            position={[0, 0.53, -dimensions.depth * 0.28]}
          >
            <ModelMaterial color={baseColor} roughness={0.46} />
          </RoundedBox>
          <RoundedBox
            castShadow
            args={[0.15, 0.42, dimensions.depth * 0.82]}
            radius={0.07}
            position={[-dimensions.width / 2 + 0.08, 0.4, 0.02]}
          >
            <ModelMaterial color={baseColor} roughness={0.48} />
          </RoundedBox>
          <RoundedBox
            castShadow
            args={[0.15, 0.42, dimensions.depth * 0.82]}
            radius={0.07}
            position={[dimensions.width / 2 - 0.08, 0.4, 0.02]}
          >
            <ModelMaterial color={baseColor} roughness={0.48} />
          </RoundedBox>
          {[...Array(dimensions.width > 2.15 ? 3 : 2)].map(
            (_, index, items) => {
              const spread = items.length === 3 ? 0.33 : 0.24;
              const offset =
                (index - (items.length - 1) / 2) * dimensions.width * spread;

              return (
                <RoundedBox
                  castShadow
                  key={`sofa-cushion-${index}`}
                  args={[
                    dimensions.width * 0.26,
                    0.12,
                    dimensions.depth * 0.22,
                  ]}
                  radius={0.06}
                  position={[offset, 0.32, -0.08]}
                >
                  <ModelMaterial color={softAccent} roughness={0.72} />
                </RoundedBox>
              );
            },
          )}
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([x, z], index) => (
            <mesh
              castShadow
              key={`sofa-leg-${index}`}
              position={[
                x * (dimensions.width / 2 - 0.1),
                0.06,
                z * (dimensions.depth * 0.28),
              ]}
            >
              <cylinderGeometry args={[0.04, 0.045, 0.12, 18]} />
              <ModelMaterial color={darkWoodColor} roughness={0.72} />
            </mesh>
          ))}
        </>
      )}

      {item.type === "floorChair" && (
        <>
          <RoundedBox
            castShadow
            args={[dimensions.width * 0.92, 0.16, dimensions.depth * 0.72]}
            radius={0.08}
            position={[0, 0.1, dimensions.depth * 0.08]}
          >
            <ModelMaterial color={baseColor} roughness={0.72} />
          </RoundedBox>
          <RoundedBox
            castShadow
            args={[dimensions.width * 0.9, 0.14, dimensions.depth * 0.54]}
            radius={0.08}
            position={[0, 0.18, -dimensions.depth * 0.18]}
            rotation={[-0.48, 0, 0]}
          >
            <ModelMaterial color={baseColor} roughness={0.72} />
          </RoundedBox>
          <RoundedBox
            castShadow
            args={[dimensions.width * 0.88, 0.14, dimensions.depth * 0.4]}
            radius={0.08}
            position={[0, 0.38, -dimensions.depth * 0.38]}
            rotation={[-0.85, 0, 0]}
          >
            <ModelMaterial color={baseColor} roughness={0.72} />
          </RoundedBox>
        </>
      )}

      {item.type === "beanbag" && (
        <>
          <mesh
            castShadow
            position={[0, dimensions.height * 0.34, 0.06]}
            scale={[1.1, 0.72, 1.18]}
          >
            <sphereGeometry args={[dimensions.width * 0.34, 28, 28]} />
            <ModelMaterial color={baseColor} roughness={0.84} />
          </mesh>
          <mesh
            castShadow
            position={[0, dimensions.height * 0.56, -dimensions.depth * 0.12]}
            scale={[0.98, 0.86, 0.82]}
          >
            <sphereGeometry args={[dimensions.width * 0.28, 28, 28]} />
            <ModelMaterial color={baseColor} roughness={0.84} />
          </mesh>
          <mesh castShadow position={[0, 0.08, 0.02]}>
            <cylinderGeometry
              args={[
                dimensions.width * 0.38,
                dimensions.width * 0.34,
                0.12,
                26,
              ]}
            />
            <ModelMaterial color={baseColor} roughness={0.86} />
          </mesh>
        </>
      )}

      {item.type === "textile" && (
        <>
          {textileVariant === "curtain" ? (
            <>
              <mesh
                castShadow
                position={[0, Math.max(dimensions.width * 1.05, 1.7), 0]}
              >
                <cylinderGeometry
                  args={[
                    0.025,
                    0.025,
                    Math.max(dimensions.width * 0.9, 1.05),
                    20,
                  ]}
                />
                <ModelMaterial
                  color={metalColor}
                  roughness={0.36}
                  metalness={0.18}
                />
              </mesh>
              <RoundedBox
                castShadow
                args={[
                  Math.max(dimensions.width, 0.9),
                  Math.max(dimensions.width * 1.6, 1.55),
                  0.03,
                ]}
                radius={0.05}
                position={[0, Math.max(dimensions.width * 0.8, 0.8), 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.94} />
              </RoundedBox>
            </>
          ) : textileVariant === "runner" ? (
            <>
              <RoundedBox
                castShadow
                args={[dimensions.width, dimensions.height, dimensions.depth]}
                radius={0.04}
                position={[0, dimensions.height / 2, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.96} />
              </RoundedBox>
              <mesh castShadow position={[0, dimensions.height + 0.005, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.84,
                    dimensions.height * 0.24,
                    dimensions.depth * 0.84,
                  ]}
                />
                <ModelMaterial color={softAccent} roughness={0.98} />
              </mesh>
            </>
          ) : textileVariant === "pad" ? (
            <>
              <RoundedBox
                castShadow
                args={[
                  dimensions.width,
                  Math.max(dimensions.height, 0.06),
                  dimensions.depth,
                ]}
                radius={0.04}
                position={[0, Math.max(dimensions.height, 0.06) / 2, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.92} />
              </RoundedBox>
              <RoundedBox
                castShadow
                args={[
                  dimensions.width * 0.94,
                  Math.max(dimensions.height * 0.46, 0.03),
                  dimensions.depth * 0.94,
                ]}
                radius={0.04}
                position={[0, Math.max(dimensions.height, 0.06) * 0.92, 0]}
              >
                <ModelMaterial color={softAccent} roughness={0.96} />
              </RoundedBox>
            </>
          ) : (
            <>
              {[0, 1].map((layer) => (
                <RoundedBox
                  castShadow
                  key={`textile-layer-${layer}`}
                  args={[
                    dimensions.width * (layer === 0 ? 1 : 0.88),
                    Math.max(dimensions.height * 0.7, 0.045),
                    dimensions.depth * (layer === 0 ? 1 : 0.84),
                  ]}
                  radius={0.05}
                  position={[0, 0.04 + layer * 0.045, layer === 0 ? 0 : -0.02]}
                  rotation={[
                    0.08 + layer * 0.03,
                    0,
                    layer === 0 ? 0.04 : -0.05,
                  ]}
                >
                  <ModelMaterial
                    color={layer === 0 ? baseColor : softAccent}
                    roughness={0.96}
                  />
                </RoundedBox>
              ))}
            </>
          )}
        </>
      )}

      {item.type === "component" && (
        <>
          {componentVariant === "legs" ? (
            <>
              {[
                [-0.16, -0.08],
                [0.16, -0.08],
                [-0.08, 0.12],
                [0.08, 0.12],
              ].map(([x, z], index) => (
                <mesh
                  castShadow
                  key={`component-leg-${index}`}
                  position={[x, 0.12, z]}
                >
                  <cylinderGeometry args={[0.03, 0.035, 0.24, 18]} />
                  <ModelMaterial color={woodColor} roughness={0.72} />
                </mesh>
              ))}
            </>
          ) : componentVariant === "armrest" ? (
            <>
              {[-1, 1].map((x, index) => (
                <group
                  key={`component-armrest-${index}`}
                  position={[x * 0.14, 0.2, 0]}
                >
                  <mesh castShadow rotation={[0, 0, x * -0.14]}>
                    <boxGeometry args={[0.08, 0.36, 0.12]} />
                    <ModelMaterial color={darkWoodColor} roughness={0.64} />
                  </mesh>
                  <mesh castShadow position={[0, 0.17, 0]}>
                    <boxGeometry args={[0.12, 0.05, 0.22]} />
                    <ModelMaterial color={baseColor} roughness={0.68} />
                  </mesh>
                </group>
              ))}
            </>
          ) : componentVariant === "frame" ? (
            <>
              {[
                [-1, -1],
                [1, -1],
                [-1, 1],
                [1, 1],
              ].map(([x, z], index) => (
                <mesh
                  castShadow
                  key={`component-frame-post-${index}`}
                  position={[
                    x * (dimensions.width / 2 - 0.04),
                    0.3,
                    z * (dimensions.depth / 2 - 0.04),
                  ]}
                >
                  <boxGeometry args={[0.03, 0.6, 0.03]} />
                  <ModelMaterial
                    color="#5d646b"
                    roughness={0.42}
                    metalness={0.22}
                  />
                </mesh>
              ))}
              {[0.12, 0.32, 0.52].map((y, index) => (
                <mesh
                  castShadow
                  key={`component-frame-rail-${index}`}
                  position={[0, y, 0]}
                >
                  <boxGeometry
                    args={[dimensions.width, 0.025, dimensions.depth * 0.92]}
                  />
                  <ModelMaterial
                    color="#7e858c"
                    roughness={0.4}
                    metalness={0.22}
                  />
                </mesh>
              ))}
            </>
          ) : componentVariant === "headboard" ? (
            <>
              <RoundedBox
                castShadow
                args={[
                  Math.max(dimensions.width, 0.72),
                  0.54,
                  Math.max(dimensions.depth, 0.08),
                ]}
                radius={0.05}
                position={[0, 0.28, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.76} />
              </RoundedBox>
              <mesh castShadow position={[0, 0.05, 0]}>
                <boxGeometry
                  args={[
                    Math.max(dimensions.width * 0.88, 0.6),
                    0.08,
                    Math.max(dimensions.depth, 0.08),
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.68} />
              </mesh>
            </>
          ) : (
            <>
              <mesh castShadow position={[0, 0.035, 0]}>
                <boxGeometry
                  args={[dimensions.width, 0.05, dimensions.depth]}
                />
                <ModelMaterial color={baseColor} roughness={0.68} />
              </mesh>
              <mesh castShadow position={[0, 0.095, -dimensions.depth * 0.08]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.84,
                    0.035,
                    dimensions.depth * 0.84,
                  ]}
                />
                <ModelMaterial color={softAccent} roughness={0.92} />
              </mesh>
              {[-0.18, 0.18].map((x, index) => (
                <mesh
                  castShadow
                  key={`component-bar-${index}`}
                  position={[x, 0.12, dimensions.depth * 0.12]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.014, 0.014, 0.26, 16]} />
                  <ModelMaterial
                    color="#6f767e"
                    roughness={0.4}
                    metalness={0.2}
                  />
                </mesh>
              ))}
            </>
          )}
        </>
      )}

      {item.type === "bench" && (
        <>
          <RoundedBox
            castShadow
            args={[
              dimensions.width,
              dimensions.height * 0.2,
              dimensions.depth * 0.82,
            ]}
            radius={0.06}
            position={[0, dimensions.height * 0.66, 0]}
          >
            <ModelMaterial color={baseColor} roughness={0.58} />
          </RoundedBox>
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([x, z], index) => (
            <mesh
              castShadow
              key={`bench-leg-${index}`}
              position={[
                x * (dimensions.width / 2 - 0.12),
                dimensions.height * 0.32,
                z * (dimensions.depth * 0.24),
              ]}
            >
              <cylinderGeometry
                args={[0.03, 0.035, dimensions.height * 0.62, 18]}
              />
              <ModelMaterial color={darkWoodColor} roughness={0.68} />
            </mesh>
          ))}
          <mesh castShadow position={[0, dimensions.height * 0.46, 0]}>
            <boxGeometry
              args={[dimensions.width * 0.7, 0.04, dimensions.depth * 0.18]}
            />
            <ModelMaterial color={darkWoodColor} roughness={0.66} />
          </mesh>
        </>
      )}

      {item.type === "chair" && (
        <>
          <RoundedBox
            castShadow
            args={[dimensions.width * 0.9, 0.08, dimensions.depth * 0.86]}
            radius={0.05}
            position={[0, 0.44, 0]}
          >
            <ModelMaterial color={baseColor} roughness={0.48} />
          </RoundedBox>
          <RoundedBox
            castShadow
            args={[dimensions.width * 0.82, dimensions.height * 0.48, 0.1]}
            radius={0.05}
            position={[0, 0.76, -dimensions.depth * 0.32]}
          >
            <ModelMaterial color={baseColor} roughness={0.5} />
          </RoundedBox>
          {[-0.22, 0.22].map((x, index) => (
            <mesh
              castShadow
              key={`chair-back-${index}`}
              position={[x, 0.73, -dimensions.depth * 0.26]}
            >
              <boxGeometry args={[0.05, dimensions.height * 0.38, 0.04]} />
              <ModelMaterial color={softAccent} roughness={0.38} />
            </mesh>
          ))}
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([x, z], index) => (
            <mesh
              castShadow
              key={`chair-leg-${index}`}
              position={[
                x * (dimensions.width * 0.33),
                0.22,
                z * (dimensions.depth * 0.26),
              ]}
            >
              <boxGeometry args={[0.05, 0.44, 0.05]} />
              <ModelMaterial color={woodColor} roughness={0.7} />
            </mesh>
          ))}
        </>
      )}

      {item.type === "tray" && (
        <>
          <mesh castShadow position={[0, 0.03, 0]}>
            <boxGeometry args={[dimensions.width, 0.04, dimensions.depth]} />
            <ModelMaterial color={softAccent} roughness={0.8} />
          </mesh>
          {[
            [
              0,
              0.07,
              -dimensions.depth / 2 + 0.02,
              dimensions.width,
              0.08,
              0.03,
            ],
            [
              0,
              0.07,
              dimensions.depth / 2 - 0.02,
              dimensions.width,
              0.08,
              0.03,
            ],
            [
              -dimensions.width / 2 + 0.02,
              0.07,
              0,
              0.03,
              0.08,
              dimensions.depth,
            ],
            [
              dimensions.width / 2 - 0.02,
              0.07,
              0,
              0.03,
              0.08,
              dimensions.depth,
            ],
          ].map(([x, y, z, w, h, d], index) => (
            <mesh castShadow key={`tray-rim-${index}`} position={[x, y, z]}>
              <boxGeometry args={[w, h, d]} />
              <ModelMaterial
                color={baseColor}
                roughness={0.42}
                metalness={0.18}
              />
            </mesh>
          ))}
          {[-1, 1].map((x, index) => (
            <mesh
              castShadow
              key={`tray-handle-${index}`}
              position={[x * (dimensions.width / 2 + 0.02), 0.08, 0]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <torusGeometry args={[0.06, 0.015, 14, 26]} />
              <ModelMaterial
                color={baseColor}
                roughness={0.38}
                metalness={0.2}
              />
            </mesh>
          ))}
        </>
      )}

      {item.type === "rug" && (
        <>
          <RoundedBox
            receiveShadow
            args={[dimensions.width, dimensions.height, dimensions.depth]}
            radius={0.04}
            position={[0, dimensions.height / 2, 0]}
          >
            <meshStandardMaterial color={baseColor} roughness={0.92} />
          </RoundedBox>
          <mesh receiveShadow position={[0, dimensions.height + 0.002, 0]}>
            <boxGeometry
              args={[
                dimensions.width * 0.82,
                dimensions.height * 0.2,
                dimensions.depth * 0.82,
              ]}
            />
            <meshStandardMaterial color={softAccent} roughness={0.95} />
          </mesh>
        </>
      )}

      {item.type === "mirror" && (
        <>
          {mirrorVariant === "wall" ? (
            <>
              <mesh castShadow position={[0, dimensions.height * 0.5, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width,
                    dimensions.height,
                    Math.max(dimensions.depth, 0.04),
                  ]}
                />
                <ModelMaterial color={woodColor} roughness={0.54} />
              </mesh>
              <mesh
                position={[
                  0,
                  dimensions.height * 0.5,
                  Math.max(dimensions.depth, 0.04) * 0.56,
                ]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 0.84,
                    dimensions.height * 0.84,
                    Math.max(dimensions.depth * 0.18, 0.012),
                  ]}
                />
                <meshPhysicalMaterial
                  color="#dfe6ec"
                  roughness={0.08}
                  metalness={0.02}
                  reflectivity={0.9}
                  clearcoat={0.2}
                />
              </mesh>
            </>
          ) : mirrorVariant === "table" ? (
            <>
              <mesh castShadow position={[0, dimensions.height * 0.56, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width,
                    dimensions.height,
                    Math.max(dimensions.depth, 0.03),
                  ]}
                />
                <ModelMaterial color={woodColor} roughness={0.54} />
              </mesh>
              <mesh
                position={[
                  0,
                  dimensions.height * 0.56,
                  Math.max(dimensions.depth, 0.03) * 0.55,
                ]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 0.82,
                    dimensions.height * 0.8,
                    Math.max(dimensions.depth * 0.16, 0.01),
                  ]}
                />
                <meshPhysicalMaterial
                  color="#dfe6ec"
                  roughness={0.08}
                  metalness={0.02}
                  reflectivity={0.9}
                  clearcoat={0.2}
                />
              </mesh>
              <mesh
                castShadow
                position={[
                  0,
                  dimensions.height * 0.18,
                  -Math.max(dimensions.depth * 0.18, 0.04),
                ]}
                rotation={[-0.45, 0, 0]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 0.7,
                    0.03,
                    Math.max(dimensions.depth * 1.4, 0.12),
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.62} />
              </mesh>
            </>
          ) : (
            <>
              <mesh
                castShadow
                position={[0, dimensions.height * 0.5, 0]}
                rotation={[-0.08, 0, 0]}
              >
                <boxGeometry
                  args={[dimensions.width, dimensions.height, dimensions.depth]}
                />
                <ModelMaterial color={woodColor} roughness={0.54} />
              </mesh>
              <mesh
                position={[0, dimensions.height * 0.5, dimensions.depth * 0.52]}
                rotation={[-0.08, 0, 0]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 0.84,
                    dimensions.height * 0.84,
                    dimensions.depth * 0.18,
                  ]}
                />
                <meshPhysicalMaterial
                  color="#dfe6ec"
                  roughness={0.08}
                  metalness={0.02}
                  reflectivity={0.9}
                  clearcoat={0.2}
                />
              </mesh>
              {[-0.28, 0.28].map((x, index) => (
                <mesh
                  castShadow
                  key={`mirror-foot-${index}`}
                  position={[
                    x * dimensions.width,
                    0.08,
                    -dimensions.depth * 0.22,
                  ]}
                  rotation={[0, 0, x * -0.12]}
                >
                  <boxGeometry args={[0.04, 0.16, 0.18]} />
                  <ModelMaterial color={darkWoodColor} roughness={0.66} />
                </mesh>
              ))}
            </>
          )}
        </>
      )}

      {item.type === "table" && (
        <>
          <mesh castShadow position={[0, dimensions.height - 0.035, 0]}>
            <boxGeometry args={[dimensions.width, 0.07, dimensions.depth]} />
            <ModelMaterial color={baseColor} roughness={0.4} />
          </mesh>
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([x, z], index) => (
            <mesh
              castShadow
              key={`table-leg-${index}`}
              position={[
                x * (dimensions.width / 2 - 0.09),
                Math.max(dimensions.height / 2 - 0.04, 0.17),
                z * (dimensions.depth / 2 - 0.09),
              ]}
            >
              <boxGeometry
                args={[0.08, Math.max(dimensions.height - 0.08, 0.28), 0.08]}
              />
              <ModelMaterial color={darkWoodColor} roughness={0.68} />
            </mesh>
          ))}
          {dimensions.height < 0.56 && (
            <mesh castShadow position={[0, 0.26, 0]}>
              <boxGeometry
                args={[dimensions.width * 0.72, 0.05, dimensions.depth * 0.54]}
              />
              <ModelMaterial color={softAccent} roughness={0.54} />
            </mesh>
          )}
        </>
      )}

      {item.type === "vase" && (
        <>
          <mesh castShadow position={[0, dimensions.height * 0.18, 0]}>
            <cylinderGeometry
              args={[
                dimensions.width * 0.3,
                dimensions.width * 0.36,
                dimensions.height * 0.28,
                28,
              ]}
            />
            <ModelMaterial color={baseColor} roughness={0.42} />
          </mesh>
          <mesh castShadow position={[0, dimensions.height * 0.48, 0]}>
            <sphereGeometry args={[dimensions.width * 0.34, 24, 24]} />
            <ModelMaterial color={baseColor} roughness={0.38} />
          </mesh>
          <mesh castShadow position={[0, dimensions.height * 0.76, 0]}>
            <cylinderGeometry
              args={[
                dimensions.width * 0.14,
                dimensions.width * 0.18,
                dimensions.height * 0.32,
                24,
              ]}
            />
            <ModelMaterial color={baseColor} roughness={0.36} />
          </mesh>
          <mesh castShadow position={[0, dimensions.height * 0.94, 0]}>
            <torusGeometry
              args={[dimensions.width * 0.16, dimensions.width * 0.03, 14, 28]}
            />
            <ModelMaterial
              color={metalColor}
              roughness={0.28}
              metalness={0.24}
            />
          </mesh>
        </>
      )}

      {item.type === "storageBox" && (
        <>
          {boxVariant === "drawerTower" ? (
            <>
              <mesh castShadow position={[0, dimensions.height * 0.5, 0]}>
                <boxGeometry
                  args={[dimensions.width, dimensions.height, dimensions.depth]}
                />
                <meshPhysicalMaterial
                  color="#eef2f4"
                  roughness={0.18}
                  transmission={0.26}
                  transparent
                  opacity={0.58}
                />
              </mesh>
              {[0.2, 0.5, 0.8].map((ratio, index) => (
                <group
                  key={`drawer-tower-${index}`}
                  position={[0, dimensions.height * ratio, 0]}
                >
                  <mesh
                    castShadow
                    position={[0, 0, dimensions.depth / 2 + 0.02]}
                  >
                    <boxGeometry
                      args={[
                        dimensions.width * 0.88,
                        dimensions.height * 0.24,
                        0.03,
                      ]}
                    />
                    <meshPhysicalMaterial
                      color="#f7f9fb"
                      roughness={0.16}
                      transmission={0.22}
                      transparent
                      opacity={0.6}
                    />
                  </mesh>
                  <mesh
                    castShadow
                    position={[
                      0,
                      -dimensions.height * 0.05,
                      dimensions.depth / 2 + 0.035,
                    ]}
                  >
                    <boxGeometry
                      args={[dimensions.width * 0.24, 0.018, 0.03]}
                    />
                    <ModelMaterial color="#cdd5da" roughness={0.34} />
                  </mesh>
                </group>
              ))}
            </>
          ) : boxVariant === "drawerBox" ? (
            <>
              <mesh castShadow position={[0, dimensions.height * 0.5, 0]}>
                <boxGeometry
                  args={[dimensions.width, dimensions.height, dimensions.depth]}
                />
                <meshPhysicalMaterial
                  color="#edf1f3"
                  roughness={0.2}
                  transmission={0.34}
                  transparent
                  opacity={0.5}
                />
              </mesh>
              <mesh
                castShadow
                position={[
                  0,
                  dimensions.height * 0.48,
                  dimensions.depth / 2 + 0.01,
                ]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 0.9,
                    dimensions.height * 0.78,
                    0.03,
                  ]}
                />
                <meshPhysicalMaterial
                  color="#f5f7f8"
                  roughness={0.16}
                  transmission={0.28}
                  transparent
                  opacity={0.55}
                />
              </mesh>
              <mesh
                castShadow
                position={[
                  0,
                  dimensions.height * 0.18,
                  dimensions.depth / 2 + 0.025,
                ]}
              >
                <boxGeometry args={[dimensions.width * 0.3, 0.02, 0.03]} />
                <ModelMaterial color="#d6dde1" roughness={0.3} />
              </mesh>
            </>
          ) : boxVariant === "bambooBox" ? (
            <>
              <mesh castShadow position={[0, 0.05, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.92,
                    0.06,
                    dimensions.depth * 0.92,
                  ]}
                />
                <ModelMaterial color="#b38a58" roughness={0.68} />
              </mesh>
              {[-1, 1].map((x, index) => (
                <mesh
                  castShadow
                  key={`bamboo-side-${index}`}
                  position={[
                    x * (dimensions.width / 2 - 0.02),
                    dimensions.height * 0.38,
                    0,
                  ]}
                >
                  <boxGeometry
                    args={[
                      0.035,
                      dimensions.height * 0.72,
                      dimensions.depth * 0.92,
                    ]}
                  />
                  <ModelMaterial color="#c29a67" roughness={0.7} />
                </mesh>
              ))}
              {[-1, 1].map((z, index) => (
                <mesh
                  castShadow
                  key={`bamboo-front-${index}`}
                  position={[
                    0,
                    dimensions.height * 0.38,
                    z * (dimensions.depth / 2 - 0.02),
                  ]}
                >
                  <boxGeometry
                    args={[
                      dimensions.width * 0.92,
                      dimensions.height * 0.72,
                      0.03,
                    ]}
                  />
                  <ModelMaterial color="#c29a67" roughness={0.7} />
                </mesh>
              ))}
              {[-0.32, -0.1, 0.12, 0.34].map((x, index) => (
                <mesh
                  castShadow
                  key={`bamboo-slat-${index}`}
                  position={[
                    x * dimensions.width,
                    dimensions.height * 0.38,
                    dimensions.depth / 2 + 0.005,
                  ]}
                >
                  <boxGeometry args={[0.02, dimensions.height * 0.64, 0.014]} />
                  <ModelMaterial color="#d6b17a" roughness={0.72} />
                </mesh>
              ))}
            </>
          ) : boxVariant === "basketBox" ? (
            <>
              <mesh castShadow position={[0, 0.05, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.92,
                    0.05,
                    dimensions.depth * 0.92,
                  ]}
                />
                <ModelMaterial color={baseColor} roughness={0.64} />
              </mesh>
              {[-1, 1].map((x, index) => (
                <mesh
                  castShadow
                  key={`basket-side-${index}`}
                  position={[
                    x * (dimensions.width / 2 - 0.02),
                    dimensions.height * 0.36,
                    0,
                  ]}
                >
                  <boxGeometry
                    args={[
                      0.03,
                      dimensions.height * 0.68,
                      dimensions.depth * 0.92,
                    ]}
                  />
                  <ModelMaterial color={baseColor} roughness={0.68} />
                </mesh>
              ))}
              {[-1, 1].map((z, index) => (
                <mesh
                  castShadow
                  key={`basket-front-${index}`}
                  position={[
                    0,
                    dimensions.height * 0.36,
                    z * (dimensions.depth / 2 - 0.02),
                  ]}
                >
                  <boxGeometry
                    args={[
                      dimensions.width * 0.92,
                      dimensions.height * 0.68,
                      0.03,
                    ]}
                  />
                  <ModelMaterial color={baseColor} roughness={0.68} />
                </mesh>
              ))}
              {[-0.3, -0.1, 0.1, 0.3].map((x, index) => (
                <mesh
                  castShadow
                  key={`basket-rib-x-${index}`}
                  position={[
                    x * dimensions.width,
                    dimensions.height * 0.36,
                    dimensions.depth / 2 + 0.004,
                  ]}
                >
                  <boxGeometry
                    args={[0.014, dimensions.height * 0.58, 0.012]}
                  />
                  <ModelMaterial color={softAccent} roughness={0.88} />
                </mesh>
              ))}
              {[-0.24, 0, 0.24].map((z, index) => (
                <mesh
                  castShadow
                  key={`basket-rib-z-${index}`}
                  position={[0, dimensions.height * 0.48, z * dimensions.depth]}
                >
                  <boxGeometry args={[dimensions.width * 0.84, 0.012, 0.012]} />
                  <ModelMaterial color={softAccent} roughness={0.88} />
                </mesh>
              ))}
            </>
          ) : boxVariant === "softBox" ? (
            <>
              <RoundedBox
                castShadow
                args={[
                  dimensions.width,
                  dimensions.height * 0.82,
                  dimensions.depth,
                ]}
                radius={0.08}
                position={[0, dimensions.height * 0.34, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.9} />
              </RoundedBox>
              <mesh castShadow position={[0, dimensions.height * 0.62, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.84,
                    0.03,
                    dimensions.depth * 0.84,
                  ]}
                />
                <ModelMaterial color={softAccent} roughness={0.96} />
              </mesh>
              {[-1, 1].map((x, index) => (
                <mesh
                  castShadow
                  key={`soft-box-handle-${index}`}
                  position={[
                    x * (dimensions.width / 2 + 0.01),
                    dimensions.height * 0.34,
                    0,
                  ]}
                >
                  <boxGeometry args={[0.02, 0.09, 0.12]} />
                  <ModelMaterial color="#a89b90" roughness={0.7} />
                </mesh>
              ))}
            </>
          ) : boxVariant === "lidBox" ? (
            <>
              <mesh castShadow position={[0, dimensions.height * 0.12, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width,
                    dimensions.height * 0.24,
                    dimensions.depth,
                  ]}
                />
                <ModelMaterial color="#b89362" roughness={0.7} />
              </mesh>
              <mesh castShadow position={[0, dimensions.height * 0.18, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.86,
                    dimensions.height * 0.06,
                    dimensions.depth * 0.86,
                  ]}
                />
                <ModelMaterial color="#d2ae77" roughness={0.72} />
              </mesh>
            </>
          ) : boxVariant === "plasticBox" ? (
            <>
              <RoundedBox
                castShadow
                args={[
                  dimensions.width,
                  dimensions.height * 0.76,
                  dimensions.depth,
                ]}
                radius={0.04}
                position={[0, dimensions.height * 0.3, 0]}
              >
                <meshPhysicalMaterial
                  color="#e9edf0"
                  roughness={0.22}
                  transmission={0.22}
                  transparent
                  opacity={0.62}
                />
              </RoundedBox>
              <RoundedBox
                castShadow
                args={[
                  dimensions.width * 1.02,
                  dimensions.height * 0.22,
                  dimensions.depth * 1.02,
                ]}
                radius={0.04}
                position={[0, dimensions.height * 0.75, 0]}
              >
                <meshPhysicalMaterial
                  color="#eef2f5"
                  roughness={0.2}
                  transmission={0.18}
                  transparent
                  opacity={0.66}
                />
              </RoundedBox>
            </>
          ) : (
            <>
              <RoundedBox
                castShadow
                args={[
                  dimensions.width,
                  dimensions.height * 0.76,
                  dimensions.depth,
                ]}
                radius={0.04}
                position={[0, dimensions.height * 0.3, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.7} />
              </RoundedBox>
              <RoundedBox
                castShadow
                args={[
                  dimensions.width * 1.02,
                  dimensions.height * 0.22,
                  dimensions.depth * 1.02,
                ]}
                radius={0.04}
                position={[0, dimensions.height * 0.75, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.66} />
              </RoundedBox>
              {[-1, 1].map((x, index) => (
                <mesh
                  castShadow
                  key={`box-handle-${index}`}
                  position={[
                    x * (dimensions.width / 2 + 0.01),
                    dimensions.height * 0.4,
                    0,
                  ]}
                >
                  <boxGeometry args={[0.02, 0.08, 0.1]} />
                  <ModelMaterial color="#2f3438" roughness={0.54} />
                </mesh>
              ))}
            </>
          )}
        </>
      )}

      {item.type === "dolly" && (
        <>
          <mesh castShadow position={[0, 0.06, 0]}>
            <boxGeometry args={[dimensions.width, 0.06, dimensions.depth]} />
            <ModelMaterial color={baseColor} roughness={0.46} />
          </mesh>
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([x, z], index) => (
            <group
              key={`dolly-wheel-${index}`}
              position={[
                x * (dimensions.width / 2 - 0.05),
                0.02,
                z * (dimensions.depth / 2 - 0.05),
              ]}
            >
              <mesh castShadow>
                <cylinderGeometry args={[0.018, 0.018, 0.02, 18]} />
                <ModelMaterial
                  color="#8d939a"
                  roughness={0.42}
                  metalness={0.22}
                />
              </mesh>
              <mesh castShadow position={[0, 0.015, 0]}>
                <boxGeometry args={[0.02, 0.03, 0.02]} />
                <ModelMaterial color="#5b6066" roughness={0.56} />
              </mesh>
            </group>
          ))}
        </>
      )}

      {item.type === "coatRack" && (
        <>
          {[-1, 1].map((x, index) => (
            <mesh
              castShadow
              key={`coat-side-${index}`}
              position={[
                x * dimensions.width * 0.24,
                dimensions.height * 0.5,
                0,
              ]}
              rotation={[0, 0, x * -0.14]}
            >
              <boxGeometry args={[0.045, dimensions.height, 0.045]} />
              <ModelMaterial color={baseColor} roughness={0.58} />
            </mesh>
          ))}
          <mesh castShadow position={[0, 0.05, 0]}>
            <boxGeometry
              args={[dimensions.width * 0.78, 0.05, dimensions.depth * 0.92]}
            />
            <ModelMaterial color={baseColor} roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0, dimensions.height * 0.94, 0]}>
            <boxGeometry args={[dimensions.width * 0.7, 0.04, 0.04]} />
            <ModelMaterial color={baseColor} roughness={0.58} />
          </mesh>
          {[0.08, 0.34].map((ratio, index) => (
            <mesh
              castShadow
              key={`coat-shelf-${index}`}
              position={[0, dimensions.height * ratio, 0]}
            >
              <boxGeometry
                args={[
                  dimensions.width * (index === 0 ? 0.76 : 0.54),
                  0.05,
                  dimensions.depth,
                ]}
              />
              <ModelMaterial color={baseColor} roughness={0.62} />
            </mesh>
          ))}
          <mesh castShadow position={[0, dimensions.height * 0.2, 0]}>
            <boxGeometry args={[0.035, dimensions.height * 0.32, 0.035]} />
            <ModelMaterial color={baseColor} roughness={0.58} />
          </mesh>
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([x, z], index) => (
            <group
              key={`coat-wheel-${index}`}
              position={[
                x * (dimensions.width * 0.28),
                0.025,
                z * (dimensions.depth * 0.34),
              ]}
            >
              <mesh castShadow>
                <cylinderGeometry args={[0.022, 0.022, 0.022, 18]} />
                <ModelMaterial color="#2f3438" roughness={0.48} />
              </mesh>
              <mesh castShadow position={[0, 0.02, 0]}>
                <boxGeometry args={[0.018, 0.03, 0.018]} />
                <ModelMaterial
                  color="#6a6f75"
                  roughness={0.46}
                  metalness={0.18}
                />
              </mesh>
            </group>
          ))}
        </>
      )}

      {item.type === "bed" && (
        <>
          <RoundedBox
            castShadow
            args={[dimensions.width + 0.08, 0.16, dimensions.depth + 0.06]}
            radius={0.06}
            position={[0, 0.08, 0]}
          >
            <ModelMaterial color={woodColor} roughness={0.58} />
          </RoundedBox>
          <RoundedBox
            castShadow
            args={[dimensions.width, 0.22, dimensions.depth]}
            radius={0.08}
            position={[0, 0.24, 0]}
          >
            <ModelMaterial color={baseColor} roughness={0.65} />
          </RoundedBox>
          <RoundedBox
            castShadow
            args={[dimensions.width * 1.02, dimensions.height * 0.52, 0.16]}
            radius={0.05}
            position={[0, 0.55, -dimensions.depth / 2 + 0.08]}
          >
            <ModelMaterial color={baseColor} roughness={0.56} />
          </RoundedBox>
          {[-0.22, 0.22].map((x, index) => (
            <RoundedBox
              castShadow
              key={`bed-pillow-${index}`}
              args={[dimensions.width * 0.32, 0.1, 0.26]}
              radius={0.05}
              position={[x, 0.38, -dimensions.depth * 0.23]}
            >
              <ModelMaterial color={softAccent} roughness={0.78} />
            </RoundedBox>
          ))}
        </>
      )}

      {item.type === "storage" && (
        <>
          {storageVariant === "tvStand" ? (
            <>
              <mesh castShadow position={[0, 0.05, 0]}>
                <boxGeometry
                  args={[dimensions.width * 0.92, 0.1, dimensions.depth * 0.9]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.72} />
              </mesh>
              <RoundedBox
                castShadow
                args={[
                  dimensions.width,
                  dimensions.height * 0.62,
                  dimensions.depth,
                ]}
                radius={0.04}
                position={[0, dimensions.height * 0.31 + 0.08, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.5} />
              </RoundedBox>
              <mesh
                castShadow
                position={[
                  0,
                  dimensions.height * 0.49,
                  dimensions.depth / 2 + 0.02,
                ]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 0.96,
                    dimensions.height * 0.07,
                    0.03,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.52} />
              </mesh>
              <mesh
                castShadow
                position={[
                  0,
                  dimensions.height * 0.22,
                  dimensions.depth / 2 + 0.02,
                ]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 0.96,
                    dimensions.height * 0.07,
                    0.03,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.52} />
              </mesh>
              {[-0.33, 0.33].map((x, index) => (
                <mesh
                  castShadow
                  key={`tv-door-${index}`}
                  position={[
                    x * dimensions.width,
                    dimensions.height * 0.22,
                    dimensions.depth / 2 + 0.03,
                  ]}
                >
                  <boxGeometry
                    args={[
                      dimensions.width * 0.25,
                      dimensions.height * 0.36,
                      0.03,
                    ]}
                  />
                  <ModelMaterial color={baseColor} roughness={0.42} />
                </mesh>
              ))}
              <mesh castShadow position={[0, dimensions.height * 0.22, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.24,
                    dimensions.height * 0.3,
                    dimensions.depth * 0.72,
                  ]}
                />
                <ModelMaterial color={softAccent} roughness={0.76} />
              </mesh>
              <mesh
                castShadow
                position={[
                  0,
                  dimensions.height * 0.22,
                  dimensions.depth * 0.03,
                ]}
              >
                <boxGeometry
                  args={[
                    0.03,
                    dimensions.height * 0.28,
                    dimensions.depth * 0.68,
                  ]}
                />
                <ModelMaterial color={woodColor} roughness={0.6} />
              </mesh>
              {[-0.33, 0.33].map((x, index) => (
                <mesh
                  castShadow
                  key={`tv-handle-${index}`}
                  position={[
                    x * dimensions.width,
                    dimensions.height * 0.22,
                    dimensions.depth / 2 + 0.05,
                  ]}
                >
                  <boxGeometry args={[0.04, 0.14, 0.02]} />
                  <ModelMaterial
                    color={metalColor}
                    roughness={0.34}
                    metalness={0.22}
                  />
                </mesh>
              ))}
              {[-0.42, -0.14, 0.14, 0.42].map((x, index) => (
                <mesh
                  castShadow
                  key={`tv-leg-${index}`}
                  position={[
                    x * dimensions.width,
                    0.2,
                    index < 2
                      ? -dimensions.depth * 0.24
                      : dimensions.depth * 0.24,
                  ]}
                  rotation={[0, 0, index < 2 ? 0.08 : -0.08]}
                >
                  <boxGeometry args={[0.05, 0.4, 0.05]} />
                  <ModelMaterial color={woodColor} roughness={0.66} />
                </mesh>
              ))}
            </>
          ) : storageVariant === "displayShelf" ? (
            <>
              {[-1, 1].map((x, index) => (
                <mesh
                  castShadow
                  key={`display-side-${index}`}
                  position={[
                    x * (dimensions.width / 2 - 0.03),
                    dimensions.height * 0.5,
                    0,
                  ]}
                >
                  <torusGeometry
                    args={[dimensions.height * 0.28, 0.018, 18, 48, Math.PI]}
                  />
                  <ModelMaterial
                    color="#c8a867"
                    roughness={0.34}
                    metalness={0.24}
                  />
                </mesh>
              ))}
              <mesh castShadow position={[0, dimensions.height * 0.32, 0]}>
                <torusGeometry
                  args={[dimensions.height * 0.16, 0.014, 16, 42, Math.PI]}
                />
                <ModelMaterial
                  color="#c8a867"
                  roughness={0.34}
                  metalness={0.24}
                />
              </mesh>
              {[-0.26, 0, 0.26].map((x, index) => (
                <mesh
                  castShadow
                  key={`display-post-${index}`}
                  position={[x * dimensions.width, dimensions.height * 0.5, 0]}
                >
                  <boxGeometry args={[0.022, dimensions.height, 0.022]} />
                  <ModelMaterial
                    color="#c8a867"
                    roughness={0.34}
                    metalness={0.24}
                  />
                </mesh>
              ))}
              {[0.12, 0.46, 0.8].map((ratio, index) => (
                <mesh
                  castShadow
                  key={`display-shelf-${index}`}
                  position={[0, dimensions.height * ratio, 0]}
                >
                  <boxGeometry
                    args={[
                      dimensions.width * 0.94,
                      0.05,
                      dimensions.depth * 0.86,
                    ]}
                  />
                  <ModelMaterial color="#8f7c69" roughness={0.58} />
                </mesh>
              ))}
              <mesh castShadow position={[0, dimensions.height * 0.96, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.94,
                    0.04,
                    dimensions.depth * 0.18,
                  ]}
                />
                <ModelMaterial
                  color="#c8a867"
                  roughness={0.34}
                  metalness={0.24}
                />
              </mesh>
              <mesh castShadow position={[0, 0.04, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.94,
                    0.06,
                    dimensions.depth * 0.92,
                  ]}
                />
                <ModelMaterial
                  color="#c8a867"
                  roughness={0.34}
                  metalness={0.24}
                />
              </mesh>
            </>
          ) : storageVariant === "rollingShelf" ? (
            <>
              {[
                [-1, -1],
                [1, -1],
                [-1, 1],
                [1, 1],
              ].map(([x, z], index) => (
                <mesh
                  castShadow
                  key={`rolling-post-${index}`}
                  position={[
                    x * (dimensions.width / 2 - 0.04),
                    dimensions.height * 0.5,
                    z * (dimensions.depth / 2 - 0.04),
                  ]}
                >
                  <boxGeometry args={[0.035, dimensions.height, 0.035]} />
                  <ModelMaterial
                    color="#91979d"
                    roughness={0.28}
                    metalness={0.22}
                  />
                </mesh>
              ))}
              <mesh castShadow position={[0, dimensions.height * 0.96, 0]}>
                <boxGeometry args={[dimensions.width * 0.92, 0.04, 0.04]} />
                <ModelMaterial
                  color="#91979d"
                  roughness={0.28}
                  metalness={0.22}
                />
              </mesh>
              {[-1, 1].map((x, index) => (
                <mesh
                  castShadow
                  key={`rolling-handle-${index}`}
                  position={[
                    x * (dimensions.width / 2 - 0.035),
                    dimensions.height * 0.9,
                    0,
                  ]}
                  rotation={[0, 0, x * -0.08]}
                >
                  <torusGeometry args={[0.12, 0.012, 14, 28, Math.PI]} />
                  <ModelMaterial
                    color="#91979d"
                    roughness={0.28}
                    metalness={0.22}
                  />
                </mesh>
              ))}
              {[0.16, 0.48, 0.8].map((ratio, index) => (
                <group
                  key={`rolling-tray-${index}`}
                  position={[0, dimensions.height * ratio, 0]}
                >
                  <mesh castShadow position={[0, 0.025, 0]}>
                    <boxGeometry
                      args={[
                        dimensions.width * 0.9,
                        0.05,
                        dimensions.depth * 0.86,
                      ]}
                    />
                    <ModelMaterial color={baseColor} roughness={0.6} />
                  </mesh>
                  {[
                    [
                      0,
                      0.09,
                      -dimensions.depth * 0.43,
                      dimensions.width * 0.9,
                      0.08,
                      0.025,
                    ],
                    [
                      0,
                      0.09,
                      dimensions.depth * 0.43,
                      dimensions.width * 0.9,
                      0.08,
                      0.025,
                    ],
                    [
                      -dimensions.width * 0.45,
                      0.09,
                      0,
                      0.025,
                      0.08,
                      dimensions.depth * 0.82,
                    ],
                    [
                      dimensions.width * 0.45,
                      0.09,
                      0,
                      0.025,
                      0.08,
                      dimensions.depth * 0.82,
                    ],
                  ].map(([x, y, z, w, h, d], rimIndex) => (
                    <mesh
                      castShadow
                      key={`rolling-tray-rim-${index}-${rimIndex}`}
                      position={[x, y, z]}
                    >
                      <boxGeometry args={[w, h, d]} />
                      <ModelMaterial color={baseColor} roughness={0.56} />
                    </mesh>
                  ))}
                </group>
              ))}
              {[
                [-1, -1],
                [1, -1],
                [-1, 1],
                [1, 1],
              ].map(([x, z], index) => (
                <group
                  key={`rolling-wheel-${index}`}
                  position={[
                    x * (dimensions.width / 2 - 0.05),
                    0.025,
                    z * (dimensions.depth / 2 - 0.05),
                  ]}
                >
                  <mesh castShadow>
                    <cylinderGeometry args={[0.022, 0.022, 0.02, 18]} />
                    <ModelMaterial color="#2f3438" roughness={0.48} />
                  </mesh>
                  <mesh castShadow position={[0, 0.02, 0]}>
                    <boxGeometry args={[0.018, 0.03, 0.018]} />
                    <ModelMaterial
                      color="#7f868d"
                      roughness={0.42}
                      metalness={0.2}
                    />
                  </mesh>
                </group>
              ))}
            </>
          ) : storageVariant === "wireRack" ? (
            <>
              {[
                [-1, -1],
                [1, -1],
                [-1, 1],
                [1, 1],
              ].map(([x, z], index) => (
                <mesh
                  castShadow
                  key={`wire-rack-post-${index}`}
                  position={[
                    x * (dimensions.width / 2 - 0.03),
                    dimensions.height / 2,
                    z * (dimensions.depth / 2 - 0.03),
                  ]}
                >
                  <boxGeometry args={[0.026, dimensions.height, 0.026]} />
                  <ModelMaterial
                    color="#7e858c"
                    roughness={0.34}
                    metalness={0.24}
                  />
                </mesh>
              ))}
              {[0.08, 0.32, 0.56, 0.8].map((ratio, index) => (
                <group
                  key={`wire-rack-level-${index}`}
                  position={[0, dimensions.height * ratio, 0]}
                >
                  <mesh castShadow position={[0, 0.015, 0]}>
                    <boxGeometry
                      args={[
                        dimensions.width * 0.94,
                        0.03,
                        dimensions.depth * 0.9,
                      ]}
                    />
                    <ModelMaterial
                      color={
                        /go oc cho|go soi/.test(normalizedSource)
                          ? woodColor
                          : "#c7d0d6"
                      }
                      roughness={
                        /go oc cho|go soi/.test(normalizedSource) ? 0.58 : 0.38
                      }
                      metalness={
                        /go oc cho|go soi/.test(normalizedSource) ? 0 : 0.12
                      }
                    />
                  </mesh>
                  {[
                    [
                      0,
                      0.08,
                      -dimensions.depth * 0.45,
                      dimensions.width * 0.94,
                      0.035,
                      0.018,
                    ],
                    [
                      0,
                      0.08,
                      dimensions.depth * 0.45,
                      dimensions.width * 0.94,
                      0.035,
                      0.018,
                    ],
                    [
                      -dimensions.width * 0.47,
                      0.08,
                      0,
                      0.018,
                      0.035,
                      dimensions.depth * 0.86,
                    ],
                    [
                      dimensions.width * 0.47,
                      0.08,
                      0,
                      0.018,
                      0.035,
                      dimensions.depth * 0.86,
                    ],
                  ].map(([x, y, z, w, h, d], rimIndex) => (
                    <mesh
                      castShadow
                      key={`wire-rack-rim-${index}-${rimIndex}`}
                      position={[x, y, z]}
                    >
                      <boxGeometry args={[w, h, d]} />
                      <ModelMaterial
                        color="#8d949c"
                        roughness={0.34}
                        metalness={0.24}
                      />
                    </mesh>
                  ))}
                </group>
              ))}
              {/giay dep/.test(normalizedSource) && (
                <mesh castShadow position={[0, dimensions.height * 0.52, 0]}>
                  <boxGeometry
                    args={[
                      dimensions.width * 0.9,
                      0.02,
                      dimensions.depth * 0.28,
                    ]}
                  />
                  <ModelMaterial
                    color="#b7c0c7"
                    roughness={0.36}
                    metalness={0.2}
                  />
                </mesh>
              )}
            </>
          ) : storageVariant === "glassCabinet" ? (
            <>
              <RoundedBox
                castShadow
                args={[dimensions.width, dimensions.height, dimensions.depth]}
                radius={0.03}
                position={[0, dimensions.height / 2, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.48} />
              </RoundedBox>
              {[0.18, 0.42, 0.66].map((ratio, index) => (
                <mesh
                  castShadow
                  key={`glass-shelf-${index}`}
                  position={[0, dimensions.height * ratio, 0]}
                >
                  <boxGeometry
                    args={[
                      dimensions.width * 0.88,
                      0.03,
                      dimensions.depth * 0.82,
                    ]}
                  />
                  <ModelMaterial color={darkWoodColor} roughness={0.56} />
                </mesh>
              ))}
              {[-0.24, 0.24].map((x, index) => (
                <mesh
                  castShadow
                  key={`glass-door-frame-${index}`}
                  position={[
                    x * dimensions.width,
                    dimensions.height * 0.52,
                    dimensions.depth / 2 + 0.015,
                  ]}
                >
                  <boxGeometry
                    args={[
                      dimensions.width * 0.42,
                      dimensions.height * 0.82,
                      0.03,
                    ]}
                  />
                  <meshPhysicalMaterial
                    color="#dce6eb"
                    roughness={0.12}
                    transmission={0.45}
                    transparent
                    opacity={0.38}
                  />
                </mesh>
              ))}
              {[-0.24, 0.24].map((x, index) => (
                <mesh
                  castShadow
                  key={`glass-handle-${index}`}
                  position={[
                    x * dimensions.width,
                    dimensions.height * 0.52,
                    dimensions.depth / 2 + 0.04,
                  ]}
                >
                  <boxGeometry args={[0.028, 0.18, 0.02]} />
                  <ModelMaterial
                    color={metalColor}
                    roughness={0.3}
                    metalness={0.24}
                  />
                </mesh>
              ))}
              <mesh castShadow position={[0, 0.05, 0]}>
                <boxGeometry
                  args={[dimensions.width * 1.02, 0.1, dimensions.depth * 1.02]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.68} />
              </mesh>
            </>
          ) : storageVariant === "shelfTall" ? (
            <>
              <mesh castShadow position={[0, 0.04, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.98,
                    0.08,
                    dimensions.depth * 0.92,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.7} />
              </mesh>
              {[-0.46, -0.16, 0.16, 0.46].map((x, index) => (
                <mesh
                  castShadow
                  key={`tall-shelf-post-${index}`}
                  position={[x * dimensions.width, dimensions.height / 2, 0]}
                >
                  <boxGeometry args={[0.04, dimensions.height, 0.04]} />
                  <ModelMaterial
                    color="#2a2a2a"
                    roughness={0.38}
                    metalness={0.18}
                  />
                </mesh>
              ))}
              {[0, 0.2, 0.4, 0.6, 0.8].map((ratio, index) => (
                <mesh
                  castShadow
                  key={`tall-shelf-level-${index}`}
                  position={[0, dimensions.height * ratio + 0.04, 0]}
                >
                  <boxGeometry
                    args={[dimensions.width, 0.06, dimensions.depth * 0.9]}
                  />
                  <ModelMaterial color={baseColor} roughness={0.5} />
                </mesh>
              ))}
              {[-0.31, 0.31].map((x, index) => (
                <mesh
                  castShadow
                  key={`tall-shelf-side-rail-${index}`}
                  position={[x * dimensions.width, dimensions.height * 0.5, 0]}
                >
                  <boxGeometry
                    args={[
                      0.02,
                      dimensions.height * 0.98,
                      dimensions.depth * 0.88,
                    ]}
                  />
                  <ModelMaterial
                    color="#232323"
                    roughness={0.38}
                    metalness={0.18}
                  />
                </mesh>
              ))}
            </>
          ) : storageVariant === "shelfWide" ? (
            <>
              <mesh castShadow position={[0, 0.04, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.98,
                    0.08,
                    dimensions.depth * 0.96,
                  ]}
                />
                <ModelMaterial color={baseColor} roughness={0.56} />
              </mesh>
              <mesh castShadow position={[0, dimensions.height * 0.52, 0]}>
                <boxGeometry
                  args={[dimensions.width, 0.07, dimensions.depth]}
                />
                <ModelMaterial color={baseColor} roughness={0.52} />
              </mesh>
              <mesh castShadow position={[0, dimensions.height + 0.02, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 1.02,
                    0.08,
                    dimensions.depth * 1.02,
                  ]}
                />
                <ModelMaterial color={baseColor} roughness={0.48} />
              </mesh>
              {[-1, 1].map((x, index) => (
                <mesh
                  castShadow
                  key={`wide-shelf-side-${index}`}
                  position={[
                    x * (dimensions.width / 2 - 0.04),
                    dimensions.height / 2 + 0.02,
                    0,
                  ]}
                >
                  <boxGeometry
                    args={[0.08, dimensions.height, dimensions.depth]}
                  />
                  <ModelMaterial color={baseColor} roughness={0.56} />
                </mesh>
              ))}
              {[-0.25, 0.05, 0.35].map((x, index) => (
                <mesh
                  castShadow
                  key={`wide-shelf-divider-${index}`}
                  position={[x * dimensions.width, dimensions.height * 0.5, 0]}
                >
                  <boxGeometry
                    args={[
                      0.06,
                      dimensions.height * 0.96,
                      dimensions.depth * 0.96,
                    ]}
                  />
                  <ModelMaterial color={baseColor} roughness={0.54} />
                </mesh>
              ))}
              {[
                [-0.36, 0.22],
                [0.16, 0.24],
                [-0.1, -0.18],
                [0.35, -0.08],
              ].map(([x, z], index) => (
                <mesh
                  castShadow
                  key={`wide-shelf-box-${index}`}
                  position={[
                    x * dimensions.width,
                    index < 2
                      ? dimensions.height * 0.77
                      : dimensions.height * 0.24,
                    z * dimensions.depth,
                  ]}
                >
                  <boxGeometry
                    args={[
                      dimensions.width * 0.16,
                      dimensions.height * 0.18,
                      dimensions.depth * 0.22,
                    ]}
                  />
                  <ModelMaterial color={softAccent} roughness={0.74} />
                </mesh>
              ))}
            </>
          ) : (
            <>
              <RoundedBox
                castShadow
                args={[dimensions.width, dimensions.height, dimensions.depth]}
                radius={0.05}
                position={[0, dimensions.height / 2, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.52} />
              </RoundedBox>
              <mesh
                castShadow
                position={[
                  0,
                  dimensions.height / 2,
                  dimensions.depth / 2 + 0.01,
                ]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 0.95,
                    dimensions.height * 0.9,
                    0.02,
                  ]}
                />
                <ModelMaterial color={baseColor} roughness={0.45} />
              </mesh>
              <mesh
                castShadow
                position={[
                  0,
                  dimensions.height / 2,
                  dimensions.depth / 2 + 0.02,
                ]}
              >
                <boxGeometry args={[0.02, dimensions.height * 0.84, 0.03]} />
                <ModelMaterial color={darkWoodColor} roughness={0.4} />
              </mesh>
              {[-0.2, 0.2].map((x, index) => (
                <mesh
                  castShadow
                  key={`storage-handle-${index}`}
                  position={[
                    x * dimensions.width,
                    dimensions.height * 0.55,
                    dimensions.depth / 2 + 0.03,
                  ]}
                >
                  <boxGeometry args={[0.06, dimensions.height * 0.33, 0.03]} />
                  <ModelMaterial
                    color={metalColor}
                    roughness={0.34}
                    metalness={0.22}
                  />
                </mesh>
              ))}
              <mesh castShadow position={[0, 0.06, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 1.02,
                    0.12,
                    dimensions.depth * 1.04,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.7} />
              </mesh>
            </>
          )}
        </>
      )}

      {item.type === "decor" && (
        <>
          <mesh castShadow position={[0, dimensions.height * 0.28, 0]}>
            <boxGeometry
              args={[
                dimensions.width * 0.42,
                dimensions.height * 0.56,
                dimensions.depth * 0.42,
              ]}
            />
            <ModelMaterial color={softAccent} roughness={0.82} />
          </mesh>
          <mesh castShadow position={[0, dimensions.height * 0.57, 0]}>
            <boxGeometry
              args={[dimensions.width * 0.56, 0.05, dimensions.depth * 0.56]}
            />
            <ModelMaterial color={darkWoodColor} roughness={0.58} />
          </mesh>
          <mesh
            castShadow
            position={[0.02, dimensions.height * 0.78, 0]}
            rotation={[0.42, 0.22, -0.12]}
            scale={[0.7, 1.2, 0.55]}
          >
            <icosahedronGeometry args={[dimensions.width * 0.18, 0]} />
            <ModelMaterial
              color={baseColor}
              roughness={0.34}
              metalness={0.08}
            />
          </mesh>
          <mesh
            castShadow
            position={[-0.03, dimensions.height * 0.96, 0.02]}
            scale={[0.72, 0.46, 0.72]}
          >
            <sphereGeometry args={[dimensions.width * 0.16, 24, 24]} />
            <ModelMaterial
              color={baseColor}
              roughness={0.38}
              metalness={0.06}
            />
          </mesh>
          <mesh
            castShadow
            position={[0, dimensions.height * 0.7, 0]}
            rotation={[0, 0.5, Math.PI / 2]}
          >
            <torusGeometry
              args={[dimensions.width * 0.14, dimensions.width * 0.035, 18, 42]}
            />
            <ModelMaterial
              color={metalColor}
              roughness={0.28}
              metalness={0.28}
            />
          </mesh>
        </>
      )}

      {item.type === "lamp" && (
        <>
          <mesh castShadow position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.14, 0.18, 0.06, 24]} />
            <ModelMaterial
              color={metalColor}
              roughness={0.42}
              metalness={0.24}
            />
          </mesh>
          <mesh castShadow position={[0, dimensions.height * 0.42, 0]}>
            <cylinderGeometry
              args={[0.025, 0.03, dimensions.height * 0.84, 18]}
            />
            <ModelMaterial color="#30323a" roughness={0.28} metalness={0.24} />
          </mesh>
          <mesh castShadow position={[0, dimensions.height * 0.88, 0]}>
            <coneGeometry
              args={[dimensions.width * 0.52, dimensions.height * 0.26, 32]}
            />
            <ModelMaterial color={softAccent} roughness={0.5} />
          </mesh>
          <pointLight
            color="#fff1c2"
            distance={4.2}
            intensity={active ? 1.25 : 0.78}
            position={[0, dimensions.height * 0.84, 0]}
          />
        </>
      )}

      {item.type === "plant" && (
        <>
          <mesh castShadow position={[0, 0.14, 0]}>
            <cylinderGeometry
              args={[dimensions.width * 0.26, dimensions.width * 0.2, 0.28, 24]}
            />
            <ModelMaterial color={plantPotColor} roughness={0.72} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <mesh
              castShadow
              key={`plant-leaf-${index}`}
              position={[
                Math.cos(index * 1.05) * dimensions.width * 0.16,
                0.38 + Math.sin(index * 0.75) * 0.08,
                Math.sin(index * 1.05) * dimensions.depth * 0.16,
              ]}
              scale={[0.85, 1.25, 0.85]}
            >
              <sphereGeometry args={[dimensions.width * 0.18, 20, 20]} />
              <ModelMaterial color={baseColor} roughness={0.72} />
            </mesh>
          ))}
        </>
      )}

      {active && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[highlightRadius * 0.88, highlightRadius, 56]} />
          <meshBasicMaterial color="#0f766e" opacity={0.38} transparent />
        </mesh>
      )}

      {selected && <ProductLabel item={item} y={labelHeight} />}
    </group>
  );
}

function Scene({
  controlsRef,
  draggingId,
  items,
  onDragStateChange,
  onMoveItem,
  resetToken,
  roomDimensions,
  selectedId,
  onSelect,
}) {
  useEffect(() => {
    if (!resetToken) return;
    controlsRef.current?.reset();
  }, [controlsRef, resetToken]);

  return (
    <>
      <KeyboardNavigation controlsRef={controlsRef} enabled={!draggingId} />
      <PerspectiveCamera
        makeDefault
        fov={46}
        position={DEFAULT_CAMERA_POSITION}
      />
      <OrbitControls
        ref={controlsRef}
        enabled={!draggingId}
        enableDamping
        makeDefault
        maxDistance={9}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={2.9}
        target={DEFAULT_CAMERA_TARGET}
      />
      <hemisphereLight
        skyColor="#edf4ff"
        groundColor="#826f57"
        intensity={0.34}
      />
      <ambientLight intensity={0.48} />
      <directionalLight
        castShadow
        intensity={1.3}
        position={[4.2, 6.2, 3.4]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight
        castShadow
        intensity={0.8}
        position={[-3, 5, 2.2]}
        angle={0.3}
        penumbra={0.45}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Room dimensions={roomDimensions} />
      <Grid
        args={[8, 8]}
        cellColor="#d5cec2"
        cellSize={0.5}
        fadeDistance={9}
        fadeStrength={1}
        position={[0, 0.012, 0]}
        sectionColor="#a39889"
        sectionSize={1}
      />
      {items.map((item) => (
        <FurnitureModel
          item={item}
          key={item.id}
          onDragStateChange={onDragStateChange}
          onMoveItem={onMoveItem}
          onSelect={onSelect}
          roomDimensions={roomDimensions}
          selected={String(selectedId) === String(item.id)}
        />
      ))}
      <ContactShadows
        blur={2.8}
        far={4.8}
        opacity={0.28}
        position={[0, 0.02, 0]}
        scale={7.4}
      />
      <Environment preset="apartment" />
    </>
  );
}

function Viewer3DPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const controlsRef = useRef(null);
  const canvasPanelRef = useRef(null);
  const pageRef = useRef(null);
  const layoutRequestKeyRef = useRef("");
  const [draggingId, setDraggingId] = useState(null);
  const [manualPositions, setManualPositions] = useState({});
  const [availableHeight, setAvailableHeight] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [addingCart, setAddingCart] = useState(false);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  const initialAiResults = useMemo(
    () => location.state?.aiResults || getSavedAiViewerState() || null,
    [location.state],
  );
  const [aiResults, setAiResults] = useState(initialAiResults);

  useEffect(() => {
    setAiResults(initialAiResults);
    setDraggingId(null);
    setManualPositions({});
    layoutRequestKeyRef.current = "";

    if (initialAiResults) {
      saveAiViewerState(initialAiResults);
    }
  }, [initialAiResults]);

  const products = useMemo(
    () => (Array.isArray(aiResults?.products) ? aiResults.products : []),
    [aiResults],
  );

  useEffect(() => {
    if (!aiResults || !products.length) return;

    const hasLayoutPlacement =
      aiResults?.layout?.requestVersion === LAYOUT_REQUEST_VERSION &&
      (products.some((product) => product?.layoutPlacement) ||
        Boolean(aiResults?.layout?.items?.length) ||
        Boolean(aiResults?.layout?.rejected?.length));

    if (hasLayoutPlacement) return;

    const requestKey = JSON.stringify({
      id: aiResults.id || aiResults.requestMeta?.id || "",
      roomType: aiResults.roomType || "",
      style: aiResults.style || "",
      room: aiResults.roomAnalysis || {},
      products: products.map((product) => getProductId(product)).join("|"),
      version: LAYOUT_REQUEST_VERSION,
    });

    if (layoutRequestKeyRef.current === requestKey) return;

    let cancelled = false;
    layoutRequestKeyRef.current = requestKey;
    setLayoutLoading(true);

    const loadLayout = async () => {
      try {
        const layoutResponse = await postAiLayoutFromRecommendationApi({
          roomType: aiResults.roomType,
          dimensions: aiResults.roomAnalysis,
          style: aiResults.style,
          products,
          topK: Math.max(products.length, 1),
          minScore: 0.55,
        });

        if (cancelled) return;

        const mergedResult = mergeAiLayoutResult(aiResults, layoutResponse);
        const versionedResult = {
          ...mergedResult,
          layout: {
            ...(mergedResult?.layout || {}),
            requestVersion: LAYOUT_REQUEST_VERSION,
          },
        };

        if (versionedResult?.layout?.rejected?.length) {
          console.warn(
            "[AI Viewer] layout rejected products",
            versionedResult.layout.rejected,
          );
        }

        setAiResults(versionedResult);
        saveAiViewerState(versionedResult);
      } catch (error) {
        if (cancelled) return;

        console.error("AI viewer layout error:", error);
        toast.error(
          "Khong lay duoc vi tri AI, viewer se dung bo cuc mac dinh.",
        );
      } finally {
        if (!cancelled) {
          setLayoutLoading(false);
        }
      }
    };

    loadLayout();

    return () => {
      cancelled = true;
    };
  }, [aiResults, products]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;

    let frameId = 0;

    const updateAvailableHeight = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const pageElement = pageRef.current;
        if (!pageElement) return;

        const rect = pageElement.getBoundingClientRect();
        const nextHeight = Math.max(
          window.innerHeight - Math.max(rect.top, 0) - 8,
          320,
        );

        setAvailableHeight((current) =>
          current !== nextHeight ? nextHeight : current,
        );
      });
    };

    updateAvailableHeight();

    window.addEventListener("resize", updateAvailableHeight);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateAvailableHeight);
    };
  }, []);

  const sceneItems = useMemo(() => {
    const counts = {};
    const mappedItems = products.map((product, index) => {
      const meta = getItemType(product);
      const storageVariant =
        meta.type === "storage" ? getStorageVariant(product) : undefined;
      const boxVariant =
        meta.type === "storageBox" ? getStorageBoxVariant(product) : undefined;
      const placementKey = storageVariant || meta.type;
      const typeIndex = counts[placementKey] || 0;
      counts[placementKey] = typeIndex + 1;

      const aiPlacement = getAiLayoutPlacement(product);
      const placement =
        aiPlacement || getPlacement(placementKey, typeIndex, index);
      const rawColor = product?.colors?.[0];

      return {
        ...product,
        id: getProductId(product) || `viewer-item-${index + 1}`,
        color: isLikelyCssColor(rawColor) ? rawColor.trim() : meta.color,
        image: resolveImageUrl(product?.imageUrl || product?.image),
        dimensionsText: formatItemDimensionsText({
          ...product,
          boxVariant,
          storageVariant,
          type: meta.type,
        }),
        hasAiPlacement: Boolean(aiPlacement),
        layoutScore: aiPlacement?.score ?? product?.layoutScore,
        modelUrl: aiPlacement?.modelUrl || product?.modelUrl || "",
        position: placement.position,
        rotation: placement.rotation,
        boxVariant,
        storageVariant,
        type: meta.type,
      };
    });

    const baseItems = mappedItems.map((item) => {
      const manualPlacement = manualPositions[item.id];

      if (!manualPlacement) return item;

      return {
        ...item,
        position: manualPlacement.position,
        rotation: manualPlacement.rotation ?? item.rotation,
      };
    });

    const surfaceAnchors = baseItems.filter(
      (item) =>
        ["table", "sofa", "bench", "bed"].includes(item.type) ||
        (item.type === "storage" &&
          [
            "tvStand",
            "shelfWide",
            "displayShelf",
            "rollingShelf",
            "wireRack",
            "glassCabinet",
            "shelfTall",
          ].includes(item.storageVariant)),
    );
    const accessoryCounts = { tray: 0, vase: 0, storageBox: 0, textile: 0 };

    return baseItems.map((item) => {
      if (
        !["tray", "vase", "storageBox", "textile"].includes(item.type) ||
        item.hasAiPlacement ||
        manualPositions[item.id]
      ) {
        return item;
      }

      const accessoryIndex = accessoryCounts[item.type] || 0;
      accessoryCounts[item.type] = accessoryIndex + 1;

      const placement = getSurfacePlacementForAccessory(
        item,
        surfaceAnchors,
        accessoryIndex,
      );

      if (!placement) {
        return item;
      }

      return {
        ...item,
        position: placement.position,
        rotation: placement.rotation,
      };
    });
  }, [manualPositions, products]);

  const aiPlacedCount = sceneItems.filter((item) => item.hasAiPlacement).length;
  const hasLayoutResult = Boolean(aiResults?.layout);
  const manualMovedCount = Object.keys(manualPositions).length;

  const selectedItem =
    sceneItems.find((item) => String(item.id) === String(selectedId)) ||
    sceneItems[0] ||
    null;

  const totalPrice = sceneItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0,
  );

  const handleSelect = (item) => {
    setSelectedId(item.id);
  };

  const handleMoveItem = (itemId, nextPosition) => {
    setManualPositions((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] || {}),
        position: nextPosition,
      },
    }));
    setSelectedId(itemId);
  };

  const handleDragStateChange = (itemId) => {
    setDraggingId(itemId);
  };

  const handleResetView = () => {
    setResetToken((current) => current + 1);
  };

  const handleResetItems = () => {
    setDraggingId(null);
    setManualPositions({});
  };

  const handleToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await canvasPanelRef.current?.requestFullscreen();
    } catch (error) {
      console.error("Toggle fullscreen error:", error);
      toast.error("Không thể chuyển toàn màn hình.");
    }
  };

  const handleAddAllToCart = async () => {
    const realItems = sceneItems.filter(
      (item) => !String(item.id).startsWith("ai-product-"),
    );

    if (!realItems.length) {
      toast.error("Danh sách AI chưa có productId thật để thêm vào giỏ.");
      return;
    }

    setAddingCart(true);
    try {
      await Promise.all(
        realItems.map((item) =>
          addToCartApi({
            productId: item.id,
            quantity: 1,
          }),
        ),
      );

      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Đã thêm sản phẩm vào giỏ hàng.");
      navigate("/cart");
    } catch (error) {
      console.error("Add AI products to cart error:", error);
      toast.error(
        error?.response?.data?.message || "Không thêm được vào giỏ hàng.",
      );
    } finally {
      setAddingCart(false);
    }
  };

  if (!sceneItems.length) {
    return (
      <div
        className={styles.emptyPage}
        ref={pageRef}
        style={
          availableHeight
            ? { "--viewer-available-height": `${availableHeight}px` }
            : undefined
        }
      >
        <div className={styles.emptyPanel}>
          <Box size={42} />
          <h1>Chưa có dữ liệu 3D</h1>
          <p>
            Hãy tạo thiết kế bằng AI Designer để viewer dựng không gian từ
            response thật của API.
          </p>
          <button type="button" onClick={() => navigate("/ai-designer")}>
            Mở AI Designer
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.page}
      ref={pageRef}
      style={
        availableHeight
          ? { "--viewer-available-height": `${availableHeight}px` }
          : undefined
      }
    >
      <header className={styles.toolbar}>
        <div className={styles.toolbarMain}>
          <button
            className={styles.iconButton}
            onClick={() => navigate(-1)}
            title="Quay lại"
            type="button"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <span className={styles.kicker}>
              <Sparkles size={14} />
              AI 3D Viewer
            </span>
            <h1>Không gian 3D</h1>
          </div>
        </div>

        <div className={styles.toolbarActions}>
          <button
            className={styles.iconButton}
            onClick={handleResetView}
            title="Reset góc nhìn"
            type="button"
          >
            <RotateCcw size={18} />
          </button>
          <button
            className={styles.iconButton}
            onClick={handleResetItems}
            title="Reset vị trí đồ vật"
            type="button"
          >
            <Box size={18} />
          </button>
          <button
            className={styles.iconButton}
            onClick={handleToggleFullscreen}
            title="Toàn màn hình"
            type="button"
          >
            <Maximize2 size={18} />
          </button>
          <button
            className={styles.cartButton}
            disabled={addingCart}
            onClick={handleAddAllToCart}
            type="button"
          >
            {addingCart ? (
              <Loader2 className={styles.spin} size={18} />
            ) : (
              <ShoppingCart size={18} />
            )}
            <span>Mua tất cả</span>
          </button>
        </div>
      </header>

      <main className={styles.viewerShell}>
        <section className={styles.canvasPanel} ref={canvasPanelRef}>
          <Canvas shadows dpr={[1, 1.7]}>
            <Suspense fallback={null}>
              <Scene
                controlsRef={controlsRef}
                draggingId={draggingId}
                items={sceneItems}
                onDragStateChange={handleDragStateChange}
                onMoveItem={handleMoveItem}
                onSelect={handleSelect}
                resetToken={resetToken}
                roomDimensions={aiResults?.roomAnalysis}
                selectedId={selectedItem?.id}
              />
            </Suspense>
          </Canvas>

          <div className={styles.sceneStats}>
            <div>
              <Home size={17} />
              <span>{aiResults?.roomType || "Không gian AI"}</span>
            </div>
            <div className={styles.sceneStatsMeta}>
              <span className={styles.sceneStatsLabel}>AI layout</span>
              <strong>
                {layoutLoading
                  ? "Dang xep vi tri AI..."
                  : `${aiPlacedCount}/${sceneItems.length} vị trí AI`}
              </strong>
              {manualMovedCount > 0 && (
                <small className={styles.sceneStatsHint}>
                  {manualMovedCount} món đã chỉnh tay
                </small>
              )}
              {!layoutLoading && !hasLayoutResult && aiPlacedCount === 0 && (
                <small className={styles.sceneStatsHint}>
                  Chưa có vị trí AI, đang dùng bố cục mặc định
                </small>
              )}
            </div>
          </div>
        </section>

        <aside className={styles.sidePanel}>
          <section className={styles.summaryBlock}>
            <span>Tổng giá trị</span>
            <strong>{formatPrice(totalPrice)}</strong>
            <p>
              {aiResults?.reasoning ||
                "Viewer đang dùng danh sách sản phẩm từ kết quả AI recommend."}
            </p>
          </section>

          {selectedItem && (
            <section className={styles.detailBlock}>
              {selectedItem.image && (
                <img src={selectedItem.image} alt={selectedItem.name} />
              )}
              <span>{selectedItem.category || selectedItem.type}</span>
              <h2>{selectedItem.name}</h2>
              <strong>{formatPrice(selectedItem.price)}</strong>
              <p>
                {selectedItem.reason ||
                  "Sản phẩm phù hợp với cấu hình phòng đã chọn."}
              </p>
              <dl>
                <div>
                  <dt>Kích thước</dt>
                  <dd>{selectedItem.dimensionsText || "Chưa có dữ liệu"}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() =>
                  selectedItem.id &&
                  !String(selectedItem.id).startsWith("ai-product-")
                    ? navigate(`/products/${selectedItem.id}`)
                    : navigate("/products")
                }
              >
                Xem chi tiết sản phẩm
                <ChevronRight size={16} />
              </button>
            </section>
          )}

          <section className={styles.productList}>
            <h3>Danh sách sản phẩm</h3>
            {sceneItems.map((item) => (
              <button
                className={
                  String(item.id) === String(selectedItem?.id)
                    ? styles.activeItem
                    : ""
                }
                key={item.id}
                onClick={() => handleSelect(item)}
                type="button"
              >
                <span>{item.name}</span>
                <strong>{formatPrice(item.price)}</strong>
              </button>
            ))}
          </section>
        </aside>
      </main>
    </div>
  );
}

export default Viewer3DPage;
