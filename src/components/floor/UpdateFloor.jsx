import { useState, useEffect } from "react";
import {
  MdEdit,
  MdRefresh,
  MdSearch,
  MdApartment,
  MdHotel,
  MdTag,
  MdSave,
  MdCheckCircle,
  MdErrorOutline,
} from "react-icons/md";
import { getFloorById, updateFloor } from "../../api/floorApi";
import { getAuthToken, getApiErrorMessage } from "../../api/axiosInstance";

function UpdateFloor({ floors = [], initialFloorId = "", onFloorUpdated }) {
  const [searchId, setSearchId] = useState(initialFloorId ? String(initialFloorId) : "");
  const [isFetched, setIsFetched] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    hostel_id: "",
    floor_no: "",
    floor_name: "",
  });

  // Automatically fetch if initialFloorId changes
  useEffect(() => {
    if (initialFloorId) {
      const idStr = String(initialFloorId);
      setSearchId(idStr);
      handleFetchById(idStr);
    }
  }, [initialFloorId]);

  const handleFetchById = async (idToFetch) => {
    const targetId = idToFetch || searchId.trim();
    if (!targetId) {
      setErrorMessage("Please enter a Floor ID to fetch.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setErrorMessage("No authentication token found. Please log in from the home screen to access floor management.");
      return;
    }

    setIsFetching(true);
    setErrorMessage("");
    setToastMessage("");

    try {
      const res = await getFloorById(targetId);
      if (res.data && (res.data.data || res.data.id)) {
        const floor = res.data.data || res.data;
        setFormData({
          hostel_id: floor.hostel_id !== undefined && floor.hostel_id !== null ? String(floor.hostel_id) : "",
          floor_no: floor.floor_no !== undefined && floor.floor_no !== null ? String(floor.floor_no) : "",
          floor_name: floor.floor_name || "",
        });
        setIsFetched(true);
      } else {
        fallbackLocalFind(targetId);
      }
    } catch (err) {
      console.warn("Backend getFloorById failed, attempting fallback:", err);
      fallbackLocalFind(targetId);
    } finally {
      setIsFetching(false);
    }
  };

  const fallbackLocalFind = (id) => {
    const found = floors.find((f) => String(f.id) === String(id));
    if (found) {
      setFormData({
        hostel_id: String(found.hostel_id || ""),
        floor_no: String(found.floor_no || ""),
        floor_name: found.floor_name || "",
      });
      setIsFetched(true);
      setErrorMessage("");
    } else {
      setIsFetched(false);
      setErrorMessage(`Floor #${id} not found.`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setSearchId("");
    setFormData({
      hostel_id: "",
      floor_no: "",
      floor_name: "",
    });
    setIsFetched(false);
    setToastMessage("");
    setErrorMessage("");
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!searchId) {
      setErrorMessage("Please fetch a valid Floor ID first.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setErrorMessage("No authentication token found. Please log in from the home screen to access floor management.");
      return;
    }

    if (!formData.floor_name.trim() || formData.floor_no === "" || formData.hostel_id === "") {
      setErrorMessage("Please fill in all required fields (Hostel ID, Floor No, Floor Name).");
      return;
    }

    const payload = {
      hostel_id: parseInt(formData.hostel_id, 10),
      floor_no: parseInt(formData.floor_no, 10),
      floor_name: formData.floor_name.trim(),
    };

    if (isNaN(payload.hostel_id) || isNaN(payload.floor_no)) {
      setErrorMessage("Hostel ID and Floor No must be valid numbers.");
      return;
    }

    setIsUpdating(true);
    setErrorMessage("");
    setToastMessage("");

    try {
      const res = await updateFloor(searchId, payload);
      if (res.data && (res.data.success || res.status === 200)) {
        const successMsg = res.data.message || `Floor #${searchId} updated successfully!`;
        setToastMessage(successMsg);

        if (onFloorUpdated) {
          await onFloorUpdated();
        }

        setTimeout(() => {
          setToastMessage("");
        }, 4000);
      } else {
        setErrorMessage(res.data?.message || "Failed to update floor.");
      }
    } catch (err) {
      console.error("Update floor error:", err);
      const msg = getApiErrorMessage(err, "Failed to update floor.");
      setErrorMessage(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fm-main-card">
      {/* Page Header */}
      <div className="fm-card-header">
        <div className="fm-card-title-group">
          <div className="fm-icon-badge orange">
            <MdEdit />
          </div>
          <div>
            <h3>Update Floor</h3>
            <p>Fetch and update existing floor information by Floor ID</p>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {toastMessage && (
        <div className="fm-toast-alert success">
          <MdCheckCircle style={{ fontSize: "20px" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="fm-toast-alert error">
          <MdErrorOutline style={{ fontSize: "20px" }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Search / Fetch Floor by ID */}
      <div className="fm-search-panel" style={{ marginBottom: "24px" }}>
        <div className="fm-search-panel-title">
          <MdSearch />
          <span>Fetch Floor to Update</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetchById();
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="fm-form-group" style={{ flex: 1, minWidth: "200px" }}>
              <label htmlFor="update-search-floor-id">Floor ID *</label>
              <div className="fm-input-wrapper">
                <MdTag />
                <input
                  id="update-search-floor-id"
                  type="number"
                  className="fm-input"
                  placeholder="Enter Floor ID (e.g. 1, 2, 3...)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  required
                  disabled={isFetching}
                />
              </div>
            </div>

            <button
              type="submit"
              className="fm-btn-search"
              disabled={isFetching}
              style={{ height: "44px" }}
            >
              <MdSearch />
              <span>{isFetching ? "Fetching..." : "Fetch Floor"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Step 2: Update Form */}
      <form onSubmit={handleUpdateSubmit}>
        <div className="fm-form-grid">
          {/* Floor ID (Readonly) */}
          <div className="fm-form-group">
            <label>Floor ID</label>
            <div className="fm-input-wrapper">
              <MdTag />
              <input
                type="text"
                className="fm-input"
                value={isFetched && searchId ? `#${searchId}` : "Fetch a floor first"}
                disabled
                style={{ background: "#f8fafc", color: "#64748b", cursor: "not-allowed" }}
              />
            </div>
          </div>

          {/* Hostel ID */}
          <div className="fm-form-group">
            <label htmlFor="update-hostel-id">Hostel ID *</label>
            <div className="fm-input-wrapper">
              <MdHotel />
              <input
                id="update-hostel-id"
                type="number"
                name="hostel_id"
                className="fm-input"
                placeholder="e.g. 1"
                value={formData.hostel_id}
                onChange={handleInputChange}
                required
                disabled={!isFetched || isUpdating}
              />
            </div>
          </div>

          {/* Floor No */}
          <div className="fm-form-group">
            <label htmlFor="update-floor-no">Floor No. *</label>
            <div className="fm-input-wrapper">
              <MdTag />
              <input
                id="update-floor-no"
                type="number"
                name="floor_no"
                className="fm-input"
                placeholder="e.g. 1, 2, 3..."
                value={formData.floor_no}
                onChange={handleInputChange}
                required
                disabled={!isFetched || isUpdating}
              />
            </div>
          </div>

          {/* Floor Name */}
          <div className="fm-form-group">
            <label htmlFor="update-floor-name">Floor Name *</label>
            <div className="fm-input-wrapper">
              <MdApartment />
              <input
                id="update-floor-name"
                type="text"
                name="floor_name"
                className="fm-input"
                placeholder="e.g. First Floor"
                value={formData.floor_name}
                onChange={handleInputChange}
                required
                disabled={!isFetched || isUpdating}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fm-form-actions">
          <button
            type="button"
            className="fm-btn-clear"
            onClick={handleReset}
            disabled={isUpdating}
          >
            <MdRefresh />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            className="fm-btn-search"
            disabled={!isFetched || isUpdating}
          >
            <MdSave />
            <span>{isUpdating ? "Updating Floor..." : "Update Floor"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateFloor;
