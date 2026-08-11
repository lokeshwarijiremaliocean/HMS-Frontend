import { useState } from "react";
import {
  MdFormatListBulleted,
  MdSearch,
  MdFilterList,
  MdVisibility,
  MdEdit,
  MdDeleteOutline,
} from "react-icons/md";

function AllRooms({ rooms, onSelectEdit, onSelectDelete, onSelectView }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRooms = rooms.filter((room) =>
    String(room.roomNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(room.floor || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(room.id || "").includes(searchTerm)
  );

  return (
    <div className="rm-main-card">
      <div className="rm-table-header">
        <div className="rm-table-title">
          <div className="icon-bg orange">
            <MdFormatListBulleted />
          </div>
          <div>
            <h3>All Rooms</h3>
            <p>View all rooms in the hostel</p>
          </div>
        </div>

        <div className="rm-table-tools">
          <div className="rm-search-box">
            <MdSearch />
            <input
              type="text"
              placeholder="Search by room no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="rm-filter-btn" title="Filter">
            <MdFilterList />
          </button>
        </div>
      </div>

      <div className="rm-table-wrapper">
        <table className="rm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Floor</th>
              <th>Room No.</th>
              <th>Total Beds</th>
              <th>Occupied Beds</th>
              <th>Available Beds</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.id}</td>
                  <td>{room.floor}</td>
                  <td>{room.roomNo}</td>
                  <td>{room.totalBeds}</td>
                  <td>{room.occupiedBeds}</td>
                  <td>{room.availableBeds}</td>
                  <td>
                    <div className="rm-action-btns">
                      <button
                        className="rm-action-icon view"
                        title="View Details"
                        onClick={() => onSelectView && onSelectView(room.id)}
                      >
                        <MdVisibility />
                      </button>
                      <button
                        className="rm-action-icon edit"
                        title="Edit Room"
                        onClick={() => onSelectEdit && onSelectEdit(room.id)}
                      >
                        <MdEdit />
                      </button>
                      <button
                        className="rm-action-icon delete"
                        title="Delete Room"
                        onClick={() => onSelectDelete && onSelectDelete(room.id)}
                      >
                        <MdDeleteOutline />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                  No rooms found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="rm-pagination">
        <span>Showing 1 to {Math.min(10, filteredRooms.length)} of {filteredRooms.length} rooms</span>
        <div className="rm-page-numbers">
          <button className="rm-page-btn">&lt;</button>
          <button className="rm-page-btn active">1</button>
          <button className="rm-page-btn">2</button>
          <button className="rm-page-btn">3</button>
          <span>...</span>
          <button className="rm-page-btn">10</button>
          <button className="rm-page-btn">&gt;</button>
        </div>
      </div>
    </div>
  );
}

export default AllRooms;
