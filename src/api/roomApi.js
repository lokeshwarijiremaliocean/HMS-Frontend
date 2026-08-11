import apiClient from "./axiosInstance";

// 1. Get all rooms (GET /room or GET /rooms)
export const getAllRooms = async () => {
  try {
    return await apiClient.get("/room");
  } catch {
    return await apiClient.get("/rooms");
  }
};

// 2. Add room (POST /room or POST /rooms)
export const addRoom = async (payload) => {
  try {
    return await apiClient.post("/room", payload);
  } catch {
    return await apiClient.post("/rooms", payload);
  }
};

// 3. Get room by ID (GET /room?id=X or GET /rooms/{id})
export const getRoomById = async (roomId) => {
  try {
    return await apiClient.get(`/room?id=${roomId}`);
  } catch {
    return await apiClient.get(`/rooms/${roomId}`);
  }
};

// 4. Update room by ID (PUT /room?id=X or PUT /rooms/{id})
export const updateRoom = async (roomId, payload) => {
  try {
    return await apiClient.put(`/room?id=${roomId}`, payload);
  } catch {
    return await apiClient.put(`/rooms/${roomId}`, payload);
  }
};

// 5. Delete room by ID (DELETE /room?id=X or DELETE /rooms/{id})
export const deleteRoom = async (roomId) => {
  try {
    return await apiClient.delete(`/room?id=${roomId}`);
  } catch {
    return await apiClient.delete(`/rooms/${roomId}`);
  }
};

export default {
  getAllRooms,
  addRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
};
