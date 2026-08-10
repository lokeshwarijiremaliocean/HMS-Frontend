import apiClient from "./axiosInstance";

// Add new hostel
export const addHostel = async (hostelData) => {
  return apiClient.post("/hostel", hostelData);
};

// Search hostel by code
export const searchHostel = async (code) => {
  return apiClient.get(`/hostel?code=${encodeURIComponent(code)}`);
};

// Delete hostel by code or id
export const deleteHostel = async (codeOrId) => {
  return apiClient.delete(`/hostel?code=${encodeURIComponent(codeOrId)}`);
};

export default {
  addHostel,
  searchHostel,
  deleteHostel,
};
