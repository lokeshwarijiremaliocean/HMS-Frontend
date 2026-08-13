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
    if (!deleteId.toString().trim()) {
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
      const res = await deleteRoom(deleteId.toString().trim());
      const resData = res.data;

      if (resData && resData.success !== false) {
        setMessage({ type: "success", text: resData.message || "Room deleted successfully" });
        setDeleteId("");
        if (onRoomDeleted) {
          onRoomDeleted();
        }
      } else {
        setMessage({ type: "error", text: resData?.message || "Failed to delete room" });
      }
    } catch (err) {
      console.warn("Delete Room Error:", err);
      const errMsg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail[0]?.msg
          : err.response?.data?.detail) ||
        "Failed to delete room. Please check backend connection.";
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
            disabled={loading}
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

