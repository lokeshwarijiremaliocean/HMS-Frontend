import { useState } from "react";
import {
  MdDelete,
  MdSearch,
  MdCheckCircle,
  MdWarning,
} from "react-icons/md";

function DeleteFloor({ floors = [], onFloorDeleted }) {
  const [selectedId, setSelectedId] = useState("");
  const [floorToDelete, setFloorToDelete] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleSelectChange = (e) => {
    const val = e.target.value;
    setSelectedId(val);
    const found = floors.find(
      (f) => String(f.id) === String(val) || String(f.floor_no) === String(val)
    );
    setFloorToDelete(found || null);
  };

  const handleInitiateDelete = (e) => {
    e.preventDefault();
    if (!floorToDelete) {
      alert("Please select a floor to delete.");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!floorToDelete) return;

    if (onFloorDeleted) {
      onFloorDeleted(floorToDelete.id);
    }

    setToastMessage(`Floor "${floorToDelete.floor_name}" deleted successfully!`);
    setShowConfirm(false);
    setSelectedId("");
    setFloorToDelete(null);

    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  return (
    <div className="fm-main-card">
      {/* Page Header */}
      <div className="fm-card-header">
        <div className="fm-card-title-group">
          <div className="fm-icon-badge purple" style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}>
            <MdDelete />
          </div>
          <div>
            <h3>Delete Floor</h3>
            <p>Remove a floor record from the system</p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fm-toast-alert success">
          <MdCheckCircle style={{ fontSize: "20px" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handleInitiateDelete}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontWeight: 600, fontSize: "14px", color: "#334155", display: "block", marginBottom: "8px" }}>
            Select Floor to Delete
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

        {floorToDelete && (
          <div style={{
            padding: "16px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            marginBottom: "24px"
          }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>{floorToDelete.floor_name}</h4>
            <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#64748b" }}>
              <strong>Floor No:</strong> {floorToDelete.floor_no} | <strong>Hostel ID:</strong> {floorToDelete.hostel_id}
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              <strong>Status:</strong> {floorToDelete.is_active ? "Active" : "Inactive"}
            </p>
          </div>
        )}

        <div className="fm-form-actions">
          <button
            type="submit"
            className="fm-btn-search"
            style={{ backgroundColor: "#ef4444" }}
            disabled={!floorToDelete}
          >
            <MdDelete />
            <span>Delete Floor</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fdm-backdrop" onClick={() => setShowConfirm(false)}>
          <div className="fdm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fdm-header" style={{ borderBottom: "1px solid #fee2e2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ef4444" }}>
                <MdWarning style={{ fontSize: "24px" }} />
                <h3 style={{ margin: 0 }}>Confirm Deletion</h3>
              </div>
            </div>
            <div className="fdm-body">
              <p>
                Are you sure you want to delete floor <strong>"{floorToDelete?.floor_name}"</strong>?
              </p>
              <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                This action cannot be undone.
              </p>
            </div>
            <div className="fdm-footer">
              <button
                type="button"
                className="fm-btn-clear"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="fm-btn-search"
                style={{ backgroundColor: "#ef4444" }}
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteFloor;
