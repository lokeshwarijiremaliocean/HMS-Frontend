import { useState, useEffect } from "react";
import { MdAddCircleOutline, MdRefresh, MdAdd } from "react-icons/md";
import { addBed, getHostelsList, getFloorsList } from "../../api/bedApi";

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

  // Fetch hostels and floors on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [hostelData, floorData] = await Promise.all([
          getHostelsList(),
          getFloorsList(),
        ]);
        if (Array.isArray(hostelData) && hostelData.length > 0) {
          setHostels(hostelData);
        }
        if (Array.isArray(floorData) && floorData.length > 0) {
          setFloors(floorData);
        }
      } catch (err) {
        console.warn("Dropdown options load notice:", err.message);
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-populate floor_name when floor_id is chosen if matched in floor list
      if (name === "floor_id") {
        const selectedFloor = floors.find(
          (f) => String(f.id || f.floor_id) === String(value)
        );
        if (selectedFloor) {
          updated.floor_name =
            selectedFloor.name ||
            selectedFloor.floor_name ||
            `Floor ${selectedFloor.floor_number || value}`;
        } else if (value && !prev.floor_name) {
          updated.floor_name = `Floor ${value}`;
        }
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
      errors.hostel_id = "Hostel is required";
    }
    if (!formData.floor_id && formData.floor_id !== 0) {
      errors.floor_id = "Floor is required";
    }
    if (!formData.floor_name.trim()) {
      errors.floor_name = "Floor Name is required";
    }
    if (!formData.room_no.trim()) {
      errors.room_no = "Room Number is required";
    }
    if (!formData.bed_no.trim()) {
      errors.bed_no = "Bed Number is required";
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
      const res = await addBed(formData);
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
          onBedAdded(res.data?.data || res.data || formData);
        }
        setFormData(initialForm);
        setFormErrors({});
      } else {
        if (showToast) {
          showToast("error", res.data?.message || "Failed to add bed");
        }
      }
    } catch (err) {
      console.error("Add Bed Error:", err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to add bed";
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
          {/* 1. Hostel */}
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
              {hostels.length > 0 ? (
                hostels.map((h, i) => (
                  <option key={h.id || i} value={h.id || i + 1}>
                    {h.name || h.hostel_name || `Hostel ${h.id || i + 1}`}
                  </option>
                ))
              ) : (
                <>
                  <option value="1">Hostel 1 (Main Campus)</option>
                  <option value="2">Hostel 2 (North Block)</option>
                </>
              )}
            </select>
            {formErrors.hostel_id && (
              <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                {formErrors.hostel_id}
              </span>
            )}
          </div>

          {/* 2. Floor */}
          <div className="bm-field-group">
            <label htmlFor="floor_id">
              Floor <span>*</span>
            </label>
            <select
              id="floor_id"
              name="floor_id"
              value={formData.floor_id}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select Floor</option>
              {floors.length > 0 ? (
                floors.map((f, i) => (
                  <option key={f.id || f.floor_id || i} value={f.id || f.floor_id || i + 1}>
                    {f.name || f.floor_name || `Floor ${f.floor_number || f.floor_id || i + 1}`}
                  </option>
                ))
              ) : (
                <>
                  <option value="1">Floor 1</option>
                  <option value="2">Floor 2</option>
                  <option value="3">Floor 3</option>
                  <option value="4">Floor 4</option>
                  <option value="5">Floor 5</option>
                </>
              )}
            </select>
            {formErrors.floor_id && (
              <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                {formErrors.floor_id}
              </span>
            )}
          </div>

          {/* 3. Floor Name */}
          <div className="bm-field-group full-width">
            <label htmlFor="floor_name">
              Floor Name <span>*</span>
            </label>
            <input
              type="text"
              id="floor_name"
              name="floor_name"
              placeholder="Enter floor name"
              value={formData.floor_name}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.floor_name && (
              <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                {formErrors.floor_name}
              </span>
            )}
          </div>

          {/* 4. Room No. */}
          <div className="bm-field-group">
            <label htmlFor="room_no">
              Room No. <span>*</span>
            </label>
            <input
              type="text"
              id="room_no"
              name="room_no"
              placeholder="Enter room number"
              value={formData.room_no}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.room_no && (
              <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                {formErrors.room_no}
              </span>
            )}
          </div>

          {/* 5. Bed No. */}
          <div className="bm-field-group">
            <label htmlFor="bed_no">
              Bed No. <span>*</span>
            </label>
            <input
              type="text"
              id="bed_no"
              name="bed_no"
              placeholder="Enter bed number"
              value={formData.bed_no}
              onChange={handleChange}
              disabled={loading}
            />
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
