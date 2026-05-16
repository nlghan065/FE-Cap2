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
      const response = await apiClient.post(url, payload);
      return extractApiData(response);
    } catch (error) {
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

  return {
    content: Array.isArray(payload?.content) ? payload.content : [],
    page: payload?.page || 0,
    totalPages: payload?.totalPages || 1,
    totalElements: payload?.totalElements || 0,
  };
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
    stripEmptyFields({
      designRequestId,
      name: projectName,
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
    stripEmptyFields(payload),
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
      stripEmptyFields(payload),
    ],
  );
}

export async function getMyProjects3DApi({
  page = 0,
  size = 10,
  sort = "createdAt,desc",
} = {}) {
  const response = await apiClient.get(`${PROJECTS_3D_ENDPOINT}/my`, {
    params: { page, size, sort },
  });

  return extractPagedContent(extractApiData(response));
}

export async function getProject3DByIdApi(projectId) {
  const response = await apiClient.get(`${PROJECTS_3D_ENDPOINT}/${projectId}`);
  return extractApiData(response);
}
