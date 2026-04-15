import apiClient from "./apiClient";

const AI_RECOMMEND_ENDPOINT = "http://localhost:8000/api/design-requests";

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

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

  return response?.data?.data || response?.data || null;
}
