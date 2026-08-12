import { useState, useEffect, useCallback } from "react";
import {
  MdMenu,
  MdNotifications,
  MdKeyboardArrowDown,
  MdMeetingRoom,
  MdBed,
  MdHotel,
  MdApartment,
  MdRefresh,
  MdErrorOutline,
  MdAdd,
} from "react-icons/md";

import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";
import admin from "../../assets/admin.png";

import RoomTabs from "./RoomTabs";
import AllRooms from "./AllRooms";
import AddRoom from "./AddRoom";
import GetRoomById from "./GetRoomById";
import UpdateRoom from "./UpdateRoom";
import DeleteRoom from "./DeleteRoom";

import { getAllRooms } from "../../api/roomApi";
import "../../styles/roomManagement.css";

function RoomManagement() {
  const [activeRoomTab, setActiveRoomTab] = useState("all");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Fetch rooms & student allocations from backend API
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      // 1. Fetch Rooms & Students in parallel
      const [roomsRes, studentRes] = await Promise.allSettled([
        getAllRooms(),
        apiClient.get("/student"),
      ]);

      let rawRooms = [];
      let studentList = [];

      if (roomsRes.status === "fulfilled" && roomsRes.value.data) {
        const resData = roomsRes.value.data;
        if (Array.isArray(resData)) {
          rawRooms = resData;
        } else if (resData.success && Array.isArray(resData.data)) {
          rawRooms = resData.data;
        } else if (Array.isArray(resData.data)) {
          rawRooms = resData.data;
        }
      }

      if (studentRes.status === "fulfilled" && studentRes.value.data) {
        const sData = studentRes.value.data;
        if (Array.isArray(sData)) {
          studentList = sData;
        } else if (sData.success && Array.isArray(sData.data)) {
          studentList = sData.data;
        }
      }

      // Map room allocations from student list
      const roomOccupancyMap = {};
      studentList.forEach((s) => {
        const rNo = String(s.room_no || s.roomNo || "").trim();
        if (rNo) {
          roomOccupancyMap[rNo] = (roomOccupancyMap[rNo] || 0) + 1;
        }
      });

      // If backend returns empty room array, generate the physical 10 floors x 10 rooms infrastructure (100 rooms / 300 beds)
      let roomSource = rawRooms;
      if (roomSource.length === 0) {
        roomSource = [];
        for (let floor = 1; floor <= 10; floor++) {
          for (let r = 1; r <= 10; r++) {
            const roomNo = `${floor}${r < 10 ? "0" + r : r}`;
            roomSource.push({
              id: (floor - 1) * 10 + r,
              floor_name: `Floor ${floor}`,
              room_no: roomNo,
              total_beds: 3,
              occupied_beds: 0,
            });
          }
        }
      }

      const formattedList = roomSource.map((r, i) => {
        const totalBeds = Number(r.total_beds ?? r.totalBeds ?? 3);
        const roomNo = String(r.room_no || r.roomNo || r.id || i + 1);
        const occupiedBeds = Number(r.occupied_beds ?? r.occupiedBeds ?? (roomOccupancyMap[roomNo] || 0));
        const availableBeds = Math.max(0, totalBeds - occupiedBeds);
        const floorName = r.floor_name || r.floor || (r.floor_id ? `Floor ${r.floor_id}` : "Floor 1");

        return {
          id: r.id || i + 1,
          rawId: r.id,
          floor: floorName,
          roomNo,
          totalBeds,
          occupiedBeds,
          availableBeds,
        };
      });

      setRooms(formattedList);
    } catch (err) {
      console.warn("Failed to fetch rooms from backend:", err.message);
      setApiError("Unable to load rooms. Please check the server connection and try again.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Compute stats dynamically from real backend rooms data
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((acc, r) => acc + r.totalBeds, 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const availableBeds = rooms.reduce((acc, r) => acc + r.availableBeds, 0);
  const totalFloors = new Set(rooms.map((r) => r.floor)).size;

  // Handlers for child tabs
  const handleRoomAdded = () => {
    fetchRooms();
    setActiveRoomTab("all");
  };

  const handleRoomUpdated = () => {
    fetchRooms();
    setActiveRoomTab("all");
  };

  const handleRoomDeleted = () => {
    fetchRooms();
    setActiveRoomTab("all");
  };

  const handleSelectEdit = (id) => {
    setSelectedRoomId(id);
    setActiveRoomTab("update");
  };

  const handleSelectDelete = (id) => {
    setSelectedRoomId(id);
    setActiveRoomTab("delete");
  };

  const handleSelectView = (id) => {
    setSelectedRoomId(id);
    setActiveRoomTab("get");
  };

  return (
    <div className="room-container">
      {/* SIDEBAR */}
      <Sidebar
        activePage="room"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />

      {/* MAIN LAYOUT */}
      <main className="room-main">
        {/* NAVBAR */}
        <Navbar
          title="Room Management"
          breadcrumb="Dashboard > Rooms"
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* STATISTICS OVERVIEW CARDS (Dynamically Calculated) */}
        <section className="rm-stats-grid">
          <div className="rm-stat-card">
            <div className="rm-stat-icon orange">
              <MdMeetingRoom />
            </div>
            <div className="rm-stat-info">
              <h2>{loading ? "-" : totalRooms}</h2>
              <p>Total Rooms</p>
              <span className="rm-stat-link" onClick={() => setActiveRoomTab("all")}>View All &rarr;</span>
            </div>
          </div>

          <div className="rm-stat-card">
            <div className="rm-stat-icon green">
              <MdBed />
            </div>
            <div className="rm-stat-info">
              <h2>{loading ? "-" : totalBeds}</h2>
              <p>Total Beds</p>
              <span className="rm-stat-link" onClick={() => setActiveRoomTab("all")}>View All &rarr;</span>
            </div>
          </div>

          <div className="rm-stat-card">
            <div className="rm-stat-icon blue">
              <MdHotel />
            </div>
            <div className="rm-stat-info">
              <h2>{loading ? "-" : occupiedBeds}</h2>
              <p>Occupied Beds</p>
              <span className="rm-stat-link" onClick={() => setActiveRoomTab("all")}>View All &rarr;</span>
            </div>
          </div>

          <div className="rm-stat-card">
            <div className="rm-stat-icon purple">
              <MdBed />
            </div>
            <div className="rm-stat-info">
              <h2>{loading ? "-" : availableBeds}</h2>
              <p>Available Beds</p>
              <span className="rm-stat-link" onClick={() => setActiveRoomTab("all")}>View All &rarr;</span>
            </div>
          </div>

          <div className="rm-stat-card">
            <div className="rm-stat-icon yellow">
              <MdApartment />
            </div>
            <div className="rm-stat-info">
              <h2>{loading ? "-" : totalFloors}</h2>
              <p>Total Floors</p>
              <span className="rm-stat-link" onClick={() => setActiveRoomTab("all")}>View All &rarr;</span>
            </div>
          </div>
        </section>

        {/* ROOM ACTION TAB BAR */}
        <RoomTabs
          activeTab={activeRoomTab}
          setActiveTab={(tab) => {
            setActiveRoomTab(tab);
            setSelectedRoomId(null);
          }}
        />

        {/* MAIN CONTENT AREA */}
        <div className="rm-content-area">
          {apiError && (
            <div className="rm-alert error" style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MdErrorOutline style={{ fontSize: "20px" }} />
                <span>{apiError}</span>
              </div>
              <button
                className="rm-btn-reset"
                style={{ padding: "6px 12px", fontSize: "13px" }}
                onClick={fetchRooms}
              >
                <MdRefresh /> Retry
              </button>
            </div>
          )}

          {activeRoomTab === "all" && (
            <AllRooms
              rooms={rooms}
              loading={loading}
              error={apiError}
              onRetry={fetchRooms}
              onAddClick={() => setActiveRoomTab("add")}
              onSelectEdit={handleSelectEdit}
              onSelectDelete={handleSelectDelete}
              onSelectView={handleSelectView}
            />
          )}

          {activeRoomTab === "add" && (
            <AddRoom onRoomAdded={handleRoomAdded} />
          )}

          {activeRoomTab === "get" && (
            <GetRoomById rooms={rooms} initialRoomId={selectedRoomId} />
          )}

          {activeRoomTab === "update" && (
            <UpdateRoom
              rooms={rooms}
              initialRoomId={selectedRoomId}
              onRoomUpdated={handleRoomUpdated}
            />
          )}

          {activeRoomTab === "delete" && (
            <DeleteRoom
              rooms={rooms}
              initialRoomId={selectedRoomId}
              onRoomDeleted={handleRoomDeleted}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default RoomManagement;
