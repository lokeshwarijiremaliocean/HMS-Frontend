import { useState } from "react";
import { MdSearch, MdContentPasteSearch } from "react-icons/md";
import { getRoomById } from "../../api/roomApi";

function GetRoomById({ rooms }) {
  const [searchId, setSearchId] = useState("");
  const [roomDetails, setRoomDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setRoomDetails(null);
    setSearched(true);

    try {
      const res = await getRoomById(searchId);
      if (res.data && (res.data.data || res.data.room_no || res.data.id)) {
        const item = res.data.data || res.data;
        setRoomDetails({
          id: item.id || searchId,
          floor: item.floor_name || item.floor || `Floor ${item.floor_id || item.floor_no || 1}`,
          roomNo: String(item.room_no || item.roomNo || item.id),
          totalBeds: item.total_beds || item.totalBeds || 3,
          occupiedBeds: item.occupied_beds || item.occupiedBeds || 0,
          availableBeds: item.available_beds || item.availableBeds || 3,
        });
      } else {
        // Fallback to local rooms state search by id or roomNo
        findLocalRoom(searchId);
      }
    } catch {
      findLocalRoom(searchId);
    } finally {
      setLoading(false);
    }
  };

  const findLocalRoom = (query) => {
    const found = rooms.find(
      (r) => String(r.id) === String(query) || String(r.roomNo) === String(query)
    );
    if (found) {
      setRoomDetails(found);
      setErrorMsg("");
    } else {
      setRoomDetails(null);
      setErrorMsg("Room not found");
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
