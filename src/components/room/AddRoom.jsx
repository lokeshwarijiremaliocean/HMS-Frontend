import { useState } from "react";
import { MdAddCircleOutline, MdAdd, MdRefresh } from "react-icons/md";
import { addRoom } from "../../api/roomApi";
import { getApiErrorMessage } from "../../api/axiosInstance";

function AddRoom({ onRoomAdded }) {
  const [formData, setFormData] = useState({
    floor: "",
    roomNo: "",
    totalBeds: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReset = () => {
    setFormData({ floor: "", roomNo: "", totalBeds: "" });
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.floor || !formData.roomNo || !formData.totalBeds) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
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

      const res = await addRoom(payload);

      if (res.data && (res.data.success || res.data.message)) {
        setMessage({ type: "success", text: res.data.message || "Room added successfully" });
      } else {
        setMessage({ type: "success", text: "Room added successfully" });
      }

      if (onRoomAdded) {
        onRoomAdded();
      }

      setFormData({ floor: "", roomNo: "", totalBeds: "" });
    } catch (err) {
      console.warn("Add Room Error:", err);
      setMessage({
        type: "error",
        text: getApiErrorMessage(err, "Failed to add room."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-main-card">
      <div className="rm-form-header">
        <div className="icon-bg orange">
          <MdAddCircleOutline />
        </div>
        <div>
          <h3>Add New Room</h3>
          <p className="rm-form-subtitle-inline">Add a new room to the system</p>
        </div>
      </div>

      {message.text && (
        <div className={`rm-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rm-full-form">
        <div className="rm-field-group">
          <label>
            Floor <span>*</span>
          </label>
          <select
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            required
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
            onChange={handleChange}
            required
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
            onChange={handleChange}
            required
          />
        </div>

        <div className="rm-form-actions-row">
          <button type="submit" className="rm-btn-submit" disabled={loading}>
            <MdAdd /> {loading ? "Adding..." : "Add Room"}
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

export default AddRoom;
