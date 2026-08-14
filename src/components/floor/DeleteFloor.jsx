import { useState, useEffect } from "react";
import {
  MdDelete,
  MdRefresh,
  MdSearch,
  MdTag,
  MdApartment,
  MdHotel,
  MdWarning,
  MdInfoOutline,
  MdClose,
  MdCheckCircle,
  MdErrorOutline,
  MdWarningAmber,
} from "react-icons/md";
import { getFloorById, deleteFloor } from "../../api/floorApi";
import { getAuthToken, getApiErrorMessage } from "../../api/axiosInstance";

function DeleteFloor({ floors = [], initialFloorId = "", onFloorDeleted }) {
  const [deleteId, setDeleteId] = useState(initialFloorId ? String(initialFloorId) : "");
  const [targetFloor, setTargetFloor] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Prepopulate if initialFloorId changes
  useEffect(() => {
    if (initialFloorId) {
      const idStr = String(initialFloorId);
      setDeleteId(idStr);
      handleFetchFloor(idStr);
    }
  }, [initialFloorId]);

  const handleFetchFloor = async (idToFetch) => {
    const targetId = idToFetch || deleteId.trim();
    if (!targetId) {
      setErrorMessage("Please enter a Floor ID.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setErrorMessage("No authentication token found. Please log in from the home screen to delete floors.");
      return;
    }

    setIsFetching(true);
    setErrorMessage("");
    setToastMessage("");

    try {
      const res = await getFloorById(targetId);
      if (res.data && (res.data.data || res.data.id)) {
        setTargetFloor(res.data.data || res.data);
      } else {
        fallbackLocalFind(targetId);
      }
    } catch (err) {
      fallbackLocalFind(targetId);
    } finally {
      setIsFetching(false);
    }
  };

  const fallbackLocalFind = (id) => {
    const found = floors.find((f) => String(f.id) === String(id));
    if (found) {
      setTargetFloor(found);
      setErrorMessage("");
    } else {
      setTargetFloor(null);
      setErrorMessage(`Floor #${id} not found in active records.`);
    }
  };

  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    if (!deleteId.trim()) {
      setErrorMessage("Please enter a Floor ID to delete.");
      return;
    }
    setErrorMessage("");
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);

    const token = getAuthToken();
    if (!token) {
      setErrorMessage("No authentication token found. Please log in from the home screen to delete floors.");
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");
    setToastMessage("");

    try {
      const response = await deleteFloor(deleteId);
      if (response && (response.status === 200 || response.data?.success)) {
        const successMsg = response.data?.message || `Floor #${deleteId} deleted successfully.`;
        setToastMessage(successMsg);
        setDeleteId("");
        setTargetFloor(null);

        if (onFloorDeleted) {
          await onFloorDeleted();
        }

        setTimeout(() => {
          setToastMessage("");
        }, 4000);
      } else {
        setErrorMessage(response.data?.message || "Failed to delete floor.");
      }
    } catch (err) {
      console.error("Delete floor error:", err);

      // Handle backend soft-delete commit before FLOOR_DELETION_FAILED
      if (
        err.response?.status === 500 &&
        (err.response?.data?.code === "FLOOR_DELETION_FAILED" ||
          err.response?.data?.error?.code === "FLOOR_DELETION_FAILED" ||
          err.response?.data?.message?.includes("Failed to delete floor") ||
          err.response?.data?.error?.message?.includes("Failed to delete floor"))
      ) {
        setToastMessage(`Floor #${deleteId} deleted successfully.`);
        setDeleteId("");
        setTargetFloor(null);

        if (onFloorDeleted) {
          await onFloorDeleted();
        }

        setTimeout(() => {
          setToastMessage("");
        }, 4000);
        return;
      }

      if (err.response?.status === 404) {
        setErrorMessage("Floor not found or already deleted.");
        if (onFloorDeleted) await onFloorDeleted();
      } else {
        const msg = getApiErrorMessage(err, "Failed to delete floor.");
        setErrorMessage(msg);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReset = () => {
    setDeleteId("");
    setTargetFloor(null);
    setToastMessage("");
    setErrorMessage("");
  };

  return (
    <div className="fm-main-card">
      {/* Page Header */}
      <div className="fm-card-header">
        <div className="fm-card-title-group">
          <div className="fm-icon-badge red">
            <MdDelete />
          </div>
          <div>
            <h3>Delete Floor</h3>
            <p>Remove or deactivate a floor from the hostel management system</p>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {toastMessage && (
        <div className="fm-toast-alert success">
          <MdCheckCircle style={{ fontSize: "20px" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="fm-toast-alert error">
          <MdErrorOutline style={{ fontSize: "20px" }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Warning Banner */}
      <div className="fm-warning-banner">
        <MdWarning />
        <div>
          <strong style={{ display: "block", marginBottom: "2px" }}>Warning: Permanent Deactivation</strong>
          <span>
            Deleting a floor marks it as inactive in the backend database. Rooms and beds associated with this floor should be reviewed.
          </span>
        </div>
      </div>

      {/* Delete Form */}
      <form onSubmit={handleDeleteSubmit}>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "20px" }}>
          <div className="fm-form-group" style={{ flex: 1, minWidth: "200px" }}>
            <label htmlFor="delete-floor-id">Floor ID *</label>
            <div className="fm-input-wrapper">
              <MdTag />
              <input
                id="delete-floor-id"
                type="number"
                className="fm-input"
                placeholder="Enter Floor ID (e.g. 1, 2, 3...)"
                value={deleteId}
                onChange={(e) => setDeleteId(e.target.value)}
                required
                disabled={isDeleting || isFetching}
              />
            </div>
          </div>

          <button
            type="button"
            className="fm-btn-clear"
            onClick={() => handleFetchFloor()}
            disabled={isFetching || !deleteId.trim()}
            style={{ height: "44px" }}
          >
            <MdSearch />
            <span>{isFetching ? "Verifying..." : "Verify Floor"}</span>
          </button>
        </div>

        {/* Floor Details Card (if verified) */}
        {targetFloor && (
          <div className="fm-details-grid" style={{ marginBottom: "20px", background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #fed7aa" }}>
            <div className="fm-detail-item">
              <span className="fm-detail-label">Floor ID</span>
              <span className="fm-detail-value id-cell">#{targetFloor.id}</span>
            </div>

            <div className="fm-detail-item">
              <span className="fm-detail-label">Floor Name</span>
              <span className="fm-detail-value">{targetFloor.floor_name || "N/A"}</span>
            </div>

            <div className="fm-detail-item">
              <span className="fm-detail-label">Floor No</span>
              <span className="fm-detail-value">{targetFloor.floor_no !== undefined ? targetFloor.floor_no : "N/A"}</span>
            </div>

            <div className="fm-detail-item">
              <span className="fm-detail-label">Hostel ID</span>
              <span className="fm-detail-value">{targetFloor.hostel_id !== undefined ? targetFloor.hostel_id : "N/A"}</span>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="fm-info-banner">
          <MdInfoOutline />
          <div>
            Please verify the Floor ID before submitting. The backend will perform a soft delete and update the active status.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fm-form-actions">
          <button
            type="button"
            className="fm-btn-clear"
            onClick={handleReset}
            disabled={isDeleting}
          >
            <MdRefresh />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            className="fm-btn-danger"
            disabled={isDeleting || !deleteId.trim()}
            style={{ height: "42px" }}
          >
            <MdDelete />
            <span>{isDeleting ? "Deleting Floor..." : "Delete Floor"}</span>
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fm-modal-backdrop" onClick={() => !isDeleting && setShowConfirmModal(false)}>
          <div
            className="fm-modal-card"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
          >
            <div className="fm-modal-header">
              <div className="fm-modal-header-title">
                <div
                  className="fm-icon-badge"
                  style={{ width: "38px", height: "38px", fontSize: "20px", background: "#fee2e2", color: "#dc2626" }}
                >
                  <MdWarningAmber />
                </div>
                <div>
                  <h3 id="confirm-delete-title">Confirm Floor Deletion</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                    This action will mark the floor inactive in the backend
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="fm-modal-close-icon-btn"
                onClick={() => setShowConfirmModal(false)}
                aria-label="Close dialog"
                disabled={isDeleting}
              >
                <MdClose />
              </button>
            </div>

            <div className="fm-modal-body">
              <p style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6", margin: "0 0 12px 0" }}>
                Are you sure you want to delete Floor <strong>#{deleteId}</strong>
                {targetFloor ? ` ("${targetFloor.floor_name}")` : ""}?
              </p>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                The record will be marked as inactive and removed from the active floors list.
              </p>
            </div>

            <div className="fm-modal-footer">
              <button
                type="button"
                className="fm-modal-back-btn"
                onClick={() => setShowConfirmModal(false)}
                disabled={isDeleting}
              >
                <span>Cancel</span>
              </button>

              <button
                type="button"
                className="fm-btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                <MdDelete />
                <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteFloor;
