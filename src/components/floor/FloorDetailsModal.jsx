import { useState, useEffect } from "react";
import {
  MdApartment,
  MdClose,
  MdArrowBack,
  MdEdit,
  MdHotel,
  MdTag,
  MdSave,
  MdCheckCircle,
  MdErrorOutline,
} from "react-icons/md";
import { updateFloor } from "../../api/floorApi";
import { getApiErrorMessage } from "../../api/axiosInstance";

function FloorDetailsModal({
  floor,
  onClose,
  onFloorUpdated,
  initialEditMode = false,
}) {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [formData, setFormData] = useState({
    hostel_id: "",
    floor_no: "",
    floor_name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (floor) {
      setFormData({
        hostel_id: floor.hostel_id !== undefined && floor.hostel_id !== null ? String(floor.hostel_id) : "",
        floor_no: floor.floor_no !== undefined && floor.floor_no !== null ? String(floor.floor_no) : "",
        floor_name: floor.floor_name || "",
      });
      setIsEditing(initialEditMode);
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [floor, initialEditMode]);

  if (!floor) return null;

  const floorId = floor.id !== undefined && floor.id !== null ? floor.id : "N/A";
  const hostelId = floor.hostel_id !== undefined && floor.hostel_id !== null ? floor.hostel_id : "N/A";
  const floorNo = floor.floor_no !== undefined && floor.floor_no !== null ? floor.floor_no : "N/A";
  const floorName = floor.floor_name || "N/A";
  const isActive = floor.is_active !== undefined ? floor.is_active : true;
  const createdBy = floor.created_by || "Admin";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

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
      const response = await updateFloor(floor.id, payload);
      if (response.data && (response.data.success || response.status === 200)) {
        setSuccessMessage(response.data.message || "Floor updated successfully.");
        if (onFloorUpdated) {
          await onFloorUpdated();
        }
        setTimeout(() => {
          setIsEditing(false);
          setSuccessMessage("");
        }, 1200);
      } else {
        setErrorMessage(response.data?.message || "Failed to update floor.");
      }
    } catch (err) {
      console.error("Error updating floor:", err);
      const msg = getApiErrorMessage(err, "Failed to update floor.");
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fm-modal-backdrop" onClick={onClose}>
      <div
        className="fm-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="floor-details-title"
      >
        {/* Modal Header */}
        <div className="fm-modal-header">
          <div className="fm-modal-header-title">
            <div className="fm-icon-badge orange" style={{ width: "38px", height: "38px", fontSize: "20px" }}>
              <MdApartment />
            </div>
            <div>
              <h3 id="floor-details-title">
                {isEditing ? "Update Floor" : "Floor Details"}
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                {isEditing
                  ? `Edit information for Floor #${floorId}`
                  : `Detailed information for Floor #${floorId}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="fm-modal-close-icon-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <MdClose />
          </button>
        </div>

        {/* Modal Alerts */}
        <div style={{ padding: "0 24px" }}>
          {successMessage && (
            <div className="fm-toast-alert success" style={{ marginTop: "16px", marginBottom: "0" }}>
              <MdCheckCircle style={{ fontSize: "20px" }} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="fm-toast-alert error" style={{ marginTop: "16px", marginBottom: "0" }}>
              <MdErrorOutline style={{ fontSize: "20px" }} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="fm-modal-body">
          {isEditing ? (
            /* Edit Form */
            <form id="update-floor-form" onSubmit={handleUpdateSubmit}>
              <div className="fm-form-grid" style={{ marginBottom: 0 }}>
                {/* Floor ID (Readonly) */}
                <div className="fm-form-group">
                  <label>Floor ID</label>
                  <div className="fm-input-wrapper">
                    <MdTag />
                    <input
                      type="text"
                      className="fm-input"
                      value={`#${floorId}`}
                      disabled
                      style={{ background: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }}
                    />
                  </div>
                </div>

                {/* Hostel ID */}
                <div className="fm-form-group">
                  <label htmlFor="edit-hostel-id">Hostel ID *</label>
                  <div className="fm-input-wrapper">
                    <MdHotel />
                    <input
                      id="edit-hostel-id"
                      type="number"
                      name="hostel_id"
                      className="fm-input"
                      placeholder="e.g. 1"
                      value={formData.hostel_id}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Floor No */}
                <div className="fm-form-group">
                  <label htmlFor="edit-floor-no">Floor No. *</label>
                  <div className="fm-input-wrapper">
                    <MdTag />
                    <input
                      id="edit-floor-no"
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
                  <label htmlFor="edit-floor-name">Floor Name *</label>
                  <div className="fm-input-wrapper">
                    <MdApartment />
                    <input
                      id="edit-floor-name"
                      type="text"
                      name="floor_name"
                      className="fm-input"
                      placeholder="e.g. First Floor"
                      value={formData.floor_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Details Grid */
            <div className="fm-details-grid">
              <div className="fm-detail-item">
                <span className="fm-detail-label">Floor ID</span>
                <span className="fm-detail-value id-cell">#{floorId}</span>
              </div>

              <div className="fm-detail-item">
                <span className="fm-detail-label">Hostel ID</span>
                <span className="fm-detail-value">{hostelId}</span>
              </div>

              <div className="fm-detail-item">
                <span className="fm-detail-label">Floor No</span>
                <span className="fm-detail-value">{floorNo}</span>
              </div>

              <div className="fm-detail-item">
                <span className="fm-detail-label">Floor Name</span>
                <span className="fm-detail-value">{floorName}</span>
              </div>

              <div className="fm-detail-item">
                <span className="fm-detail-label">Status</span>
                <span className="fm-detail-value">
                  <span className={`fm-status-badge ${isActive ? "active" : "inactive"}`}>
                    <span className="badge-dot"></span>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </span>
              </div>

              <div className="fm-detail-item">
                <span className="fm-detail-label">Created By</span>
                <span className="fm-detail-value">{createdBy}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="fm-modal-footer">
          {isEditing ? (
            <>
              <button
                type="button"
                className="fm-modal-back-btn"
                onClick={() => {
                  setIsEditing(false);
                  setErrorMessage("");
                }}
                disabled={isSubmitting}
              >
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                form="update-floor-form"
                className="fm-btn-search"
                disabled={isSubmitting}
                style={{ height: "40px", padding: "0 20px" }}
              >
                <MdSave />
                <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="fm-modal-back-btn"
                onClick={onClose}
              >
                <MdArrowBack />
                <span>Close / Back</span>
              </button>

              <button
                type="button"
                className="fm-action-btn-edit"
                style={{ height: "40px", padding: "0 18px", fontSize: "13.5px" }}
                onClick={() => setIsEditing(true)}
              >
                <MdEdit />
                <span>Edit Floor</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FloorDetailsModal;
