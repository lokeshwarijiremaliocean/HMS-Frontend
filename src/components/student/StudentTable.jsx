import { useState, useEffect } from "react";
import {
  MdSearch,
  MdFilterList,
  MdInfo,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

function StudentTable({
  dataList = [],
  loading = false,
  onViewDetails,
  onEditStudent,
  onDeleteStudent,
  title = "All Students",
  subtitle = "View and manage all students",
  showSearchHeader = true,
}) {
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset pagination on search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearchQuery, dataList]);

  // Client-side table filter
  const filteredData = dataList.filter((s) => {
    if (!tableSearchQuery.trim()) return true;
    const q = tableSearchQuery.toLowerCase();
    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    const roll = String(s.roll_no || "").toLowerCase();
    const phone = String(s.phone || "").toLowerCase();
    const email = String(s.email || "").toLowerCase();
    const degree = String(s.degree || "").toLowerCase();
    const branch = String(s.branch || "").toLowerCase();
    const room = String(s.room_no || "").toLowerCase();

    return (
      fullName.includes(q) ||
      roll.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      degree.includes(q) ||
      branch.includes(q) ||
      room.includes(q)
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="sm-card">
      {showSearchHeader && (
        <div className="sm-card-header">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="sm-card-header-actions">
            <div className="sm-search-input-group">
              <MdSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search table by name, roll, phone..."
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
              />
            </div>
            <button className="sm-btn-filter" title="Filter list">
              <MdFilterList /> Filter
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="sm-loading">
          <span className="sm-spinner-lg" />
          <p>Loading students list...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="sm-empty">
          <MdInfo />
          <p>No students found</p>
        </div>
      ) : (
        <div className="sm-table-container">
          <div className="sm-table-responsive">
            <table className="sm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Degree</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Floor</th>
                  <th>Room</th>
                  <th>Bed</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((s, idx) => (
                  <tr key={s.id || s.roll_no || idx}>
                    <td>{startIndex + idx + 1}</td>
                    <td className="sm-roll-badge">{s.roll_no}</td>
                    <td className="sm-student-name">
                      {s.first_name} {s.last_name}
                    </td>
                    <td>{s.gender}</td>
                    <td>{s.phone}</td>
                    <td>{s.email}</td>
                    <td>{s.degree}</td>
                    <td>{s.branch}</td>
                    <td>{s.academic_year}</td>
                    <td>{Number(s.floor_no) > 0 ? `F${s.floor_no}` : "-"}</td>
                    <td>{Number(s.room_no) > 0 ? `R${s.room_no}` : "-"}</td>
                    <td>{Number(s.bed_no) > 0 ? `Bed ${s.bed_no}` : "-"}</td>
                    <td>
                      <div className="sm-row-actions">
                        {onViewDetails && (
                          <button
                            className="sm-action-btn view"
                            title="View Details"
                            onClick={() => onViewDetails(s)}
                          >
                            <MdVisibility />
                          </button>
                        )}
                        {onEditStudent && (
                          <button
                            className="sm-action-btn edit"
                            title="Edit Student"
                            onClick={() => onEditStudent(s)}
                          >
                            <MdEdit />
                          </button>
                        )}
                        {onDeleteStudent && (
                          <button
                            className="sm-action-btn delete"
                            title="Delete Student"
                            onClick={() => onDeleteStudent(s)}
                          >
                            <MdDelete />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="sm-pagination">
            <p className="sm-pagination-text">
              Showing {filteredData.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + pageSize, filteredData.length)} of{" "}
              {filteredData.length} students
            </p>
            <div className="sm-pagination-pages">
              <button
                className="sm-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <MdChevronLeft />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`sm-page-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="sm-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <MdChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentTable;
