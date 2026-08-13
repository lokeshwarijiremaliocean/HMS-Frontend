import { useState } from "react";

import {
  MdHome,
  MdSearch,
  MdDelete,
  MdAddCircleOutline,
  MdAdd,
  MdArrowForward,
} from "react-icons/md";

import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";
import { addHostel, getHostelByCode, deleteHostelById } from "../../api/hostelApi";

import "../../styles/hostelManagement.css";

// Helper to extract clean user-friendly error messages from backend responses
const extractErrorMessage = (error, defaultMsg = "An error occurred.") => {
  if (!error) return defaultMsg;

  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      const firstErr = data.detail[0];
      if (typeof firstErr === "string") return firstErr;
      if (firstErr?.msg) return firstErr.msg;
    }
  }

  if (error.code === "ERR_NETWORK" || !error.response) {
    return "Backend server is unavailable. Please check if backend server at http://127.0.0.1:8000 is running.";
  }

  if (error.response?.status === 401) {
    return "Unauthorized. Please log in again.";
  }
  if (error.response?.status === 403) {
    return "Forbidden. You do not have permission to perform this action.";
  }

  return error.message || defaultMsg;
};

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
  const [deleteId, setDeleteId] = useState("");

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

  // ─── 1. ADD HOSTEL ───
  // POST /hostel/add with payload: { name, code, city, state, country }
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // Prevent duplicate submissions

    const name = formData.hostelName.trim();
    const code = formData.hostelCode.trim();
    const city = formData.city.trim();
    const state = formData.state.trim();
    const country = formData.country.trim();

    if (!name || !code || !city || !state || !country) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        name,
        code,
        city,
        state,
        country,
      };

      const response = await addHostel(payload);

      if (response.data && response.data.success !== false) {
        setMessage({
          type: "success",
          text: response.data.message || "Hostel added successfully!",
        });
        // Clear/reset form after successful creation
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
      setMessage({
        type: "error",
        text: extractErrorMessage(error, "Failed to add hostel. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── 2. SEARCH HOSTEL ───
  // GET /hostel/{hostel_code}
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // Prevent duplicate submissions

    const codeToSearch = searchCode.trim();
    if (!codeToSearch) {
      setMessage({ type: "error", text: "Please enter a hostel code to search." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    setSearchResult(null);

    try {
      const response = await getHostelByCode(codeToSearch);
      const resData = response.data;

      if (resData && resData.success !== false && (resData.data || resData.name || resData.id)) {
        const hostelInfo = resData.data || resData;
        setSearchResult(hostelInfo);
        setMessage({
          type: "success",
          text: resData.message || "Hostel details retrieved successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: resData?.message || `No hostel found with code "${codeToSearch}".`,
        });
      }
    } catch (error) {
      console.error("Search Hostel Error:", error);
      const msg =
        error.response?.status === 404
          ? `Hostel not found with code "${codeToSearch}".`
          : extractErrorMessage(error, "Error searching hostel.");
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  // ─── 3. DELETE HOSTEL ───
  // DELETE /hostel/{id} (Requires numeric hostel ID)
  const handleDeleteSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // Prevent duplicate submissions

    const idStr = deleteId.toString().trim();
    const numericId = Number(idStr);

    if (!idStr || isNaN(numericId) || numericId <= 0) {
      setMessage({
        type: "error",
        text: "Please enter a valid numeric Hostel ID (integer, e.g. 1).",
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete Hostel ID: ${numericId}?`)) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await deleteHostelById(numericId);
      const resData = response.data;

      if (resData && resData.success !== false) {
        setMessage({
          type: "success",
          text: resData?.message || `Hostel ID ${numericId} deleted successfully!`,
        });
        setDeleteId("");
        if (searchResult && String(searchResult.id) === String(numericId)) {
          setSearchResult(null);
        }
      } else {
        setMessage({
          type: "error",
          text: resData?.message || "Failed to delete hostel.",
        });
      }
    } catch (error) {
      console.error("Delete Hostel Error:", error);
      const msg =
        error.response?.status === 404
          ? `Hostel with ID "${numericId}" not found.`
          : extractErrorMessage(error, "Error deleting hostel.");
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hostel-management-container">
      <Sidebar isOpen={sidebarOpen} />

      <main className="hostel-management-main">
        {/* Shared Navbar */}
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
              <p>Remove hostel by ID</p>
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
                      placeholder="Enter hostel name (e.g. Campus2)"
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
                      placeholder="Enter hostel code (e.g. 0066)"
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
                      placeholder="Enter city (e.g. CSN)"
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
                      placeholder="Enter state (e.g. MH)"
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
                      placeholder="Enter country (e.g. IN)"
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
                      placeholder="Enter hostel code (e.g. 0066)"
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
                      <span className="label">ID</span>
                      <span className="val">{searchResult.id || searchResult.hostel_id || "N/A"}</span>
                    </div>
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
                Remove a hostel by entering its numeric Hostel ID
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
                      Hostel ID <span>*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter numeric Hostel ID (integer, e.g. 1)"
                      value={deleteId}
                      onChange={(e) => setDeleteId(e.target.value)}
                      required
                      min="1"
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
