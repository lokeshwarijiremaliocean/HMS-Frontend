import apiClient from "./axiosInstance";
import { getAllFloors } from "./floorApi";

// ─── 1. GET ALL BEDS ───
// Method: GET, Endpoint: /bed
export const getAllBeds = async () => {
  return await apiClient.get("/bed");
};

// ─── 2. GET BED BY ID ───
// Method: GET, Endpoint: /bed/id?id={id}
export const getBedById = async (bedId) => {
  try {
    return await apiClient.get(`/bed/id?id=${encodeURIComponent(bedId)}`);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      return await apiClient.get(`/bed/${encodeURIComponent(bedId)}`);
    }
    throw err;
  }
};

// ─── 3. ADD NEW BED ───
// Method: POST, Endpoint: /bed/add (or /bed)
export const addBed = async (bedData) => {
  const payload = {
    hostel_id: Number(bedData.hostel_id),
    floor_id: Number(bedData.floor_id),
    floor_name: String(bedData.floor_name || "").trim(),
    room_no: String(bedData.room_no || "").trim(),
    bed_no: String(bedData.bed_no || "").trim(),
  };

  try {
    return await apiClient.post("/bed/add", payload);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      return await apiClient.post("/bed", payload);
    }
    throw err;
  }
};

// ─── 4. UPDATE BED BY ID ───
// Method: PUT, Endpoint: /bed/id?id={id}
export const updateBed = async (bedId, bedData) => {
  const payload = {
    hostel_id: Number(bedData.hostel_id),
    floor_id: Number(bedData.floor_id),
    floor_name: String(bedData.floor_name || "").trim(),
    room_no: String(bedData.room_no || "").trim(),
    bed_no: String(bedData.bed_no || "").trim(),
  };

  try {
    return await apiClient.put(`/bed/id?id=${encodeURIComponent(bedId)}`, payload);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      return await apiClient.put(`/bed/${encodeURIComponent(bedId)}`, payload);
    }
    throw err;
  }
};

// ─── 5. DELETE BED BY ID ───
// Method: DELETE, Endpoint: /bed/id?id={id}
export const deleteBed = async (bedId) => {
  try {
    return await apiClient.delete(`/bed/id?id=${encodeURIComponent(bedId)}`);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      return await apiClient.delete(`/bed/${encodeURIComponent(bedId)}`);
    }
    throw err;
  }
};

// ─── CONSTANTS: ROOMS (R1-R10) & BEDS (B1-B3) ───
export const ROOMS_LIST = [
  "R1",
  "R2",
  "R3",
  "R4",
  "R5",
  "R6",
  "R7",
  "R8",
  "R9",
  "R10",
];

export const BEDS_LIST = ["B1", "B2", "B3"];

// ─── HELPER: FETCH FLOORS FOR DROPDOWN (10 Floors for Campus Next) ───
export const getFloorsList = async () => {
  const defaultFloors = [
    { id: 1, floor_id: 1, floor_no: 1, floor_name: "First Floor", hostel_id: 1 },
    { id: 2, floor_id: 2, floor_no: 2, floor_name: "Second Floor", hostel_id: 1 },
    { id: 3, floor_id: 3, floor_no: 3, floor_name: "Third Floor", hostel_id: 1 },
    { id: 4, floor_id: 4, floor_no: 4, floor_name: "Fourth Floor", hostel_id: 1 },
    { id: 5, floor_id: 5, floor_no: 5, floor_name: "Fifth Floor", hostel_id: 1 },
    { id: 6, floor_id: 6, floor_no: 6, floor_name: "Sixth Floor", hostel_id: 1 },
    { id: 7, floor_id: 7, floor_no: 7, floor_name: "Seventh Floor", hostel_id: 1 },
    { id: 8, floor_id: 8, floor_no: 8, floor_name: "Eighth Floor", hostel_id: 1 },
    { id: 9, floor_id: 9, floor_no: 9, floor_name: "Ninth Floor", hostel_id: 1 },
    { id: 10, floor_id: 10, floor_no: 10, floor_name: "Tenth Floor", hostel_id: 1 },
  ];

  try {
    const res = await getAllFloors();
    let dbFloors = [];
    if (res && res.data) {
      if (Array.isArray(res.data.data)) {
        dbFloors = res.data.data;
      } else if (Array.isArray(res.data)) {
        dbFloors = res.data;
      }
    }
    if (Array.isArray(dbFloors) && dbFloors.length > 0) {
      return defaultFloors.map((df) => {
        const match = dbFloors.find(
          (dbf) =>
            (Number(dbf.hostel_id) === 1 || !dbf.hostel_id) &&
            (Number(dbf.floor_no) === df.floor_no ||
              String(dbf.floor_name).toLowerCase().trim() === df.floor_name.toLowerCase().trim() ||
              Number(dbf.id) === df.id)
        );
        if (match) {
          return {
            ...df,
            id: match.id || df.id,
            floor_id: match.id || df.id,
            floor_name: match.floor_name || df.floor_name,
            hostel_id: 1,
          };
        }
        return df;
      });
    }
  } catch (err) {
    console.warn("Floor API notice:", err.message);
  }

  return defaultFloors;
};

// ─── HELPER: FETCH HOSTELS FOR DROPDOWN (Campus Next) ───
export const getHostelsList = async () => {
  return [
    {
      id: 1,
      hostel_id: 1,
      name: "Campus Next",
      hostel_name: "Campus Next",
    },
  ];
};

export default {
  getAllBeds,
  getBedById,
  addBed,
  updateBed,
  deleteBed,
  getHostelsList,
  getFloorsList,
  ROOMS_LIST,
  BEDS_LIST,
};





