import {
  Suspense,
  useCallback,
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
  RotateCw,
  Save,
  ShoppingCart,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { Box3, Color, Plane, Vector3 } from "three";

import { postAiLayoutFromRecommendationApi } from "../../api/aiRecommendApi";
import { addToCartApi } from "../../api/cartApi";
import { mergeAiLayoutResult } from "../../utils/aiRecommendResultV2";
import { getErrorMessage } from "../../utils/errorMessage";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "../../styles/Viewer3D.module.css";

const STORAGE_KEY = "cap2-ai-viewer-state";
const LAYOUT_REQUEST_VERSION = "layout-model-url-v5";
const DEFAULT_CAMERA_POSITION = [5.3, 3.7, 6.4];
const DEFAULT_CAMERA_TARGET = [0, 0.55, 0];
const DEFAULT_ROOM_DIMENSIONS = { width: 4.8, length: 5.8, height: 3 };
const DEFAULT_ROOM_PALETTE = ["#f5f5dc", "#d2b48c", "#ffffff"];
const DRAG_ROOM_PADDING = 0.08;
const ITEM_ROTATION_STEP = Math.PI / 12;
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
  "vach ben",
  "thanh inox",
  "mam ke",
  "khung thep",
  "phan gia",
  "bo dieu chinh",
  "gia de do",
];
const NIGHTSTAND_KEYS = [
  "tu dau giuong",
  "tab dau giuong",
  "ban dau giuong",
  "nightstand",
  "night stand",
  "night table",
  "bedside table",
  "bedside cabinet",
  "bedside drawer",
];
const HEADBOARD_KEYS = [
  "headboard",
  "bed headboard",
  "head board",
  "tua dau giuong",
  "op dau giuong",
];
const TABLE_LAMP_KEYS = [
  "table lamp",
  "desk lamp",
  "bedside lamp",
  "nightstand lamp",
  "den ban",
  "den ngu",
  "den dau giuong",
];
const FLOOR_LAMP_KEYS = ["floor lamp", "standing lamp", "den cay", "den san"];
const CEILING_LAMP_KEYS = [
  "ceiling lamp",
  "ceiling light",
  "ceiling fixture",
  "pendant lamp",
  "pendant light",
  "flush mount",
  "semi flush",
  "chandelier",
  "den tran",
  "den op tran",
  "den mam",
  "den tha",
  "den tha tran",
  "den chum",
];
const TABLE_PLANT_KEYS = [
  "chau hoa",
  "chau cay",
  "planter",
  "flower pot",
  "plant pot",
  "succulent",
  "mini plant",
];
const FLOOR_PLANT_KEYS = [
  "floor plant",
  "tree",
  "palm",
  "cay lon",
  "cay dung",
  "cay san",
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
const OFFICE_CHAIR_KEYS = [
  "office chair",
  "desk chair",
  "task chair",
  "computer chair",
  "gaming chair",
  "ghe lam viec",
  "ghe van phong",
  "van phong",
];
const ARMCHAIR_STYLE_KEYS = [
  "armchair",
  "accent chair",
  "lounge chair",
  "club chair",
  "reading chair",
  "ghe thu gian",
  "relax chair",
];
const DINING_CHAIR_KEYS = [
  "dining chair",
  "side chair",
  "ghe an",
  "ghe cafe",
  "ghe ban an",
];
const STOOL_CHAIR_KEYS = [
  "bar stool",
  "counter stool",
  "stool",
  "ghe don",
  "don tron",
  "don cao",
];
const SWIVEL_CHAIR_KEYS = ["xoay", "swivel", "rotating", "spin chair"];
const TABLE_OVAL_KEYS = [
  "oval",
  "ellipse",
  "elliptic",
  "ban oval",
  "oval table",
];
const TABLE_ROUND_KEYS = ["round table", "ban tron", "tron"];
const TABLE_COFFEE_KEYS = ["coffee table", "ban nuoc", "ban tra", "ban sofa"];
const TABLE_SIDE_KEYS = ["side table", "end table", "ban ben", "ban phu"];
const TABLE_DESK_KEYS = [
  "desk",
  "work desk",
  "study desk",
  "writing desk",
  "computer desk",
  "ban lam viec",
  "ban hoc",
];
const TABLE_CONSOLE_KEYS = [
  "console table",
  "entry table",
  "hall table",
  "ban console",
];
const TABLE_DINING_KEYS = ["dining table", "ban an", "ban tiec"];
const SHELF_CATEGORY_KEYS = ["ke phong khach", "ke sach"];
const DISPLAY_CABINET_KEYS = ["trung bay", "display cabinet", "china cabinet"];
const SIDEBOARD_KEYS = [
  "tu ly",
  "sideboard",
  "buffet",
  "credenza",
  "dresser",
  "tu buffet",
  "tu ruou",
];
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
const GLASS_CABINET_KEYS = [...DISPLAY_CABINET_KEYS];
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
  {
    categories: ["hoa & cay", "chau hoa", "chau cay"],
    type: "plant",
    color: "#3f7751",
  },
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
    keys: [
      "plant",
      "cay",
      "hoa",
      "chau hoa",
      "chau cay",
      "planter",
      "flower pot",
      "plant pot",
    ],
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

const LAMP_VARIANT_DEFAULT_DIMENSIONS = {
  floor: { width: 0.34, height: 1.6, depth: 0.34 },
  table: { width: 0.24, height: 0.46, depth: 0.24 },
  ceiling: { width: 0.72, height: 0.68, depth: 0.72 },
};

const CHAIR_VARIANT_DEFAULT_DIMENSIONS = {
  dining: { width: 0.66, height: 0.9, depth: 0.66 },
  armchair: { width: 0.84, height: 0.88, depth: 0.8 },
  swivel: { width: 0.78, height: 0.92, depth: 0.76 },
  office: { width: 0.7, height: 1.02, depth: 0.72 },
  stool: { width: 0.5, height: 0.68, depth: 0.5 },
};

const TABLE_VARIANT_DEFAULT_DIMENSIONS = {
  rect: { width: 1.1, height: 0.48, depth: 0.68 },
  coffee: { width: 1.15, height: 0.42, depth: 0.64 },
  side: { width: 0.56, height: 0.58, depth: 0.56 },
  desk: { width: 1.35, height: 0.76, depth: 0.64 },
  console: { width: 1.28, height: 0.78, depth: 0.36 },
  dining: { width: 1.56, height: 0.75, depth: 0.84 },
  oval: { width: 1.28, height: 0.72, depth: 0.78 },
  round: { width: 0.92, height: 0.72, depth: 0.92 },
};

const PLANT_VARIANT_DEFAULT_DIMENSIONS = {
  floor: { width: 0.42, height: 0.8, depth: 0.42 },
  table: { width: 0.22, height: 0.34, depth: 0.22 },
};

const STORAGE_VARIANT_DEFAULT_DIMENSIONS = {
  nightstand: { width: 0.56, height: 0.62, depth: 0.42 },
  tvStand: { width: 1.75, height: 0.62, depth: 0.46 },
  sideboard: { width: 1.58, height: 0.88, depth: 0.46 },
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

const LAMP_VARIANT_DIMENSION_LIMITS = {
  floor: {
    width: [0.24, 0.55],
    height: [1.15, 1.95],
    depth: [0.24, 0.55],
  },
  table: {
    width: [0.16, 0.38],
    height: [0.26, 0.78],
    depth: [0.16, 0.38],
  },
  ceiling: {
    width: [0.32, 1.35],
    height: [0.24, 1.1],
    depth: [0.32, 1.35],
  },
};

const CHAIR_VARIANT_DIMENSION_LIMITS = {
  dining: {
    width: [0.5, 0.8],
    height: [0.78, 1.04],
    depth: [0.5, 0.82],
  },
  armchair: {
    width: [0.72, 1.06],
    height: [0.74, 1.02],
    depth: [0.7, 1],
  },
  swivel: {
    width: [0.66, 0.96],
    height: [0.78, 1.08],
    depth: [0.66, 0.92],
  },
  office: {
    width: [0.58, 0.84],
    height: [0.88, 1.22],
    depth: [0.56, 0.84],
  },
  stool: {
    width: [0.38, 0.68],
    height: [0.42, 1.05],
    depth: [0.38, 0.68],
  },
};

const TABLE_VARIANT_DIMENSION_LIMITS = {
  rect: {
    width: [0.55, 1.8],
    height: [0.38, 0.82],
    depth: [0.45, 1.2],
  },
  coffee: {
    width: [0.72, 1.8],
    height: [0.3, 0.56],
    depth: [0.45, 1.1],
  },
  side: {
    width: [0.35, 0.8],
    height: [0.42, 0.78],
    depth: [0.35, 0.8],
  },
  desk: {
    width: [0.9, 2],
    height: [0.68, 0.84],
    depth: [0.5, 0.9],
  },
  console: {
    width: [0.8, 2.2],
    height: [0.68, 0.94],
    depth: [0.24, 0.5],
  },
  dining: {
    width: [1.1, 2.4],
    height: [0.68, 0.82],
    depth: [0.7, 1.2],
  },
  oval: {
    width: [0.82, 2.1],
    height: [0.52, 0.82],
    depth: [0.56, 1.3],
  },
  round: {
    width: [0.55, 1.5],
    height: [0.55, 0.82],
    depth: [0.55, 1.5],
  },
};

const PLANT_VARIANT_DIMENSION_LIMITS = {
  floor: {
    width: [0.3, 0.75],
    height: [0.55, 1.15],
    depth: [0.3, 0.75],
  },
  table: {
    width: [0.14, 0.42],
    height: [0.2, 0.62],
    depth: [0.14, 0.42],
  },
};

const STORAGE_VARIANT_DIMENSION_LIMITS = {
  nightstand: {
    width: [0.38, 0.82],
    height: [0.42, 0.86],
    depth: [0.28, 0.58],
  },
  tvStand: {
    width: [1.3, 2.2],
    height: [0.45, 0.82],
    depth: [0.34, 0.6],
  },
  sideboard: {
    width: [1, 2.2],
    height: [0.68, 1.18],
    depth: [0.32, 0.58],
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

const SUPPORT_TYPES = [
  "table",
  "desk",
  "nightstand",
  "cabinet",
  "shelf",
  "dresser",
  "bench",
  "bed",
  "sofa",
];

const DECOR_TYPES = [
  "table_lamp",
  "vase",
  "plant",
  "storage_box",
  "tray",
  "textile",
];

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
  nightstand: [
    { position: [1.65, 0, -1.45], rotation: -0.2 },
    { position: [-1.65, 0, -1.45], rotation: 0.2 },
    { position: [1.8, 0, 1.35], rotation: -Math.PI / 2 },
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
  sideboard: [
    { position: [1.95, 0, 1.15], rotation: -Math.PI / 2 },
    { position: [-1.95, 0, 1.1], rotation: Math.PI / 2 },
    { position: [0, 0, -2], rotation: Math.PI },
  ],
  decor: [
    { position: [1.85, 0, 1.6], rotation: 0.25 },
    { position: [-1.85, 0, 1.55], rotation: -0.25 },
    { position: [0.95, 0, -1.35], rotation: 0.1 },
  ],
  lamp: [
    { position: [2.1, 0, 1.8], rotation: 0 },
    { position: [-2.1, 0, 1.8], rotation: 0 },
  ],
  tableLamp: [
    { position: [1.45, 0, -1.15], rotation: -0.1 },
    { position: [-1.45, 0, -1.15], rotation: 0.1 },
  ],
  ceilingLamp: [
    { position: [0, 0, -0.15], rotation: 0 },
    { position: [-1.15, 0, -1.1], rotation: 0 },
    { position: [1.15, 0, 0.85], rotation: 0 },
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

const MANUAL_PREVIEW_LAYOUTS = [
  { position: [0, 0, 0.9], rotation: 0 },
  { position: [0.85, 0, 0.9], rotation: 0 },
  { position: [-0.85, 0, 0.9], rotation: 0 },
  { position: [0, 0, 0.2], rotation: 0 },
  { position: [0.85, 0, 0.2], rotation: 0 },
  { position: [-0.85, 0, 0.2], rotation: 0 },
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

const createColorValue = (value, fallback = "#ffffff") => {
  try {
    return new Color(value || fallback);
  } catch {
    return new Color(fallback);
  }
};

const colorToHex = (value) => `#${createColorValue(value).getHexString()}`;

const mixColors = (from, to, ratio) =>
  `#${createColorValue(from)
    .lerp(createColorValue(to), clamp(ratio, 0, 1))
    .getHexString()}`;

const getColorLuminance = (value) => {
  const color = createColorValue(value);
  return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
};

const getRoomSurfacePalette = (palette) => {
  const sourceColors = Array.from(
    new Set(
      (Array.isArray(palette) ? palette : [])
        .map((item) => item?.color)
        .filter(Boolean)
        .map((item) => colorToHex(item)),
    ),
  );
  const normalizedColors = sourceColors.length
    ? sourceColors
    : DEFAULT_ROOM_PALETTE;
  const sortedByLightness = [...normalizedColors].sort(
    (a, b) => getColorLuminance(a) - getColorLuminance(b),
  );
  const darkest = sortedByLightness[0];
  const lightest = sortedByLightness[sortedByLightness.length - 1];
  const mid =
    sortedByLightness[Math.floor((sortedByLightness.length - 1) / 2)] ||
    normalizedColors[1] ||
    lightest;
  const dominant = normalizedColors[0] || lightest;
  const support = normalizedColors[1] || mid || darkest;
  const accent = normalizedColors[2] || lightest;
  const wallBase = mixColors(dominant, accent, 0.38);
  const floorBase = mixColors(support, darkest, 0.34);
  const floorAlt = mixColors(floorBase, accent, 0.14);
  const floorLine = mixColors(floorBase, "#ffffff", 0.22);
  const backWall = mixColors(wallBase, accent, 0.1);
  const sideWall = mixColors(wallBase, support, 0.08);
  const ceiling = mixColors(accent, "#ffffff", 0.5);
  const trim = mixColors(darkest, "#ffffff", 0.46);

  return {
    floor: floorBase,
    floorAlt,
    floorLine,
    backWall,
    sideWall,
    ceiling,
    trim,
    gridCell: mixColors(floorBase, "#ffffff", 0.18),
    gridSection: mixColors(darkest, "#8f7f6d", 0.34),
    skyLight: mixColors(ceiling, "#edf4ff", 0.28),
    groundLight: mixColors(floorBase, "#826f57", 0.3),
    ambientLight: mixColors(wallBase, "#ffffff", 0.25),
    sunlight: mixColors(accent, "#fff4d8", 0.35),
  };
};

const parseDimension = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const hasDefinedKey = (source, keys) =>
  Boolean(
    source &&
    typeof source === "object" &&
    keys.some((key) => source[key] !== undefined && source[key] !== null),
  );

const normalizeLinearUnit = (value, fallback = "m") => {
  const normalized = String(value || fallback)
    .trim()
    .toLowerCase();

  if (
    ["cm", "centimeter", "centimeters", "centimetre", "centimetres"].includes(
      normalized,
    )
  ) {
    return "cm";
  }

  if (
    ["mm", "millimeter", "millimeters", "millimetre", "millimetres"].includes(
      normalized,
    )
  ) {
    return "mm";
  }

  return "m";
};

const getMeasurementUnit = (source, fallback = "m") => {
  if (!source || typeof source !== "object") {
    return normalizeLinearUnit(fallback, fallback);
  }

  const explicitUnit =
    source.unit ||
    source.dimensionUnit ||
    source.dimension_unit ||
    source.measurementUnit ||
    source.measurement_unit ||
    source.positionUnit ||
    source.position_unit ||
    source.coordinateUnit ||
    source.coordinate_unit;

  if (explicitUnit) {
    return normalizeLinearUnit(explicitUnit, fallback);
  }

  if (
    hasDefinedKey(source, [
      "widthMm",
      "lengthMm",
      "depthMm",
      "heightMm",
      "xMm",
      "yMm",
      "zMm",
    ])
  ) {
    return "mm";
  }

  if (
    hasDefinedKey(source, [
      "widthCm",
      "lengthCm",
      "depthCm",
      "heightCm",
      "xCm",
      "yCm",
      "zCm",
    ])
  ) {
    return "cm";
  }

  if (
    hasDefinedKey(source, [
      "widthM",
      "lengthM",
      "depthM",
      "heightM",
      "xM",
      "yM",
      "zM",
      "elevationM",
    ])
  ) {
    return "m";
  }

  return normalizeLinearUnit(fallback, fallback);
};

const toMeters = (value, unit = "m") => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;

  const normalizedUnit = normalizeLinearUnit(unit, "m");

  if (normalizedUnit === "cm") return num / 100;
  if (normalizedUnit === "mm") return num / 1000;
  return num;
};

const formatMeasureValue = (value) =>
  Number.isFinite(value) ? Number(value.toFixed(2)) : 0;

const getRoomMetricValue = (dimensions, keys) =>
  keys
    .map((key) => parseDimension(dimensions?.[key]))
    .find((value) => value > 0) || 0;

const getRoomMetrics = (dimensions) => {
  const unit = getMeasurementUnit(dimensions, "m");
  const widthValue = getRoomMetricValue(dimensions, [
    "width",
    "widthM",
    "width_m",
  ]);
  const lengthValue = getRoomMetricValue(dimensions, [
    "length",
    "lengthM",
    "length_m",
    "depth",
    "depthM",
    "depth_m",
  ]);
  const heightValue = getRoomMetricValue(dimensions, [
    "height",
    "heightM",
    "height_m",
  ]);

  return {
    width: widthValue
      ? toMeters(widthValue, unit)
      : DEFAULT_ROOM_DIMENSIONS.width,
    length: lengthValue
      ? toMeters(lengthValue, unit)
      : DEFAULT_ROOM_DIMENSIONS.length,
    height: heightValue
      ? toMeters(heightValue, unit)
      : DEFAULT_ROOM_DIMENSIONS.height,
  };
};

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
    typeof position[1] === "number" && Number.isFinite(position[1])
      ? position[1]
      : getItemFloorOffset(item),
    clamp(position[2], Math.min(minZ, maxZ), Math.max(minZ, maxZ)),
  ];
};

const normalizeRotationAngle = (value) =>
  Math.atan2(Math.sin(value || 0), Math.cos(value || 0));

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
    width: Math.min(sizeA, sizeB),
    depth: Math.max(sizeA, sizeB),
    unit: "m",
  };
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0111\u0110]/g, "d")
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

const isNightstandSource = (source) =>
  NIGHTSTAND_KEYS.some((keyword) => matchesKeyword(source, keyword));

const getLampVariant = (product) => {
  const source = sourceTextOf(product);
  const category = categoryTextOf(product);
  const rawHeight = parseDimension(product?.dimensions?.height);
  const rawWidth = parseDimension(
    product?.dimensions?.width ?? product?.dimensions?.length,
  );
  const rawDepth = parseDimension(
    product?.dimensions?.depth ?? product?.dimensions?.length,
  );
  const maxSpan = Math.max(rawWidth || 0, rawDepth || 0);
  const hasTableLampKeyword = TABLE_LAMP_KEYS.some((keyword) =>
    matchesKeyword(source, keyword),
  );
  const hasFloorLampKeyword = FLOOR_LAMP_KEYS.some((keyword) =>
    matchesKeyword(source, keyword),
  );
  const hasCeilingLampKeyword =
    category.includes("den tran") ||
    CEILING_LAMP_KEYS.some((keyword) => matchesKeyword(source, keyword));

  if (hasTableLampKeyword) {
    return "table";
  }

  if (hasFloorLampKeyword) {
    return "floor";
  }

  if (hasCeilingLampKeyword) {
    return "ceiling";
  }

  if (rawHeight > 0 && rawHeight <= 90 && (!rawWidth || rawWidth <= 45)) {
    return "table";
  }

  if (rawHeight >= 110) {
    return "floor";
  }

  if (rawHeight > 0 && rawHeight <= 45 && maxSpan >= 42) {
    return "ceiling";
  }

  return "floor";
};

const getChairVariant = (product) => {
  const source = sourceTextOf(product);
  const category = categoryTextOf(product);
  const rawHeight = parseDimension(product?.dimensions?.height);
  const rawWidth = parseDimension(
    product?.dimensions?.width ?? product?.dimensions?.length,
  );
  const rawDepth = parseDimension(
    product?.dimensions?.depth ?? product?.dimensions?.length,
  );
  const isSwivel = SWIVEL_CHAIR_KEYS.some((keyword) =>
    matchesKeyword(source, keyword),
  );
  const isArmchairStyle =
    category.includes("armchair") ||
    category.includes("ghe thu gian") ||
    ARMCHAIR_STYLE_KEYS.some((keyword) => matchesKeyword(source, keyword));

  if (
    category.includes("ghe lam viec") ||
    OFFICE_CHAIR_KEYS.some((keyword) => matchesKeyword(source, keyword))
  ) {
    return "office";
  }

  if (isSwivel && (isArmchairStyle || rawWidth >= 72 || rawDepth >= 72)) {
    return "swivel";
  }

  if (isArmchairStyle) {
    return "armchair";
  }

  if (
    category.includes("ghe an") ||
    DINING_CHAIR_KEYS.some((keyword) => matchesKeyword(source, keyword))
  ) {
    return "dining";
  }

  if (
    category.includes("don") ||
    STOOL_CHAIR_KEYS.some((keyword) => matchesKeyword(source, keyword))
  ) {
    return "stool";
  }

  if (isSwivel) {
    return "office";
  }

  if (rawWidth >= 78 || rawDepth >= 78) {
    return "armchair";
  }

  if (rawHeight > 0 && rawHeight <= 72 && rawWidth <= 62 && rawDepth <= 62) {
    return "stool";
  }

  return "dining";
};

const getTableVariant = (product) => {
  const source = sourceTextOf(product);
  const category = categoryTextOf(product);
  const rawHeight = parseDimension(product?.dimensions?.height);
  const rawWidth = parseDimension(
    product?.dimensions?.width ?? product?.dimensions?.length,
  );
  const rawDepth = parseDimension(
    product?.dimensions?.depth ?? product?.dimensions?.length,
  );
  const isOval = TABLE_OVAL_KEYS.some((keyword) =>
    matchesKeyword(source, keyword),
  );
  const isRound = TABLE_ROUND_KEYS.some((keyword) =>
    matchesKeyword(source, keyword),
  );

  if (
    category.includes("ban console") ||
    TABLE_CONSOLE_KEYS.some((keyword) => matchesKeyword(source, keyword))
  ) {
    return "console";
  }

  if (
    category.includes("ban lam viec") ||
    TABLE_DESK_KEYS.some((keyword) => matchesKeyword(source, keyword))
  ) {
    return "desk";
  }

  if (
    category.includes("ban ben") ||
    TABLE_SIDE_KEYS.some((keyword) => matchesKeyword(source, keyword))
  ) {
    return isRound ? "round" : "side";
  }

  if (
    category.includes("ban nuoc") ||
    TABLE_COFFEE_KEYS.some((keyword) => matchesKeyword(source, keyword))
  ) {
    return isOval ? "oval" : isRound ? "round" : "coffee";
  }

  if (
    category.includes("ban an") ||
    TABLE_DINING_KEYS.some((keyword) => matchesKeyword(source, keyword))
  ) {
    return isOval ? "oval" : isRound ? "round" : "dining";
  }

  if (isOval) {
    return "oval";
  }

  if (isRound) {
    return "round";
  }

  if (rawHeight > 0 && rawHeight <= 56) {
    return rawWidth <= 70 && rawDepth <= 70 ? "side" : "coffee";
  }

  if (rawDepth > 0 && rawDepth <= 45 && rawWidth >= 95) {
    return "console";
  }

  if (rawWidth >= 120 && rawDepth >= 70) {
    return "dining";
  }

  if (rawHeight >= 68 && rawDepth >= 50 && rawWidth >= 90) {
    return "desk";
  }

  return "rect";
};

const getPlantVariant = (product) => {
  const source = sourceTextOf(product);
  const rawHeight = parseDimension(product?.dimensions?.height);
  const rawWidth = parseDimension(
    product?.dimensions?.width ?? product?.dimensions?.length,
  );

  if (FLOOR_PLANT_KEYS.some((keyword) => matchesKeyword(source, keyword))) {
    return "floor";
  }

  if (TABLE_PLANT_KEYS.some((keyword) => matchesKeyword(source, keyword))) {
    return "table";
  }

  if (rawHeight > 0 && rawHeight <= 80 && (!rawWidth || rawWidth <= 50)) {
    return "table";
  }

  return "floor";
};

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

  if (isNightstandSource(source)) {
    return { type: "storage", color: "#a75e33" };
  }

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
    isNightstandSource(source) ||
    ["tu dau giuong", "tab dau giuong", "ban dau giuong"].some((keyword) =>
      category.includes(keyword),
    )
  ) {
    return "nightstand";
  }

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
    category.includes("tu ly") ||
    SIDEBOARD_KEYS.some((keyword) => matchesKeyword(source, keyword))
  ) {
    return "sideboard";
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
    ["drawer", "dresser", "sideboard", "buffet", "credenza"].some((keyword) =>
      matchesKeyword(source, keyword),
    )
  ) {
    return "sideboard";
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

  if (HEADBOARD_KEYS.some((keyword) => matchesKeyword(source, keyword))) {
    return "headboard";
  }

  return "panel";
};

