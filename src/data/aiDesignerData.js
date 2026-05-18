export const AI_ROOM_TYPES = [
  {
    id: "Living Room",
    name: "Phòng khách",
    icon: "🛋️",
    desc: "Không gian tiếp khách, giải trí và sinh hoạt gia đình.",
  },
  {
    id: "Bedroom",
    name: "Phòng ngủ",
    icon: "🛏️",
    desc: "Không gian nghỉ ngơi riêng tư, ưu tiên sự thư giãn và gọn gàng.",
  },
];

export const AI_STYLE_OPTIONS = [
  {
    id: "Modern",
    name: "Modern",
    desc: "Hiện đại, tiện nghi, đường nét sạch.",
  },
  {
    id: "Minimal",
    name: "Minimal",
    desc: "Tối giản, nhẹ mắt, tập trung công năng.",
  },
  {
    id: "Scandinavian",
    name: "Scandinavian",
    desc: "Ấm áp, sáng màu, gần gũi.",
  },

  {
    id: "Classic",
    name: "Classic",
    desc: "Cân xứng, sang trọng, truyền thống.",
  },
  {
    id: "Japanese",
    name: "Japanese",
    desc: "Tĩnh, gọn, ưu tiên thiên nhiên.",
  },
  {
    id: "Luxury",
    name: "Luxury",
    desc: "Đậm điểm nhấn, bề mặt cao cấp.",
  },
  {
    id: "Boho",
    name: "Boho",
    desc: "Tự do, nghệ thuật, giàu chất liệu.",
  },
];

export const AI_DENSITY_OPTIONS = [
  { id: "sparse", name: "Ít", desc: "Tối giản" },
  { id: "medium", name: "Vừa", desc: "Cân đối" },
  { id: "dense", name: "Nhiều", desc: "Đầy đủ" },
];

export const AI_GENDER_OPTIONS = [
  { id: "male", name: "Nam", desc: "Tông gọn, chắc, hiện đại" },
  { id: "female", name: "Nữ", desc: "Tông mềm, sáng, cân bằng" },
  { id: "other", name: "Khác", desc: "Trung tính theo sở thích cá nhân" },
];

export const AI_REQUEST_STATUS_LABELS = {
  COMPLETED: "Hoàn tất",
  PENDING: "Đang chờ xử lý",
  PROCESSING: "Đang xử lý",
  FAILED: "Thất bại",
};

const normalizeAiLabelValue = (value) =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const getOptionLabel = (options, value, fallback = "") => {
  if (!value) return fallback;

  const normalizedValue = normalizeAiLabelValue(value);
  const matchedOption = options.find(
    (item) =>
      normalizeAiLabelValue(item.id) === normalizedValue ||
      normalizeAiLabelValue(item.name) === normalizedValue,
  );

  return matchedOption?.name || value;
};

export const getAiRoomTypeLabel = (value, fallback = "") =>
  getOptionLabel(AI_ROOM_TYPES, value, fallback);

export const getAiStyleLabel = (value, fallback = "") =>
  getOptionLabel(AI_STYLE_OPTIONS, value, fallback);

export const getAiDensityLabel = (value, fallback = "") =>
  getOptionLabel(AI_DENSITY_OPTIONS, value, fallback);

export const getAiGenderLabel = (value, fallback = "") =>
  getOptionLabel(AI_GENDER_OPTIONS, value, fallback);

export const getAiRequestStatusLabel = (value, fallback = "Đã tạo yêu cầu") => {
  if (!value) return fallback;

  const normalizedValue = String(value || "")
    .trim()
    .toUpperCase();

  return AI_REQUEST_STATUS_LABELS[normalizedValue] || value;
};
