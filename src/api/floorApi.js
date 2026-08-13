import apiClient from "./axiosInstance";

// ─── 1. GET ALL FLOORS ───
// Method: GET, Endpoint: /floors
export const getAllFloors = async () => {
  return await apiClient.get("/floors");
};

// ─── 2. GET FLOOR BY ID ───
// Method: GET, Endpoint: /floor/{id}
export const getFloorById = async (id) => {
  return await apiClient.get(`/floor/${encodeURIComponent(id)}`);
};

// ─── 3. GET FLOOR BY NAME ───
// Method: GET, Endpoint: /floor?floor_name={floor_name}
export const getFloorByName = async (floorName) => {
  return await apiClient.get(`/floor?floor_name=${encodeURIComponent(floorName)}`);
};

// ─── 4. ADD NEW FLOOR ───
// Method: POST, Endpoint: /floor
export const addFloor = async (floorData) => {
  return await apiClient.post("/floor", floorData);
};

// ─── 5. UPDATE FLOOR BY ID ───
// Method: PUT, Endpoint: /floor/{id}
export const updateFloor = async (id, floorData) => {
  return await apiClient.put(`/floor/${encodeURIComponent(id)}`, floorData);
};

// ─── 6. DELETE FLOOR BY ID ───
// Method: DELETE, Endpoint: /floor/{id}
export const deleteFloor = async (id) => {
  return await apiClient.delete(`/floor/${encodeURIComponent(id)}`);
};

export default {
  getAllFloors,
  getFloorById,
  getFloorByName,
  addFloor,
  updateFloor,
  deleteFloor,
};
