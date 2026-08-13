import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";

import FloorTabs from "./FloorTabs";
import ViewFloors from "./ViewFloors";
import SearchFloor from "./SearchFloor";
import AddFloor from "./AddFloor";
import FloorDetailsModal from "./FloorDetailsModal";

import "../../styles/floorManagement.css";

// Realistic frontend mock data strictly adhering to backend Floor entity fields
// (id, hostel_id, floor_no, floor_name, is_active, created_by)
const INITIAL_MOCK_FLOORS = [
  {
    id: 1,
    hostel_id: 101,
    floor_no: 0,
    floor_name: "Ground Floor",
    is_active: true,
    created_by: "Admin",
  },
  {
    id: 2,
    hostel_id: 101,
    floor_no: 1,
    floor_name: "First Floor",
    is_active: true,
    created_by: "Admin",
  },
  {
    id: 3,
    hostel_id: 101,
    floor_no: 2,
    floor_name: "Second Floor",
    is_active: true,
    created_by: "Admin",
  },
  {
    id: 4,
    hostel_id: 101,
    floor_no: 3,
    floor_name: "Third Floor",
    is_active: false,
    created_by: "Admin",
  },
  {
    id: 5,
    hostel_id: 102,
    floor_no: 1,
    floor_name: "Block A - Floor 1",
    is_active: true,
    created_by: "SuperAdmin",
  },
  {
    id: 6,
    hostel_id: 102,
    floor_no: 2,
    floor_name: "Block A - Floor 2",
    is_active: true,
    created_by: "SuperAdmin",
  },
  {
    id: 7,
    hostel_id: 103,
    floor_no: 1,
    floor_name: "Wing B - Floor 1",
    is_active: true,
    created_by: "Hostel Admin",
  },
  {
    id: 8,
    hostel_id: 103,
    floor_no: 2,
    floor_name: "Wing B - Floor 2",
    is_active: false,
    created_by: "Hostel Admin",
  },
];

function FloorManagement() {
  const location = useLocation();
  const initialTab = location.state?.tab || "view";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [floors, setFloors] = useState(INITIAL_MOCK_FLOORS);
  const [selectedFloor, setSelectedFloor] = useState(null);

  const handleSelectView = (floor) => {
    setSelectedFloor(floor);
  };

  const handleFloorAdded = (newFloor) => {
    setFloors((prev) => [newFloor, ...prev]);
  };

  return (
    <div className="floor-container">
      {/* 1. FIXED SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        activePage="floorManagement"
        activeFloorTab={activeTab}
        onSelectFloorTab={setActiveTab}
      />

      {/* 2. MAIN LAYOUT */}
      <main className="floor-main">
        {/* Top Navbar with Breadcrumb Dashboard > Floors */}
        <Navbar
          title="Floor Management"
          breadcrumb="Dashboard > Floors"
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Action Tab Bar */}
        <FloorTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Tab Content Display */}
        {(activeTab === "view" || activeTab === "all") && (
          <ViewFloors
            floors={floors}
            onSelectView={handleSelectView}
          />
        )}

        {activeTab === "search" && (
          <SearchFloor
            floors={floors}
            onSelectView={handleSelectView}
          />
        )}

        {activeTab === "add" && (
          <AddFloor
            onFloorAdded={handleFloorAdded}
          />
        )}
      </main>

      {/* Floor Details Modal */}
      {selectedFloor && (
        <FloorDetailsModal
          floor={selectedFloor}
          onClose={() => setSelectedFloor(null)}
        />
      )}
    </div>
  );
}

export default FloorManagement;
