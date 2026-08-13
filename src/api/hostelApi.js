import apiClient from "./axiosInstance";

// ─── 1. ADD HOSTEL ───
// Method: POST, Endpoint: /hostel/add
export const addHostel = async (payload) => {
  return apiClient.post("/hostel/add", payload);
};

// ─── 2. SEARCH HOSTEL BY CODE ───
// Method: GET, Endpoint: /hostel/{hostel_code}
export const getHostelByCode = async (hostelCode) => {
  return apiClient.get(`/hostel/${encodeURIComponent(hostelCode)}`);
};

// Alias for searchHostel
export const searchHostel = getHostelByCode;

// ─── 3. DELETE HOSTEL BY ID ───
// Method: DELETE, Endpoint: /hostel/{id}
export const deleteHostelById = async (id) => {
  return apiClient.delete(`/hostel/${encodeURIComponent(id)}`);
};

// Alias for deleteHostel
export const deleteHostel = deleteHostelById;

export default {
  addHostel,
  getHostelByCode,
  searchHostel,
  deleteHostelById,
  deleteHostel,
};
