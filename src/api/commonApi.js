import apiClient from "./axiosInstance";

/**
 * Common search API endpoint.
 * GET /common/search?query=<search text>
 */
export const commonSearch = async (query) => {
  try {
    return await apiClient.get("/common/search", {
      params: { query },
    });
  } catch (error) {
    return { data: [] };
  }
};

export default {
  commonSearch,
};
