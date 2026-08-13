import { useState, useEffect, useMemo } from "react";
import { MdEdit, MdRefresh, MdSave, MdSearch } from "react-icons/md";
import {
  getBedById,
  updateBed,
  getHostelsList,
  getFloorsList,
  ROOMS_LIST,
  BEDS_LIST,
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
        const floorData = await getFloorsList();
        const activeFloors = Array.isArray(floorData) ? floorData : [];
        setFloors(activeFloors);

        const hostelData = await getHostelsList();
        if (Array.isArray(hostelData) && hostelData.length > 0) {
          setHostels(hostelData);
        }
      } catch (err) {
        console.error("Dropdown options load notice:", err);
      }
    };
    fetchOptions();
  }, []);

  // Filter floors belonging ONLY to the selected hostel
  const availableFloors = useMemo(() => {
    if (!formData.hostel_id) return [];
    return floors.filter(
      (f) => String(f.hostel_id) === String(formData.hostel_id)
    );
  }, [floors, formData.hostel_id]);

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

      if (res.data && res.data.success === false) {
        const msg = res.data.message || "Bed not found";
        setErrorMessage(msg);
        setActiveBedId(null);
        if (showToast) showToast("error", msg);
        return;
      }

      const data = res.data?.data || res.data;

      if (data && typeof data === "object" && (data.id || data.bed_id || data.room_no || data.bed_no)) {
        setActiveBedId(data.id || data.bed_id || targetId);
        setFormData({
          hostel_id: data.hostel_id !== undefined && data.hostel_id !== null ? Number(data.hostel_id) : 1,
          floor_id: data.floor_id !== undefined && data.floor_id !== null ? Number(data.floor_id) : "",
          floor_name: data.floor_name || "",
          room_no: data.room_no || data.room_number || "",
          bed_no: data.bed_no || data.bed_number || "",
        });
        setFormErrors({});
        if (showToast) showToast("success", res.data?.message || "Bed details loaded for editing.");
      } else {
        const msg = res.data?.message || "Bed not found";
        setErrorMessage(msg);
        setActiveBedId(null);
        if (showToast) showToast("error", msg);
      }
    } catch (err) {
      console.error("Fetch Bed API Error:", err.response?.data || err);
      let msg = "Bed not found";
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d.message === "string" && d.message.trim()) {
          msg = d.message;
        } else if (typeof d.detail === "string" && d.detail.trim()) {
          msg = d.detail;
        } else if (Array.isArray(d.detail) && d.detail.length > 0) {
          errMsg = d.detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(", ");
        }
      } else if (err.message) {
        msg = err.message;
      }
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

      // 1. When Hostel changes:
      // Reset Floor, Room, Bed
      if (name === "hostel_id") {
        updated.hostel_id = value ? Number(value) : "";
        updated.floor_id = "";
        updated.floor_name = "";
        updated.room_no = "";
        updated.bed_no = "";
      }

      // 2. When Floor changes:
      // Reset Room, Bed
      if (name === "floor_id") {
        const selectedFloor = availableFloors.find(
          (f) => String(f.id ?? f.floor_id) === String(value)
        );
        if (selectedFloor) {
          updated.floor_id = Number(selectedFloor.id ?? selectedFloor.floor_id);
          updated.floor_name = String(
            selectedFloor.floor_name ||
            selectedFloor.name ||
            `Floor ${selectedFloor.floor_no || selectedFloor.id}`
          );
        } else {
          updated.floor_id = "";
          updated.floor_name = "";
        }
        updated.room_no = "";
        updated.bed_no = "";
      }

      // 3. When Room changes:
      // Reset Bed
      if (name === "room_no") {
        updated.room_no = value;
        updated.bed_no = "";
      }

      // 4. When Bed changes:
      if (name === "bed_no") {
        updated.bed_no = value;
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
      errors.hostel_id = "Please select a hostel";
    }
    if (!formData.floor_id && formData.floor_id !== 0) {
      errors.floor_id = "Please select a floor";
    }
    if (!formData.room_no) {
      errors.room_no = "Please select a room";
    }
    if (!formData.bed_no) {
      errors.bed_no = "Please select a bed";
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
      const payload = {
        hostel_id: Number(formData.hostel_id),
        floor_id: Number(formData.floor_id),
        floor_name: String(formData.floor_name),
        room_no: String(formData.room_no).trim(),
        bed_no: String(formData.bed_no).trim(),
      };

      const res = await updateBed(activeBedId, payload);

      if (res.data && res.data.success === false) {
        if (showToast) {
          showToast("error", res.data.message || "Failed to update bed");
        }
        return;
      }

      const isSuccess =
        res.status === 200 ||
        res.data?.success ||
        res.data?.id;

      if (isSuccess) {
        if (showToast) {
          showToast("success", res.data?.message || "Bed updated successfully");
        }
        if (onBedUpdated) {
          onBedUpdated(activeBedId, res.data?.data || res.data || payload);
        }
      } else {
        if (showToast) {
          showToast("error", res.data?.message || "Failed to update bed");
        }
      }
    } catch (err) {
      console.error("Update Bed API Error:", err.response?.data || err);
      let errMsg = "Failed to update bed";
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d.message === "string" && d.message.trim()) {
          errMsg = d.message;
        } else if (typeof d.detail === "string" && d.detail.trim()) {
          errMsg = d.detail;
        } else if (Array.isArray(d.detail) && d.detail.length > 0) {
          errMsg = d.detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(", ");
        }
      } else if (err.message) {
        errMsg = err.message;
      }
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
            {/* 1. Hostel Dropdown */}
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
                {hostels.map((h) => {
                  const hId = h.id !== undefined && h.id !== null ? h.id : h.hostel_id || 1;
                  const hLabel = h.name || h.hostel_name || "Campus Next";
                  return (
                    <option key={hId} value={hId}>
                      {hLabel}
                    </option>
                  );
                })}
              </select>
              {formErrors.hostel_id && (
                <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.hostel_id}
                </span>
              )}
            </div>

            {/* 2. Floor Dropdown (Dynamic from Floor API filtered by selected hostel) */}
            <div className="bm-field-group">
              <label htmlFor="up_floor_id">
                Floor <span>*</span>
              </label>
              <select
                id="up_floor_id"
                name="floor_id"
                value={formData.floor_id}
                onChange={handleChange}
                disabled={!formData.hostel_id || saving}
              >
                <option value="">Select Floor</option>
                {availableFloors.map((f) => {
                  const fId = f.id !== undefined && f.id !== null ? f.id : f.floor_id;
                  const fLabel = f.floor_name || f.name || `Floor ${f.floor_no || fId}`;
                  return (
                    <option key={fId} value={fId}>
                      {fLabel}
                    </option>
                  );
                })}
              </select>
              {formErrors.floor_id && (
                <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.floor_id}
                </span>
              )}
            </div>

            {/* 3. Room No. Dropdown (Disabled until Floor is selected) */}
            <div className="bm-field-group">
              <label htmlFor="up_room_no">
                Room No. <span>*</span>
              </label>
              <select
                id="up_room_no"
                name="room_no"
                value={formData.room_no}
                onChange={handleChange}
                disabled={!formData.floor_id || saving}
              >
                <option value="">Select Room</option>
                {ROOMS_LIST.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {formErrors.room_no && (
                <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                  {formErrors.room_no}
                </span>
              )}
            </div>

            {/* 4. Bed No. Dropdown (Disabled until Room is selected) */}
            <div className="bm-field-group">
              <label htmlFor="up_bed_no">
                Bed No. <span>*</span>
              </label>
              <select
                id="up_bed_no"
                name="bed_no"
                value={formData.bed_no}
                onChange={handleChange}
                disabled={!formData.room_no || saving}
              >
                <option value="">Select Bed</option>
                {BEDS_LIST.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
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


