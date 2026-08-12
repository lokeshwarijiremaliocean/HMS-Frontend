import apiClient from "./axiosInstance";

// ─── 1. GET ALL BEDS ───
export const getAllBeds = async () => {
  try {
    return await apiClient.get("/bed");
  } catch {
    try {
      return await apiClient.get("/beds");
    } catch {
      return await apiClient.get("/bed/all");
    }
  }
};

// ─── 2. GET BED BY ID ───
export const getBedById = async (bedId) => {
  try {
    return await apiClient.get(`/bed/${bedId}`);
  } catch {
    try {
      return await apiClient.get(`/bed?id=${bedId}`);
    } catch {
      return await apiClient.get(`/beds/${bedId}`);
    }
  }
};

// ─── 3. ADD NEW BED ───
export const addBed = async (bedData) => {
  const payload = {
    hostel_id: Number(bedData.hostel_id) || 0,
    floor_id: Number(bedData.floor_id) || 0,
    floor_name: String(bedData.floor_name || "").trim(),
    room_no: String(bedData.room_no || "").trim(),
    bed_no: String(bedData.bed_no || "").trim(),
  };

  try {
    return await apiClient.post("/bed", payload);
  } catch {
    return await apiClient.post("/beds", payload);
  }
};

// ─── 4. UPDATE BED BY ID ───
export const updateBed = async (bedId, bedData) => {
  const payload = {
    hostel_id: Number(bedData.hostel_id) || 0,
    floor_id: Number(bedData.floor_id) || 0,
    floor_name: String(bedData.floor_name || "").trim(),
    room_no: String(bedData.room_no || "").trim(),
    bed_no: String(bedData.bed_no || "").trim(),
  };

  try {
    return await apiClient.put(`/bed/${bedId}`, payload);
  } catch {
    try {
      return await apiClient.put(`/bed?id=${bedId}`, payload);
    } catch {
      try {
        return await apiClient.put(`/beds/${bedId}`, payload);
      } catch {
        return await apiClient.patch(`/bed/${bedId}`, payload);
      }
    }
  }
};

// ─── 5. DELETE BED BY ID ───
export const deleteBed = async (bedId) => {
  try {
    return await apiClient.delete(`/bed/${bedId}`);
  } catch {
    try {
      return await apiClient.delete(`/bed?id=${bedId}`);
    } catch {
      return await apiClient.delete(`/beds/${bedId}`);
    }
  }
};

// ─── HELPER: FETCH HOSTELS FOR DROPDOWN ───
export const getHostelsList = async () => {
  try {
    const res = await apiClient.get("/hostel");
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
  } catch {
    try {
      const res = await apiClient.get("/hostels");
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      if (Array.isArray(res.data)) return res.data;
    } catch {
      // Return empty if endpoint unavailable
    }
  }
  return [];
};

// ─── HELPER: FETCH FLOORS/ROOMS FOR DROPDOWN ───
export const getFloorsList = async () => {
  try {
    const res = await apiClient.get("/floor");
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
  } catch {
    try {
      const res = await apiClient.get("/floors");
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      if (Array.isArray(res.data)) return res.data;
    } catch {
      // Try from rooms endpoint
      try {
        const res = await apiClient.get("/room");
        const list = res.data?.data || res.data;
        if (Array.isArray(list)) return list;
      } catch {
        // Return empty
      }
    }
  }
  return [];
};

export default {
  getAllBeds,
  getBedById,
  addBed,
  updateBed,
  deleteBed,
  getHostelsList,
  getFloorsList,
};
