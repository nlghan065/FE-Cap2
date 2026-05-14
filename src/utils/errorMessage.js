const MOJIBAKE_PATTERN =
  /(?:Ã.|Â.|Ä.|áº.|á».|á»‹|á»£|á»‘|á»—|á»|á»ƒ|á»‡|á»«|á»±|â€|â€“|â€”|ðŸ)/;

const STATUS_MESSAGE_MAP = {
  400: "Yêu cầu không hợp lệ.",
  401: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu yêu cầu.",
  409: "Dữ liệu đã tồn tại hoặc đang xung đột.",
  422: "Dữ liệu gửi lên chưa hợp lệ.",
  500: "Máy chủ đang gặp lỗi. Vui lòng thử lại sau.",
  502: "Máy chủ đang tạm gián đoạn. Vui lòng thử lại sau.",
  503: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.",
};

const KNOWN_MESSAGE_MAP = [
  {
    test: /network error/i,
    value: "Không thể kết nối tới máy chủ. Vui lòng thử lại.",
  },
  {
    test: /timeout/i,
    value: "Yêu cầu bị quá thời gian chờ. Vui lòng thử lại.",
  },
  {
    test: /invalid user id|invalid id/i,
    value: "ID không hợp lệ.",
  },
  {
    test: /unauthorized/i,
    value: STATUS_MESSAGE_MAP[401],
  },
  {
    test: /forbidden/i,
    value: STATUS_MESSAGE_MAP[403],
  },
  {
    test: /not found/i,
    value: STATUS_MESSAGE_MAP[404],
  },
  {
    test: /internal server error/i,
    value: STATUS_MESSAGE_MAP[500],
  },
  {
    test: /duplicate|already exists|already in use/i,
    value: "Dữ liệu đã tồn tại.",
  },
];

const REQUEST_FAILED_PATTERN = /^Request failed with status code \d+$/i;

const normalizeWhitespace = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeDisplayMessage = (value) => {
  if (typeof value !== "string") return "";

  let normalized = normalizeWhitespace(value);

  for (let index = 0; index < 2; index += 1) {
    if (!MOJIBAKE_PATTERN.test(normalized)) break;

    try {
      const decoded = decodeURIComponent(escape(normalized));

      if (!decoded || decoded === normalized) break;
      normalized = normalizeWhitespace(decoded);
    } catch {
      break;
    }
  }

  return normalized;
};

const extractNestedMessages = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap(extractNestedMessages);
  }

  if (typeof value === "string") {
    return [value];
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap(extractNestedMessages);
  }

  return [];
};

const extractPayloadMessage = (payload) => {
  if (!payload) return "";

  if (typeof payload === "string") return payload;

  const directCandidates = [
    payload.message,
    payload.error,
    payload.detail,
    payload.title,
    payload.reason,
  ];

  const directMessage = directCandidates.find(
    (item) => typeof item === "string" && item.trim(),
  );

  if (directMessage) return directMessage;

  const nestedCandidates = [
    payload.errors,
    payload.errorMessages,
    payload.messages,
    payload.violations,
    payload.data,
  ];

  const nestedMessage = nestedCandidates
    .flatMap(extractNestedMessages)
    .find((item) => typeof item === "string" && item.trim());

  return nestedMessage || "";
};

const translateKnownMessage = (message, status) => {
  const normalized = normalizeDisplayMessage(message);

  if (!normalized) {
    return STATUS_MESSAGE_MAP[status] || "";
  }

  if (REQUEST_FAILED_PATTERN.test(normalized)) {
    return STATUS_MESSAGE_MAP[status] || normalized;
  }

  const matchedRule = KNOWN_MESSAGE_MAP.find(({ test }) => test.test(normalized));
  if (matchedRule) {
    return matchedRule.value;
  }

  return normalized;
};

export const getErrorMessage = (
  error,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
) => {
  const status = error?.response?.status;
  const normalizedFallback =
    normalizeDisplayMessage(fallback) ||
    STATUS_MESSAGE_MAP[status] ||
    "Đã xảy ra lỗi. Vui lòng thử lại.";

  const candidates = [
    extractPayloadMessage(error?.response?.data),
    error?.message,
  ];

  for (const candidate of candidates) {
    const normalized = translateKnownMessage(candidate, status);

    if (normalized) {
      return normalized;
    }
  }

  return STATUS_MESSAGE_MAP[status] || normalizedFallback;
};

export const normalizeErrorResponse = (error) => {
  if (!error) return error;

  const status = error?.response?.status;
  const payload = error?.response?.data;

  if (typeof payload === "string") {
    error.response.data = translateKnownMessage(payload, status);
  } else if (payload && typeof payload === "object") {
    if (typeof payload.message === "string") {
      payload.message = translateKnownMessage(payload.message, status);
    }

    if (typeof payload.error === "string") {
      payload.error = translateKnownMessage(payload.error, status);
    }

    if (typeof payload.detail === "string") {
      payload.detail = translateKnownMessage(payload.detail, status);
    }
  }

  if (typeof error.message === "string") {
    error.message = translateKnownMessage(error.message, status);
  }

  return error;
};
