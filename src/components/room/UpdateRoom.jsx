import { useState, useEffect } from "react";
import { MdEdit, MdRefresh, MdSave } from "react-icons/md";
import { getRoomById, updateRoom } from "../../api/roomApi";
import { getApiErrorMessage } from "../../api/axiosInstance";

function UpdateRoom({ rooms, initialRoomId, onRoomUpdated }) {
  const [searchId, setSearchId] = useState(initialRoomId || "");
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    floor: "",
    roomNo: "",
    totalBeds: "",
  });

  const handleFetch = async (e, customId) => {
    if (e) e.preventDefault();
    const idToUse = customId || searchId;
    if (!idToUse) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await getRoomById(idToUse);
      if (res.data && (res.data.data || res.data.room_no)) {
        const item = res.data.data || res.data;
        setFormData({
          floor: item.floor_name || item.floor || `Floor ${item.floor_id || 1}`,
          roomNo: String(item.room_no || item.roomNo || ""),
          totalBeds: String(item.total_beds || item.totalBeds || ""),
        });
        setFetched(true);
      } else {
        findLocalAndSet(idToUse);
      }
    } catch {
      findLocalAndSet(idToUse);
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch if initialRoomId passed from table edit action
  useEffect(() => {
    if (initialRoomId) {
      setSearchId(initialRoomId);
      handleFetch(null, initialRoomId);
    }
  }, [initialRoomId]);

  const findLocalAndSet = (id) => {
    const found = rooms.find(
      (r) => String(r.id) === String(id) || String(r.roomNo) === String(id)
    );
    if (found) {
      setFormData({
        floor: found.floor,
        roomNo: String(found.roomNo),
        totalBeds: String(found.totalBeds),
      });
      setFetched(true);
      setMessage({ type: "", text: "" });
    } else {
      setFetched(false);
      setMessage({ type: "error", text: "Room not found with provided ID" });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReset = () => {
    setFormData({ floor: "", roomNo: "", totalBeds: "" });
    setFetched(false);
    setMessage({ type: "", text: "" });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.floor || !formData.roomNo || !formData.totalBeds) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const floorId = parseInt(formData.floor.replace(/\D/g, "") || "1", 10);
      const payload = {
        floor_id: floorId,
        room_no: formData.roomNo,
        total_beds: parseInt(formData.totalBeds, 10),
      };

      const res = await updateRoom(searchId, payload);
      if (res.data && (res.data.success || res.data.message)) {
        setMessage({ type: "success", text: res.data.message || "Room updated successfully" });
      } else {
        setMessage({ type: "success", text: "Room updated successfully" });
      }

      if (onRoomUpdated) {
        onRoomUpdated();
      }
    } catch (err) {
      console.warn("Update Room Error:", err);
      setMessage({
        type: "error",
        text: getApiErrorMessage(err, "Failed to update room."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-main-card">
      <div className="rm-form-header">
        <div className="icon-bg orange">
          <MdEdit />
        </div>
        <div>
          <h3>Update Room</h3>
          <p className="rm-form-subtitle-inline">Update room information</p>
        </div>
      </div>

      {message.text && (
        <div className={`rm-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Step 1: Room ID Fetch Section */}
      <form onSubmit={(e) => handleFetch(e, searchId)} className="rm-search-id-bar">
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
            <button type="submit" className="rm-btn-orange-outline" disabled={loading}>
              {loading ? "Fetching..." : "Fetch Room"}
            </button>
          </div>
        </div>
      </form>

      <hr className="rm-divider" />

      {/* Step 2: Populated Update Form */}
      <form onSubmit={handleUpdateSubmit} className="rm-full-form">
        <div className="rm-field-group">
          <label>
            Floor <span>*</span>
          </label>
          <select
            name="floor"
            value={formData.floor}
            onChange={handleInputChange}
            required
            disabled={!fetched}
          >
            <option value="">Select Floor</option>
            <option value="Floor 1">Floor 1</option>
            <option value="Floor 2">Floor 2</option>
            <option value="Floor 3">Floor 3</option>
            <option value="Floor 4">Floor 4</option>
            <option value="Floor 5">Floor 5</option>
          </select>
        </div>

        <div className="rm-field-group">
          <label>
            Room No. <span>*</span>
          </label>
          <input
            type="text"
            name="roomNo"
            placeholder="Enter room number"
            value={formData.roomNo}
            onChange={handleInputChange}
            required
            disabled={!fetched}
          />
        </div>

        <div className="rm-field-group">
          <label>
            Total Beds <span>*</span>
          </label>
          <input
            type="number"
            name="totalBeds"
            placeholder="Enter total beds"
            value={formData.totalBeds}
            onChange={handleInputChange}
            required
            disabled={!fetched}
          />
        </div>

        <div className="rm-form-actions-row">
          <button
            type="submit"
            className="rm-btn-submit"
            disabled={!fetched || loading}
          >
            <MdSave /> {loading ? "Updating..." : "Update Room"}
          </button>

          <button
            type="button"
            className="rm-btn-reset"
            onClick={handleReset}
          >
            <MdRefresh /> Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateRoom;
