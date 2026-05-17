import apiClient from "./apiClient";

const PROJECTS_3D_ENDPOINT = "/api/projects-3d";

const extractApiData = (response) => response?.data?.data || response?.data || null;
const normalizeId = (value) => String(value || "").trim();

const stripEmptyFields = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => stripEmptyFields(item))
      .filter((item) => item !== undefined);
  }

  if (!value || typeof value !== "object") {
    return value === "" || value === null || value === undefined
      ? undefined
      : value;
  }

  const entries = Object.entries(value).reduce((acc, [key, entryValue]) => {
    const nextValue = stripEmptyFields(entryValue);

    if (nextValue === undefined) {
      return acc;
    }

    if (
      typeof nextValue === "object" &&
      !Array.isArray(nextValue) &&
      nextValue !== null &&
      !Object.keys(nextValue).length
    ) {
      return acc;
    }

    acc.push([key, nextValue]);
    return acc;
  }, []);

  return Object.fromEntries(entries);
};

const buildUniquePayloads = (payloads) => {
  const seen = new Set();

  return payloads.filter((payload) => {
    if (payload === undefined) {
      return false;
    }

    const signature = JSON.stringify(payload);

    if (seen.has(signature)) {
      return false;
    }

    seen.add(signature);
    return true;
  });
};

const shouldRetryWithAlternatePayload = (error) => {
  const status = Number(error?.response?.status || 0);
  const code = Number(error?.response?.data?.code || 0);

  return [400, 415, 422, 500].includes(status) || code === 9999;
};

const postWithPayloadFallback = async (url, payloads) => {
  let lastError = null;

  for (const payload of buildUniquePayloads(payloads)) {
    try {
      console.log("[PROJECTS 3D API] POST", url, payload);
      const response = await apiClient.post(url, payload);
      console.log("[PROJECTS 3D API] RESPONSE", url, response?.data);
      return extractApiData(response);
    } catch (error) {
      console.error("[PROJECTS 3D API] ERROR", url, {
        payload,
        status: error?.response?.status,
        data: error?.response?.data,
      });

      lastError = error;

      if (!shouldRetryWithAlternatePayload(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};

const extractPagedContent = (payload) => {
  if (Array.isArray(payload)) {
    return {
      content: payload,
      page: 0,
      totalPages: 1,
      totalElements: payload.length,
    };
  }

  if (payload && typeof payload === "object" && !Array.isArray(payload?.content)) {
    const singleProjectId = normalizeId(
      payload?.id || payload?._id || payload?.projectId || payload?.project3DId,
    );

    if (singleProjectId) {
      return {
        content: [payload],
        page: 0,
        totalPages: 1,
        totalElements: 1,
      };
    }
  }

  return {
    content: Array.isArray(payload?.content) ? payload.content : [],
    page: payload?.page || 0,
    totalPages: payload?.totalPages || 1,
    totalElements: payload?.totalElements || 0,
  };
};

const extractProjectDetail = (payload, projectId = "") => {
  const normalizedProjectId = normalizeId(projectId);

  if (Array.isArray(payload)) {
    return (
      payload.find(
        (item) =>
          normalizeId(
            item?.id || item?._id || item?.projectId || item?.project3DId,
          ) === normalizedProjectId,
      ) ||
      payload[0] ||
      null
    );
  }

  const candidateList =
    payload?.content ||
    payload?.items ||
    payload?.projects ||
    payload?.data;

  if (Array.isArray(candidateList)) {
    return extractProjectDetail(candidateList, projectId);
  }

  return payload && typeof payload === "object" ? payload : null;
};

export async function createProject3DApi(payload) {
  const designRequestId = normalizeId(
    payload?.designRequestId || payload?.sourceDesignRequestId || payload?.requestId,
  );
  const projectName =
    String(payload?.name || payload?.title || "3D Design").trim() || "3D Design";
  const projectTitle =
    String(payload?.title || payload?.name || "3D Design").trim() || "3D Design";

  return postWithPayloadFallback(PROJECTS_3D_ENDPOINT, [
    stripEmptyFields(payload),
    stripEmptyFields({
      designRequestId,
      name: projectName,
      sceneData: payload?.sceneData,
      editedProducts: Array.isArray(payload?.editedProducts)
        ? payload.editedProducts
        : [],
    }),
    stripEmptyFields({
      designRequestId,
      title: projectTitle,
    }),
    stripEmptyFields({
      designRequestId,
    }),
    stripEmptyFields({
      sourceDesignRequestId: designRequestId,
      name: projectName,
    }),
  ]);
}

export async function saveProject3DEditedProductsApi(projectId, payload) {
  const editedProducts = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.editedProducts)
      ? payload.editedProducts
      : Array.isArray(payload?.products)
        ? payload.products
        : Array.isArray(payload?.items)
          ? payload.items
          : [];

  return postWithPayloadFallback(
    `${PROJECTS_3D_ENDPOINT}/${projectId}/edited-products`,
    [
      stripEmptyFields(payload),
      stripEmptyFields({
        sceneData: payload?.sceneData,
        editedProducts,
      }),
      stripEmptyFields({
        editedProducts,
      }),
      editedProducts,
      stripEmptyFields({
        products: editedProducts,
      }),
      stripEmptyFields({
        items: editedProducts,
      }),
      stripEmptyFields({
        viewerEdits: payload?.viewerEdits,
        snapshot: payload?.snapshot,
        editedProducts,
      }),
    ],
  );
}

export async function getMyProjects3DApi({
  page = 0,
  size = 10,
  sort = "createdAt,desc",
} = {}) {
  console.log("[PROJECTS 3D API] GET /my", { page, size, sort });

  const response = await apiClient.get(`${PROJECTS_3D_ENDPOINT}/my`, {
    params: { page, size, sort },
  });

  console.log("[PROJECTS 3D API] RESPONSE /my", response?.data);

  return extractPagedContent(extractApiData(response));
}

export async function getProject3DByIdApi(projectId) {
  console.log("[PROJECTS 3D API] GET detail", projectId);

  const response = await apiClient.get(`${PROJECTS_3D_ENDPOINT}/${projectId}`);

  console.log("[PROJECTS 3D API] RESPONSE detail", response?.data);

  return extractProjectDetail(extractApiData(response), projectId);
}
