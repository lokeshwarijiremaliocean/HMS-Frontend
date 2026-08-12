import { useState, useMemo } from "react";
import {
  MdFormatListBulleted,
  MdSearch,
  MdFilterList,
  MdVisibility,
  MdEdit,
  MdDeleteOutline,
  MdInbox,
} from "react-icons/md";

function AllBeds({
  beds = [],
  loading = false,
  onSelectView,
  onSelectEdit,
  onSelectDelete,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered beds based on search input
  const filteredBeds = useMemo(() => {
    if (!searchTerm.trim()) return beds;
    const term = searchTerm.toLowerCase();
    return beds.filter((bed) => {
      const idStr = String(bed.id || bed.bed_id || "").toLowerCase();
      const hostelStr = String(bed.hostel_name || bed.hostel_id || "").toLowerCase();
      const floorStr = String(bed.floor_id || "").toLowerCase();
      const floorNameStr = String(bed.floor_name || "").toLowerCase();
      const roomStr = String(bed.room_no || bed.room_number || "").toLowerCase();
      const bedNoStr = String(bed.bed_no || bed.bed_number || "").toLowerCase();
      const statusStr = String(bed.status || "").toLowerCase();

      return (
        idStr.includes(term) ||
        hostelStr.includes(term) ||
        floorStr.includes(term) ||
        floorNameStr.includes(term) ||
        roomStr.includes(term) ||
        bedNoStr.includes(term) ||
        statusStr.includes(term)
      );
    });
  }, [beds, searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredBeds.length / itemsPerPage) || 1;
  const paginatedBeds = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBeds.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBeds, currentPage, itemsPerPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bm-main-card">
      {/* Content Card Header */}
      <div className="bm-table-header">
        <div className="bm-table-title">
          <div className="icon-bg orange">
            <MdFormatListBulleted />
          </div>
          <div>
            <h3>All Beds</h3>
            <p>View and manage all beds</p>
          </div>
        </div>

        <div className="bm-table-tools">
          <div className="bm-search-box">
            <MdSearch />
            <input
              type="text"
              placeholder="Search by bed no., room no., floor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button className="bm-filter-btn" type="button" title="Filter list">
            <MdFilterList />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Main Table / Empty State Area */}
      <div className="bm-table-wrapper">
        <table className="bm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Bed ID</th>
              <th>Hostel</th>
              <th>Floor</th>
              <th>Floor Name</th>
              <th>Room No.</th>
              <th>Bed No.</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "50px 20px" }}>
                  <div style={{ color: "#e85b19", fontWeight: 600, fontSize: "15px" }}>
                    Loading beds...
                  </div>
                </td>
              </tr>
            ) : paginatedBeds.length > 0 ? (
              paginatedBeds.map((bed, index) => {
                const bedId = bed.id || bed.bed_id || index + 1;
                const hostelDisplay =
                  bed.hostel_name || (bed.hostel_id ? `Hostel ${bed.hostel_id}` : "-");
                const floorDisplay =
                  bed.floor_id !== undefined && bed.floor_id !== null
                    ? `Floor ${bed.floor_id}`
                    : "-";
                const floorNameDisplay = bed.floor_name || "-";
                const roomNoDisplay = bed.room_no || bed.room_number || "-";
                const bedNoDisplay = bed.bed_no || bed.bed_number || "-";
                const isOccupied =
                  bed.is_occupied ||
                  bed.status?.toLowerCase() === "occupied" ||
                  bed.occupied === true;
                const statusLabel = isOccupied ? "Occupied" : "Available";

                return (
                  <tr key={bedId}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>
                      <strong style={{ color: "#0f172a" }}>#{bedId}</strong>
                    </td>
                    <td>{hostelDisplay}</td>
                    <td>{floorDisplay}</td>
                    <td>{floorNameDisplay}</td>
                    <td>{roomNoDisplay}</td>
                    <td>{bedNoDisplay}</td>
                    <td>
                      <span
                        className={`bm-status-badge ${
                          isOccupied ? "occupied" : "available"
                        }`}
                      >
                        <span className="dot"></span>
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <div className="bm-action-btns">
                        <button
                          type="button"
                          className="bm-action-icon view"
                          title="View Details"
                          onClick={() => onSelectView && onSelectView(bedId)}
                        >
                          <MdVisibility />
                        </button>
                        <button
                          type="button"
                          className="bm-action-icon edit"
                          title="Edit Bed"
                          onClick={() => onSelectEdit && onSelectEdit(bedId)}
                        >
                          <MdEdit />
                        </button>
                        <button
                          type="button"
                          className="bm-action-icon delete"
                          title="Delete Bed"
                          onClick={() => onSelectDelete && onSelectDelete(bedId)}
                        >
                          <MdDeleteOutline />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : null}
          </tbody>
        </table>

        {/* Empty State when no beds exist or search finds nothing */}
        {!loading && filteredBeds.length === 0 && (
          <div className="bm-empty-state">
            <div className="bm-empty-box-icon">
              <MdInbox />
            </div>
            <h4>No beds found</h4>
            <p>There are no beds to display.</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="bm-pagination">
        <span>
          Showing{" "}
          {filteredBeds.length === 0
            ? "0 to 0 of 0"
            : `${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(
                currentPage * itemsPerPage,
                filteredBeds.length
              )} of ${filteredBeds.length}`}{" "}
          beds
        </span>

        <div className="bm-page-numbers">
          <button
            type="button"
            className="bm-page-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1 || filteredBeds.length === 0}
            title="Previous Page"
          >
            &lt;
          </button>
          <button
            type="button"
            className="bm-page-btn active"
            disabled={filteredBeds.length === 0}
          >
            {currentPage}
          </button>
          <button
            type="button"
            className="bm-page-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || filteredBeds.length === 0}
            title="Next Page"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

export default AllBeds;