const getRawDimensionValue = (dimensions, keys) =>
  keys
    .map((key) => parseDimension(dimensions?.[key]))
    .find((value) => value > 0) || 0;

const fromCentimeters = (value, unit = "cm") => {
  const normalizedUnit = normalizeLinearUnit(unit, "cm");

  if (normalizedUnit === "m") return value / 100;
  if (normalizedUnit === "mm") return value * 10;
  return value;
};

const getRawDimensionSet = (item) => {
  const sourceDimensions = item?.dimensions || {};
  const sourceUnit = getMeasurementUnit(
    sourceDimensions,
    item?.unit || item?.dimensionUnit || "m",
  );
  const rawWidth = getRawDimensionValue(sourceDimensions, [
    "width",
    "widthM",
    "width_m",
    "length",
    "lengthM",
    "length_m",
  ]);
  const rawHeight = getRawDimensionValue(sourceDimensions, [
    "height",
    "heightM",
    "height_m",
  ]);
  const rawDepth = getRawDimensionValue(sourceDimensions, [
    "depth",
    "depthM",
    "depth_m",
    "length",
    "lengthM",
    "length_m",
  ]);
  const sorted = [rawWidth, rawHeight, rawDepth]
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (item?.type === "rug") {
    const textSize = extractPlanarSizeFromText(item);

    if (textSize && !rawWidth && !rawDepth) {
      return {
        width: textSize.width,
        height: rawHeight || 0.02,
        depth: textSize.depth,
        unit: textSize.unit,
      };
    }

    return {
      width: rawWidth || fromCentimeters(180, sourceUnit),
      height: rawHeight || fromCentimeters(2, sourceUnit),
      depth: rawDepth || fromCentimeters(260, sourceUnit),
      unit: sourceUnit,
    };
  }

  if (item?.type === "mirror" && sorted.length === 3) {
    return {
      width: sorted[1],
      height: sorted[2],
      depth: sorted[0],
      unit: sourceUnit,
    };
  }

  if (item?.type === "bench" && sorted.length === 3) {
    return {
      width: sorted[2],
      height: sorted[1],
      depth: sorted[0],
      unit: sourceUnit,
    };
  }

  if (item?.type === "beanbag") {
    const footprint = Math.max(rawWidth || 0, rawDepth || 0, sorted[2] || 0);

    return {
      width: footprint,
      height: rawHeight || sorted[1] || 0,
      depth: footprint,
      unit: sourceUnit,
    };
  }

  if (item?.type === "vase" && sorted.length === 3) {
    return {
      width: sorted[1],
      height: sorted[2],
      depth: sorted[1],
      unit: sourceUnit,
    };
  }

  if (item?.type === "textile" && sorted.length === 3) {
    return {
      width: sorted[2],
      height: sorted[0],
      depth: sorted[1],
      unit: sourceUnit,
    };
  }

  if (
    ["tray", "storageBox", "dolly"].includes(item?.type) &&
    sorted.length === 3
  ) {
    if (item?.boxVariant === "drawerTower") {
      return {
        width: sorted[2],
        height: sorted[0] * 3 + fromCentimeters(2, sourceUnit),
        depth: sorted[1],
        unit: sourceUnit,
      };
    }

    return {
      width: sorted[2],
      height: sorted[0],
      depth: sorted[1],
      unit: sourceUnit,
    };
  }

  if (item?.type === "component" && sorted.length === 3) {
    return {
      width: sorted[2],
      height: sorted[0],
      depth: sorted[1],
      unit: sourceUnit,
    };
  }

  if (item?.type === "coatRack") {
    return {
      width: Math.max(rawWidth, rawDepth),
      height: rawHeight || rawWidth || 0,
      depth: Math.min(rawWidth || rawDepth || 0, rawDepth || rawWidth || 0),
      unit: sourceUnit,
    };
  }

  if (item?.type === "floorChair") {
    return {
      width: Math.max(rawWidth, rawDepth),
      height: rawHeight || Math.min(rawWidth, rawDepth),
      depth: Math.min(rawWidth || rawDepth || 0, rawDepth || rawWidth || 0),
      unit: sourceUnit,
    };
  }

  if (item?.type === "storage" && rawDepth && rawWidth && rawDepth > rawWidth) {
    return {
      width: rawDepth,
      height: rawHeight,
      depth: rawWidth,
      unit: sourceUnit,
    };
  }

  return {
    width: rawWidth,
    height: rawHeight,
    depth: rawDepth,
    unit: sourceUnit,
  };
};

