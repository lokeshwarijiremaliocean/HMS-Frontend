import apiClient from "./axiosInstance";

// ─── 1. GET ALL FLOORS ───
// Method: GET, Endpoint: /floors
export const getAllFloors = async () => {
  return await apiClient.get("/floors");
};

// ─── 2. GET FLOOR BY ID ───
// Method: GET, Endpoint: /floor/id?id={id}
export const getFloorById = async (id) => {
  const numericId = parseInt(id, 10);
  const targetId = isNaN(numericId) ? id : numericId;
  return await apiClient.get(`/floor/id?id=${encodeURIComponent(targetId)}`);
};

// ─── 3. GET FLOOR BY NAME ───
// Method: GET, Endpoint: /floor/name?floor_name={floor_name}
export const getFloorByName = async (floorName) => {
  return await apiClient.get(`/floor/name?floor_name=${encodeURIComponent(floorName)}`);
};

// ─── 4. ADD NEW FLOOR ───
// Method: POST, Endpoint: /floor/add
// Body: { hostel_id: number, floor_no: number, floor_name: string }
export const addFloor = async (floorData) => {
  return await apiClient.post("/floor/add", floorData);
};

// ─── 5. UPDATE FLOOR BY ID ───
// Method: PUT, Endpoint: /floor/id?id={id}
// Body: { hostel_id?: number, floor_no?: number, floor_name?: string }
export const updateFloor = async (id, floorData) => {
  const numericId = parseInt(id, 10);
  const targetId = isNaN(numericId) ? id : numericId;
  return await apiClient.put(`/floor/id?id=${encodeURIComponent(targetId)}`, floorData);
};

// ─── 6. DELETE FLOOR BY ID ───
// Method: DELETE, Endpoint: /floor/id?id={id}
export const deleteFloor = async (id) => {
  const numericId = parseInt(id, 10);
  const targetId = isNaN(numericId) ? id : numericId;
  return await apiClient.delete(`/floor/id?id=${encodeURIComponent(targetId)}`);
};

export default {
  getAllFloors,
  getFloorById,
  getFloorByName,
  addFloor,
  updateFloor,
  deleteFloor,
};
