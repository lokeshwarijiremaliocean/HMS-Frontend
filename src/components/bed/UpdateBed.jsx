import { useState, useEffect } from "react";
import { MdEdit, MdRefresh, MdSave, MdSearch } from "react-icons/md";
import {
  getBedById,
  updateBed,
  getHostelsList,
  getFloorsList,
} from "../../api/bedApi";

function UpdateBed({
  initialBedId = null,
  onBedUpdated,
  showToast,
}) {
  const [bedIdToFetch, setBedIdToFetch] = useState(initialBedId || "");
  const [activeBedId, setActiveBedId] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [floors, setFloors] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const initialForm = {
    hostel_id: "",
    floor_id: "",
    floor_name: "",
    room_no: "",
    bed_no: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Fetch dropdown options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [hostelData, floorData] = await Promise.all([
          getHostelsList(),
          getFloorsList(),
        ]);
        if (Array.isArray(hostelData)) setHostels(hostelData);
        if (Array.isArray(floorData)) setFloors(floorData);
      } catch (err) {
        console.warn("Dropdown options load notice:", err.message);
      }
    };
    fetchOptions();
  }, []);

  // Fetch bed details
  const handleFetchBed = async (idToFetch) => {
    const targetId = idToFetch || bedIdToFetch;
    if (!String(targetId).trim()) {
      if (showToast) showToast("error", "Please enter a Bed ID to fetch.");
      return;
    }

    setFetching(true);
    setErrorMessage("");

    try {
      const res = await getBedById(targetId);
      const data = res.data?.data || res.data;

      if (data && (data.id || data.bed_id || data.room_no || data.bed_no)) {
        setActiveBedId(data.id || data.bed_id || targetId);
        setFormData({
          hostel_id: data.hostel_id !== undefined ? data.hostel_id : "",
          floor_id: data.floor_id !== undefined ? data.floor_id : "",
          floor_name: data.floor_name || "",
          room_no: data.room_no || data.room_number || "",
          bed_no: data.bed_no || data.bed_number || "",
        });
        setFormErrors({});
        if (showToast) showToast("success", "Bed details loaded for editing.");
      } else {
        setErrorMessage("Bed not found");
        setActiveBedId(null);
        if (showToast) showToast("error", "Bed not found");
      }
    } catch (err) {
      console.error("Fetch Bed Error:", err);
      const msg = err.response?.data?.message || err.response?.data?.detail || "Bed not found";
      setErrorMessage(msg);
      setActiveBedId(null);
      if (showToast) showToast("error", msg);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (initialBedId) {
      setBedIdToFetch(initialBedId);
      handleFetchBed(initialBedId);
    }
  }, [initialBedId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "floor_id") {
        const selectedFloor = floors.find(
          (f) => String(f.id || f.floor_id) === String(value)
        );
        if (selectedFloor) {
          updated.floor_name =
            selectedFloor.name ||
            selectedFloor.floor_name ||
            `Floor ${selectedFloor.floor_number || value}`;
        }
      }

      return updated;
    });

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.hostel_id && formData.hostel_id !== 0) {
      errors.hostel_id = "Hostel is required";
    }
    if (!formData.floor_id && formData.floor_id !== 0) {
      errors.floor_id = "Floor is required";
    }
    if (!formData.floor_name.trim()) {
      errors.floor_name = "Floor Name is required";
    }
    if (!formData.room_no.trim()) {
      errors.room_no = "Room Number is required";
    }
    if (!formData.bed_no.trim()) {
      errors.bed_no = "Bed Number is required";
    }
    return errors;
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!activeBedId) {
      if (showToast) showToast("error", "Please fetch a valid bed first.");
      return;
    }

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (showToast) showToast("error", "Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await updateBed(activeBedId, formData);
      const isSuccess =
        res.status === 200 ||
        res.data?.success ||
        res.data?.id;

      if (isSuccess) {
        if (showToast) {
          showToast("success", res.data?.message || "Bed updated successfully");
        }
        if (onBedUpdated) {
          onBedUpdated(activeBedId, res.data?.data || res.data || formData);
        }
      } else {
        if (showToast) {
          showToast("error", res.data?.message || "Failed to update bed");
        }
      }
    } catch (err) {
      console.error("Update Bed Error:", err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to update bed";
      if (showToast) {
        showToast("error", errMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (activeBedId) {
      handleFetchBed(activeBedId);
    } else {
      setFormData(initialForm);
      setFormErrors({});
    }
  };

  return (
    <div className="bm-main-card">
      {/* Header */}
      <div className="bm-form-header">
        <div className="icon-bg orange">
          <MdEdit />
        </div>
        <div>
          <h3>Update Bed</h3>
          <p className="bm-form-subtitle-inline">Update bed information</p>
        </div>
      </div>

      {/* 1. Fetch Bed ID Input Bar */}
      <div className="bm-search-id-bar">
        <div className="bm-inline-field">
          <label htmlFor="update_bed_id">
            Bed ID <span>*</span>
          </label>
          <div className="bm-input-btn-group">
            <input
              type="text"
              id="update_bed_id"
              placeholder="Enter bed ID"
              value={bedIdToFetch}
              onChange={(e) => setBedIdToFetch(e.target.value)}
              disabled={fetching || saving}
            />
            <button
              type="button"
              className="bm-btn-orange"
              onClick={() => handleFetchBed()}
              disabled={fetching || saving || !bedIdToFetch.trim()}
            >
              <MdSearch />
              <span>{fetching ? "Fetching bed..." : "Fetch Bed"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {errorMessage && (
        <div className="bm-alert error" style={{ maxWidth: "760px" }}>
          {errorMessage}
        </div>
      )}

      {/* 2. Populated Update Form (Active when a bed is fetched) */}
      {activeBedId ? (
        <form onSubmit={handleUpdateSubmit} className="bm-full-form">
          <div
            style={{
              background: "#fff7ed",
              padding: "10px 16px",
              borderRadius: "8px",
              marginBottom: "18px",
              fontSize: "13.5px",
              color: "#c2410c",
              fontWeight: 600,
            }}
          >
            Editing Bed ID #{activeBedId}
          </div>

          <div className="bm-form-grid">
            {/* 1. Hostel */}
            <div className="bm-field-group">
              <label htmlFor="up_hostel_id">
                Hostel <span>*</span>
              </label>
              <select
                id="up_hostel_id"
                name="hostel_id"
                value={formData.hostel_id}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="">Select Hostel</option>
                {hostels.length > 0 ? (
                  hostels.map((h, i) => (
                    <option key={h.id || i} value={h.id || i + 1}>
                      {h.name || h.hostel_name || `Hostel ${h.id || i + 1}`}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Hostel 1 (Main Campus)</option>
                    <option value="2">Hostel 2 (North Block)</option>
                  </>
                )}
              </select>
              {formErrors.hostel_id && (
                <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.hostel_id}
                </span>
              )}
            </div>

            {/* 2. Floor */}
            <div className="bm-field-group">
              <label htmlFor="up_floor_id">
                Floor <span>*</span>
              </label>
              <select
                id="up_floor_id"
                name="floor_id"
                value={formData.floor_id}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="">Select Floor</option>
                {floors.length > 0 ? (
                  floors.map((f, i) => (
                    <option key={f.id || f.floor_id || i} value={f.id || f.floor_id || i + 1}>
                      {f.name || f.floor_name || `Floor ${f.floor_number || f.floor_id || i + 1}`}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                    <option value="3">Floor 3</option>
                    <option value="4">Floor 4</option>
                    <option value="5">Floor 5</option>
                  </>
                )}
              </select>
              {formErrors.floor_id && (
                <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.floor_id}
                </span>
              )}
            </div>

            {/* 3. Floor Name */}
            <div className="bm-field-group full-width">
              <label htmlFor="up_floor_name">
                Floor Name <span>*</span>
              </label>
              <input
                type="text"
                id="up_floor_name"
                name="floor_name"
                placeholder="Enter floor name"
                value={formData.floor_name}
                onChange={handleChange}
                disabled={saving}
              />
              {formErrors.floor_name && (
                <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.floor_name}
                </span>
              )}
            </div>

            {/* 4. Room No. */}
            <div className="bm-field-group">
              <label htmlFor="up_room_no">
                Room No. <span>*</span>
              </label>
              <input
                type="text"
                id="up_room_no"
                name="room_no"
                placeholder="Enter room number"
                value={formData.room_no}
                onChange={handleChange}
                disabled={saving}
              />
              {formErrors.room_no && (
                <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.room_no}
                </span>
              )}
            </div>

            {/* 5. Bed No. */}
            <div className="bm-field-group">
              <label htmlFor="up_bed_no">
                Bed No. <span>*</span>
              </label>
              <input
                type="text"
                id="up_bed_no"
                name="bed_no"
                placeholder="Enter bed number"
                value={formData.bed_no}
                onChange={handleChange}
                disabled={saving}
              />
              {formErrors.bed_no && (
                <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.bed_no}
                </span>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="bm-form-actions-row">
            <button
              type="submit"
              className="bm-btn-submit"
              disabled={saving}
            >
              <MdSave />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
            <button
              type="button"
              className="bm-btn-reset"
              onClick={handleReset}
              disabled={saving}
            >
              <MdRefresh />
              <span>Reset</span>
            </button>
          </div>
        </form>
      ) : (
        !fetching && (
          <div className="bm-empty-placeholder-card">
            <div className="bm-placeholder-icon">
              <MdEdit />
            </div>
            <h4>No bed selected for update</h4>
            <p>Enter a Bed ID above and click Fetch Bed to populate and edit bed details.</p>
          </div>
        )
      )}
    </div>
  );
}

export default UpdateBed;
