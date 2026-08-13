import { useState, useEffect } from "react";
import { MdAddCircleOutline, MdAdd, MdRefresh } from "react-icons/md";
import { addRoom } from "../../api/roomApi";
import { getAllFloors } from "../../api/floorApi";

function AddRoom({ onRoomAdded }) {
  const [formData, setFormData] = useState({
    floor: "",
    roomNo: "",
    totalBeds: "",
  });

  const [floorsList, setFloorsList] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      floor_id: i + 1,
      display_name: `F${i + 1}`,
    }))
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
        console.warn("Notice loading floors for room form:", err.message);
      }
    };
    fetchFloors();
  }, []);

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

      const res = await addRoom(payload);

      if (res.data && res.data.success === false) {
        setMessage({
          type: "error",
          text: res.data.message || "Failed to add room",
        });
      } else {
        setMessage({
          type: "success",
          text: res.data?.message || "Room added successfully",
        });
        setFormData({ floor: "", roomNo: "", totalBeds: "" });
        if (onRoomAdded) {
          onRoomAdded();
        }
      }
    } catch (err) {
      console.warn("Add Room Error:", err);
      let errMsg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail[0]?.msg
          : err.response?.data?.detail) ||
        "Failed to add room.";

      if (typeof errMsg === "string" && (errMsg.includes("foreign key") || errMsg.includes("room_floor_id_fkey"))) {
        errMsg = `Selected Floor ID (${formData.floor}) does not exist in the database table 'floor'. Please select an existing floor or add the floor to database first.`;
      }

      setMessage({
        type: "error",
        text: errMsg,
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
            disabled={loading}
          >
            <MdRefresh /> Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRoom;

