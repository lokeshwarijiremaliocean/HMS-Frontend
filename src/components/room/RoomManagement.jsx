import { useState, useEffect } from "react";
import {
  MdMenu,
  MdNotifications,
  MdKeyboardArrowDown,
  MdMeetingRoom,
  MdBed,
  MdHotel,
  MdApartment,
} from "react-icons/md";

import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";

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

  // Initial Rooms Data
  const initialRooms = [
    { id: 1, floor: "Floor 1", roomNo: "101", totalBeds: 3, occupiedBeds: 2, availableBeds: 1 },
    { id: 2, floor: "Floor 1", roomNo: "102", totalBeds: 3, occupiedBeds: 3, availableBeds: 0 },
    { id: 3, floor: "Floor 2", roomNo: "201", totalBeds: 3, occupiedBeds: 1, availableBeds: 2 },
    { id: 4, floor: "Floor 2", roomNo: "202", totalBeds: 3, occupiedBeds: 3, availableBeds: 0 },
    { id: 5, floor: "Floor 3", roomNo: "301", totalBeds: 3, occupiedBeds: 2, availableBeds: 1 },
    { id: 6, floor: "Floor 3", roomNo: "302", totalBeds: 3, occupiedBeds: 0, availableBeds: 3 },
    { id: 7, floor: "Floor 4", roomNo: "401", totalBeds: 3, occupiedBeds: 1, availableBeds: 2 },
    { id: 8, floor: "Floor 4", roomNo: "402", totalBeds: 3, occupiedBeds: 2, availableBeds: 1 },
    { id: 9, floor: "Floor 5", roomNo: "501", totalBeds: 3, occupiedBeds: 3, availableBeds: 0 },
    { id: 10, floor: "Floor 5", roomNo: "502", totalBeds: 3, occupiedBeds: 1, availableBeds: 2 },
  ];

  const [rooms, setRooms] = useState(initialRooms);

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getAllRooms();
        if (res.data && (res.data.success || Array.isArray(res.data))) {
          const list = res.data.data || res.data;
          if (Array.isArray(list) && list.length > 0) {
            setRooms(
              list.map((r, i) => ({
                id: r.id || i + 1,
                floor: r.floor_name || r.floor || `Floor ${r.floor_id || 1}`,
                roomNo: String(r.room_no || r.roomNo || r.id),
                totalBeds: r.total_beds || r.totalBeds || 3,
                occupiedBeds: r.occupied_beds || r.occupiedBeds || 0,
                availableBeds: r.available_beds || r.availableBeds || (r.total_beds || 3),
              }))
            );
          }
        }
      } catch (err) {
        console.log("Rooms data loaded locally:", err.message);
      }
    };

    fetchRooms();
  }, []);

  // Handler: Add room callback
  const handleRoomAdded = (newRoomData) => {
    const newRoom = {
      id: rooms.length + 1,
      floor: newRoomData.floor,
      roomNo: newRoomData.roomNo,
      totalBeds: newRoomData.totalBeds,
      occupiedBeds: 0,
      availableBeds: newRoomData.totalBeds,
    };
    setRooms((prev) => [...prev, newRoom]);
  };

  // Handler: Update room callback
  const handleRoomUpdated = (id, updatedData) => {
    setRooms((prev) =>
      prev.map((r) =>
        String(r.id) === String(id) || String(r.roomNo) === String(id)
          ? {
              ...r,
              floor: updatedData.floor,
              roomNo: updatedData.roomNo,
              totalBeds: updatedData.totalBeds,
              availableBeds: updatedData.totalBeds - r.occupiedBeds,
            }
          : r
      )
    );
  };

  // Handler: Delete room callback
  const handleRoomDeleted = (id) => {
    setRooms((prev) =>
      prev.filter(
        (r) => String(r.id) !== String(id) && String(r.roomNo) !== String(id)
      )
    );
  };

  // Row action handlers from AllRooms table
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
      {/* 1. FIXED SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} />

      {/* MAIN LAYOUT */}
      <main className="room-main">
        {/* Shared Navbar with 👤 Admin Profile and 🔔 Notification Bell */}
        <Navbar
          title="Room Management"
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* 3. FIXED STATISTICS OVERVIEW CARDS (Always visible) */}
        <section className="rm-stats-grid">
          <div className="rm-stat-card">
            <div className="rm-stat-icon orange">
              <MdMeetingRoom />
            </div>
            <div className="rm-stat-info">
              <h2>100</h2>
              <p>Total Rooms</p>
              <span className="rm-stat-link">View All &rarr;</span>
            </div>
          </div>

          <div className="rm-stat-card">
            <div className="rm-stat-icon green">
              <MdBed />
            </div>
            <div className="rm-stat-info">
              <h2>300</h2>
              <p>Total Beds</p>
              <span className="rm-stat-link">View All &rarr;</span>
            </div>
          </div>

          <div className="rm-stat-card">
            <div className="rm-stat-icon blue">
              <MdHotel />
            </div>
            <div className="rm-stat-info">
              <h2>83</h2>
              <p>Occupied Beds</p>
              <span className="rm-stat-link">View All &rarr;</span>
            </div>
          </div>

          <div className="rm-stat-card">
            <div className="rm-stat-icon purple">
              <MdBed />
            </div>
            <div className="rm-stat-info">
              <h2>17</h2>
              <p>Available Beds</p>
              <span className="rm-stat-link">View All &rarr;</span>
            </div>
          </div>

          <div className="rm-stat-card">
            <div className="rm-stat-icon yellow">
              <MdApartment />
            </div>
            <div className="rm-stat-info">
              <h2>10</h2>
              <p>Total Floors</p>
              <span className="rm-stat-link">View All &rarr;</span>
            </div>
          </div>
        </section>

        {/* 4. FIXED ROOM ACTION TAB BAR */}
        <RoomTabs
          activeTab={activeRoomTab}
          setActiveTab={(tab) => {
            setActiveRoomTab(tab);
            setSelectedRoomId(null);
          }}
        />

        {/* 5. SINGLE MAIN CONTENT AREA (Dynamically replaced by active tab state) */}
        <div className="rm-content-area">
          {activeRoomTab === "all" && (
            <AllRooms
              rooms={rooms}
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
