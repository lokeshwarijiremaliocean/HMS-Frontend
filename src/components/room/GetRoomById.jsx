import { useState } from "react";
import { MdSearch, MdContentPasteSearch } from "react-icons/md";
import { getRoomById } from "../../api/roomApi";

function GetRoomById({ rooms = [] }) {
  const [searchId, setSearchId] = useState("");
  const [roomDetails, setRoomDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setRoomDetails(null);

    try {
      const res = await getRoomById(searchId.trim());
      const resData = res.data;

      if (resData && resData.success !== false && (resData.data || resData.room_no || resData.id)) {
        const item = resData.data || resData;
        const floorDisplay = item.floor_name || item.floor || (item.floor_id || item.floor_no ? `F${item.floor_id || item.floor_no}` : "F1");
        const totalBeds = Number(item.total_beds ?? item.totalBeds ?? 3);
        const occupiedBeds = Number(item.occupied_beds ?? item.occupiedBeds ?? 0);
        const availableBeds = Number(item.available_beds ?? item.availableBeds ?? Math.max(0, totalBeds - occupiedBeds));

        setRoomDetails({
          id: item.id || searchId,
          floor: floorDisplay,
          roomNo: String(item.room_no || item.roomNo || item.id),
          totalBeds,
          occupiedBeds,
          availableBeds,
        });
      } else {
        const errMsg = resData?.message || `Room with ID "${searchId}" not found.`;
        setErrorMsg(errMsg);
      }
    } catch (err) {
      console.warn("Search Room Error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        (err.response?.status === 404 ? `Room with ID "${searchId}" not found.` : "Failed to fetch room details.");
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-main-card">
      <div className="rm-form-header">
        <div className="icon-bg blue">
          <MdSearch />
        </div>
        <div>
          <h3>Get Room by ID</h3>
          <p className="rm-form-subtitle-inline">View room details</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="rm-search-id-bar">
        <div className="rm-inline-field">
          <label>
            Room ID <span>*</span>
          </label>
          <div className="rm-input-btn-group">
            <input
              type="text"
              placeholder="Enter room ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              required
            />
            <button type="submit" className="rm-btn-blue" disabled={loading}>
              <MdSearch /> {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {errorMsg && (
        <div className="rm-alert error" style={{ marginTop: "20px" }}>
          {errorMsg}
        </div>
      )}

      {/* Room Details View */}
      {roomDetails ? (
        <div className="rm-details-card">
          <h4>Room Information Details</h4>
          <div className="rm-details-grid">
            <div className="rm-detail-item">
              <span className="label">Room ID</span>
              <span className="val">{roomDetails.id}</span>
            </div>
            <div className="rm-detail-item">
              <span className="label">Floor</span>
              <span className="val">{roomDetails.floor}</span>
            </div>
            <div className="rm-detail-item">
              <span className="label">Room Number</span>
              <span className="val">{roomDetails.roomNo}</span>
            </div>
            <div className="rm-detail-item">
              <span className="label">Total Beds</span>
              <span className="val">{roomDetails.totalBeds}</span>
            </div>
            <div className="rm-detail-item">
              <span className="label">Occupied Beds</span>
              <span className="val">{roomDetails.occupiedBeds}</span>
            </div>
            <div className="rm-detail-item">
              <span className="label">Available Beds</span>
              <span className="val">{roomDetails.availableBeds}</span>
            </div>
          </div>
        </div>
      ) : (
        !errorMsg && (
          <div className="rm-empty-state-card">
            <div className="rm-empty-icon">
              <MdContentPasteSearch />
            </div>
            <h4>Room Details</h4>
            <p>Search for a room using its ID to view room information.</p>
          </div>
        )
      )}
    </div>
  );
}

export default GetRoomById;

