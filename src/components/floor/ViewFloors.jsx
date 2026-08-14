import { useState, useMemo } from "react";
import {
  MdFormatListBulleted,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdApartment,
  MdCheckCircle,
  MdErrorOutline,
  MdClose,
  MdWarningAmber,
} from "react-icons/md";
import { deleteFloor } from "../../api/floorApi";
import { getApiErrorMessage } from "../../api/axiosInstance";

function ViewFloors({
  floors = [],
  loading = false,
  errorMessage: externalError = "",
  onSelectView,
  onSelectEdit,
  onSelectDelete,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Delete confirmation modal state
  const [floorToDelete, setFloorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleDeleteClick = (floor) => {
    setFloorToDelete(floor);
    setErrorMessage("");
  };

  const handleConfirmDelete = async () => {
    if (!floorToDelete) return;

    setIsDeleting(true);
    setErrorMessage("");
    try {
      const response = await deleteFloor(floorToDelete.id);
      if (response && (response.status === 200 || response.data?.success)) {
        const successMsg = response.data?.message || `Floor "${floorToDelete.floor_name}" deleted successfully.`;
        setToastMessage(successMsg);
        setFloorToDelete(null);

        if (onRefresh) {
          await onRefresh();
        }

        setTimeout(() => {
          setToastMessage("");
        }, 4000);
      } else {
        setErrorMessage(response.data?.message || "Failed to delete floor.");
      }
    } catch (err) {
      console.error("Delete Floor Request Failure Details:", {
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method,
        floorId: floorToDelete.id,
      });

      // If backend successfully committed soft-delete before throwing FLOOR_DELETION_FAILED
      if (
        err.response?.status === 500 &&
        (err.response?.data?.code === "FLOOR_DELETION_FAILED" ||
          err.response?.data?.error?.code === "FLOOR_DELETION_FAILED" ||
          err.response?.data?.message?.includes("Failed to delete floor") ||
          err.response?.data?.error?.message?.includes("Failed to delete floor"))
      ) {
        setToastMessage(`Floor "${floorToDelete.floor_name}" deleted successfully.`);
        setFloorToDelete(null);

        if (onRefresh) {
          await onRefresh();
        }

        setTimeout(() => {
          setToastMessage("");
        }, 4000);
        return;
      }

      if (err.response?.status === 404) {
        setErrorMessage(getApiErrorMessage(err, "Floor not found or already deleted."));
        if (onRefresh) await onRefresh();
        setFloorToDelete(null);
      } else {
        const errorDetail = getApiErrorMessage(err, "Failed to delete floor.");
        setErrorMessage(errorDetail);
      }
    } finally {
      setIsDeleting(false);
    }
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
            onClick={() => onRefresh && onRefresh()}
            disabled={loading}
            title="Refresh floors from backend"
          >
            <MdRefresh />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
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

      {/* Success Toast */}
      {toastMessage && (
        <div className="fm-toast-alert success">
          <MdCheckCircle style={{ fontSize: "20px" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Toast */}
      {(errorMessage || externalError) && (
        <div className="fm-toast-alert error">
          <MdErrorOutline style={{ fontSize: "20px" }} />
          <span>{errorMessage || externalError}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="fm-loading-container">
          <div className="fm-spinner"></div>
          <span>Loading floor records from backend...</span>
        </div>
      ) : (
        /* Floor List Table */
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
                <th style={{ textAlign: "center" }}>Delete</th>
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
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="fm-action-btn-view"
                            onClick={() => onSelectView(floor)}
                            title="View Floor Details"
                          >
                            <MdVisibility />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            className="fm-action-btn-edit"
                            onClick={() => onSelectEdit ? onSelectEdit(floor) : onSelectView(floor)}
                            title="Edit Floor"
                          >
                            <MdEdit />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="fm-action-btn-delete"
                          onClick={() => handleDeleteClick(floor)}
                          title="Delete Floor"
                        >
                          <MdDelete />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8">
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
      )}

      {/* Table Pagination Footer */}
      {!loading && filteredFloors.length > 0 && (
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

      {/* Delete Confirmation Modal */}
      {floorToDelete && (
        <div className="fm-modal-backdrop" onClick={() => !isDeleting && setFloorToDelete(null)}>
          <div
            className="fm-modal-card"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            {/* Modal Header */}
            <div className="fm-modal-header">
              <div className="fm-modal-header-title">
                <div
                  className="fm-icon-badge"
                  style={{ width: "38px", height: "38px", fontSize: "20px", background: "#fee2e2", color: "#dc2626" }}
                >
                  <MdWarningAmber />
                </div>
                <div>
                  <h3 id="delete-dialog-title">Delete Floor</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                    Confirm deletion of floor record
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="fm-modal-close-icon-btn"
                onClick={() => !isDeleting && setFloorToDelete(null)}
                aria-label="Close dialog"
                disabled={isDeleting}
              >
                <MdClose />
              </button>
            </div>

            {/* Modal Body */}
            <div className="fm-modal-body">
              <p style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6", margin: "0 0 12px 0" }}>
                Are you sure you want to delete <strong>{floorToDelete.floor_name}</strong> (Floor ID: #{floorToDelete.id})?
              </p>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                This action will mark the floor as inactive in the backend database.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="fm-modal-footer">
              <button
                type="button"
                className="fm-modal-back-btn"
                onClick={() => setFloorToDelete(null)}
                disabled={isDeleting}
              >
                <span>Cancel</span>
              </button>

              <button
                type="button"
                className="fm-btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                <MdDelete />
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewFloors;
