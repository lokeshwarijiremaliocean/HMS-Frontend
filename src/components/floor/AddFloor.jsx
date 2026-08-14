import { useState } from "react";
import {
  MdAdd,
  MdRefresh,
  MdApartment,
  MdHotel,
  MdTag,
  MdCheckCircle,
  MdErrorOutline,
} from "react-icons/md";
import { addFloor } from "../../api/floorApi";
import { getAuthToken, getApiErrorMessage } from "../../api/axiosInstance";

function AddFloor({ onFloorAdded }) {
  const [formData, setFormData] = useState({
    hostel_id: "",
    floor_no: "",
    floor_name: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setToastMessage("");

    // Check if token exists in session
    const currentToken = getAuthToken();
    if (!currentToken) {
      setErrorMessage("No authentication token found. Please log in to obtain a valid backend session.");
      return;
    }

    if (!formData.floor_name.trim() || formData.floor_no === "" || formData.hostel_id === "") {
      setErrorMessage("Please fill in Hostel ID, Floor No, and Floor Name.");
      return;
    }

    const payload = {
      hostel_id: parseInt(formData.hostel_id, 10),
      floor_no: parseInt(formData.floor_no, 10),
      floor_name: formData.floor_name.trim(),
    };

    if (isNaN(payload.hostel_id) || isNaN(payload.floor_no)) {
      setErrorMessage("Hostel ID and Floor No must be valid numbers.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await addFloor(payload);

      if (response.data && (response.data.success || response.status === 200)) {
        const addedFloor = response.data.data;
        const successMsg = response.data.message || `Floor "${payload.floor_name}" added successfully!`;
        setToastMessage(successMsg);

        // Reset form
        setFormData({
          hostel_id: "",
          floor_no: "",
          floor_name: "",
        });

        if (onFloorAdded) {
          await onFloorAdded(addedFloor);
        }

        setTimeout(() => {
          setToastMessage("");
        }, 4000);
      } else {
        setErrorMessage(response.data?.message || "Failed to add floor.");
      }
    } catch (err) {
      console.error("Error adding floor:", err);
      const msg = getApiErrorMessage(err, "Failed to add floor.");
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      hostel_id: "",
      floor_no: "",
      floor_name: "",
    });
    setToastMessage("");
    setErrorMessage("");
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

      {/* Success Toast */}
      {toastMessage && (
        <div className="fm-toast-alert success">
          <MdCheckCircle style={{ fontSize: "20px" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fm-toast-alert error">
          <MdErrorOutline style={{ fontSize: "20px" }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="fm-form-grid">
          {/* Hostel ID */}
          <div className="fm-form-group">
            <label htmlFor="add-hostel-id">Hostel ID *</label>
            <div className="fm-input-wrapper">
              <MdHotel />
              <input
                id="add-hostel-id"
                type="number"
                name="hostel_id"
                className="fm-input"
                placeholder="e.g. 1"
                value={formData.hostel_id}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Floor No */}
          <div className="fm-form-group">
            <label htmlFor="add-floor-no">Floor No. *</label>
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
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Floor Name */}
          <div className="fm-form-group">
            <label htmlFor="add-floor-name">Floor Name *</label>
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
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fm-form-actions">
          <button
            type="button"
            className="fm-btn-clear"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <MdRefresh />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            className="fm-btn-search"
            disabled={isSubmitting}
          >
            <MdAdd />
            <span>{isSubmitting ? "Saving Floor..." : "Save Floor"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddFloor;
