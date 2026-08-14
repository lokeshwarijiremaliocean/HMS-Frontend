import { useState, useEffect } from "react";
import { MdEdit, MdRefresh, MdSave } from "react-icons/md";
import { getRoomById, updateRoom } from "../../api/roomApi";
import { getApiErrorMessage } from "../../api/axiosInstance";

function UpdateRoom({ rooms = [], initialRoomId, onRoomUpdated }) {
  const [searchId, setSearchId] = useState(initialRoomId || "");
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [floorsList, setFloorsList] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      floor_id: i + 1,
      display_name: `F${i + 1}`,
    }))
  );

  const [formData, setFormData] = useState({
    floor: "",
    roomNo: "",
    totalBeds: "",
  });

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const res = await getAllFloors();
        let dbFloors = [];
        if (res) {
          if (Array.isArray(res)) {
            dbFloors = res;
          } else if (Array.isArray(res.data)) {
            dbFloors = res.data;
          } else if (res.data?.data && Array.isArray(res.data.data)) {
            dbFloors = res.data.data;
          }
        }
        if (Array.isArray(dbFloors) && dbFloors.length > 0) {
          const mapped = dbFloors.map((f) => {
            const realId = Number(f.id ?? f.floor_id ?? f.floor_no);
            const name = f.floor_name || `Floor ${f.floor_no || realId}`;
            return {
              floor_id: realId,
              display_name: `${name} (ID: ${realId})`,
            };
          });
          setFloorsList(mapped);
        }
      } catch (err) {
        console.warn("Notice loading floors for update room form:", err.message);
      }
    };
    fetchFloors();
  }, []);

  const handleFetch = async (e, customId) => {
    if (e) e.preventDefault();
    const idToUse = (customId || searchId || "").toString().trim();
    if (!idToUse) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await getRoomById(idToUse);
      const resData = res.data;

      if (resData && resData.success !== false && (resData.data || resData.room_no || resData.id)) {
        const item = resData.data || resData;
        setFormData({
          floor: String(item.floor_id || item.floor_no || item.floor || "1"),
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
        floor: String(found.floor_id || found.floorNo || "1"),
        roomNo: String(found.roomNo || ""),
        totalBeds: String(found.totalBeds || ""),
      });
      setFetched(true);
      setMessage({ type: "", text: "" });
    } else {
      setFetched(false);
      setMessage({ type: "error", text: `Room not found with ID "${id}"` });
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

    const bedsNum = Number(formData.totalBeds);
    if (isNaN(bedsNum) || bedsNum <= 0) {
      setMessage({ type: "error", text: "Total beds must be a positive number." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        floor_id: Number(formData.floor),
        room_no: String(formData.roomNo).trim(),
        total_beds: bedsNum,
      };

      const res = await updateRoom(searchId, payload);
      if (res.data && res.data.success === false) {
        setMessage({ type: "error", text: res.data.message || "Failed to update room" });
      } else {
        setMessage({ type: "success", text: res.data?.message || "Room updated successfully" });
        if (onRoomUpdated) {
          onRoomUpdated();
        }
      }
    } catch (err) {
      console.warn("Update Room Error:", err);
      const errMsg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail[0]?.msg
          : err.response?.data?.detail) ||
        "Failed to update room. Please check backend connection.";
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
            {floorsList.map((f) => (
              <option key={f.floor_id} value={f.floor_id}>
                {f.display_name}
              </option>
            ))}
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

