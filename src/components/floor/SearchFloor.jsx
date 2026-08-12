import { useState } from "react";
import {
  MdSearch,
  MdRefresh,
  MdApartment,
  MdTag,
  MdHotel,
  MdVisibility,
  MdFilterAlt,
} from "react-icons/md";

function SearchFloor({ floors = [], onSelectView }) {
  const [floorIdQuery, setFloorIdQuery] = useState("");
  const [floorNameQuery, setFloorNameQuery] = useState("");
  const [hostelIdQuery, setHostelIdQuery] = useState("");

  // Search state
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState(floors);

  // UI-only search action
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setHasSearched(true);

    const fId = floorIdQuery.trim().toLowerCase();
    const fName = floorNameQuery.trim().toLowerCase();
    const hId = hostelIdQuery.trim().toLowerCase();

    // If no search filter is entered, show all floors
    if (!fId && !fName && !hId) {
      setSearchResults(floors);
      return;
    }

    const filtered = floors.filter((floor) => {
      const matchId = !fId || String(floor.id ?? "").toLowerCase().includes(fId);
      const matchName = !fName || String(floor.floor_name ?? "").toLowerCase().includes(fName);
      const matchHostel = !hId || String(floor.hostel_id ?? "").toLowerCase().includes(hId);

      return matchId && matchName && matchHostel;
    });

    setSearchResults(filtered);
  };

  // UI-only clear action
  const handleClear = () => {
    setFloorIdQuery("");
    setFloorNameQuery("");
    setHostelIdQuery("");
    setHasSearched(false);
    setSearchResults(floors);
  };

  return (
    <div className="fm-main-card">
      {/* Page Header */}
      <div className="fm-card-header">
        <div className="fm-card-title-group">
          <div className="fm-icon-badge orange">
            <MdSearch />
          </div>
          <div>
            <h3>Search Floors</h3>
            <p>Filter and locate floor records by Floor ID, Floor Name, or Hostel ID</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Card */}
      <div className="fm-search-panel">
        <div className="fm-search-panel-title">
          <MdFilterAlt />
          <span>Floor Search Criteria</span>
        </div>

        <form onSubmit={handleSearch}>
          <div className="fm-search-grid">
            {/* Search by Floor ID */}
            <div className="fm-form-group">
              <label htmlFor="search-floor-id">Floor ID</label>
              <div className="fm-input-wrapper">
                <MdTag />
                <input
                  id="search-floor-id"
                  type="text"
                  className="fm-input"
                  placeholder="e.g. 1, 2, 3..."
                  value={floorIdQuery}
                  onChange={(e) => setFloorIdQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Search by Floor Name */}
            <div className="fm-form-group">
              <label htmlFor="search-floor-name">Floor Name</label>
              <div className="fm-input-wrapper">
                <MdApartment />
                <input
                  id="search-floor-name"
                  type="text"
                  className="fm-input"
                  placeholder="e.g. Ground Floor, First Floor..."
                  value={floorNameQuery}
                  onChange={(e) => setFloorNameQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Optional Hostel ID Filter */}
            <div className="fm-form-group">
              <label htmlFor="search-hostel-id">
                Hostel ID <span className="optional-tag">(Optional)</span>
              </label>
              <div className="fm-input-wrapper">
                <MdHotel />
                <input
                  id="search-hostel-id"
                  type="text"
                  className="fm-input"
                  placeholder="e.g. 101, 102..."
                  value={hostelIdQuery}
                  onChange={(e) => setHostelIdQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="fm-form-actions">
            <button
              type="button"
              className="fm-btn-clear"
              onClick={handleClear}
            >
              <MdRefresh />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              className="fm-btn-search"
            >
              <MdSearch />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search Results Area */}
      {searchResults.length > 0 ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#334155", margin: 0 }}>
              Search Results ({searchResults.length} {searchResults.length === 1 ? "floor" : "floors"} found)
            </h4>
            {hasSearched && (
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Filtered results
              </span>
            )}
          </div>

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
                {searchResults.map((floor) => {
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
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="fm-empty-state-card">
          <div className="fm-empty-icon">
            <MdApartment />
          </div>
          <h4 className="fm-empty-title">No floors found</h4>
          <p className="fm-empty-desc">
            No floor records match your search criteria. Please try different filters or clear your search.
          </p>
          <button
            type="button"
            className="fm-btn-clear"
            onClick={handleClear}
            style={{ margin: "0 auto" }}
          >
            <MdRefresh />
            <span>Reset Search</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchFloor;
