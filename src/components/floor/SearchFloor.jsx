import { useState, useEffect } from "react";
import {
  MdSearch,
  MdRefresh,
  MdApartment,
  MdTag,
  MdHotel,
  MdVisibility,
  MdFilterAlt,
  MdErrorOutline,
} from "react-icons/md";
import { getFloorByName, getAllFloors } from "../../api/floorApi";
import { getAuthToken, getApiErrorMessage } from "../../api/axiosInstance";

function SearchFloor({ floors = [], onSelectView }) {
  const [floorNoQuery, setFloorNoQuery] = useState("");
  const [floorNameQuery, setFloorNameQuery] = useState("");
  const [hostelIdQuery, setHostelIdQuery] = useState("");

  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(floors);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync initial floors if floors prop changes and user hasn't searched
  useEffect(() => {
    if (!hasSearched) {
      setSearchResults(floors);
    }
  }, [floors, hasSearched]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setHasSearched(true);
    setErrorMessage("");

    const token = getAuthToken();
    if (!token) {
      setErrorMessage("No authentication token found. Please log in from the home screen to search floors.");
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    const fNo = floorNoQuery.trim();
    const fName = floorNameQuery.trim();
    const hId = hostelIdQuery.trim();

    // If no search filter is entered, load all active floors from backend
    if (!fNo && !fName && !hId) {
      try {
        const res = await getAllFloors();
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setSearchResults(list);
      } catch (err) {
        if (err.response?.status === 404) {
          setSearchResults([]);
        } else {
          setErrorMessage(err.response?.data?.message || "Failed to retrieve floors.");
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
      }
      return;
    }

    // Single-field search by name: use backend GET /floor/name?floor_name=...
    if (fName && !fNo && !hId) {
      try {
        const res = await getFloorByName(fName);
        if (res.data?.data) {
          setSearchResults([res.data.data]);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setSearchResults([]);
        } else if (err.response?.status === 401) {
          setErrorMessage("Invalid or expired authentication token. Please log in again to refresh your session.");
          setSearchResults([]);
        } else {
          console.error("Error searching floor by name:", err);
          setErrorMessage(err.response?.data?.message || "Floor not found.");
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
      }
      return;
    }

    // Floor No, Hostel ID, or Multi-criteria search: fetch /floors and filter in-memory with AND logic
    try {
      const res = await getAllFloors();
      const allFloors = Array.isArray(res.data?.data) ? res.data.data : [];

      const filtered = allFloors.filter((floor) => {
        const matchNo = !fNo || String(floor.floor_no) === fNo;
        const matchName = !fName || String(floor.floor_name || "").toLowerCase().includes(fName.toLowerCase());
        const matchHostel = !hId || String(floor.hostel_id) === hId;

        return matchNo && matchName && matchHostel;
      });

      setSearchResults(filtered);
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchResults([]);
      } else {
        console.error("Error filtering floors:", err);
        setErrorMessage(getApiErrorMessage(err, "Failed to search floors."));
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setFloorNoQuery("");
    setFloorNameQuery("");
    setHostelIdQuery("");
    setHasSearched(false);
    setErrorMessage("");
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
            <p>Filter and locate floor records by Floor No, Floor Name, or Hostel ID</p>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {errorMessage && (
        <div className="fm-toast-alert error">
          <MdErrorOutline style={{ fontSize: "20px" }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search & Filter Card */}
      <div className="fm-search-panel">
        <div className="fm-search-panel-title">
          <MdFilterAlt />
          <span>Floor Search Criteria</span>
        </div>

        <form onSubmit={handleSearch}>
          <div className="fm-search-grid">
            {/* Search by Floor No */}
            <div className="fm-form-group">
              <label htmlFor="search-floor-no">Floor No.</label>
              <div className="fm-input-wrapper">
                <MdTag />
                <input
                  id="search-floor-no"
                  type="number"
                  className="fm-input"
                  placeholder="e.g. 1, 2, 3..."
                  value={floorNoQuery}
                  onChange={(e) => setFloorNoQuery(e.target.value)}
                  disabled={isSearching}
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
                  disabled={isSearching}
                />
              </div>
            </div>

            {/* Search by Hostel ID */}
            <div className="fm-form-group">
              <label htmlFor="search-hostel-id">
                Hostel ID <span className="optional-tag">(Optional)</span>
              </label>
              <div className="fm-input-wrapper">
                <MdHotel />
                <input
                  id="search-hostel-id"
                  type="number"
                  className="fm-input"
                  placeholder="e.g. 1, 2..."
                  value={hostelIdQuery}
                  onChange={(e) => setHostelIdQuery(e.target.value)}
                  disabled={isSearching}
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
              disabled={isSearching}
            >
              <MdRefresh />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              className="fm-btn-search"
              disabled={isSearching}
            >
              <MdSearch />
              <span>{isSearching ? "Searching..." : "Search"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isSearching ? (
        <div className="fm-loading-container">
          <div className="fm-spinner"></div>
          <span>Searching floors from backend...</span>
        </div>
      ) : searchResults.length > 0 ? (
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
