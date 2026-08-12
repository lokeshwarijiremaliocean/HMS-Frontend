import { MdWarningAmber, MdDeleteOutline } from "react-icons/md";

function DeleteBedModal({ isOpen, bedId, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    <div className="bm-modal-overlay">
      <div className="bm-modal-card">
        <div className="bm-modal-icon">
          <MdWarningAmber />
        </div>
        <h3>Delete Bed?</h3>
        <p>
          Are you sure you want to delete bed{" "}
          <strong style={{ color: "#0f172a" }}>#{bedId}</strong>? This action
          cannot be undone.
        </p>
        <div className="bm-modal-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-delete"
            onClick={onConfirm}
            disabled={loading}
          >
            <MdDeleteOutline style={{ marginRight: "4px", fontSize: "16px" }} />
            {loading ? "Deleting..." : "Delete Bed"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteBedModal;
