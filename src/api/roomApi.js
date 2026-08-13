import apiClient from "./axiosInstance";

export const DEFAULT_ROOMS = [
  { id: 1, floor_id: 1, floor_name: "First Floor", room_no: "R1", total_beds: 3, occupied_beds: 0 },
  { id: 2, floor_id: 1, floor_name: "First Floor", room_no: "R2", total_beds: 3, occupied_beds: 0 },
  { id: 3, floor_id: 1, floor_name: "First Floor", room_no: "R3", total_beds: 3, occupied_beds: 0 },
  { id: 4, floor_id: 1, floor_name: "First Floor", room_no: "R4", total_beds: 3, occupied_beds: 0 },
  { id: 5, floor_id: 1, floor_name: "First Floor", room_no: "R5", total_beds: 3, occupied_beds: 0 },
  { id: 6, floor_id: 2, floor_name: "Second Floor", room_no: "R6", total_beds: 3, occupied_beds: 0 },
  { id: 7, floor_id: 2, floor_name: "Second Floor", room_no: "R7", total_beds: 3, occupied_beds: 0 },
  { id: 8, floor_id: 2, floor_name: "Second Floor", room_no: "R8", total_beds: 3, occupied_beds: 0 },
  { id: 9, floor_id: 2, floor_name: "Second Floor", room_no: "R9", total_beds: 3, occupied_beds: 0 },
  { id: 10, floor_id: 2, floor_name: "Second Floor", room_no: "R10", total_beds: 3, occupied_beds: 0 },
];

// 1. Get all rooms (GET /room)
export const getAllRooms = async () => {
  try {
    return await apiClient.get("/room");
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405 || !err.response) {
      console.warn("Backend /room endpoint unavailable (404/Network). Using default room layout.");
      return { data: DEFAULT_ROOMS, isFallback: true };
    }
    throw err;
  }
};

// 2. Add room (POST /room)
export const addRoom = async (payload) => {
  try {
    return await apiClient.post("/room", payload);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      return await apiClient.post("/rooms", payload);
    }
    throw err;
  }
};

// 3. Get room by ID (GET /room/id?id=X)
export const getRoomById = async (roomId) => {
  const encId = encodeURIComponent(roomId);
  try {
    return await apiClient.get(`/room/id?id=${encId}`);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      return await apiClient.get(`/room/${encId}`);
    }
    throw err;
  }
};

// 4. Update room by ID (PUT /room/id?id=X)
export const updateRoom = async (roomId, payload) => {
  const encId = encodeURIComponent(roomId);
  try {
    return await apiClient.put(`/room/id?id=${encId}`, payload);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      return await apiClient.put(`/room/${encId}`, payload);
    }
    throw err;
  }
};

// 5. Delete room by ID (DELETE /room/id?id=X)
export const deleteRoom = async (roomId) => {
  const encId = encodeURIComponent(roomId);
  try {
    return await apiClient.delete(`/room/id?id=${encId}`);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      return await apiClient.delete(`/room/${encId}`);
    }
    throw err;
  }
};

export default {
  getAllRooms,
  addRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
  DEFAULT_ROOMS,
};


