import { useState, useEffect } from "react";
import {
  MdEdit,
  MdApartment,
  MdHotel,
  MdTag,
  MdCheckCircle,
  MdPerson,
  MdSearch,
} from "react-icons/md";

function UpdateFloor({ floors = [], initialFloorId = null, onFloorUpdated }) {
  const [selectedId, setSelectedId] = useState(initialFloorId || "");
  const [formData, setFormData] = useState({
    hostel_id: "",
    floor_no: "",
    floor_name: "",
    is_active: "true",
    created_by: "",
  });

  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (selectedId && floors.length > 0) {
      const found = floors.find(
        (f) => String(f.id) === String(selectedId) || String(f.floor_no) === String(selectedId)
      );
      if (found) {
        setFormData({
          hostel_id: found.hostel_id || "101",
          floor_no: found.floor_no !== undefined ? found.floor_no : "",
          floor_name: found.floor_name || "",
          is_active: found.is_active ? "true" : "false",
          created_by: found.created_by || "Admin",
        });
      }
    }
  }, [selectedId, floors]);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    setSelectedId(val);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedId) {
      alert("Please select a floor to update.");
      return;
    }

    const updatedFloor = {
      id: parseInt(selectedId, 10),
      hostel_id: parseInt(formData.hostel_id || "101", 10),
      floor_no: parseInt(formData.floor_no || "0", 10),
      floor_name: formData.floor_name.trim(),
      is_active: formData.is_active === true || formData.is_active === "true",
      created_by: formData.created_by || "Admin",
    };

    if (onFloorUpdated) {
      onFloorUpdated(updatedFloor);
    }

    setToastMessage(`Floor "${updatedFloor.floor_name}" updated successfully!`);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  return (
    <div className="fm-main-card">
      {/* Page Header */}
      <div className="fm-card-header">
        <div className="fm-card-title-group">
          <div className="fm-icon-badge blue">
            <MdEdit />
          </div>
          <div>
            <h3>Update Floor</h3>
            <p>Modify floor configurations and settings</p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fm-toast-alert success">
          <MdCheckCircle style={{ fontSize: "20px" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Select Floor to edit */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ fontWeight: 600, fontSize: "14px", color: "#334155", display: "block", marginBottom: "8px" }}>
          Select Floor to Edit
        </label>
        <div className="fm-input-wrapper">
          <MdSearch />
          <select
            className="fm-select"
            value={selectedId}
            onChange={handleSelectChange}
            style={{ width: "100%" }}
          >
            <option value="">-- Select a Floor --</option>
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.floor_name} (Floor #{f.floor_no}) - Hostel {f.hostel_id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form */}
      {selectedId ? (
        <form onSubmit={handleSubmit}>
          <div className="fm-form-grid">
            {/* Hostel ID */}
            <div className="fm-form-group">
              <label htmlFor="update-hostel-id">Hostel ID</label>
              <div className="fm-input-wrapper">
                <MdHotel />
                <input
                  id="update-hostel-id"
                  type="number"
                  name="hostel_id"
                  className="fm-input"
                  value={formData.hostel_id}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Floor No */}
            <div className="fm-form-group">
              <label htmlFor="update-floor-no">Floor No.</label>
              <div className="fm-input-wrapper">
                <MdTag />
                <input
                  id="update-floor-no"
                  type="number"
                  name="floor_no"
                  className="fm-input"
                  value={formData.floor_no}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Floor Name */}
            <div className="fm-form-group">
              <label htmlFor="update-floor-name">Floor Name</label>
              <div className="fm-input-wrapper">
                <MdApartment />
                <input
                  id="update-floor-name"
                  type="text"
                  name="floor_name"
                  className="fm-input"
                  value={formData.floor_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Created By */}
            <div className="fm-form-group">
              <label htmlFor="update-created-by">Created By</label>
              <div className="fm-input-wrapper">
                <MdPerson />
                <input
                  id="update-created-by"
                  type="text"
                  name="created_by"
                  className="fm-input"
                  value={formData.created_by}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Status */}
            <div className="fm-form-group">
              <label htmlFor="update-status">Status</label>
              <select
                id="update-status"
                name="is_active"
                className="fm-select"
                value={formData.is_active}
                onChange={handleChange}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="fm-form-actions">
            <button
              type="submit"
              className="fm-btn-search"
            >
              <MdEdit />
              <span>Update Floor</span>
            </button>
          </div>
        </form>
      ) : (
        <p style={{ color: "#64748b", fontStyle: "italic" }}>
          Please choose a floor from the dropdown above to edit its details.
        </p>
      )}
    </div>
  );
}

export default UpdateFloor;
