import { useState, useEffect } from "react";
import { MdDeleteOutline, MdWarningAmber } from "react-icons/md";
import { deleteBed } from "../../api/bedApi";
import DeleteBedModal from "./DeleteBedModal";

function DeleteBed({ initialBedId = null, onBedDeleted, showToast }) {
  const [bedId, setBedId] = useState(initialBedId || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialBedId) {
      setBedId(initialBedId);
    }
  }, [initialBedId]);

  const handleOpenModal = (e) => {
    e.preventDefault();
    if (!String(bedId).trim()) {
      if (showToast) showToast("error", "Please enter a Bed ID to delete.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteBed(bedId);

      if (res.data && res.data.success === false) {
        if (showToast) {
          showToast("error", res.data.message || "Failed to delete bed");
        }
        setIsModalOpen(false);
        return;
      }

      const isSuccess =
        res.status === 200 ||
        res.status === 204 ||
        res.data?.success;

      if (isSuccess) {
        if (showToast) {
          showToast("success", res.data?.message || "Bed deleted successfully");
        }
        if (onBedDeleted) {
          onBedDeleted(bedId);
        }
        setBedId("");
        setIsModalOpen(false);
      } else {
        if (showToast) {
          showToast("error", res.data?.message || "Failed to delete bed");
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Delete Bed Error:", err);
      let msg = "Failed to delete bed";
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d.message === "string" && d.message.trim()) {
          msg = d.message;
        } else if (typeof d.detail === "string" && d.detail.trim()) {
          msg = d.detail;
        } else if (Array.isArray(d.detail) && d.detail.length > 0) {
          msg = d.detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(", ");
        }
      } else if (err.message) {
        msg = err.message;
      }
      if (showToast) {
        showToast("error", msg);
      }
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-main-card">
      {/* Header */}
      <div className="bm-form-header">
        <div className="icon-bg red">
          <MdDeleteOutline />
        </div>
        <div>
          <h3>Delete Bed</h3>
          <p className="bm-form-subtitle-inline">
            Remove a bed from the system
          </p>
        </div>
      </div>

      {/* Warning Alert Banner */}
      <div className="bm-alert warning-box">
        <div className="warning-title">
          <MdWarningAmber />
          <span>Warning!</span>
        </div>
        <p className="warning-text">
          Deleting a bed will permanently remove the bed record from the system.
          This action cannot be undone.
        </p>
      </div>

      {/* Delete Input Form */}
      <form onSubmit={handleOpenModal} className="bm-full-form">
        <div className="bm-field-group" style={{ maxWidth: "420px" }}>
          <label htmlFor="del_bed_id">
            Bed ID <span>*</span>
          </label>
          <input
            type="text"
            id="del_bed_id"
            placeholder="Enter bed ID"
            value={bedId}
            onChange={(e) => setBedId(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="bm-form-actions-row">
          <button
            type="submit"
            className="bm-btn-red"
            disabled={loading || !String(bedId).trim()}
          >
            <MdDeleteOutline />
            <span>Delete Bed</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <DeleteBedModal
        isOpen={isModalOpen}
        bedId={bedId}
        loading={loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default DeleteBed;
