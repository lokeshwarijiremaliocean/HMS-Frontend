import { useState, useMemo } from "react";
import {
  MdFormatListBulleted,
  MdSearch,
  MdFilterList,
  MdVisibility,
  MdApartment,
} from "react-icons/md";

function ViewFloors({ floors = [], onSelectView }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtered floors based on quick search input
  const filteredFloors = useMemo(() => {
    if (!searchTerm.trim()) return floors;
    const term = searchTerm.toLowerCase();
    return floors.filter((floor) => {
      const idStr = String(floor.id ?? "").toLowerCase();
      const hostelStr = String(floor.hostel_id ?? "").toLowerCase();
      const floorNoStr = String(floor.floor_no ?? "").toLowerCase();
      const floorNameStr = String(floor.floor_name ?? "").toLowerCase();
      const statusStr = (floor.is_active ? "active" : "inactive").toLowerCase();
      const createdByStr = String(floor.created_by ?? "").toLowerCase();

      return (
        idStr.includes(term) ||
        hostelStr.includes(term) ||
        floorNoStr.includes(term) ||
        floorNameStr.includes(term) ||
        statusStr.includes(term) ||
        createdByStr.includes(term)
      );
    });
  }, [floors, searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredFloors.length / itemsPerPage) || 1;
  const paginatedFloors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFloors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFloors, currentPage, itemsPerPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="fm-main-card">
      {/* Page Header */}
      <div className="fm-card-header">
        <div className="fm-card-title-group">
          <div className="fm-icon-badge orange">
            <MdFormatListBulleted />
          </div>
          <div>
            <h3>View Floors</h3>
            <p>View and manage existing floor details</p>
          </div>
        </div>

        <div className="fm-card-tools">
          <div className="fm-quick-search">
            <MdSearch />
            <input
              type="text"
              placeholder="Search by floor name, ID, hostel..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            type="button"
            className="fm-tab-btn"
            style={{ padding: "8px 14px", height: "42px" }}
            title="Filter options"
          >
            <MdFilterList />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Floor List Table */}
      <div className="fm-table-wrapper">
        <table className="fm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hostel ID</th>
              <th>Floor No</th>
              <th>Floor Name</th>
              <th>Status</th>
              <th>Created By</th>
              <th style={{ textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFloors.length > 0 ? (
              paginatedFloors.map((floor) => {
                const isActive = floor.is_active !== undefined ? floor.is_active : true;
                return (
                  <tr key={floor.id}>
                    <td className="id-cell">#{floor.id}</td>
                    <td>{floor.hostel_id}</td>
                    <td>{floor.floor_no}</td>
                    <td className="floor-name-cell">{floor.floor_name}</td>
                    <td>
                      <span className={`fm-status-badge ${isActive ? "active" : "inactive"}`}>
                        <span className="badge-dot"></span>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{floor.created_by || "Admin"}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="fm-action-btn-view"
                        onClick={() => onSelectView(floor)}
                        title="View Floor Details"
                      >
                        <MdVisibility />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7">
                  <div className="fm-empty-state-card" style={{ border: "none", margin: "20px 0" }}>
                    <div className="fm-empty-icon">
                      <MdApartment />
                    </div>
                    <h4 className="fm-empty-title">No floors found</h4>
                    <p className="fm-empty-desc">
                      No floor records matching your query was found. Try clearing your search term.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      {filteredFloors.length > 0 && (
        <div className="fm-table-footer">
          <span className="fm-table-count">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredFloors.length)} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredFloors.length)} of {filteredFloors.length} floors
          </span>

          <div className="fm-pagination">
            <button
              type="button"
              className="fm-page-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              &larr;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`fm-page-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="fm-page-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewFloors;
