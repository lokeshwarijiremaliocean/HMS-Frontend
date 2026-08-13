import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";

import FloorTabs from "./FloorTabs";
import ViewFloors from "./ViewFloors";
import SearchFloor from "./SearchFloor";
import AddFloor from "./AddFloor";
import UpdateFloor from "./UpdateFloor";
import DeleteFloor from "./DeleteFloor";
import FloorDetailsModal from "./FloorDetailsModal";

import { getAllFloors } from "../../api/floorApi";
import { getAuthToken, getApiErrorMessage } from "../../api/axiosInstance";
import "../../styles/floorManagement.css";

function FloorManagement() {
  const location = useLocation();
  const initialTab = location.state?.tab || "view";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Backend state
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // Edit / Delete Floor state
  const [editingFloorId, setEditingFloorId] = useState("");
  const [deletingFloorId, setDeletingFloorId] = useState("");

  // Details Modal state
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [modalEditMode, setModalEditMode] = useState(false);

  // Fetch real floors from backend
  const fetchFloors = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setFetchError("No authentication token found. Please log in from the home screen to access floor management.");
      setFloors([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError("");
    try {
      const response = await getAllFloors();
      if (response.data && Array.isArray(response.data.data)) {
        setFloors(response.data.data);
      } else {
        setFloors([]);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // 404 with "No floors found." is normal when database has no floors yet
        setFloors([]);
      } else {
        console.error("Error fetching floors:", err);
        setFetchError(getApiErrorMessage(err, "Failed to load floor records."));
        setFloors([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFloors();
  }, [fetchFloors]);

  // Sync tab with location state if changed
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  const handleSelectView = (floor) => {
    setSelectedFloor(floor);
    setModalEditMode(false);
  };

  const handleSelectEdit = (floor) => {
    setEditingFloorId(floor.id);
    setActiveTab("update");
  };

  const handleSelectDelete = (floor) => {
    setDeletingFloorId(floor.id);
    setActiveTab("delete");
  };

  const handleCloseModal = () => {
    setSelectedFloor(null);
    setModalEditMode(false);
  };

  const handleFloorAdded = async () => {
    await fetchFloors();
    setActiveTab("view");
  };

  const handleFloorUpdated = async () => {
    await fetchFloors();
  };

  const handleFloorDeleted = async () => {
    await fetchFloors();
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
            loading={loading}
            errorMessage={fetchError}
            onSelectView={handleSelectView}
            onSelectEdit={handleSelectEdit}
            onSelectDelete={handleSelectDelete}
            onRefresh={fetchFloors}
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

        {activeTab === "update" && (
          <UpdateFloor
            floors={floors}
            initialFloorId={editingFloorId}
            onFloorUpdated={handleFloorUpdated}
          />
        )}

        {activeTab === "delete" && (
          <DeleteFloor
            floors={floors}
            initialFloorId={deletingFloorId}
            onFloorDeleted={handleFloorDeleted}
          />
        )}
      </main>

      {/* Floor Details Modal */}
      {selectedFloor && (
        <FloorDetailsModal
          floor={selectedFloor}
          initialEditMode={modalEditMode}
          onClose={handleCloseModal}
          onFloorUpdated={handleFloorUpdated}
        />
      )}
    </div>
  );
}

export default FloorManagement;