const formatItemDimensionsText = (item) => {
  const raw = getRawDimensionSet(item);

  if (!raw.width && !raw.height && !raw.depth) {
    return item?.dimensionsText || "Chưa có dữ liệu";
  }

  return `${raw.width || 0} x ${raw.depth || 0} x ${raw.height || 0} ${raw.unit || "m"}`;
};

const clampFurnitureSize = (size, room) => ({
  width: Math.min(size.width, room.width * 0.9),
  depth: Math.min(size.depth, room.length * 0.9),
  height: Math.min(size.height, room.height * 0.9),
});

const getItemDimensions = (item, roomDimensions = null) => {
  const defaults =
    item.type === "storage"
      ? STORAGE_VARIANT_DEFAULT_DIMENSIONS[item.storageVariant || "wardrobe"] ||
        STORAGE_VARIANT_DEFAULT_DIMENSIONS.wardrobe
      : item.type === "table"
        ? TABLE_VARIANT_DEFAULT_DIMENSIONS[item.tableVariant || "rect"] ||
          TABLE_VARIANT_DEFAULT_DIMENSIONS.rect
        : item.type === "chair"
          ? CHAIR_VARIANT_DEFAULT_DIMENSIONS[item.chairVariant || "dining"] ||
            CHAIR_VARIANT_DEFAULT_DIMENSIONS.dining
          : item.type === "lamp"
            ? LAMP_VARIANT_DEFAULT_DIMENSIONS[item.lampVariant || "floor"] ||
              LAMP_VARIANT_DEFAULT_DIMENSIONS.floor
            : item.type === "plant"
              ? PLANT_VARIANT_DEFAULT_DIMENSIONS[
                  item.plantVariant || "floor"
                ] || PLANT_VARIANT_DEFAULT_DIMENSIONS.floor
              : TYPE_DEFAULT_DIMENSIONS[item.type] ||
                TYPE_DEFAULT_DIMENSIONS.chair;
  const limits =
    item.type === "storage"
      ? STORAGE_VARIANT_DIMENSION_LIMITS[item.storageVariant || "wardrobe"] ||
        STORAGE_VARIANT_DIMENSION_LIMITS.wardrobe
      : item.type === "table"
        ? TABLE_VARIANT_DIMENSION_LIMITS[item.tableVariant || "rect"] ||
          TABLE_VARIANT_DIMENSION_LIMITS.rect
        : item.type === "chair"
          ? CHAIR_VARIANT_DIMENSION_LIMITS[item.chairVariant || "dining"] ||
            CHAIR_VARIANT_DIMENSION_LIMITS.dining
          : item.type === "lamp"
            ? LAMP_VARIANT_DIMENSION_LIMITS[item.lampVariant || "floor"] ||
              LAMP_VARIANT_DIMENSION_LIMITS.floor
            : item.type === "plant"
              ? PLANT_VARIANT_DIMENSION_LIMITS[item.plantVariant || "floor"] ||
                PLANT_VARIANT_DIMENSION_LIMITS.floor
              : TYPE_DIMENSION_LIMITS[item.type] || TYPE_DIMENSION_LIMITS.chair;
  const raw = getRawDimensionSet(item);
  const sizeInMeters = {
    width: raw.width ? toMeters(raw.width, raw.unit) : defaults.width,
    height: raw.height ? toMeters(raw.height, raw.unit) : defaults.height,
    depth: raw.depth ? toMeters(raw.depth, raw.unit) : defaults.depth,
  };
  const normalizedSize = {
    width: clamp(sizeInMeters.width, limits.width[0], limits.width[1]),
    height: clamp(sizeInMeters.height, limits.height[0], limits.height[1]),
    depth: clamp(sizeInMeters.depth, limits.depth[0], limits.depth[1]),
  };

  if (!roomDimensions) {
    return normalizedSize;
  }

  const room = getRoomMetrics(roomDimensions);
  const roomClampedSize = clampFurnitureSize(normalizedSize, room);

  if (
    import.meta.env.DEV &&
    (roomClampedSize.width !== normalizedSize.width ||
      roomClampedSize.height !== normalizedSize.height ||
      roomClampedSize.depth !== normalizedSize.depth)
  ) {
    console.warn("[AI Viewer][ClampFurnitureSize]", {
      itemId: item?.id,
      itemName: item?.name,
      room,
      beforeClamp: normalizedSize,
      afterClamp: roomClampedSize,
    });
  }

  return roomClampedSize;
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

const getManualPreviewPlacement = (manualIndex) => {
  if (MANUAL_PREVIEW_LAYOUTS[manualIndex]) {
    return MANUAL_PREVIEW_LAYOUTS[manualIndex];
  }

  const row = Math.floor(manualIndex / 3);
  const column = manualIndex % 3;

  return {
    position: [-0.85 + column * 0.85, 0, 0.9 - row * 0.7],
    rotation: 0,
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

const normalizeViewerLayoutPosition = (value, unitHint = "m") => {
  const unit = getMeasurementUnit(
    Array.isArray(value) ? { unit: unitHint } : value,
    unitHint,
  );

  if (Array.isArray(value)) {
    const x = parseOptionalNumber(value[0]);
    const y = value.length >= 3 ? parseOptionalNumber(value[1]) : 0;
    const z =
      value.length >= 3
        ? parseOptionalNumber(value[2])
        : parseOptionalNumber(value[1]);

    return x === null || z === null
      ? null
      : [toMeters(x, unit), toMeters(y ?? 0, unit), toMeters(z, unit)];
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

  return [
    toMeters(x, unit),
    explicitZ === undefined ? 0 : toMeters(verticalY, unit),
    toMeters(z, unit),
  ];
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

const normalizeLinkId = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  const normalized = String(value).trim();
  return normalized && normalized.toLowerCase() !== "undefined"
    ? normalized
    : "";
};

const normalizePlacementMode = (value, fallback = "floor") => {
  const normalized = normalizeText(value || fallback);

  if (
    [
      "on_top_of",
      "on top of",
      "ontopof",
      "surface",
      "tabletop",
      "top",
    ].includes(normalized)
  ) {
    return "on_top_of";
  }

  return "floor";
};

const normalizeSupportSurface = (value) => {
  const normalized = normalizeText(value);

  if (!normalized) return "";
  if (normalized.includes("shelf")) return "shelf";
  if (normalized.includes("top")) return "top";

  return "";
};

const getPlacementConfigSource = (item) =>
  item?.placement && typeof item.placement === "object" ? item.placement : item;

const getPlacementTargetId = (item) => {
  const source = getPlacementConfigSource(item);

  return (
    normalizeLinkId(
      source?.targetId ||
        source?.target_id ||
        source?.parentId ||
        source?.parent_id ||
        source?.anchorId ||
        source?.anchor_id ||
        source?.supportId ||
        source?.support_id ||
        source?.targetItemId ||
        source?.target_item_id ||
        source?.target?.id,
    ) || ""
  );
};

const getDecorType = (item) => {
  if (item?.type === "lamp" && item?.lampVariant === "table") {
    return "table_lamp";
  }

  if (item?.type === "plant" && item?.plantVariant === "table") {
    return "plant";
  }

  if (item?.type === "vase") {
    return "vase";
  }

  if (item?.type === "storageBox") {
    return "storage_box";
  }

  if (item?.type === "tray") {
    return "tray";
  }

  if (
    item?.type === "textile" &&
    (!getTextileVariant(item) || getTextileVariant(item) !== "curtain")
  ) {
    return "textile";
  }

  return "";
};

const getSupportType = (item) => {
  if (item?.supportType) {
    return item.supportType;
  }

  if (item?.type === "table") {
    return item.tableVariant === "desk" ? "desk" : "table";
  }

  if (item?.type === "storage") {
    switch (item.storageVariant) {
      case "nightstand":
        return "nightstand";
      case "displayShelf":
      case "rollingShelf":
      case "wireRack":
      case "shelfTall":
      case "shelfWide":
        return "shelf";
      case "sideboard":
        return "dresser";
      default:
        return "cabinet";
    }
  }

  if (item?.type === "bench") return "bench";
  if (item?.type === "bed") return "bed";
  if (item?.type === "sofa") return "sofa";

  return "";
};

const getItemSupportSurface = (item) => {
  const explicitSurface = normalizeSupportSurface(item?.supportSurface);

  if (explicitSurface) {
    return explicitSurface;
  }

  if (item?.type === "table") {
    return "top";
  }

  if (item?.type === "storage") {
    switch (item.storageVariant) {
      case "displayShelf":
      case "rollingShelf":
      case "wireRack":
      case "glassCabinet":
      case "shelfTall":
      case "shelfWide":
        return "shelf";
      default:
        return "top";
    }
  }

  if (["bench", "bed", "sofa"].includes(item?.type)) {
    return "top";
  }

  return "";
};

const getCanSupportItems = (item) => {
  if (typeof item?.canSupportItems === "boolean") {
    return item.canSupportItems;
  }

  return SUPPORT_TYPES.includes(getSupportType(item));
};

const getDefaultPlacementMode = (item) =>
  DECOR_TYPES.includes(getDecorType(item)) ? "on_top_of" : "floor";

const getItemPlacementConfig = (item) => {
  const source = getPlacementConfigSource(item);
  const targetId = getPlacementTargetId(item);
  const rawMode =
    source?.mode ||
    source?.placementMode ||
    source?.placement_mode ||
    item?.placementMode ||
    item?.placement_mode;

  return {
    mode: normalizePlacementMode(
      rawMode || (targetId ? "on_top_of" : getDefaultPlacementMode(item)),
    ),
    targetId,
  };
};

const isSurfaceAccessoryItem = (item) =>
  getItemPlacementConfig(item).mode === "on_top_of" &&
  DECOR_TYPES.includes(getDecorType(item));

const getSupportSurfaceLevels = (anchor, item, accessoryIndex = 0) => {
  if (getItemSupportSurface(anchor) !== "shelf") {
    return [1];
  }

  switch (anchor.storageVariant) {
    case "shelfWide":
      return item?.type === "storageBox" ? [0.23, 0.77] : [1];
    case "displayShelf":
      return [0.14, 0.46, 0.8];
    case "rollingShelf":
      return [0.16, 0.48, 0.8];
    case "wireRack":
      return [0.16, 0.38, 0.6, 0.82];
    case "shelfTall":
      return [0.06, 0.26, 0.46, 0.66, 0.86];
    case "glassCabinet":
      return [0.18, 0.42, 0.66];
    default:
      return [Math.max(0.2, Math.min(1, 1 - accessoryIndex * 0.12))];
  }
};

const createEmptyViewerEdits = () => ({
  hiddenItemIds: [],
  manualPositions: {},
  manualSceneEntries: [],
});

const clonePositionArray = (value) =>
  Array.isArray(value) ? [...value] : value || null;

const clonePlacementConfig = (value) =>
  value && typeof value === "object" ? { ...value } : undefined;

const cloneViewerEdits = (snapshot = null) => {
  const source =
    snapshot && typeof snapshot === "object"
      ? snapshot
      : createEmptyViewerEdits();

  return {
    hiddenItemIds: Array.isArray(source.hiddenItemIds)
      ? source.hiddenItemIds.map((id) => String(id))
      : [],
    manualPositions: Object.fromEntries(
      Object.entries(source.manualPositions || {}).map(([id, value]) => [
        String(id),
        {
          ...value,
          placement: clonePlacementConfig(value?.placement),
          position: clonePositionArray(value?.position),
        },
      ]),
    ),
    manualSceneEntries: Array.isArray(source.manualSceneEntries)
      ? source.manualSceneEntries.map((entry) => ({
          ...entry,
          placement: clonePlacementConfig(entry?.placement),
          position: clonePositionArray(entry?.position),
        }))
      : [],
  };
};

const normalizeViewerStatePayload = (state) => {
  if (!state || typeof state !== "object") {
    return {
      aiResults: state || null,
      viewerEdits: createEmptyViewerEdits(),
    };
  }

  if ("aiResults" in state || "viewerEdits" in state) {
    return {
      aiResults: state.aiResults || null,
      viewerEdits: cloneViewerEdits(state.viewerEdits),
    };
  }

  return {
    aiResults: state,
    viewerEdits: createEmptyViewerEdits(),
  };
};

const buildViewerStatePayload = (aiResults, viewerEdits) => ({
  aiResults: aiResults || null,
  viewerEdits: cloneViewerEdits(viewerEdits),
});

const getSupportTopHeight = (anchor, dimensions) => {
  if (anchor?.type === "sofa") {
    return dimensions.height * 0.48;
  }

  if (anchor?.type === "bench") {
    return dimensions.height * 0.78;
  }

  if (anchor?.type === "bed") {
    return 0.3;
  }

  return dimensions.height;
};

const canPlaceOnTop = (child, parent, roomDimensions = null) => {
  if (!isSurfaceAccessoryItem(child) || !getCanSupportItems(parent)) {
    return false;
  }

  const supportType = getSupportType(parent);
  const decorType = getDecorType(child);

  if (
    !SUPPORT_TYPES.includes(supportType) ||
    !DECOR_TYPES.includes(decorType)
  ) {
    return false;
  }

  const childDimensions = getItemDimensions(child, roomDimensions);
  const parentDimensions = getItemDimensions(parent, roomDimensions);
  const widthAllowance = Math.max(
    parentDimensions.width - 0.06,
    parentDimensions.width * 0.82,
  );
  const depthAllowance = Math.max(
    parentDimensions.depth - 0.06,
    parentDimensions.depth * 0.82,
  );

  return (
    childDimensions.width <= widthAllowance &&
    childDimensions.depth <= depthAllowance
  );
};

const findNearestSupport = (
  child,
  furnitureList,
  roomDimensions = null,
  desiredPosition = null,
) => {
  const eligible = furnitureList.filter((item) =>
    canPlaceOnTop(child, item, roomDimensions),
  );

  if (!eligible.length) {
    return null;
  }

  const referencePosition = desiredPosition ||
    (Array.isArray(child?.position) ? child.position : null) || [0, 0, 0];

  return (
    eligible.reduce((bestMatch, candidate) => {
      const dx = referencePosition[0] - candidate.position[0];
      const dz = referencePosition[2] - candidate.position[2];
      const distance = dx * dx + dz * dz;

      if (!bestMatch || distance < bestMatch.distance) {
        return {
          distance,
          item: candidate,
        };
      }

      return bestMatch;
    }, null)?.item || null
  );
};

const resolvePlacementTargetAnchor = (
  child,
  anchors,
  roomDimensions = null,
  desiredPosition = null,
) => {
  const { targetId } = getItemPlacementConfig(child);

  if (targetId) {
    const matchedAnchor = anchors.find(
      (anchor) => normalizeLinkId(anchor.id) === targetId,
    );

    if (matchedAnchor && canPlaceOnTop(child, matchedAnchor, roomDimensions)) {
      return matchedAnchor;
    }
  }

  return findNearestSupport(child, anchors, roomDimensions, desiredPosition);
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
  const position = normalizeViewerLayoutPosition(
    positionSource,
    getMeasurementUnit(source || product, "m"),
  );
  const placement = getItemPlacementConfig(source || product);
  const canSupportItems =
    typeof source?.canSupportItems === "boolean"
      ? source.canSupportItems
      : undefined;
  const supportSurface = normalizeSupportSurface(
    source?.supportSurface || source?.support_surface,
  );

  if (!position && !(placement.mode === "on_top_of" && placement.targetId)) {
    return null;
  }

  return {
    position,
    rotation: normalizeViewerLayoutRotation(
      source?.rotation ?? product?.rotation,
    ),
    modelUrl: source?.modelUrl || product?.modelUrl || "",
    score: source?.score ?? product?.layoutScore,
    placement,
    canSupportItems,
    supportSurface: supportSurface || undefined,
  };
};

const getSurfaceAnchorItems = (items, excludedId = null) =>
  items.filter(
    (item) =>
      String(item.id) !== String(excludedId) && getCanSupportItems(item),
  );

const getEligibleAnchorsForAccessory = (item, anchors, roomDimensions = null) =>
  anchors.filter((anchor) => canPlaceOnTop(item, anchor, roomDimensions));

const getManualAccessorySurfaceY = (
  item,
  anchor,
  roomDimensions = null,
  accessoryIndex = 0,
) => {
  const dimensions = getItemDimensions(anchor, roomDimensions);
  const surfaceGap = item.type === "textile" ? 0.018 : 0.03;
  const positionY = anchor.position[1] || 0;
  const supportSurface = getItemSupportSurface(anchor);

  if (supportSurface === "shelf") {
    const levels = getSupportSurfaceLevels(anchor, item, accessoryIndex);
    const ratio = levels[accessoryIndex % levels.length] ?? levels[0] ?? 1;
    return positionY + dimensions.height * ratio + surfaceGap;
  }

  return positionY + getSupportTopHeight(anchor, dimensions) + surfaceGap;
};

const getAccessorySurfaceSnapPlacement = (
  item,
  anchors,
  desiredPosition,
  roomDimensions = null,
) => {
  const eligibleAnchors = getEligibleAnchorsForAccessory(
    item,
    anchors,
    roomDimensions,
  );

  if (!eligibleAnchors.length) return null;

  const preferredAnchor = resolvePlacementTargetAnchor(
    item,
    eligibleAnchors,
    roomDimensions,
    desiredPosition,
  );
  const candidateAnchors = preferredAnchor
    ? [preferredAnchor]
    : eligibleAnchors;
  const itemDimensions = getItemDimensions(item, roomDimensions);
  let bestMatch = null;

  candidateAnchors.forEach((anchor) => {
    const dimensions = getItemDimensions(anchor, roomDimensions);
    const rotation = anchor.rotation || 0;
    const dx = desiredPosition[0] - anchor.position[0];
    const dz = desiredPosition[2] - anchor.position[2];
    const localX = dx * Math.cos(rotation) + dz * Math.sin(rotation);
    const localZ = -dx * Math.sin(rotation) + dz * Math.cos(rotation);
    const maxX = Math.max(
      0,
      dimensions.width / 2 - itemDimensions.width / 2 - 0.04,
    );
    const maxZ = Math.max(
      0,
      dimensions.depth / 2 - itemDimensions.depth / 2 - 0.04,
    );
    const reachX = maxX + 0.22;
    const reachZ = maxZ + 0.22;

    if (Math.abs(localX) > reachX || Math.abs(localZ) > reachZ) {
      return;
    }

    const clampedLocalX = clamp(localX, -maxX, maxX);
    const clampedLocalZ = clamp(localZ, -maxZ, maxZ);
    const worldX =
      anchor.position[0] +
      clampedLocalX * Math.cos(rotation) -
      clampedLocalZ * Math.sin(rotation);
    const worldZ =
      anchor.position[2] +
      clampedLocalX * Math.sin(rotation) +
      clampedLocalZ * Math.cos(rotation);
    const distanceScore =
      Math.abs(localX - clampedLocalX) + Math.abs(localZ - clampedLocalZ);

    if (!bestMatch || distanceScore < bestMatch.distanceScore) {
      bestMatch = {
        distanceScore,
        position: [
          worldX,
          getManualAccessorySurfaceY(item, anchor, roomDimensions),
          worldZ,
        ],
      };
    }
  });

  return bestMatch?.position || null;
};

const getSurfacePlacementForAccessory = (
  item,
  anchors,
  accessoryIndex,
  roomDimensions = null,
) => {
  const eligibleAnchors = getEligibleAnchorsForAccessory(
    item,
    anchors,
    roomDimensions,
  );

  if (!eligibleAnchors.length) return null;

  const desiredPosition = Array.isArray(item?.position) ? item.position : null;
  const anchor =
    resolvePlacementTargetAnchor(
      item,
      eligibleAnchors,
      roomDimensions,
      desiredPosition,
    ) || eligibleAnchors[accessoryIndex % eligibleAnchors.length];
  const shouldPreserveItemRotation =
    Boolean(item?.hasAiPlacement) ||
    Boolean(getItemPlacementConfig(item).targetId);

  if (desiredPosition) {
    const snappedPosition = getAccessorySurfaceSnapPlacement(
      item,
      [anchor],
      desiredPosition,
      roomDimensions,
    );

    if (snappedPosition) {
      return {
        position: snappedPosition,
        rotation: shouldPreserveItemRotation
          ? (item.rotation ?? anchor.rotation ?? 0)
          : anchor.rotation + (item.type === "tray" ? 0.14 : 0.08),
        targetId: anchor.id,
      };
    }
  }

  const dimensions = getItemDimensions(anchor, roomDimensions);
  const rotation = anchor.rotation || 0;
  const offsetPatterns =
    item.type === "tray"
      ? [
          [0, 0],
          [0.16, -0.08],
          [-0.16, 0.08],
        ]
      : item.type === "lamp" && item.lampVariant === "table"
        ? [
            [0, 0],
            [0.12, -0.08],
            [-0.12, 0.08],
          ]
        : item.type === "plant" && item.plantVariant === "table"
          ? [
              [0, 0],
              [0.1, -0.06],
              [-0.1, 0.06],
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
  const positionY = getManualAccessorySurfaceY(
    item,
    anchor,
    roomDimensions,
    accessoryIndex,
  );

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
    targetId: anchor.id,
  };
};

const getInitialManualPlacementForItem = (
  item,
  currentSceneItems,
  manualIndex,
  roomDimensions = null,
) => {
  const fallbackPlacement = getManualPreviewPlacement(manualIndex);

  if (!isSurfaceAccessoryItem(item)) {
    return fallbackPlacement;
  }

  const accessoryIndex = currentSceneItems.filter(
    (sceneItem) =>
      String(sceneItem.id) !== String(item.id) &&
      sceneItem.type === item.type &&
      isSurfaceAccessoryItem(sceneItem),
  ).length;
  const surfacePlacement = getSurfacePlacementForAccessory(
    item,
    getSurfaceAnchorItems(currentSceneItems, item.id),
    accessoryIndex,
    roomDimensions,
  );

  return surfacePlacement || fallbackPlacement;
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

function Room({ dimensions, palette }) {
  const room = getRoomMetrics(dimensions);
  const width = room.width;
  const length = room.length;
  const height = room.height;
  const floorPlanks = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        z: -length / 2 + (length / 12) * (index + 0.5),
        color: index % 2 === 0 ? palette.floor : palette.floorAlt,
      })),
    [length, palette.floor, palette.floorAlt],
  );

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    console.log("[AI Viewer][RoomScale]", {
      input: dimensions,
      renderedMeters: { width, length, height },
    });
  }, [dimensions, height, length, width]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={palette.floor} roughness={0.86} />
      </mesh>

      {floorPlanks.map((plank, index) => (
        <mesh
          key={`floor-plank-${index}`}
          position={[0, 0.004 + index * 0.0001, plank.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[width, length / 12]} />
          <meshStandardMaterial
            color={plank.color}
            opacity={0.82}
            roughness={0.88}
            transparent
          />
        </mesh>
      ))}

      <mesh position={[0, height / 2, -length / 2]} receiveShadow>
        <boxGeometry args={[width, height, 0.08]} />
        <meshStandardMaterial color={palette.backWall} roughness={0.94} />
      </mesh>

      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.08, height, length]} />
        <meshStandardMaterial color={palette.sideWall} roughness={0.94} />
      </mesh>

      <mesh
        position={[0, height - 0.02, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={palette.ceiling} roughness={0.95} />
      </mesh>

      <mesh position={[0, 0.05, -length / 2 + 0.03]} receiveShadow>
        <boxGeometry args={[width, 0.1, 0.04]} />
        <meshStandardMaterial color={palette.trim} roughness={0.82} />
      </mesh>

      <mesh position={[-width / 2 + 0.03, 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.04, 0.1, length]} />
        <meshStandardMaterial color={palette.trim} roughness={0.82} />
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
  onRotateItem,
  onSelect,
  roomDimensions,
}) {
  const groupRef = useRef(null);
  const lastDebugSignatureRef = useRef("");
  const [hovered, setHovered] = useState(false);
  const dragPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), []);
  const dragIntersection = useMemo(() => new Vector3(), []);
  const dragOffsetRef = useRef(new Vector3());
  const draggedRef = useRef(false);
  const interactionModeRef = useRef(null);
  const rotatePointerXRef = useRef(0);
  const active = selected || hovered;
  const room = useMemo(() => getRoomMetrics(roomDimensions), [roomDimensions]);
  const dimensions = useMemo(
    () => getItemDimensions(item, roomDimensions),
    [item, roomDimensions],
  );
  const highlightRadius = Math.max(
    0.48,
    Math.max(dimensions.width, dimensions.depth) * 0.58,
  );
  const baseColor = item.color;
  const woodColor = "#7b583e";
  const darkWoodColor = "#4d3727";
  const softAccent = "#f6efe6";
  const metalColor = "#e5dacc";
  const plantPotColor = "#8f5e3f";
  const storageVariant = item.storageVariant || "wardrobe";
  const boxVariant = item.boxVariant || "handledBin";
  const chairVariant = item.chairVariant || "dining";
  const lampVariant = item.lampVariant || "floor";
  const plantVariant = item.plantVariant || "floor";
  const tableVariant = item.tableVariant || "rect";
  const normalizedSource = sourceTextOf(item);
  const labelHeight =
    item.type === "lamp" && lampVariant === "ceiling"
      ? Math.max(room.height - dimensions.height * 0.28, 1.35)
      : Math.min(1.9, dimensions.height + 0.5);
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

  useLayoutEffect(() => {
    if (!import.meta.env.DEV || !groupRef.current) return;

    const signature = [
      item.id,
      item.name,
      item.type,
      item.rotation || 0,
      dimensions.width,
      dimensions.height,
      dimensions.depth,
      storageVariant,
      boxVariant,
      chairVariant,
      lampVariant,
      tableVariant,
      plantVariant,
      textileVariant,
      componentVariant,
      mirrorVariant,
    ].join("|");

    if (lastDebugSignatureRef.current === signature) return;
    lastDebugSignatureRef.current = signature;

    const measurementRoot = groupRef.current.clone(true);
    measurementRoot.position.set(0, 0, 0);
    measurementRoot.rotation.set(0, 0, 0);
    measurementRoot.updateWorldMatrix(true, true);

    const box = new Box3().setFromObject(measurementRoot);
    const size = new Vector3();
    box.getSize(size);

    console.table([
      {
        name: item.name,
        widthM: formatMeasureValue(dimensions.width),
        depthM: formatMeasureValue(dimensions.depth),
        heightM: formatMeasureValue(dimensions.height),
        rotationY: formatMeasureValue(item.rotation || 0),
      },
    ]);

    console.log("[AI Viewer][ModelScale]", {
      id: item.id,
      name: item.name,
      type: item.type,
      modelUrl: item.modelUrl || null,
      rotationY: item.rotation || 0,
      expectedMeters: dimensions,
      renderedMeters: {
        width: Number(size.x.toFixed(3)),
        height: Number(size.y.toFixed(3)),
        depth: Number(size.z.toFixed(3)),
      },
    });
  }, [
    boxVariant,
    chairVariant,
    componentVariant,
    dimensions,
    item.id,
    item.modelUrl,
    item.name,
    item.rotation,
    item.type,
    lampVariant,
    mirrorVariant,
    plantVariant,
    storageVariant,
    tableVariant,
    textileVariant,
  ]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const baseY = Array.isArray(item.position) ? item.position[1] || 0 : 0;
    const hoverY =
      active &&
      !interactionModeRef.current &&
      !(item.type === "lamp" && lampVariant === "ceiling")
        ? Math.sin(state.clock.elapsedTime * 2.4) * 0.018
        : 0;
    const targetY = baseY + hoverY;

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
        const pointerButton = event.button ?? event.nativeEvent?.button ?? 0;

        if (pointerButton !== 0 && pointerButton !== 2) return;

        event.stopPropagation();
        onSelect(item);

        if (pointerButton === 2) {
          draggedRef.current = true;
          interactionModeRef.current = "rotate";
          rotatePointerXRef.current = event.clientX;
          onDragStateChange?.(item.id);
          event.target.setPointerCapture?.(event.pointerId);
          return;
        }

        if (!event.ray.intersectPlane(dragPlane, dragIntersection)) return;

        draggedRef.current = true;
        interactionModeRef.current = "move";
        dragOffsetRef.current.set(
          dragIntersection.x - item.position[0],
          0,
          dragIntersection.z - item.position[2],
        );
        onDragStateChange?.(item.id);
        event.target.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!draggedRef.current) return;

        event.stopPropagation();

        if (interactionModeRef.current === "rotate") {
          const pointerDeltaX = event.clientX - rotatePointerXRef.current;

          if (pointerDeltaX === 0) return;

          rotatePointerXRef.current = event.clientX;
          onRotateItem?.(item.id, pointerDeltaX * 0.01);
          return;
        }

        if (!event.ray.intersectPlane(dragPlane, dragIntersection)) return;

        const baseY = Array.isArray(item.position) ? item.position[1] || 0 : 0;
        const clampedPosition = clampItemPositionToRoom(
          [
            dragIntersection.x - dragOffsetRef.current.x,
            baseY,
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
        interactionModeRef.current = null;
        onDragStateChange?.(null);
        event.target.releasePointerCapture?.(event.pointerId);
      }}
      onPointerCancel={(event) => {
        if (!draggedRef.current) return;

        draggedRef.current = false;
        interactionModeRef.current = null;
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
          {chairVariant === "armchair" ? (
            <>
              <RoundedBox
                castShadow
                args={[dimensions.width * 0.84, 0.18, dimensions.depth * 0.72]}
                radius={0.08}
                position={[0, 0.28, 0.04]}
              >
                <ModelMaterial color={baseColor} roughness={0.56} />
              </RoundedBox>
              <RoundedBox
                castShadow
                args={[dimensions.width * 0.8, dimensions.height * 0.46, 0.16]}
                radius={0.08}
                position={[
                  0,
                  dimensions.height * 0.58,
                  -dimensions.depth * 0.24,
                ]}
              >
                <ModelMaterial color={baseColor} roughness={0.58} />
              </RoundedBox>
              {[-1, 1].map((x, index) => (
                <RoundedBox
                  castShadow
                  key={`chair-arm-${index}`}
                  args={[
                    0.12,
                    dimensions.height * 0.28,
                    dimensions.depth * 0.62,
                  ]}
                  radius={0.06}
                  position={[x * (dimensions.width * 0.38), 0.38, 0.02]}
                >
                  <ModelMaterial color={baseColor} roughness={0.6} />
                </RoundedBox>
              ))}
              <RoundedBox
                castShadow
                args={[dimensions.width * 0.62, 0.12, dimensions.depth * 0.48]}
                radius={0.06}
                position={[0, 0.36, 0.05]}
              >
                <ModelMaterial color={softAccent} roughness={0.78} />
              </RoundedBox>
              {[
                [-1, -1],
                [1, -1],
                [-1, 1],
                [1, 1],
              ].map(([x, z], index) => (
                <mesh
                  castShadow
                  key={`chair-armchair-leg-${index}`}
                  position={[
                    x * (dimensions.width * 0.28),
                    0.1,
                    z * (dimensions.depth * 0.22),
                  ]}
                >
                  <cylinderGeometry args={[0.035, 0.045, 0.2, 18]} />
                  <ModelMaterial color={darkWoodColor} roughness={0.72} />
                </mesh>
              ))}
            </>
          ) : chairVariant === "swivel" ? (
            <>
              <RoundedBox
                castShadow
                args={[dimensions.width * 0.78, 0.16, dimensions.depth * 0.66]}
                radius={0.08}
                position={[0, 0.34, 0.04]}
              >
                <ModelMaterial color={baseColor} roughness={0.54} />
              </RoundedBox>
              <RoundedBox
                castShadow
                args={[dimensions.width * 0.72, dimensions.height * 0.44, 0.14]}
                radius={0.08}
                position={[
                  0,
                  dimensions.height * 0.62,
                  -dimensions.depth * 0.2,
                ]}
              >
                <ModelMaterial color={baseColor} roughness={0.56} />
              </RoundedBox>
              {[-1, 1].map((x, index) => (
                <RoundedBox
                  castShadow
                  key={`chair-swivel-arm-${index}`}
                  args={[
                    0.11,
                    dimensions.height * 0.22,
                    dimensions.depth * 0.52,
                  ]}
                  radius={0.06}
                  position={[x * (dimensions.width * 0.33), 0.42, 0.04]}
                >
                  <ModelMaterial color={baseColor} roughness={0.58} />
                </RoundedBox>
              ))}
              <RoundedBox
                castShadow
                args={[dimensions.width * 0.54, 0.11, dimensions.depth * 0.42]}
                radius={0.06}
                position={[0, 0.42, 0.04]}
              >
                <ModelMaterial color={softAccent} roughness={0.76} />
              </RoundedBox>
              <mesh castShadow position={[0, 0.21, 0]}>
                <cylinderGeometry args={[0.03, 0.04, 0.36, 18]} />
                <ModelMaterial
                  color="#737a83"
                  roughness={0.34}
                  metalness={0.24}
                />
              </mesh>
              <mesh castShadow position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.05, 0.06, 0.08, 18]} />
                <ModelMaterial
                  color="#656c74"
                  roughness={0.38}
                  metalness={0.22}
                />
              </mesh>
              {[0, 1, 2, 3].map((index) => {
                const angle = (Math.PI * 2 * index) / 4 + Math.PI / 4;
                const radial = dimensions.width * 0.26;

                return (
                  <group key={`chair-swivel-base-${index}`}>
                    <mesh
                      castShadow
                      position={[
                        Math.cos(angle) * radial * 0.45,
                        0.045,
                        Math.sin(angle) * radial * 0.45,
                      ]}
                      rotation={[0, -angle, 0]}
                    >
                      <boxGeometry args={[radial, 0.025, 0.04]} />
                      <ModelMaterial
                        color="#656c74"
                        roughness={0.38}
                        metalness={0.22}
                      />
                    </mesh>
                    <mesh
                      castShadow
                      position={[
                        Math.cos(angle) * radial,
                        0.03,
                        Math.sin(angle) * radial,
                      ]}
                    >
                      <cylinderGeometry args={[0.022, 0.024, 0.04, 14]} />
                      <ModelMaterial color="#3c4147" roughness={0.44} />
                    </mesh>
                  </group>
                );
              })}
            </>
          ) : chairVariant === "office" ? (
            <>
              <RoundedBox
                castShadow
                args={[dimensions.width * 0.84, 0.12, dimensions.depth * 0.8]}
                radius={0.06}
                position={[0, 0.48, 0.02]}
              >
                <ModelMaterial color={baseColor} roughness={0.48} />
              </RoundedBox>
              <RoundedBox
                castShadow
                args={[dimensions.width * 0.76, dimensions.height * 0.5, 0.12]}
                radius={0.06}
                position={[
                  0,
                  dimensions.height * 0.7,
                  -dimensions.depth * 0.24,
                ]}
              >
                <ModelMaterial color={baseColor} roughness={0.5} />
              </RoundedBox>
              {[-1, 1].map((x, index) => (
                <group
                  key={`chair-office-arm-${index}`}
                  position={[x * (dimensions.width * 0.32), 0.5, 0.02]}
                >
                  <mesh castShadow rotation={[0, 0, x * -0.18]}>
                    <cylinderGeometry args={[0.018, 0.02, 0.24, 14]} />
                    <ModelMaterial
                      color="#6c737c"
                      roughness={0.34}
                      metalness={0.28}
                    />
                  </mesh>
                  <mesh castShadow position={[0, 0.12, 0]}>
                    <boxGeometry args={[0.14, 0.03, 0.16]} />
                    <ModelMaterial color="#3c4147" roughness={0.42} />
                  </mesh>
                </group>
              ))}
              <mesh castShadow position={[0, 0.24, 0]}>
                <cylinderGeometry args={[0.03, 0.036, 0.48, 18]} />
                <ModelMaterial
                  color="#737a83"
                  roughness={0.34}
                  metalness={0.26}
                />
              </mesh>
              <mesh castShadow position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.05, 0.06, 0.1, 18]} />
                <ModelMaterial
                  color="#656c74"
                  roughness={0.38}
                  metalness={0.22}
                />
              </mesh>
              {[0, 1, 2, 3, 4].map((index) => {
                const angle = (Math.PI * 2 * index) / 5;
                const radial = dimensions.width * 0.22;
                return (
                  <group key={`chair-office-base-${index}`}>
                    <mesh
                      castShadow
                      position={[
                        Math.cos(angle) * radial * 0.5,
                        0.05,
                        Math.sin(angle) * radial * 0.5,
                      ]}
                      rotation={[0, -angle, 0]}
                    >
                      <boxGeometry args={[radial, 0.025, 0.04]} />
                      <ModelMaterial
                        color="#656c74"
                        roughness={0.38}
                        metalness={0.22}
                      />
                    </mesh>
                    <mesh
                      castShadow
                      position={[
                        Math.cos(angle) * radial,
                        0.03,
                        Math.sin(angle) * radial,
                      ]}
                    >
                      <cylinderGeometry args={[0.03, 0.028, 0.05, 14]} />
                      <ModelMaterial color="#3c4147" roughness={0.44} />
                    </mesh>
                  </group>
                );
              })}
            </>
          ) : chairVariant === "stool" ? (
            <>
              <mesh castShadow position={[0, dimensions.height * 0.66, 0]}>
                <cylinderGeometry
                  args={[
                    dimensions.width * 0.34,
                    dimensions.width * 0.38,
                    0.08,
                    24,
                  ]}
                />
                <ModelMaterial color={baseColor} roughness={0.52} />
              </mesh>
              {[
                [-1, -1],
                [1, -1],
                [-1, 1],
                [1, 1],
              ].map(([x, z], index) => (
                <mesh
                  castShadow
                  key={`chair-stool-leg-${index}`}
                  position={[
                    x * (dimensions.width * 0.2),
                    dimensions.height * 0.3,
                    z * (dimensions.depth * 0.2),
                  ]}
                  rotation={[z * 0.04, 0, x * -0.04]}
                >
                  <cylinderGeometry
                    args={[0.025, 0.03, dimensions.height * 0.6, 16]}
                  />
                  <ModelMaterial color={woodColor} roughness={0.72} />
                </mesh>
              ))}
              <mesh castShadow position={[0, dimensions.height * 0.36, 0]}>
                <torusGeometry
                  args={[dimensions.width * 0.22, 0.018, 12, 28]}
                />
                <ModelMaterial
                  color={darkWoodColor}
                  roughness={0.56}
                  metalness={0.08}
                />
              </mesh>
            </>
          ) : (
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
          {tableVariant === "oval" ? (
            <>
              <mesh
                castShadow
                position={[0, dimensions.height - 0.035, 0]}
                scale={[1, 1, dimensions.depth / dimensions.width]}
              >
                <cylinderGeometry
                  args={[dimensions.width / 2, dimensions.width / 2, 0.07, 52]}
                />
                <ModelMaterial color={baseColor} roughness={0.4} />
              </mesh>
              <mesh
                castShadow
                position={[0, dimensions.height - 0.08, 0]}
                scale={[1, 1, dimensions.depth / dimensions.width]}
              >
                <cylinderGeometry
                  args={[
                    dimensions.width * 0.36,
                    dimensions.width * 0.4,
                    0.04,
                    44,
                  ]}
                />
                <ModelMaterial color={softAccent} roughness={0.56} />
              </mesh>
              {(dimensions.width >= 1
                ? [-dimensions.width * 0.18, dimensions.width * 0.18]
                : [0]
              ).map((x, index) => (
                <group key={`table-oval-base-${index}`} position={[x, 0, 0]}>
                  <mesh
                    castShadow
                    position={[
                      0,
                      Math.max(dimensions.height / 2 - 0.03, 0.16),
                      0,
                    ]}
                  >
                    <cylinderGeometry
                      args={[
                        0.05,
                        0.07,
                        Math.max(dimensions.height - 0.14, 0.24),
                        22,
                      ]}
                    />
                    <ModelMaterial color={darkWoodColor} roughness={0.68} />
                  </mesh>
                  <mesh castShadow position={[0, 0.05, 0]} scale={[1, 1, 0.76]}>
                    <cylinderGeometry
                      args={[
                        dimensions.width * 0.1,
                        dimensions.width * 0.14,
                        0.05,
                        28,
                      ]}
                    />
                    <ModelMaterial color={darkWoodColor} roughness={0.66} />
                  </mesh>
                </group>
              ))}
            </>
          ) : tableVariant === "desk" ? (
            <>
              <mesh castShadow position={[0, dimensions.height - 0.03, 0]}>
                <boxGeometry
                  args={[dimensions.width, 0.06, dimensions.depth]}
                />
                <ModelMaterial color={baseColor} roughness={0.42} />
              </mesh>
              <mesh
                castShadow
                position={[
                  -dimensions.width * 0.25,
                  Math.max(dimensions.height * 0.42, 0.22),
                  0,
                ]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 0.3,
                    Math.max(dimensions.height - 0.08, 0.42),
                    dimensions.depth * 0.78,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.66} />
              </mesh>
              {[0.18, -0.02].map((_, index) => (
                <mesh
                  castShadow
                  key={`desk-drawer-${index}`}
                  position={[
                    -dimensions.width * 0.25,
                    Math.max(dimensions.height * (0.62 - index * 0.14), 0.22),
                    dimensions.depth * 0.4,
                  ]}
                >
                  <boxGeometry args={[dimensions.width * 0.24, 0.05, 0.03]} />
                  <ModelMaterial color={softAccent} roughness={0.48} />
                </mesh>
              ))}
              <mesh
                castShadow
                position={[
                  dimensions.width * 0.3,
                  Math.max(dimensions.height * 0.42, 0.22),
                  -dimensions.depth * 0.3,
                ]}
              >
                <boxGeometry
                  args={[0.08, Math.max(dimensions.height - 0.08, 0.42), 0.08]}
                />
                <ModelMaterial color={woodColor} roughness={0.68} />
              </mesh>
              <mesh
                castShadow
                position={[
                  dimensions.width * 0.3,
                  Math.max(dimensions.height * 0.42, 0.22),
                  dimensions.depth * 0.3,
                ]}
              >
                <boxGeometry
                  args={[0.08, Math.max(dimensions.height - 0.08, 0.42), 0.08]}
                />
                <ModelMaterial color={woodColor} roughness={0.68} />
              </mesh>
              <mesh
                castShadow
                position={[
                  0.02,
                  Math.max(dimensions.height * 0.38, 0.24),
                  -dimensions.depth * 0.38,
                ]}
              >
                <boxGeometry args={[dimensions.width * 0.74, 0.12, 0.03]} />
                <ModelMaterial color={darkWoodColor} roughness={0.6} />
              </mesh>
            </>
          ) : tableVariant === "console" ? (
            <>
              <mesh castShadow position={[0, dimensions.height - 0.03, 0]}>
                <boxGeometry
                  args={[dimensions.width, 0.06, dimensions.depth]}
                />
                <ModelMaterial color={baseColor} roughness={0.42} />
              </mesh>
              {[
                [-1, -1],
                [1, -1],
                [-1, 1],
                [1, 1],
              ].map(([x, z], index) => (
                <mesh
                  castShadow
                  key={`console-leg-${index}`}
                  position={[
                    x * (dimensions.width / 2 - 0.06),
                    Math.max(dimensions.height / 2 - 0.03, 0.2),
                    z * (dimensions.depth / 2 - 0.05),
                  ]}
                >
                  <boxGeometry
                    args={[0.05, Math.max(dimensions.height - 0.08, 0.4), 0.05]}
                  />
                  <ModelMaterial color={darkWoodColor} roughness={0.68} />
                </mesh>
              ))}
              {[-1, 1].map((x, index) => (
                <mesh
                  castShadow
                  key={`console-cross-${index}`}
                  position={[
                    0,
                    Math.max(dimensions.height * 0.36, 0.24),
                    x * (dimensions.depth * 0.16),
                  ]}
                  rotation={[0, 0, x * 0.52]}
                >
                  <boxGeometry args={[dimensions.width * 0.82, 0.03, 0.03]} />
                  <ModelMaterial color={softAccent} roughness={0.52} />
                </mesh>
              ))}
              <mesh castShadow position={[0, 0.1, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.84,
                    0.04,
                    dimensions.depth * 0.36,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.62} />
              </mesh>
            </>
          ) : tableVariant === "coffee" ? (
            <>
              <RoundedBox
                castShadow
                args={[dimensions.width, 0.09, dimensions.depth]}
                radius={0.05}
                position={[0, dimensions.height - 0.045, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.44} />
              </RoundedBox>
              <mesh
                castShadow
                position={[0, Math.max(dimensions.height * 0.28, 0.12), 0]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 0.34,
                    Math.max(dimensions.height * 0.52, 0.18),
                    dimensions.depth * 0.34,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.66} />
              </mesh>
              <mesh castShadow position={[0, 0.06, 0]}>
                <boxGeometry
                  args={[dimensions.width * 0.6, 0.05, dimensions.depth * 0.42]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.64} />
              </mesh>
            </>
          ) : tableVariant === "side" ? (
            <>
              <RoundedBox
                castShadow
                args={[dimensions.width, 0.06, dimensions.depth]}
                radius={0.06}
                position={[0, dimensions.height - 0.03, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.44} />
              </RoundedBox>
              <mesh
                castShadow
                position={[0, Math.max(dimensions.height * 0.45, 0.18), 0]}
              >
                <cylinderGeometry
                  args={[
                    0.045,
                    0.06,
                    Math.max(dimensions.height - 0.12, 0.3),
                    18,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.68} />
              </mesh>
              {[0, 1, 2].map((index) => {
                const angle = (Math.PI * 2 * index) / 3 + Math.PI / 6;

                return (
                  <mesh
                    castShadow
                    key={`side-table-foot-${index}`}
                    position={[
                      Math.cos(angle) * dimensions.width * 0.18,
                      0.06,
                      Math.sin(angle) * dimensions.depth * 0.18,
                    ]}
                    rotation={[0, -angle, 0]}
                  >
                    <boxGeometry
                      args={[dimensions.width * 0.24, 0.025, 0.04]}
                    />
                    <ModelMaterial color={darkWoodColor} roughness={0.66} />
                  </mesh>
                );
              })}
            </>
          ) : tableVariant === "dining" ? (
            <>
              <mesh castShadow position={[0, dimensions.height - 0.035, 0]}>
                <boxGeometry
                  args={[dimensions.width, 0.07, dimensions.depth]}
                />
                <ModelMaterial color={baseColor} roughness={0.4} />
              </mesh>
              {[-1, 1].map((x, index) => (
                <group
                  key={`dining-trestle-${index}`}
                  position={[x * dimensions.width * 0.26, 0, 0]}
                >
                  <mesh
                    castShadow
                    position={[
                      0,
                      Math.max(dimensions.height / 2 - 0.04, 0.18),
                      0,
                    ]}
                  >
                    <boxGeometry
                      args={[
                        0.1,
                        Math.max(dimensions.height - 0.1, 0.34),
                        dimensions.depth * 0.2,
                      ]}
                    />
                    <ModelMaterial color={darkWoodColor} roughness={0.68} />
                  </mesh>
                  <mesh castShadow position={[0, 0.08, 0]}>
                    <boxGeometry
                      args={[
                        dimensions.width * 0.16,
                        0.05,
                        dimensions.depth * 0.48,
                      ]}
                    />
                    <ModelMaterial color={darkWoodColor} roughness={0.64} />
                  </mesh>
                </group>
              ))}
              <mesh
                castShadow
                position={[0, Math.max(dimensions.height * 0.34, 0.24), 0]}
              >
                <boxGeometry args={[dimensions.width * 0.44, 0.05, 0.06]} />
                <ModelMaterial color={softAccent} roughness={0.56} />
              </mesh>
            </>
          ) : tableVariant === "round" ? (
            <>
              <mesh castShadow position={[0, dimensions.height - 0.035, 0]}>
                <cylinderGeometry
                  args={[
                    Math.min(dimensions.width, dimensions.depth) / 2,
                    Math.min(dimensions.width, dimensions.depth) / 2,
                    0.07,
                    52,
                  ]}
                />
                <ModelMaterial color={baseColor} roughness={0.4} />
              </mesh>
              <mesh
                castShadow
                position={[0, Math.max(dimensions.height / 2 - 0.02, 0.17), 0]}
              >
                <cylinderGeometry
                  args={[
                    0.06,
                    0.08,
                    Math.max(dimensions.height - 0.16, 0.26),
                    22,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.68} />
              </mesh>
              <mesh castShadow position={[0, 0.05, 0]}>
                <cylinderGeometry
                  args={[
                    dimensions.width * 0.18,
                    dimensions.width * 0.24,
                    0.05,
                    34,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.66} />
              </mesh>
            </>
          ) : (
            <>
              <mesh castShadow position={[0, dimensions.height - 0.035, 0]}>
                <boxGeometry
                  args={[dimensions.width, 0.07, dimensions.depth]}
                />
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
                    args={[
                      0.08,
                      Math.max(dimensions.height - 0.08, 0.28),
                      0.08,
                    ]}
                  />
                  <ModelMaterial color={darkWoodColor} roughness={0.68} />
                </mesh>
              ))}
              {dimensions.height < 0.56 && (
                <mesh castShadow position={[0, 0.26, 0]}>
                  <boxGeometry
                    args={[
                      dimensions.width * 0.72,
                      0.05,
                      dimensions.depth * 0.54,
                    ]}
                  />
                  <ModelMaterial color={softAccent} roughness={0.54} />
                </mesh>
              )}
            </>
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
          {storageVariant === "nightstand" ? (
            <>
              <mesh castShadow position={[0, 0.03, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.96,
                    0.06,
                    dimensions.depth * 0.94,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.72} />
              </mesh>
              {[-0.32, 0.32].map((x, index) => (
                <mesh
                  castShadow
                  key={`nightstand-leg-${index}`}
                  position={[
                    x * dimensions.width,
                    0.15,
                    -dimensions.depth * 0.26,
                  ]}
                  rotation={[0, 0, x < 0 ? 0.05 : -0.05]}
                >
                  <boxGeometry args={[0.04, 0.3, 0.04]} />
                  <ModelMaterial color={woodColor} roughness={0.68} />
                </mesh>
              ))}
              {[-0.32, 0.32].map((x, index) => (
                <mesh
                  castShadow
                  key={`nightstand-leg-back-${index}`}
                  position={[
                    x * dimensions.width,
                    0.15,
                    dimensions.depth * 0.26,
                  ]}
                  rotation={[0, 0, x < 0 ? 0.05 : -0.05]}
                >
                  <boxGeometry args={[0.04, 0.3, 0.04]} />
                  <ModelMaterial color={woodColor} roughness={0.68} />
                </mesh>
              ))}
              <RoundedBox
                castShadow
                args={[
                  dimensions.width,
                  dimensions.height * 0.7,
                  dimensions.depth,
                ]}
                radius={0.04}
                position={[0, dimensions.height * 0.35 + 0.12, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.5} />
              </RoundedBox>
              {[0.58, 0.28].map((ratio, index) => (
                <group key={`nightstand-drawer-${index}`}>
                  <mesh
                    castShadow
                    position={[
                      0,
                      dimensions.height * ratio,
                      dimensions.depth / 2 + 0.015,
                    ]}
                  >
                    <boxGeometry
                      args={[
                        dimensions.width * 0.9,
                        dimensions.height * 0.22,
                        0.03,
                      ]}
                    />
                    <ModelMaterial color={baseColor} roughness={0.44} />
                  </mesh>
                  <mesh
                    castShadow
                    position={[
                      0,
                      dimensions.height * ratio,
                      dimensions.depth / 2 + 0.038,
                    ]}
                  >
                    <boxGeometry args={[dimensions.width * 0.18, 0.03, 0.02]} />
                    <ModelMaterial
                      color={metalColor}
                      roughness={0.34}
                      metalness={0.22}
                    />
                  </mesh>
                </group>
              ))}
              <mesh
                castShadow
                position={[0, dimensions.height * 0.8 + 0.13, 0]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 1.02,
                    0.05,
                    dimensions.depth * 1.02,
                  ]}
                />
                <ModelMaterial color={darkWoodColor} roughness={0.62} />
              </mesh>
            </>
          ) : storageVariant === "tvStand" ? (
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
          ) : storageVariant === "sideboard" ? (
            <>
              <mesh castShadow position={[0, 0.04, 0]}>
                <boxGeometry
                  args={[
                    dimensions.width * 0.98,
                    0.08,
                    dimensions.depth * 0.98,
                  ]}
                />
                <ModelMaterial
                  color="#c8a867"
                  roughness={0.32}
                  metalness={0.22}
                />
              </mesh>
              <RoundedBox
                castShadow
                args={[
                  dimensions.width,
                  dimensions.height * 0.76,
                  dimensions.depth,
                ]}
                radius={0.04}
                position={[0, dimensions.height * 0.38 + 0.08, 0]}
              >
                <ModelMaterial color={baseColor} roughness={0.48} />
              </RoundedBox>
              <mesh
                castShadow
                position={[0, dimensions.height * 0.78 + 0.12, 0]}
              >
                <boxGeometry
                  args={[
                    dimensions.width * 1.02,
                    0.06,
                    dimensions.depth * 1.02,
                  ]}
                />
                <ModelMaterial color={softAccent} roughness={0.42} />
              </mesh>
              {[-0.36, -0.12, 0.12, 0.36].map((x, index) => (
                <group key={`sideboard-door-${index}`}>
                  <mesh
                    castShadow
                    position={[
                      x * dimensions.width,
                      dimensions.height * 0.38 + 0.08,
                      dimensions.depth / 2 + 0.016,
                    ]}
                  >
                    <boxGeometry
                      args={[
                        dimensions.width * 0.21,
                        dimensions.height * 0.58,
                        0.03,
                      ]}
                    />
                    <ModelMaterial color={baseColor} roughness={0.42} />
                  </mesh>
                  <mesh
                    castShadow
                    position={[
                      x * dimensions.width,
                      dimensions.height * 0.38 + 0.08,
                      dimensions.depth / 2 + 0.038,
                    ]}
                  >
                    <boxGeometry
                      args={[0.018, dimensions.height * 0.22, 0.02]}
                    />
                    <ModelMaterial
                      color={metalColor}
                      roughness={0.28}
                      metalness={0.24}
                    />
                  </mesh>
                </group>
              ))}
              {[-0.24, 0, 0.24].map((x, index) => (
                <mesh
                  castShadow
                  key={`sideboard-trim-${index}`}
                  position={[
                    x * dimensions.width,
                    dimensions.height * 0.38 + 0.08,
                    dimensions.depth / 2 + 0.034,
                  ]}
                >
                  <boxGeometry
                    args={[0.014, dimensions.height * 0.62, 0.018]}
                  />
                  <ModelMaterial
                    color="#c8a867"
                    roughness={0.32}
                    metalness={0.22}
                  />
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
          {lampVariant === "table" ? (
            <>
              <mesh castShadow position={[0, 0.025, 0]}>
                <cylinderGeometry
                  args={[
                    dimensions.width * 0.24,
                    dimensions.width * 0.3,
                    0.05,
                    24,
                  ]}
                />
                <ModelMaterial
                  color={metalColor}
                  roughness={0.42}
                  metalness={0.24}
                />
              </mesh>
              <mesh castShadow position={[0, dimensions.height * 0.28, 0]}>
                <cylinderGeometry
                  args={[0.02, 0.024, dimensions.height * 0.46, 18]}
                />
                <ModelMaterial
                  color="#30323a"
                  roughness={0.28}
                  metalness={0.24}
                />
              </mesh>
              <mesh castShadow position={[0, dimensions.height * 0.63, 0]}>
                <sphereGeometry args={[dimensions.width * 0.11, 20, 20]} />
                <ModelMaterial
                  color={metalColor}
                  roughness={0.3}
                  metalness={0.22}
                />
              </mesh>
              <mesh castShadow position={[0, dimensions.height * 0.77, 0]}>
                <coneGeometry
                  args={[dimensions.width * 0.44, dimensions.height * 0.32, 28]}
                />
                <ModelMaterial color={softAccent} roughness={0.5} />
              </mesh>
              <pointLight
                color="#fff1c2"
                distance={2.8}
                intensity={active ? 1.05 : 0.62}
                position={[0, dimensions.height * 0.7, 0]}
              />
            </>
          ) : lampVariant === "ceiling" ? (
            <>
              <mesh castShadow position={[0, room.height - 0.03, 0]}>
                <cylinderGeometry
                  args={[
                    dimensions.width * 0.12,
                    dimensions.width * 0.16,
                    0.06,
                    24,
                  ]}
                />
                <ModelMaterial
                  color={metalColor}
                  roughness={0.32}
                  metalness={0.26}
                />
              </mesh>
              <mesh
                castShadow
                position={[0, room.height - dimensions.height * 0.34, 0]}
              >
                <cylinderGeometry
                  args={[
                    0.016,
                    0.02,
                    Math.max(dimensions.height * 0.7, 0.18),
                    18,
                  ]}
                />
                <ModelMaterial
                  color="#30323a"
                  roughness={0.28}
                  metalness={0.24}
                />
              </mesh>
              <mesh
                castShadow
                position={[0, room.height - dimensions.height * 0.72, 0]}
              >
                <cylinderGeometry
                  args={[
                    dimensions.width * 0.28,
                    dimensions.width * 0.34,
                    dimensions.height * 0.16,
                    28,
                  ]}
                />
                <ModelMaterial
                  color="#c8a867"
                  roughness={0.3}
                  metalness={0.24}
                />
              </mesh>
              <mesh
                castShadow
                position={[0, room.height - dimensions.height * 0.82, 0]}
              >
                <sphereGeometry args={[dimensions.width * 0.3, 24, 24]} />
                <ModelMaterial color={softAccent} roughness={0.44} />
              </mesh>
              <pointLight
                color="#fff1c2"
                distance={4.8}
                intensity={active ? 1.22 : 0.8}
                position={[0, room.height - dimensions.height * 0.88, 0]}
              />
            </>
          ) : (
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
                <ModelMaterial
                  color="#30323a"
                  roughness={0.28}
                  metalness={0.24}
                />
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
  onRotateItem,
  resetToken,
  roomDimensions,
  roomPalette,
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
        skyColor={roomPalette.skyLight}
        groundColor={roomPalette.groundLight}
        intensity={0.34}
      />
      <ambientLight color={roomPalette.ambientLight} intensity={0.48} />
      <directionalLight
        castShadow
        color={roomPalette.sunlight}
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
      <Room dimensions={roomDimensions} palette={roomPalette} />
      <Grid
        args={[8, 8]}
        cellColor={roomPalette.gridCell}
        cellSize={0.5}
        fadeDistance={9}
        fadeStrength={1}
        position={[0, 0.012, 0]}
        sectionColor={roomPalette.gridSection}
        sectionSize={1}
      />
      {items.map((item) => (
        <FurnitureModel
          item={item}
          key={item.id}
          onDragStateChange={onDragStateChange}
          onMoveItem={onMoveItem}
          onRotateItem={onRotateItem}
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
  const latestViewerEditsRef = useRef(createEmptyViewerEdits());
  const [draggingId, setDraggingId] = useState(null);
  const savedViewerState = useMemo(
    () => normalizeViewerStatePayload(getSavedAiViewerState()),
    [],
  );
  const initialViewerEdits = useMemo(
    () =>
      location.state?.aiResults
        ? createEmptyViewerEdits()
        : cloneViewerEdits(savedViewerState.viewerEdits),
    [location.state?.aiResults, savedViewerState.viewerEdits],
  );
  const [manualSceneEntries, setManualSceneEntries] = useState(
    initialViewerEdits.manualSceneEntries,
  );
  const [manualPositions, setManualPositions] = useState(
    initialViewerEdits.manualPositions,
  );
  const [hiddenItemIds, setHiddenItemIds] = useState(
    initialViewerEdits.hiddenItemIds,
  );
  const [savedViewerEdits, setSavedViewerEdits] = useState(initialViewerEdits);
  const [availableHeight, setAvailableHeight] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [addingCart, setAddingCart] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [layoutLoading, setLayoutLoading] = useState(false);

  const initialAiResults = useMemo(
    () => location.state?.aiResults || savedViewerState.aiResults || null,
    [location.state?.aiResults, savedViewerState.aiResults],
  );
  const [aiResults, setAiResults] = useState(initialAiResults);

  useEffect(() => {
    setAiResults(initialAiResults);
    setDraggingId(null);
    setManualSceneEntries(initialViewerEdits.manualSceneEntries);
    setManualPositions(initialViewerEdits.manualPositions);
    setHiddenItemIds(initialViewerEdits.hiddenItemIds);
    setSavedViewerEdits(initialViewerEdits);
    setSelectedId(null);
    layoutRequestKeyRef.current = "";
    latestViewerEditsRef.current = cloneViewerEdits(initialViewerEdits);

    if (initialAiResults) {
      saveAiViewerState(
        buildViewerStatePayload(initialAiResults, initialViewerEdits),
      );
    }
  }, [initialAiResults, initialViewerEdits]);

  const currentViewerEdits = useMemo(
    () =>
      cloneViewerEdits({
        hiddenItemIds,
        manualPositions,
        manualSceneEntries,
      }),
    [hiddenItemIds, manualPositions, manualSceneEntries],
  );

  useEffect(() => {
    latestViewerEditsRef.current = currentViewerEdits;
  }, [currentViewerEdits]);

  useEffect(() => {
    if (!aiResults) return;

    saveAiViewerState(buildViewerStatePayload(aiResults, currentViewerEdits));
  }, [aiResults, currentViewerEdits]);

  const products = useMemo(
    () => (Array.isArray(aiResults?.products) ? aiResults.products : []),
    [aiResults],
  );
  const hiddenItemIdSet = useMemo(
    () => new Set(hiddenItemIds.map((id) => String(id))),
    [hiddenItemIds],
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
        saveAiViewerState(
          buildViewerStatePayload(
            versionedResult,
            latestViewerEditsRef.current,
          ),
        );
      } catch (error) {
        if (cancelled) return;

        console.error("AI viewer layout error:", error);
        toast.error(
          "Không lấy được vị trí AI, viewer sẽ dùng bố cục mặc định.",
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

  const productItems = useMemo(() => {
    const counts = {};
    return products.map((product, index) => {
      const meta = getItemType(product);
      const storageVariant =
        meta.type === "storage" ? getStorageVariant(product) : undefined;
      const tableVariant =
        meta.type === "table" ? getTableVariant(product) : undefined;
      const chairVariant =
        meta.type === "chair" ? getChairVariant(product) : undefined;
      const lampVariant =
        meta.type === "lamp" ? getLampVariant(product) : undefined;
      const plantVariant =
        meta.type === "plant" ? getPlantVariant(product) : undefined;
      const boxVariant =
        meta.type === "storageBox" ? getStorageBoxVariant(product) : undefined;
      const placementKey =
        storageVariant ||
        (meta.type === "lamp"
          ? lampVariant === "table"
            ? "tableLamp"
            : lampVariant === "ceiling"
              ? "ceilingLamp"
              : meta.type
          : meta.type === "plant" && plantVariant === "table"
            ? "tablePlant"
            : meta.type);
      const typeIndex = counts[placementKey] || 0;
      counts[placementKey] = typeIndex + 1;

      const aiPlacement = getAiLayoutPlacement(product);
      const fallbackPlacement =
        aiPlacement || getPlacement(placementKey, typeIndex, index);
      const rawColor = product?.colors?.[0];
      const itemDraft = {
        ...product,
        boxVariant,
        chairVariant,
        lampVariant,
        plantVariant,
        storageVariant,
        tableVariant,
        type: meta.type,
        placement: aiPlacement?.placement || product?.placement,
        canSupportItems:
          typeof aiPlacement?.canSupportItems === "boolean"
            ? aiPlacement.canSupportItems
            : product?.canSupportItems,
        supportSurface:
          aiPlacement?.supportSurface || product?.supportSurface || "",
      };
      const placementConfig = getItemPlacementConfig(itemDraft);
      const hasAiPlacement = Boolean(
        aiPlacement &&
        (Array.isArray(aiPlacement.position) ||
          (placementConfig.mode === "on_top_of" && placementConfig.targetId)),
      );

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
        canSupportItems: getCanSupportItems(itemDraft),
        layoutScore: aiPlacement?.score ?? product?.layoutScore,
        modelUrl: aiPlacement?.modelUrl || product?.modelUrl || "",
        hasAiPlacement,
        placement: placementConfig,
        position: aiPlacement?.position || fallbackPlacement.position,
        rotation: aiPlacement?.rotation ?? fallbackPlacement.rotation,
        boxVariant,
        chairVariant,
        lampVariant,
        plantVariant,
        storageVariant,
        supportSurface: getItemSupportSurface(itemDraft),
        tableVariant,
        type: meta.type,
      };
    });
  }, [products]);

  const manualSceneEntryById = useMemo(
    () => new Map(manualSceneEntries.map((entry) => [String(entry.id), entry])),
    [manualSceneEntries],
  );

  const sceneItems = useMemo(() => {
    const mappedItems = productItems
      .filter(
        (item) =>
          !hiddenItemIdSet.has(String(item.id)) &&
          (item.hasAiPlacement || manualSceneEntryById.has(String(item.id))),
      )
      .map((item) => {
        if (item.hasAiPlacement) {
          return {
            ...item,
            isManualPlaced: false,
            sceneMode: "ai",
          };
        }

        const manualEntry = manualSceneEntryById.get(String(item.id));

        return {
          ...item,
          isManualPlaced: true,
          sceneMode: "manual",
          position: manualEntry?.position || [0, 0, 0.9],
          rotation: manualEntry?.rotation ?? 0,
        };
      });

    const baseItems = mappedItems.map((item) => {
      const manualPlacement = manualPositions[item.id];

      if (!manualPlacement) return item;

      return {
        ...item,
        position: manualPlacement.position || item.position,
        rotation: manualPlacement.rotation ?? item.rotation,
        placement: manualPlacement.placement || item.placement,
      };
    });

    const surfaceAnchors = getSurfaceAnchorItems(baseItems);
    const accessoryCounts = {
      tray: 0,
      vase: 0,
      storageBox: 0,
      textile: 0,
      lamp: 0,
      plant: 0,
    };

    return baseItems.map((item) => {
      if (!isSurfaceAccessoryItem(item) || manualPositions[item.id]) {
        return item;
      }

      const accessoryKey = getDecorType(item) || item.type;
      const accessoryIndex = accessoryCounts[accessoryKey] || 0;
      accessoryCounts[accessoryKey] = accessoryIndex + 1;

      const placement = getSurfacePlacementForAccessory(
        item,
        surfaceAnchors,
        accessoryIndex,
        aiResults?.roomAnalysis,
      );

      if (!placement) {
        return item;
      }

      return {
        ...item,
        position: placement.position,
        rotation: placement.rotation,
        placement: {
          ...item.placement,
          mode: "on_top_of",
          targetId:
            normalizeLinkId(placement.targetId) ||
            item.placement?.targetId ||
            "",
        },
      };
    });
  }, [
    aiResults?.roomAnalysis,
    hiddenItemIdSet,
    manualPositions,
    manualSceneEntryById,
    productItems,
  ]);

  const visibleProductItems = useMemo(
    () => productItems.filter((item) => !hiddenItemIdSet.has(String(item.id))),
    [hiddenItemIdSet, productItems],
  );

  const aiPlacedCount = sceneItems.filter((item) => item.hasAiPlacement).length;
  const manualPlacedCount = sceneItems.filter(
    (item) => item.isManualPlaced,
  ).length;
  const hasLayoutResult = Boolean(aiResults?.layout);
  const manualMovedCount = Object.keys(manualPositions).length;

  const selectedSceneItem =
    sceneItems.find((item) => String(item.id) === String(selectedId)) || null;
  const selectedItem =
    selectedSceneItem ||
    productItems.find((item) => String(item.id) === String(selectedId)) ||
    productItems[0] ||
    null;

  const totalPrice = visibleProductItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0,
  );
  const roomPalette = useMemo(
    () => getRoomSurfacePalette(aiResults?.colorPalette),
    [aiResults?.colorPalette],
  );

  const hasUnsavedChanges =
    JSON.stringify(currentViewerEdits) !== JSON.stringify(savedViewerEdits);
  const selectedItemHidden = Boolean(
    selectedItem && hiddenItemIdSet.has(String(selectedItem.id)),
  );
  const selectedItemHasAiPlacement = Boolean(selectedItem?.hasAiPlacement);
  const selectedItemIsManualPlaced = Boolean(selectedSceneItem?.isManualPlaced);
  const selectedItemNeedsManualPlacement = Boolean(
    selectedItem && !selectedItemHasAiPlacement && !selectedItemHidden,
  );
  const canToggleSelectedItemVisibility = Boolean(
    selectedSceneItem || selectedItemHidden,
  );

  const handleSelect = (item) => {
    setSelectedId(item.id);
  };

  const handlePreviewProduct = (product) => {
    const productId = String(product?.id || "");

    if (!productId) return;

    const productItem =
      productItems.find((item) => String(item.id) === productId) || product;

    if (productItem?.hasAiPlacement) {
      setSelectedId(productId);
      return;
    }

    const existingEntryIndex = manualSceneEntries.findIndex(
      (entry) => String(entry.id) === productId,
    );
    const initialPlacement = getInitialManualPlacementForItem(
      productItem,
      sceneItems,
      existingEntryIndex >= 0 ? existingEntryIndex : manualSceneEntries.length,
      aiResults?.roomAnalysis,
    );

    setManualSceneEntries((current) => {
      const entryIndex = current.findIndex(
        (entry) => String(entry.id) === productId,
      );

      if (entryIndex >= 0) {
        if (
          !isSurfaceAccessoryItem(productItem) ||
          manualPositions[productId]?.position
        ) {
          return current;
        }

        const next = [...current];
        next[entryIndex] = {
          ...next[entryIndex],
          position: initialPlacement.position,
          rotation: initialPlacement.rotation,
        };

        return next;
      }

      return [
        ...current,
        {
          id: productId,
          ...initialPlacement,
        },
      ];
    });

    if (isSurfaceAccessoryItem(productItem) && !manualPositions[productId]) {
      setManualPositions((current) => {
        if (current[productId]) {
          return current;
        }

        return {
          ...current,
          [productId]: {
            position: initialPlacement.position,
            rotation: initialPlacement.rotation,
          },
        };
      });
    }

    setSelectedId(productId);
  };

  const handleMoveItem = (itemId, nextPosition) => {
    const movingItem = sceneItems.find(
      (item) => String(item.id) === String(itemId),
    );
    if (!movingItem) return;

    const anchors = getSurfaceAnchorItems(sceneItems, itemId);
    const surfacePlacement = isSurfaceAccessoryItem(movingItem)
      ? getAccessorySurfaceSnapPlacement(
          movingItem,
          anchors,
          nextPosition,
          aiResults?.roomAnalysis,
        )
      : null;

    setManualPositions((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] || {}),
        position: surfacePlacement?.position || nextPosition,
        rotation: surfacePlacement?.rotation ?? movingItem.rotation,
        placement: surfacePlacement
          ? {
              mode: "on_top_of",
              targetId: surfacePlacement.targetId,
            }
          : current[itemId]?.placement || movingItem.placement,
      },
    }));
    setSelectedId(itemId);
  };

  const handleRotateItem = useCallback(
    (itemId, rotationDelta) => {
      const sceneItem = sceneItems.find(
        (item) => String(item.id) === String(itemId),
      );

      if (!sceneItem) return;

      setManualPositions((current) => {
        const existingPlacement = current[itemId] || {};
        const nextRotation = normalizeRotationAngle(
          (existingPlacement.rotation ?? sceneItem.rotation ?? 0) +
            rotationDelta,
        );
        const nextPosition = clampItemPositionToRoom(
          existingPlacement.position || sceneItem.position,
          getItemDimensions(sceneItem, aiResults?.roomAnalysis),
          aiResults?.roomAnalysis,
          {
            ...sceneItem,
            rotation: nextRotation,
          },
        );

        return {
          ...current,
          [itemId]: {
            ...existingPlacement,
            position: nextPosition,
            rotation: nextRotation,
          },
        };
      });
      setSelectedId(itemId);
    },
    [aiResults?.roomAnalysis, sceneItems],
  );

  const handleDragStateChange = (itemId) => {
    setDraggingId(itemId);
  };

  const handleSaveDesign = () => {
    if (!aiResults) return;

    setSavedViewerEdits(currentViewerEdits);
    saveAiViewerState(buildViewerStatePayload(aiResults, currentViewerEdits));
    toast.success("Đã lưu thiết kế 3D hiện tại.");
  };

  const handleResetView = () => {
    setDraggingId(null);
    setResetToken((current) => current + 1);
  };

  const handleResetItems = () => {
    setDraggingId(null);
    setManualPositions({});
  };

  const handleRestoreSavedDesign = () => {
    setDraggingId(null);
    setManualSceneEntries(savedViewerEdits.manualSceneEntries);
    setManualPositions(savedViewerEdits.manualPositions);
    setHiddenItemIds(savedViewerEdits.hiddenItemIds);
    setResetToken((current) => current + 1);
    toast.success("Đã quay lại bản trước khi chỉnh sửa.");
  };

  const handleToggleItemVisibility = (product) => {
    const productId = String(product?.id || "");

    if (!productId) return;

    const isHidden = hiddenItemIdSet.has(productId);

    setHiddenItemIds((current) =>
      isHidden
        ? current.filter((id) => String(id) !== productId)
        : [...current, productId],
    );

    if (isHidden) {
      const productItem =
        productItems.find((item) => String(item.id) === productId) || product;

      if (!productItem?.hasAiPlacement) {
        handlePreviewProduct(productItem);
      }

      toast.success("Đã thêm lại sản phẩm vào 3D view.");
      return;
    }

    toast.success("Đã xóa sản phẩm khỏi 3D view.");
  };

  useEffect(() => {
    if (!selectedSceneItem || draggingId) return undefined;

    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName?.toLowerCase();

      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        event.target?.isContentEditable
      ) {
        return;
      }

      if (event.key.toLowerCase() === "q") {
        event.preventDefault();
        handleRotateItem(selectedSceneItem.id, -ITEM_ROTATION_STEP);
      }

      if (event.key.toLowerCase() === "e") {
        event.preventDefault();
        handleRotateItem(selectedSceneItem.id, ITEM_ROTATION_STEP);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [draggingId, handleRotateItem, selectedSceneItem]);

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
    const realItems = visibleProductItems.filter(
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
      toast.error(getErrorMessage(error, "Không thêm được vào giỏ hàng."));
    } finally {
      setAddingCart(false);
    }
  };

  if (!productItems.length) {
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
            className={styles.iconButton}
            disabled={!hasUnsavedChanges}
            onClick={handleSaveDesign}
            title="Lưu bố cục 3D hiện tại"
            type="button"
          >
            <Save size={18} />
          </button>
          <button
            className={styles.iconButton}
            disabled={!hasUnsavedChanges}
            onClick={handleRestoreSavedDesign}
            title="Khôi phục bản đã lưu"
            type="button"
          >
            <Undo2 size={18} />
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
        <section
          className={styles.canvasPanel}
          onContextMenu={(event) => event.preventDefault()}
          ref={canvasPanelRef}
        >
          <Canvas shadows dpr={[1, 1.7]}>
            <Suspense fallback={null}>
              <Scene
                controlsRef={controlsRef}
                draggingId={draggingId}
                items={sceneItems}
                onDragStateChange={handleDragStateChange}
                onMoveItem={handleMoveItem}
                onRotateItem={handleRotateItem}
                onSelect={handleSelect}
                resetToken={resetToken}
                roomDimensions={aiResults?.roomAnalysis}
                roomPalette={roomPalette}
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
                  : `${aiPlacedCount}/${productItems.length} vị trí AI`}
              </strong>
              {manualPlacedCount > 0 && (
                <small className={styles.sceneStatsHint}>
                  {manualPlacedCount} món đặt thủ công
                </small>
              )}
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
              <div className={styles.detailMeta}>
                <span>{selectedItem.category || selectedItem.type}</span>
                <strong
                  className={
                    selectedItemHidden
                      ? styles.hiddenPlacementChip
                      : selectedItemHasAiPlacement
                        ? styles.aiPlacementChip
                        : selectedItemIsManualPlaced
                          ? styles.manualPlacementChip
                          : styles.pendingPlacementChip
                  }
                >
                  {selectedItemHidden
                    ? "Ẩn khỏi 3D"
                    : selectedItemHasAiPlacement
                      ? "AI placed"
                      : selectedItemIsManualPlaced
                        ? "Manual placed"
                        : "Chưa vào phòng"}
                </strong>
              </div>
              <h2>{selectedItem.name}</h2>
              <strong>{formatPrice(selectedItem.price)}</strong>
              <p>
                {selectedItem.reason ||
                  "Sản phẩm phù hợp với cấu hình phòng đã chọn."}
              </p>
              {selectedItemNeedsManualPlacement && (
                <div className={styles.manualPlacementHint}>
                  Sản phẩm này chưa có vị trí AI. Bạn có thể thêm vào phòng và
                  kéo để đặt thủ công.
                </div>
              )}
              {selectedItemHidden && (
                <div className={styles.manualPlacementHint}>
                  Sản phẩm này đang bị ẩn khỏi mô hình 3D. Bạn có thể hiện lại
                  để tiếp tục chỉnh bố cục hoặc giữ nó ngoài không gian.
                </div>
              )}
              <dl>
                <div>
                  <dt>Kích thước</dt>
                  <dd>{selectedItem.dimensionsText || "Chưa có dữ liệu"}</dd>
                </div>
              </dl>
              <div className={styles.detailActions}>
                {selectedSceneItem && (
                  <div className={styles.rotationActions}>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() =>
                        handleRotateItem(
                          selectedSceneItem.id,
                          -ITEM_ROTATION_STEP,
                        )
                      }
                    >
                      <RotateCcw size={16} />
                      Xoay trái
                    </button>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() =>
                        handleRotateItem(
                          selectedSceneItem.id,
                          ITEM_ROTATION_STEP,
                        )
                      }
                    >
                      <RotateCw size={16} />
                      Xoay phải
                    </button>
                  </div>
                )}
                {selectedItemNeedsManualPlacement && (
                  <button
                    type="button"
                    onClick={() => handlePreviewProduct(selectedItem)}
                  >
                    {selectedItemIsManualPlaced
                      ? "Xem trong phòng"
                      : "Thêm vào phòng"}
                    <ChevronRight size={16} />
                  </button>
                )}
                {canToggleSelectedItemVisibility && (
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => handleToggleItemVisibility(selectedItem)}
                  >
                    <Trash2 size={16} />
                    {selectedItemHidden
                      ? "Hiện lại trong 3D"
                      : "Xóa khỏi 3D view"}
                  </button>
                )}
                <button
                  className={styles.secondaryButton}
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
              </div>
            </section>
          )}

          <section className={styles.productList}>
            <h3>Danh sách sản phẩm</h3>
            {productItems.map((item) => (
              <button
                className={
                  [
                    String(item.id) === String(selectedItem?.id)
                      ? styles.activeItem
                      : "",
                    hiddenItemIdSet.has(String(item.id)) ? styles.hiddenItem : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                key={item.id}
                onClick={() => handleSelect(item)}
                type="button"
              >
                <span>
                  {item.name}
                  {hiddenItemIdSet.has(String(item.id)) ? " (ẩn)" : ""}
                </span>
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
