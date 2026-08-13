import { useState, useEffect } from "react";
import { MdDelete, MdWarning, MdInfoOutline, MdClose } from "react-icons/md";
import { deleteRoom } from "../../api/roomApi";
import { getApiErrorMessage } from "../../api/axiosInstance";

function DeleteRoom({ initialRoomId, onRoomDeleted }) {
  const [deleteId, setDeleteId] = useState(initialRoomId || "");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (initialRoomId) {
      setDeleteId(initialRoomId);
    }
  }, [initialRoomId]);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    if (!deleteId) {
      setMessage({ type: "error", text: "Please enter a Room ID to delete." });
      return;
    }
    setMessage({ type: "", text: "" });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    setShowModal(false);
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await deleteRoom(deleteId);
      if (res.data && (res.data.success || res.data.message)) {
        setMessage({ type: "success", text: res.data.message || "Room deleted successfully" });
      } else {
        setMessage({ type: "success", text: "Room deleted successfully" });
      }

      if (onRoomDeleted) {
        onRoomDeleted();
      }
      setDeleteId("");
    } catch (err) {
      console.warn("Delete Room Error:", err);
      setMessage({
        type: "error",
        text: getApiErrorMessage(err, "Failed to delete room."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-main-card">
      <div className="rm-form-header">
        <div className="icon-bg red">
          <MdDelete />
        </div>
        <div>
          <h3>Delete Room</h3>
          <p className="rm-form-subtitle-inline">Remove a room from the system</p>
        </div>
      </div>

      {message.text && (
        <div className={`rm-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Warning Box */}
      <div className="rm-warning-banner">
        <MdWarning className="icon" />
        <div>
          <strong>Warning!</strong>
          <p>
            Deleting a room will remove it permanently from the system. This
            action cannot be undone.
          </p>
        </div>
      </div>

      <form onSubmit={handleDeleteClick} className="rm-full-form">
        <div className="rm-field-group">
          <label>
            Room ID <span>*</span>
          </label>
          <input
            type="text"
            placeholder="Enter room ID"
            value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)}
            required
          />
        </div>

        {/* Info Box */}
        <div className="rm-info-banner">
          <MdInfoOutline className="icon" />
          <div>
            Please enter the Room ID of the room you want to delete. Make sure
            the room is not allocated to any student.
          </div>
        </div>

        <div className="rm-form-actions-row right">
          <button type="submit" className="rm-btn-red" disabled={loading}>
            <MdDelete /> {loading ? "Deleting..." : "Delete Room"}
          </button>
          <button
            type="button"
            className="rm-btn-reset"
            onClick={() => setDeleteId("")}
          >
            <MdClose /> Cancel
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="rm-modal-backdrop">
          <div className="rm-modal-box">
            <div className="rm-modal-header">
              <h3>Delete Room?</h3>
              <button
                className="rm-modal-close"
                onClick={() => setShowModal(false)}
              >
                <MdClose />
              </button>
            </div>
            <div className="rm-modal-body">
              <p>
                Are you sure you want to delete room <strong>{deleteId}</strong>?
              </p>
            </div>
            <div className="rm-modal-footer">
              <button
                className="rm-btn-reset"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="rm-btn-red" onClick={confirmDelete}>
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteRoom;
