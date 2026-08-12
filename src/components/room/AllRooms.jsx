import { useState } from "react";
import {
  MdFormatListBulleted,
  MdSearch,
  MdFilterList,
  MdVisibility,
  MdEdit,
  MdDeleteOutline,
  MdMeetingRoom,
  MdAdd,
  MdRefresh,
  MdErrorOutline,
} from "react-icons/md";

function AllRooms({ rooms, loading, error, onRetry, onAddClick, onSelectEdit, onSelectDelete, onSelectView }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredRooms = rooms.filter((room) =>
    String(room.roomNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(room.floor || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(room.id || "").includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredRooms.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + pageSize);

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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button className="rm-filter-btn" title="Filter">
            <MdFilterList />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rm-loading-skeleton" style={{ padding: "40px 20px", textStyle: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <span className="sm-spinner-lg" />
            <p style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Loading room data from server...</p>
          </div>
        </div>
      ) : error && rooms.length === 0 ? (
        <div className="rm-empty-state-card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <div className="rm-empty-icon" style={{ background: "#fee2e2", color: "#ef4444", margin: "0 auto 16px auto", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
            <MdErrorOutline />
          </div>
          <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>Unable to load rooms</h4>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>Please check the server connection and try again.</p>
          <button className="rm-btn-submit" onClick={onRetry} style={{ margin: "0 auto" }}>
            <MdRefresh /> Retry Connection
          </button>
        </div>
      ) : rooms.length === 0 ? (
        <div className="rm-empty-state-card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <div className="rm-empty-icon" style={{ background: "#ffedd5", color: "#ea580c", margin: "0 auto 16px auto", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
            <MdMeetingRoom />
          </div>
          <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>No Rooms Found</h4>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>There are currently no rooms available. Add your first room to get started.</p>
          <button className="rm-btn-submit" onClick={onAddClick} style={{ margin: "0 auto" }}>
            <MdAdd /> Add Room
          </button>
        </div>
      ) : (
        <>
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
                {paginatedRooms.length > 0 ? (
                  paginatedRooms.map((room, index) => (
                    <tr key={room.id || index}>
                      <td>{startIndex + index + 1}</td>
                      <td>{room.floor}</td>
                      <td>{room.roomNo}</td>
                      <td>{room.totalBeds}</td>
                      <td>{room.occupiedBeds}</td>
                      <td>
                        <span className={`rm-badge-status ${room.availableBeds > 0 ? "available" : "full"}`} style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: room.availableBeds > 0 ? "#dcfce7" : "#fee2e2",
                          color: room.availableBeds > 0 ? "#166534" : "#991b1b"
                        }}>
                          {room.availableBeds} Available
                        </span>
                      </td>
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
                    <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      No rooms matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Real Pagination Footer */}
          {filteredRooms.length > 0 && (
            <div className="rm-pagination">
              <span>
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredRooms.length)} of {filteredRooms.length} rooms
              </span>
              <div className="rm-page-numbers">
                <button
                  className="rm-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`rm-page-btn ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  className="rm-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AllRooms;
