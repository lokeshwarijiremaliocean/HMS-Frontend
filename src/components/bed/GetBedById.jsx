import { useState, useEffect } from "react";
import { MdSearch, MdOutlineFindInPage } from "react-icons/md";
import { getBedById } from "../../api/bedApi";
import BedDetails from "./BedDetails";

function GetBedById({ initialBedId = null, onSelectEdit, onSelectDelete, showToast }) {
  const [searchId, setSearchId] = useState(initialBedId || "");
  const [bedData, setBedData] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async (idToSearch) => {
    const targetId = idToSearch || searchId;
    if (!String(targetId).trim()) {
      if (showToast) showToast("error", "Please enter a Bed ID to search.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSearched(true);
    setBedData(null);

    try {
      const res = await getBedById(targetId);

      if (res.data && res.data.success === false) {
        const msg = res.data.message || "Bed not found";
        setErrorMessage(msg);
        if (showToast) showToast("error", msg);
        return;
      }

      const data = res.data?.data || res.data;
      if (data && typeof data === "object" && Object.keys(data).length > 0 && (data.id || data.bed_id || data.room_no || data.bed_no)) {
        setBedData(data);
        if (showToast) showToast("success", res.data?.message || "Bed details retrieved successfully.");
      } else {
        const msg = res.data?.message || "Bed not found";
        setErrorMessage(msg);
        if (showToast) showToast("error", msg);
      }
    } catch (err) {
      console.error("Get Bed By ID Error:", err);
      let msg = "Bed not found";
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d.message === "string" && d.message.trim()) {
          msg = d.message;
        } else if (typeof d.detail === "string" && d.detail.trim()) {
          msg = d.detail;
        } else if (Array.isArray(d.detail) && d.detail.length > 0) {
          msg = d.detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(", ");
        }
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      if (showToast) showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBedId) {
      setSearchId(initialBedId);
      handleSearch(initialBedId);
    }
  }, [initialBedId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="bm-main-card">
      {/* Header */}
      <div className="bm-form-header">
        <div className="icon-bg orange">
          <MdSearch />
        </div>
        <div>
          <h3>Get Bed by ID</h3>
          <p className="bm-form-subtitle-inline">
            View bed details using the bed ID
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="bm-search-id-bar">
        <div className="bm-inline-field">
          <label htmlFor="get_bed_id">
            Bed ID <span>*</span>
          </label>
          <div className="bm-input-btn-group">
            <input
              type="text"
              id="get_bed_id"
              placeholder="Enter bed ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="bm-btn-blue"
              disabled={loading || !searchId.trim()}
            >
              <MdSearch />
              <span>{loading ? "Searching bed..." : "Search"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Error State */}
      {errorMessage && (
        <div className="bm-alert error" style={{ maxWidth: "760px" }}>
          {errorMessage}
        </div>
      )}

      {/* Loaded Bed Details */}
      {bedData ? (
        <BedDetails
          bed={bedData}
          onEdit={(id) => onSelectEdit && onSelectEdit(id)}
          onDelete={(id) => onSelectDelete && onSelectDelete(id)}
        />
      ) : (
        /* Initial Empty State */
        !loading && !errorMessage && (
          <div className="bm-empty-placeholder-card">
            <div className="bm-placeholder-icon">
              <MdOutlineFindInPage />
            </div>
            <h4>No bed selected</h4>
            <p>Enter bed ID and click search to view bed details.</p>
          </div>
        )
      )}
    </div>
  );
}

export default GetBedById;
