import { MdEdit, MdDeleteOutline } from "react-icons/md";

function BedDetails({ bed, onEdit, onDelete }) {
  if (!bed) return null;

  const bedId = bed.id || bed.bed_id || "N/A";
  const hostelDisplay =
    bed.hostel_name || (bed.hostel_id ? `Hostel ${bed.hostel_id}` : "N/A");
  const floorIdDisplay =
    bed.floor_id !== undefined && bed.floor_id !== null ? bed.floor_id : "N/A";
  const floorNameDisplay = bed.floor_name || "N/A";
  const roomNoDisplay = bed.room_no || bed.room_number || "N/A";
  const bedNoDisplay = bed.bed_no || bed.bed_number || "N/A";
  const isOccupied =
    bed.is_occupied ||
    bed.status?.toLowerCase() === "occupied" ||
    bed.occupied === true;
  const statusDisplay = isOccupied ? "Occupied" : "Available";

  return (
    <div className="bm-details-card">
      <div className="bm-details-card-header">
        <h4>Bed Information #{bedId}</h4>
        <span
          className={`bm-status-badge ${
            isOccupied ? "occupied" : "available"
          }`}
        >
          <span className="dot"></span>
          {statusDisplay}
        </span>
      </div>

      <div className="bm-details-grid">
        <div className="bm-detail-item">
          <span className="label">Bed ID</span>
          <span className="value">#{bedId}</span>
        </div>

        <div className="bm-detail-item">
          <span className="label">Hostel</span>
          <span className="value">{hostelDisplay}</span>
        </div>

        <div className="bm-detail-item">
          <span className="label">Floor ID</span>
          <span className="value">{floorIdDisplay}</span>
        </div>

        <div className="bm-detail-item">
          <span className="label">Floor Name</span>
          <span className="value">{floorNameDisplay}</span>
        </div>

        <div className="bm-detail-item">
          <span className="label">Room Number</span>
          <span className="value">{roomNoDisplay}</span>
        </div>

        <div className="bm-detail-item">
          <span className="label">Bed Number</span>
          <span className="value">{bedNoDisplay}</span>
        </div>
      </div>

      {/* Quick Action Triggers */}
      <div className="bm-details-actions">
        <button
          type="button"
          className="bm-btn-orange"
          onClick={() => onEdit && onEdit(bedId)}
          style={{ height: "42px", padding: "0 20px", fontSize: "14px" }}
        >
          <MdEdit />
          <span>Edit Bed</span>
        </button>
        <button
          type="button"
          className="bm-btn-red"
          onClick={() => onDelete && onDelete(bedId)}
          style={{ height: "42px", padding: "0 20px", fontSize: "14px" }}
        >
          <MdDeleteOutline />
          <span>Delete Bed</span>
        </button>
      </div>
    </div>
  );
}

export default BedDetails;
