import { useState } from "react";
import {
  MdAdd,
  MdRefresh,
  MdApartment,
  MdHotel,
  MdTag,
  MdCheckCircle,
  MdPerson,
} from "react-icons/md";

function AddFloor({ onFloorAdded }) {
  const [formData, setFormData] = useState({
    hostel_id: "101",
    floor_no: "",
    floor_name: "",
    is_active: true,
    created_by: "Admin",
  });

  const [toastMessage, setToastMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.floor_name || formData.floor_no === "") {
      alert("Please fill in the Floor No and Floor Name.");
      return;
    }

    const newFloor = {
      id: Math.floor(100 + Math.random() * 900),
      hostel_id: parseInt(formData.hostel_id || "101", 10),
      floor_no: parseInt(formData.floor_no || "0", 10),
      floor_name: formData.floor_name.trim(),
      is_active: formData.is_active === true || formData.is_active === "true",
      created_by: formData.created_by || "Admin",
    };

    if (onFloorAdded) {
      onFloorAdded(newFloor);
    }

    setToastMessage(`Floor "${newFloor.floor_name}" added successfully (UI Demo)!`);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);

    // Reset form
    setFormData({
      hostel_id: "101",
      floor_no: "",
      floor_name: "",
      is_active: true,
      created_by: "Admin",
    });
  };

  const handleReset = () => {
    setFormData({
      hostel_id: "101",
      floor_no: "",
      floor_name: "",
      is_active: true,
      created_by: "Admin",
    });
    setToastMessage("");
  };

  return (
    <div className="fm-main-card">
      {/* Page Header */}
      <div className="fm-card-header">
        <div className="fm-card-title-group">
          <div className="fm-icon-badge orange">
            <MdAdd />
          </div>
          <div>
            <h3>Add New Floor</h3>
            <p>Create and configure a new floor for the hostel</p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fm-toast-alert success">
          <MdCheckCircle style={{ fontSize: "20px" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="fm-form-grid">
          {/* Hostel ID */}
          <div className="fm-form-group">
            <label htmlFor="add-hostel-id">Hostel ID</label>
            <div className="fm-input-wrapper">
              <MdHotel />
              <input
                id="add-hostel-id"
                type="number"
                name="hostel_id"
                className="fm-input"
                placeholder="e.g. 101"
                value={formData.hostel_id}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Floor No */}
          <div className="fm-form-group">
            <label htmlFor="add-floor-no">Floor No.</label>
            <div className="fm-input-wrapper">
              <MdTag />
              <input
                id="add-floor-no"
                type="number"
                name="floor_no"
                className="fm-input"
                placeholder="e.g. 1, 2, 3..."
                value={formData.floor_no}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Floor Name */}
          <div className="fm-form-group">
            <label htmlFor="add-floor-name">Floor Name</label>
            <div className="fm-input-wrapper">
              <MdApartment />
              <input
                id="add-floor-name"
                type="text"
                name="floor_name"
                className="fm-input"
                placeholder="e.g. First Floor, Ground Floor"
                value={formData.floor_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Created By */}
          <div className="fm-form-group">
            <label htmlFor="add-created-by">Created By</label>
            <div className="fm-input-wrapper">
              <MdPerson />
              <input
                id="add-created-by"
                type="text"
                name="created_by"
                className="fm-input"
                placeholder="e.g. Admin"
                value={formData.created_by}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Status */}
          <div className="fm-form-group">
            <label htmlFor="add-status">Status</label>
            <select
              id="add-status"
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
            type="button"
            className="fm-btn-clear"
            onClick={handleReset}
          >
            <MdRefresh />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            className="fm-btn-search"
          >
            <MdAdd />
            <span>Save Floor</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddFloor;
