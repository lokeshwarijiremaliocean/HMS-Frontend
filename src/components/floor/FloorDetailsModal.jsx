import { MdApartment, MdClose, MdArrowBack } from "react-icons/md";

function FloorDetailsModal({ floor, onClose }) {
  if (!floor) return null;

  const floorId = floor.id !== undefined && floor.id !== null ? floor.id : "N/A";
  const hostelId = floor.hostel_id !== undefined && floor.hostel_id !== null ? floor.hostel_id : "N/A";
  const floorNo = floor.floor_no !== undefined && floor.floor_no !== null ? floor.floor_no : "N/A";
  const floorName = floor.floor_name || "N/A";
  const isActive = floor.is_active !== undefined ? floor.is_active : true;
  const createdBy = floor.created_by || "Admin";

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
              <h3 id="floor-details-title">Floor Details</h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                Detailed information for Floor #{floorId}
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

        {/* Modal Body - Two Column Grid */}
        <div className="fm-modal-body">
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
        </div>

        {/* Modal Footer */}
        <div className="fm-modal-footer">
          <button
            type="button"
            className="fm-modal-back-btn"
            onClick={onClose}
          >
            <MdArrowBack />
            <span>Close / Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FloorDetailsModal;
