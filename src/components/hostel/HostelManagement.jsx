import { useState } from "react";

import {
  MdMenu,
  MdNotifications,
  MdKeyboardArrowDown,
  MdHome,
  MdSearch,
  MdDelete,
  MdAddCircleOutline,
  MdAdd,
  MdArrowForward,
} from "react-icons/md";

import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";
import { addHostel, searchHostel, deleteHostel } from "../../api/hostelApi";

import "../../styles/hostelManagement.css";

function HostelManagement() {
  const [activeMode, setActiveMode] = useState("add"); // "add", "search", "delete"
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    hostelName: "",
    hostelCode: "",
    city: "",
    state: "",
    country: "",
  });

  const [searchCode, setSearchCode] = useState("");
  const [deleteCode, setDeleteCode] = useState("");

  const [searchResult, setSearchResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleCardClick = (mode) => {
    setActiveMode(mode);
    setMessage({ type: "", text: "" });
    setSearchResult(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 1. Add Hostel Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        name: formData.hostelName,
        code: formData.hostelCode,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        created_by: "Admin",
      };

      const response = await addHostel(payload);

      if (response.data && (response.data.success || response.data.message)) {
        setMessage({
          type: "success",
          text: response.data.message || "Hostel added successfully!",
        });
        setFormData({
          hostelName: "",
          hostelCode: "",
          city: "",
          state: "",
          country: "",
        });
      } else {
        setMessage({
          type: "error",
          text: response.data?.message || "Failed to add hostel.",
        });
      }
    } catch (error) {
      console.error("Add Hostel Error:", error);
      const errMsg = error.response?.data?.detail
        ? (Array.isArray(error.response.data.detail) ? error.response.data.detail[0]?.msg : error.response.data.detail)
        : (error.response?.data?.message || "Error adding hostel.");
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  // 2. Search Hostel Submit
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });
    setSearchResult(null);

    try {
      const response = await searchHostel(searchCode);

      if (response.data && response.data.data) {
        setSearchResult(response.data.data);
        setMessage({
          type: "success",
          text: "Hostel details retrieved successfully!",
        });
      } else if (response.data) {
        setSearchResult(response.data);
        setMessage({
          type: "success",
          text: "Hostel found!",
        });
      } else {
        setMessage({ type: "error", text: "No hostel found with this code." });
      }
    } catch (error) {
      console.error("Search Hostel Error:", error);
      const errMsg = error.response?.data?.detail
        ? (Array.isArray(error.response.data.detail) ? error.response.data.detail[0]?.msg : error.response.data.detail)
        : (error.response?.data?.message || "Hostel not found or server endpoint unavailable.");
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete Hostel Submit
  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!deleteCode.trim()) return;

    if (!window.confirm(`Are you sure you want to delete hostel: ${deleteCode}?`)) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await deleteHostel(deleteCode);

      if (response.data && (response.data.success || response.data.message)) {
        setMessage({
          type: "success",
          text: response.data.message || `Hostel ${deleteCode} deleted successfully!`,
        });
        setDeleteCode("");
      } else {
        setMessage({
          type: "error",
          text: response.data?.message || "Failed to delete hostel.",
        });
      }
    } catch (error) {
      console.error("Delete Hostel Error:", error);
      const errMsg = error.response?.data?.detail
        ? (Array.isArray(error.response.data.detail) ? error.response.data.detail[0]?.msg : error.response.data.detail)
        : (error.response?.data?.message || "Error deleting hostel.");
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hostel-management-container">
      <Sidebar isOpen={sidebarOpen} />

      <main className="hostel-management-main">
        {/* Shared Navbar with 👤 Admin Profile and 🔔 Notification Bell */}
        <Navbar
          title="Hostel Management"
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* ---- Action Cards (Interactive Mode Selectors) ---- */}
        <div className="hm-action-cards">
          <div
            className={`hm-action-card add-card ${
              activeMode === "add" ? "active" : ""
            }`}
            onClick={() => handleCardClick("add")}
          >
            <div className="hm-card-icon">
              <MdHome />
            </div>
            <div className="hm-card-text">
              <h3>Add Hostel</h3>
              <p>Create a new hostel</p>
            </div>
            <MdArrowForward className="hm-card-arrow" />
          </div>

          <div
            className={`hm-action-card search-card ${
              activeMode === "search" ? "active" : ""
            }`}
            onClick={() => handleCardClick("search")}
          >
            <div className="hm-card-icon">
              <MdSearch />
            </div>
            <div className="hm-card-text">
              <h3>Search Hostel</h3>
              <p>Find hostel by code</p>
            </div>
            <MdArrowForward className="hm-card-arrow" />
          </div>

          <div
            className={`hm-action-card delete-card ${
              activeMode === "delete" ? "active" : ""
            }`}
            onClick={() => handleCardClick("delete")}
          >
            <div className="hm-card-icon">
              <MdDelete />
            </div>
            <div className="hm-card-text">
              <h3>Delete Hostel</h3>
              <p>Remove hostel by ID / Code</p>
            </div>
            <MdArrowForward className="hm-card-arrow" />
          </div>
        </div>

        {/* ---- Dynamic Form Section Based On Selected Card ---- */}
        <div className="hm-form-section">
          {/* MODE 1: ADD HOSTEL */}
          {activeMode === "add" && (
            <>
              <div className="hm-form-header">
                <div className="hm-form-icon">
                  <MdAddCircleOutline />
                </div>
                <h2>Add New Hostel</h2>
              </div>
              <p className="hm-form-subtitle">
                Enter the hostel information below
              </p>

              {message.text && (
                <div className={`hm-alert ${message.type}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleAddSubmit}>
                <div className="hm-form-grid">
                  <div className="hm-form-group">
                    <label>
                      Hostel Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="hostelName"
                      placeholder="Enter hostel name"
                      value={formData.hostelName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="hm-form-group">
                    <label>
                      Hostel Code <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="hostelCode"
                      placeholder="Enter hostel code"
                      value={formData.hostelCode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="hm-form-group">
                    <label>
                      City <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="hm-form-group">
                    <label>
                      State <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="hm-form-group full-width">
                    <label>
                      Country <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      placeholder="Enter country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="hm-form-actions">
                  <button type="submit" className="hm-add-btn" disabled={loading}>
                    <MdAdd />
                    {loading ? "Adding..." : "Add Hostel"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* MODE 2: SEARCH HOSTEL */}
          {activeMode === "search" && (
            <>
              <div className="hm-form-header">
                <div className="hm-form-icon" style={{ background: "#e3f2fd", color: "#2196f3" }}>
                  <MdSearch />
                </div>
                <h2>Search Hostel</h2>
              </div>
              <p className="hm-form-subtitle">
                Search hostel details by unique hostel code
              </p>

              {message.text && (
                <div className={`hm-alert ${message.type}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSearchSubmit}>
                <div className="hm-form-grid">
                  <div className="hm-form-group full-width">
                    <label>
                      Hostel Code <span>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter hostel code (e.g. HSTL101)"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="hm-form-actions">
                  <button
                    type="submit"
                    className="hm-add-btn"
                    style={{ background: "#2196F3" }}
                    disabled={loading}
                  >
                    <MdSearch />
                    {loading ? "Searching..." : "Search Hostel"}
                  </button>
                </div>
              </form>

              {/* Search Result Card Display */}
              {searchResult && (
                <div className="hm-result-card">
                  <h3>Hostel Details</h3>
                  <div className="hm-result-grid">
                    <div className="hm-result-item">
                      <span className="label">Name</span>
                      <span className="val">{searchResult.name || searchResult.hostel_name || "N/A"}</span>
                    </div>
                    <div className="hm-result-item">
                      <span className="label">Code</span>
                      <span className="val">{searchResult.code || searchResult.hostel_code || searchCode}</span>
                    </div>
                    <div className="hm-result-item">
                      <span className="label">City</span>
                      <span className="val">{searchResult.city || "N/A"}</span>
                    </div>
                    <div className="hm-result-item">
                      <span className="label">State</span>
                      <span className="val">{searchResult.state || "N/A"}</span>
                    </div>
                    <div className="hm-result-item">
                      <span className="label">Country</span>
                      <span className="val">{searchResult.country || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* MODE 3: DELETE HOSTEL */}
          {activeMode === "delete" && (
            <>
              <div className="hm-form-header">
                <div className="hm-form-icon" style={{ background: "#ffebee", color: "#d32f2f" }}>
                  <MdDelete />
                </div>
                <h2>Delete Hostel</h2>
              </div>
              <p className="hm-form-subtitle">
                Remove a hostel by entering its unique code or ID
              </p>

              {message.text && (
                <div className={`hm-alert ${message.type}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleDeleteSubmit}>
                <div className="hm-form-grid">
                  <div className="hm-form-group full-width">
                    <label>
                      Hostel Code / ID <span>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter hostel code or ID to delete"
                      value={deleteCode}
                      onChange={(e) => setDeleteCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="hm-form-actions">
                  <button
                    type="submit"
                    className="hm-add-btn hm-delete-btn"
                    disabled={loading}
                  >
                    <MdDelete />
                    {loading ? "Deleting..." : "Delete Hostel"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default HostelManagement;
