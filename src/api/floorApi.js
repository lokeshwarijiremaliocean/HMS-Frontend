import apiClient from "./axiosInstance";

export const DEFAULT_FLOORS = [
  { id: 1, floor_id: 1, floor_no: 1, floor_name: "First Floor", hostel_id: 1, is_active: true, created_by: "Admin" },
  { id: 2, floor_id: 2, floor_no: 2, floor_name: "Second Floor", hostel_id: 1, is_active: true, created_by: "Admin" },
  { id: 3, floor_id: 3, floor_no: 3, floor_name: "Third Floor", hostel_id: 1, is_active: true, created_by: "Admin" },
  { id: 4, floor_id: 4, floor_no: 4, floor_name: "Fourth Floor", hostel_id: 1, is_active: true, created_by: "Admin" },
  { id: 5, floor_id: 5, floor_no: 5, floor_name: "Fifth Floor", hostel_id: 1, is_active: true, created_by: "Admin" },
  { id: 6, floor_id: 6, floor_no: 6, floor_name: "Sixth Floor", hostel_id: 1, is_active: true, created_by: "Admin" },
  { id: 7, floor_id: 7, floor_no: 7, floor_name: "Seventh Floor", hostel_id: 1, is_active: true, created_by: "Admin" },
  { id: 8, floor_id: 8, floor_no: 8, floor_name: "Eighth Floor", hostel_id: 1, is_active: true, created_by: "Admin" },
  { id: 9, floor_id: 9, floor_no: 9, floor_name: "Ninth Floor", hostel_id: 1, is_active: true, created_by: "Admin" },
  { id: 10, floor_id: 10, floor_no: 10, floor_name: "Tenth Floor", hostel_id: 1, is_active: true, created_by: "Admin" },
];

// ─── 1. GET ALL FLOORS ───
// Method: GET, Endpoint: /floors
export const getAllFloors = async () => {
  try {
    return await apiClient.get("/floors");
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405 || !err.response) {
      console.warn("Backend /floors endpoint unavailable (404/Network). Using default floors list.");
      return { data: DEFAULT_FLOORS, isFallback: true };
    }
    throw err;
  }
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
  DEFAULT_FLOORS,
};
