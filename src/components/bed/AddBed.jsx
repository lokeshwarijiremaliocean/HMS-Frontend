import { useState, useEffect, useMemo } from "react";
import { MdAddCircleOutline, MdRefresh, MdAdd } from "react-icons/md";
import {
  addBed,
  getHostelsList,
  getFloorsList,
  ROOMS_LIST,
  BEDS_LIST,
} from "../../api/bedApi";

function AddBed({ onBedAdded, showToast }) {
  const initialForm = {
    hostel_id: "",
    floor_id: "",
    floor_name: "",
    room_no: "",
    bed_no: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [hostels, setHostels] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch real hostels (Campus Next) and floors (10 Floors) on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const floorData = await getFloorsList();
        const activeFloors = Array.isArray(floorData) ? floorData : [];
        setFloors(activeFloors);

        const hostelData = await getHostelsList();
        if (Array.isArray(hostelData) && hostelData.length > 0) {
          setHostels(hostelData);
        }
      } catch (err) {
        console.error("Dropdown options load notice:", err);
      }
    };
    fetchDropdownData();
  }, []);

  // Filter floors belonging ONLY to the selected hostel
  const availableFloors = useMemo(() => {
    if (!formData.hostel_id) return [];
    return floors.filter(
      (f) => String(f.hostel_id) === String(formData.hostel_id)
    );
  }, [floors, formData.hostel_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // 1. When Hostel changes:
      // Reset Floor, Room, Bed
      if (name === "hostel_id") {
        updated.hostel_id = value ? Number(value) : "";
        updated.floor_id = "";
        updated.floor_name = "";
        updated.room_no = "";
        updated.bed_no = "";
      }

      // 2. When Floor changes:
      // Store numeric floor_id and floor_name; Reset Room, Bed
      if (name === "floor_id") {
        const selectedFloor = availableFloors.find(
          (f) => String(f.id ?? f.floor_id) === String(value)
        );
        if (selectedFloor) {
          updated.floor_id = Number(selectedFloor.id ?? selectedFloor.floor_id);
          updated.floor_name = String(
            selectedFloor.floor_name ||
            selectedFloor.name ||
            `Floor ${selectedFloor.floor_no || selectedFloor.id}`
          );
        } else {
          updated.floor_id = "";
          updated.floor_name = "";
        }
        updated.room_no = "";
        updated.bed_no = "";
      }

      // 3. When Room changes:
      // Reset Bed
      if (name === "room_no") {
        updated.room_no = value;
        updated.bed_no = "";
      }

      // 4. When Bed changes:
      if (name === "bed_no") {
        updated.bed_no = value;
      }

      return updated;
    });

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.hostel_id && formData.hostel_id !== 0) {
      errors.hostel_id = "Please select a hostel";
    }
    if (!formData.floor_id && formData.floor_id !== 0) {
      errors.floor_id = "Please select a floor";
    }
    if (!formData.room_no) {
      errors.room_no = "Please select a room";
    }
    if (!formData.bed_no) {
      errors.bed_no = "Please select a bed";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (showToast) {
        showToast("error", "Please fill in all required fields.");
      }
      return;
    }

    setLoading(true);
    try {
      const payload = {
        hostel_id: Number(formData.hostel_id),
        floor_id: Number(formData.floor_id),
        floor_name: String(formData.floor_name),
        room_no: String(formData.room_no).trim(),
        bed_no: String(formData.bed_no).trim(),
      };

      const res = await addBed(payload);

      if (res.data && res.data.success === false) {
        if (showToast) {
          showToast("error", res.data.message || "Failed to add bed");
        }
        return;
      }

      const isSuccess =
        res.status === 200 ||
        res.status === 201 ||
        res.data?.success ||
        res.data?.id;

      if (isSuccess) {
        if (showToast) {
          showToast(
            "success",
            res.data?.message || "Bed added successfully"
          );
        }
        if (onBedAdded) {
          onBedAdded(res.data?.data || res.data || payload);
        }
        setFormData(initialForm);
        setFormErrors({});
      } else {
        if (showToast) {
          showToast("error", res.data?.message || "Failed to add bed");
        }
      }
    } catch (err) {
      console.error("Add Bed API Error:", err.response?.data || err);
      let errMsg = "Failed to add bed";
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d.message === "string" && d.message.trim()) {
          errMsg = d.message;
        } else if (typeof d.detail === "string" && d.detail.trim()) {
          errMsg = d.detail;
        } else if (Array.isArray(d.detail) && d.detail.length > 0) {
          errMsg = d.detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(", ");
        }
      } else if (err.message) {
        errMsg = err.message;
      }
      if (showToast) {
        showToast("error", errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setFormErrors({});
  };

  return (
    <div className="bm-main-card">
      {/* Header */}
      <div className="bm-form-header">
        <div className="icon-bg orange">
          <MdAddCircleOutline />
        </div>
        <div>
          <h3>Add New Bed</h3>
          <p className="bm-form-subtitle-inline">
            Enter bed details to add a new bed
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bm-full-form">
        <div className="bm-form-grid">
          {/* 1. Hostel Dropdown */}
          <div className="bm-field-group">
            <label htmlFor="hostel_id">
              Hostel <span>*</span>
            </label>
            <select
              id="hostel_id"
              name="hostel_id"
              value={formData.hostel_id}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select Hostel</option>
              {hostels.map((h) => {
                const hId = h.id !== undefined && h.id !== null ? h.id : h.hostel_id || 1;
                const hLabel = h.name || h.hostel_name || "Campus Next";
                return (
                  <option key={hId} value={hId}>
                    {hLabel}
                  </option>
                );
              })}
            </select>
            {formErrors.hostel_id && (
              <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                {formErrors.hostel_id}
              </span>
            )}
          </div>

          {/* 2. Floor Dropdown (Disabled until Hostel is selected) */}
          <div className="bm-field-group">
            <label htmlFor="floor_id">
              Floor <span>*</span>
            </label>
            <select
              id="floor_id"
              name="floor_id"
              value={formData.floor_id}
              onChange={handleChange}
              disabled={!formData.hostel_id || loading}
            >
              <option value="">Select Floor</option>
              {availableFloors.map((f) => {
                const fId = f.id !== undefined && f.id !== null ? f.id : f.floor_id;
                const fLabel = f.floor_name || f.name || `Floor ${f.floor_no || fId}`;
                return (
                  <option key={fId} value={fId}>
                    {fLabel}
                  </option>
                );
              })}
            </select>
            {formErrors.floor_id && (
              <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                {formErrors.floor_id}
              </span>
            )}
          </div>

          {/* 3. Room No. Dropdown (Disabled until Floor is selected) */}
          <div className="bm-field-group">
            <label htmlFor="room_no">
              Room No. <span>*</span>
            </label>
            <select
              id="room_no"
              name="room_no"
              value={formData.room_no}
              onChange={handleChange}
              disabled={!formData.floor_id || loading}
            >
              <option value="">Select Room</option>
              {ROOMS_LIST.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {formErrors.room_no && (
              <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                {formErrors.room_no}
              </span>
            )}
          </div>

          {/* 4. Bed No. Dropdown (Disabled until Room is selected) */}
          <div className="bm-field-group">
            <label htmlFor="bed_no">
              Bed No. <span>*</span>
            </label>
            <select
              id="bed_no"
              name="bed_no"
              value={formData.bed_no}
              onChange={handleChange}
              disabled={!formData.room_no || loading}
            >
              <option value="">Select Bed</option>
              {BEDS_LIST.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {formErrors.bed_no && (
              <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                {formErrors.bed_no}
              </span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="bm-form-actions-row">
          <button
            type="submit"
            className="bm-btn-submit"
            disabled={loading}
          >
            <MdAdd />
            <span>{loading ? "Adding bed..." : "+ Add Bed"}</span>
          </button>
          <button
            type="button"
            className="bm-btn-reset"
            onClick={handleReset}
            disabled={loading}
          >
            <MdRefresh />
            <span>Reset</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddBed;



