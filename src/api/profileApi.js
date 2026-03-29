import apiClient from "./apiClient";
export const getProfileApi = async () => {
  try {
    const res = await apiClient.get("/profiles/me");

    return res.data.data;
  } catch (error) {
    console.error("Profile API error:", error.response?.data || error);
    throw error;
  }
};
