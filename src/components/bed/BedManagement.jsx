import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";

import BedStats from "./BedStats";
import BedTabs from "./BedTabs";
import AllBeds from "./AllBeds";
import AddBed from "./AddBed";
import GetBedById from "./GetBedById";
import UpdateBed from "./UpdateBed";
import DeleteBed from "./DeleteBed";
import BedToast from "./BedToast";

import { getAllBeds } from "../../api/bedApi";
import "../../styles/bedManagement.css";

function BedManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBedId, setSelectedBedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Real backend bed data - starts EMPTY (ZERO hardcoded data)
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch all beds from backend API
  const fetchAllBeds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllBeds();
      if (res && res.data) {
        const list = res.data.data || res.data;
        if (Array.isArray(list)) {
          setBeds(list);
        } else {
          setBeds([]);
        }
      } else {
        setBeds([]);
      }
    } catch (err) {
      console.warn("Backend beds fetch notice (empty initial state):", err.message);
      setBeds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBeds();
  }, [fetchAllBeds]);

  // Compute 5 Real-Time Statistics dynamically from API response (or 0 when empty)
  const stats = useMemo(() => {
    const totalBeds = beds.length;
    let occupiedBeds = 0;
    const roomSet = new Set();

    beds.forEach((b) => {
      const isOccupied =
        b.is_occupied ||
        b.status?.toLowerCase() === "occupied" ||
        b.occupied === true;
      if (isOccupied) occupiedBeds++;

      const roomKey = b.room_no || b.room_number || b.room_id;
      if (roomKey) roomSet.add(String(roomKey));
    });

    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const totalRooms = roomSet.size;
    const totalCapacity = totalBeds;

    return {
      totalBeds,
      availableBeds,
      occupiedBeds,
      totalRooms,
      totalCapacity,
    };
  }, [beds]);

  // Handle Tab Navigation with state reset
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedBedId(null);
  };

  // Cross-view row action handlers from AllBeds table
  const handleSelectView = (bedId) => {
    setSelectedBedId(bedId);
    setActiveTab("get");
  };

  const handleSelectEdit = (bedId) => {
    setSelectedBedId(bedId);
    setActiveTab("update");
  };

  const handleSelectDelete = (bedId) => {
    setSelectedBedId(bedId);
    setActiveTab("delete");
  };

  // Callback when a bed is added
  const handleBedAdded = (newBed) => {
    fetchAllBeds();
  };

  // Callback when a bed is updated
  const handleBedUpdated = (id, updatedData) => {
    fetchAllBeds();
  };

  // Callback when a bed is deleted
  const handleBedDeleted = (deletedId) => {
    setBeds((prev) =>
      prev.filter(
        (b) =>
          String(b.id || b.bed_id) !== String(deletedId) &&
          String(b.bed_no) !== String(deletedId)
      )
    );
    fetchAllBeds();
  };

  return (
    <div className="bed-container">
      {/* 1. FIXED SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        activePage="bedManagement"
      />

      {/* 2. MAIN LAYOUT */}
      <main className="bed-main">
        {/* Top Navbar with Breadcrumb Dashboard > Beds */}
        <Navbar
          title="Bed Management"
          breadcrumb="Dashboard > Beds"
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* 3. FIXED STATISTICS OVERVIEW CARDS (Always visible) */}
        <BedStats
          stats={stats}
          onTabChange={handleTabChange}
        />

        {/* 4. FIXED BED ACTION TAB BAR */}
        <BedTabs
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />

        {/* 5. SINGLE MAIN CONTENT AREA (Dynamically replaced by active tab state) */}
        <div className="bm-content-area">
          {activeTab === "all" && (
            <AllBeds
              beds={beds}
              loading={loading}
              onSelectView={handleSelectView}
              onSelectEdit={handleSelectEdit}
              onSelectDelete={handleSelectDelete}
            />
          )}

          {activeTab === "add" && (
            <AddBed
              onBedAdded={handleBedAdded}
              showToast={showToast}
            />
          )}

          {activeTab === "get" && (
            <GetBedById
              initialBedId={selectedBedId}
              onSelectEdit={handleSelectEdit}
              onSelectDelete={handleSelectDelete}
              showToast={showToast}
            />
          )}

          {activeTab === "update" && (
            <UpdateBed
              initialBedId={selectedBedId}
              onBedUpdated={handleBedUpdated}
              showToast={showToast}
            />
          )}

          {activeTab === "delete" && (
            <DeleteBed
              initialBedId={selectedBedId}
              onBedDeleted={handleBedDeleted}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Toast Notification Container */}
      <BedToast toast={toast} onClose={closeToast} />
    </div>
  );
}

export default BedManagement;
