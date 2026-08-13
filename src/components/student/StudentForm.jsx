import { useState, useEffect } from "react";
import {
  MdPersonAdd,
  MdRefresh,
  MdSave,
  MdSearch,
  MdEdit,
} from "react-icons/md";
import { addStudent, updateStudent, getStudentByRollNo, getAllStudents } from "../../api/studentApi";
import { parseIntegerOrZero, extractErrorMessage, extractSingleStudent, extractStudentList } from "./studentUtils";

const INITIAL_ADD_FORM = {
  rollNo: "",
  firstName: "",
  lastName: "",
  gender: "",
  phone: "",
  email: "",
  bloodGroup: "",
  parentName: "",
  parentPhone: "",
  degree: "",
  branch: "",
  academicYear: "",
  floorNo: "",
  roomNo: "",
  bedNo: "",
};

const INITIAL_UPDATE_FORM = {
  first_name: "",
  last_name: "",
  gender: "",
  phone: "",
  email: "",
  parent_name: "",
  parent_phone: "",
  degree: "",
  branch: "",
  academic_year: "",
  floor_no: "",
  room_no: "",
  bed_no: "",
  blood_group: "",
};

function StudentForm({
  mode = "add", // "add" | "update"
  allStudents = [],
  prefillStudent = null,
  showToast,
  onSuccess,
}) {
  // Add state
  const [addFormData, setAddFormData] = useState({ ...INITIAL_ADD_FORM });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Update state
  const [updateQuery, setUpdateQuery] = useState("");
  const [updateDbId, setUpdateDbId] = useState(null);
  const [updateRollNo, setUpdateRollNo] = useState("");
  const [updateData, setUpdateData] = useState({ ...INITIAL_UPDATE_FORM });
  const [fetchingUpdate, setFetchingUpdate] = useState(false);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  // Handle prefill if passed from table edit button or view action
  useEffect(() => {
    if (mode === "update" && prefillStudent) {
      setUpdateDbId(prefillStudent.id);
      setUpdateRollNo(prefillStudent.roll_no || "");
      setUpdateQuery(String(prefillStudent.roll_no || prefillStudent.id || ""));
      setUpdateData({
        first_name: prefillStudent.first_name || "",
        last_name: prefillStudent.last_name || "",
        gender: prefillStudent.gender || "",
        phone: prefillStudent.phone || "",
        email: prefillStudent.email || "",
        parent_name: prefillStudent.parent_name || "",
        parent_phone: prefillStudent.parent_phone || "",
        degree: prefillStudent.degree || "",
        branch: prefillStudent.branch || "",
        academic_year: prefillStudent.academic_year !== undefined ? String(prefillStudent.academic_year) : "",
        floor_no: prefillStudent.floor_no !== undefined && Number(prefillStudent.floor_no) > 0 ? String(prefillStudent.floor_no) : "",
        room_no: prefillStudent.room_no !== undefined && Number(prefillStudent.room_no) > 0 ? String(prefillStudent.room_no) : "",
        bed_no: prefillStudent.bed_no !== undefined && Number(prefillStudent.bed_no) > 0 ? String(prefillStudent.bed_no) : "",
        blood_group: prefillStudent.blood_group || "",
      });
    }
  }, [mode, prefillStudent]);

  // Handle room change in Add Form -> Resets Bed choice to prevent stale selection
  const handleAddRoomChange = (newRoomVal) => {
    setAddFormData((prev) => ({
      ...prev,
      roomNo: newRoomVal,
      bedNo: "", // Reset bed selection for newly selected room
    }));
  };

  // Handle room change in Update Form -> Resets Bed choice to prevent stale selection
  const handleUpdateRoomChange = (newRoomVal) => {
    setUpdateData((prev) => ({
      ...prev,
      room_no: newRoomVal,
      bed_no: "", // Reset bed selection for newly selected room
    }));
  };

  // Validate allocation numeric boundaries
  const validateAllocation = (floorVal, roomVal, bedVal) => {
    if (floorVal !== 0 && (floorVal < 1 || floorVal > 10)) {
      showToast("error", "Floor number must be between 1 and 10 (F1 - F10)");
      return false;
    }
    if (roomVal !== 0 && (roomVal < 1 || roomVal > 100)) {
      showToast("error", "Room number must be between 1 and 100 (R1 - R100)");
      return false;
    }
    if (bedVal !== 0 && (bedVal < 1 || bedVal > 3)) {
      showToast("error", "Bed number must be between 1 and 3 (Bed 1 - Bed 3)");
      return false;
    }
    return true;
  };

  // ─── ADD STUDENT SUBMIT ───
  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();

    // Required fields check
    if (!addFormData.rollNo || isNaN(parseInt(addFormData.rollNo, 10))) {
      showToast("error", "Please enter a valid numeric Roll Number");
      return;
    }
    if (!addFormData.firstName.trim() || !addFormData.lastName.trim()) {
      showToast("error", "First name and last name are required");
      return;
    }
    if (!addFormData.gender) {
      showToast("error", "Please select gender");
      return;
    }
    if (!addFormData.phone.trim()) {
      showToast("error", "Phone number is required");
      return;
    }
    if (!addFormData.email.trim()) {
      showToast("error", "Email is required");
      return;
    }
    if (!addFormData.parentName.trim() || !addFormData.parentPhone.trim()) {
      showToast("error", "Parent name and parent phone are required");
      return;
    }
    if (!addFormData.degree.trim() || !addFormData.branch.trim()) {
      showToast("error", "Degree and branch are required");
      return;
    }
    if (!addFormData.academicYear || isNaN(parseInt(addFormData.academicYear, 10))) {
      showToast("error", "Academic year is required");
      return;
    }

    const floorVal = parseIntegerOrZero(addFormData.floorNo);
    const roomVal = parseIntegerOrZero(addFormData.roomNo);
    const bedVal = parseIntegerOrZero(addFormData.bedNo);

    if (!validateAllocation(floorVal, roomVal, bedVal)) {
      return;
    }

    setSubmittingAdd(true);
    try {
      const payload = {
        roll_no: parseIntegerOrZero(addFormData.rollNo),
        first_name: addFormData.firstName.trim(),
        last_name: addFormData.lastName.trim(),
        gender: addFormData.gender,
        phone: String(addFormData.phone.trim()),
        email: addFormData.email.trim(),
        parent_name: addFormData.parentName.trim(),
        parent_phone: String(addFormData.parentPhone.trim()),
        degree: addFormData.degree.trim(),
        branch: addFormData.branch.trim(),
        academic_year: parseIntegerOrZero(addFormData.academicYear),
        floor_no: floorVal,
        room_no: roomVal,
        bed_no: bedVal,
        blood_group: addFormData.bloodGroup ? addFormData.bloodGroup.trim() : "",
      };

      const res = await addStudent(payload);
      showToast("success", "Student added successfully");
      setAddFormData({ ...INITIAL_ADD_FORM });
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to add student");
      showToast("error", msg);
    } finally {
      setSubmittingAdd(false);
    }
  };

  // ─── FETCH STUDENT FOR UPDATE ───
  const handleFetchUpdateStudent = async () => {
    const queryVal = updateQuery.trim();
    if (!queryVal) {
      showToast("error", "Please enter a Student ID or Roll Number");
      return;
    }

    setFetchingUpdate(true);
    setUpdateDbId(null);
    setUpdateRollNo("");
    try {
      let targetStudent = null;

      // 1. Search in-memory list
      targetStudent = allStudents.find(
        (item) => String(item.id) === queryVal || String(item.roll_no) === queryVal
      );

      // 2. If not found, fetch by Roll Number API
      if (!targetStudent) {
        try {
          const rollRes = await getStudentByRollNo(queryVal);
          targetStudent = extractSingleStudent(rollRes.data);
        } catch {
          // ignore error here and fallback
        }
      }

      // 3. If still not found, fetch all students API to search by ID
      if (!targetStudent) {
        try {
          const allRes = await getAllStudents();
          const list = extractStudentList(allRes.data);
          targetStudent = list.find(
            (item) => String(item.id) === queryVal || String(item.roll_no) === queryVal
          );
        } catch {
          // ignore
        }
      }

      if (targetStudent) {
        setUpdateDbId(targetStudent.id);
        setUpdateRollNo(targetStudent.roll_no || "");
        setUpdateData({
          first_name: targetStudent.first_name || "",
          last_name: targetStudent.last_name || "",
          gender: targetStudent.gender || "",
          phone: targetStudent.phone || "",
          email: targetStudent.email || "",
          parent_name: targetStudent.parent_name || "",
          parent_phone: targetStudent.parent_phone || "",
          degree: targetStudent.degree || "",
          branch: targetStudent.branch || "",
          academic_year: targetStudent.academic_year !== undefined ? String(targetStudent.academic_year) : "",
          floor_no: targetStudent.floor_no !== undefined && Number(targetStudent.floor_no) > 0 ? String(targetStudent.floor_no) : "",
          room_no: targetStudent.room_no !== undefined && Number(targetStudent.room_no) > 0 ? String(targetStudent.room_no) : "",
          bed_no: targetStudent.bed_no !== undefined && Number(targetStudent.bed_no) > 0 ? String(targetStudent.bed_no) : "",
          blood_group: targetStudent.blood_group || "",
        });
        showToast("success", `Loaded record for ${targetStudent.first_name} ${targetStudent.last_name}`);
      } else {
        showToast("error", "Student not found");
      }
    } catch (err) {
      showToast("error", extractErrorMessage(err, "Failed to fetch student details"));
    } finally {
      setFetchingUpdate(false);
    }
  };

  // ─── UPDATE STUDENT SUBMIT ───
  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    if (!updateDbId) {
      showToast("error", "Please fetch a student first before updating");
      return;
    }

    const floorVal = parseIntegerOrZero(updateData.floor_no);
    const roomVal = parseIntegerOrZero(updateData.room_no);
    const bedVal = parseIntegerOrZero(updateData.bed_no);

    if (!validateAllocation(floorVal, roomVal, bedVal)) {
      return;
    }

    setSubmittingUpdate(true);
    try {
      const payload = {
        first_name: updateData.first_name.trim(),
        last_name: updateData.last_name.trim(),
        gender: updateData.gender,
        phone: String(updateData.phone || "").trim(),
        email: updateData.email.trim(),
        parent_name: updateData.parent_name.trim(),
        parent_phone: String(updateData.parent_phone || "").trim(),
        degree: updateData.degree.trim(),
        branch: updateData.branch.trim(),
        academic_year: parseIntegerOrZero(updateData.academic_year),
        floor_no: floorVal,
        room_no: roomVal,
        bed_no: bedVal,
        blood_group: updateData.blood_group ? updateData.blood_group.trim() : "",
      };

      const res = await updateStudent(updateDbId, payload);
      showToast("success", "Student updated successfully");
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to update student");
      showToast("error", msg);
    } finally {
      setSubmittingUpdate(false);
    }
  };

  if (mode === "add") {
    return (
      <div className="sm-card">
        <div className="sm-card-header">
          <div>
            <h2>Add New Student</h2>
            <p>Enter student information and hostel allocation details</p>
          </div>
        </div>

        <form onSubmit={handleAddStudentSubmit} className="sm-form">
          {/* SECTION 1: Personal Information */}
          <div className="sm-form-section">
            <h3 className="sm-section-title">SECTION 1 — Personal Information</h3>
            <div className="sm-form-grid">
              <div className="sm-field">
                <label>
                  Roll No. <span className="required">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter roll number (e.g. 1001)"
                  value={addFormData.rollNo}
                  onChange={(e) => setAddFormData({ ...addFormData, rollNo: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  value={addFormData.firstName}
                  onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={addFormData.lastName}
                  onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>
                  Gender <span className="required">*</span>
                </label>
                <select
                  value={addFormData.gender}
                  onChange={(e) => setAddFormData({ ...addFormData, gender: e.target.value })}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm-field">
                <label>
                  Phone <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>Blood Group</label>
                <select
                  value={addFormData.bloodGroup}
                  onChange={(e) => setAddFormData({ ...addFormData, bloodGroup: e.target.value })}
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Parent / Guardian Information */}
          <div className="sm-form-section">
            <h3 className="sm-section-title">SECTION 2 — Parent / Guardian Information</h3>
            <div className="sm-form-grid">
              <div className="sm-field">
                <label>
                  Parent Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter parent name"
                  value={addFormData.parentName}
                  onChange={(e) => setAddFormData({ ...addFormData, parentName: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>
                  Parent Phone <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter parent phone"
                  value={addFormData.parentPhone}
                  onChange={(e) => setAddFormData({ ...addFormData, parentPhone: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Academic Information */}
          <div className="sm-form-section">
            <h3 className="sm-section-title">SECTION 3 — Academic Information</h3>
            <div className="sm-form-grid">
              <div className="sm-field">
                <label>
                  Degree <span className="required">*</span>
                </label>
                <select
                  value={addFormData.degree}
                  onChange={(e) => setAddFormData({ ...addFormData, degree: e.target.value })}
                  required
                >
                  <option value="">Select degree</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="B.E.">B.E.</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="MCA">MCA</option>
                  <option value="BCA">BCA</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="M.Sc">M.Sc</option>
                </select>
              </div>

              <div className="sm-field">
                <label>
                  Branch <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter branch (e.g. Computer Science)"
                  value={addFormData.branch}
                  onChange={(e) => setAddFormData({ ...addFormData, branch: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>
                  Academic Year <span className="required">*</span>
                </label>
                <select
                  value={addFormData.academicYear}
                  onChange={(e) => setAddFormData({ ...addFormData, academicYear: e.target.value })}
                  required
                >
                  <option value="">Select year</option>
                  <option value="1">1st Year (1)</option>
                  <option value="2">2nd Year (2)</option>
                  <option value="3">3rd Year (3)</option>
                  <option value="4">4th Year (4)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Hostel Allocation */}
          <div className="sm-form-section">
            <h3 className="sm-section-title">SECTION 4 — Hostel Allocation</h3>
            <div className="sm-form-grid">
              <div className="sm-field">
                <label>Floor</label>
                <select
                  value={addFormData.floorNo}
                  onChange={(e) => setAddFormData({ ...addFormData, floorNo: e.target.value })}
                >
                  <option value="">Select floor</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((f) => (
                    <option key={f} value={f}>
                      F{f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm-field">
                <label>Room</label>
                <select
                  value={addFormData.roomNo}
                  onChange={(e) => handleAddRoomChange(e.target.value)}
                >
                  <option value="">Select room</option>
                  {Array.from({ length: 100 }, (_, i) => i + 1).map((r) => (
                    <option key={r} value={r}>
                      R{r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm-field">
                <label>Bed</label>
                <select
                  value={addFormData.bedNo}
                  onChange={(e) => setAddFormData({ ...addFormData, bedNo: e.target.value })}
                >
                  <option value="">Select bed</option>
                  <option value="1">Bed 1</option>
                  <option value="2">Bed 2</option>
                  <option value="3">Bed 3</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sm-form-actions">
            <button type="submit" className="sm-btn-primary" disabled={submittingAdd}>
              {submittingAdd ? <span className="sm-spinner" /> : <MdPersonAdd />}
              {submittingAdd ? "Adding..." : "+ Add Student"}
            </button>

            <button
              type="button"
              className="sm-btn-secondary"
              onClick={() => setAddFormData({ ...INITIAL_ADD_FORM })}
              disabled={submittingAdd}
            >
              <MdRefresh /> Reset Form
            </button>
          </div>
        </form>
      </div>
    );
  }

  // UPDATE FORM
  return (
    <div className="sm-card">
      <div className="sm-card-header">
        <div>
          <h2>Update Student</h2>
          <p>Search for a student record to modify details</p>
        </div>
      </div>

      <div className="sm-search-bar-inline" style={{ marginBottom: "28px" }}>
        <div className="sm-field flex-1">
          <label>
            Student ID / Roll No <span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Student ID or Roll Number"
            value={updateQuery}
            onChange={(e) => setUpdateQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetchUpdateStudent()}
          />
        </div>
        <button
          className="sm-btn-primary search-btn-align"
          onClick={handleFetchUpdateStudent}
          disabled={fetchingUpdate}
        >
          {fetchingUpdate ? <span className="sm-spinner" /> : <MdSearch />}
          {fetchingUpdate ? "Loading..." : "Fetch Student"}
        </button>
      </div>

      {updateDbId ? (
        <form onSubmit={handleUpdateStudentSubmit} className="sm-form">
          <div className="sm-form-section">
            <h3 className="sm-section-title">
              Editing Record: {updateData.first_name} {updateData.last_name} (ID: #{updateDbId})
            </h3>
            <div className="sm-form-grid">
              <div className="sm-field">
                <label>Roll Number (Read-only)</label>
                <input
                  type="text"
                  value={updateRollNo}
                  disabled
                  readOnly
                  style={{ background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" }}
                />
              </div>

              <div className="sm-field">
                <label>First Name</label>
                <input
                  type="text"
                  value={updateData.first_name}
                  onChange={(e) => setUpdateData({ ...updateData, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>Last Name</label>
                <input
                  type="text"
                  value={updateData.last_name}
                  onChange={(e) => setUpdateData({ ...updateData, last_name: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>Gender</label>
                <select
                  value={updateData.gender}
                  onChange={(e) => setUpdateData({ ...updateData, gender: e.target.value })}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm-field">
                <label>Phone</label>
                <input
                  type="text"
                  value={updateData.phone}
                  onChange={(e) => setUpdateData({ ...updateData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>Email</label>
                <input
                  type="email"
                  value={updateData.email}
                  onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>Parent Name</label>
                <input
                  type="text"
                  value={updateData.parent_name}
                  onChange={(e) => setUpdateData({ ...updateData, parent_name: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>Parent Phone</label>
                <input
                  type="text"
                  value={updateData.parent_phone}
                  onChange={(e) => setUpdateData({ ...updateData, parent_phone: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>Degree</label>
                <input
                  type="text"
                  value={updateData.degree}
                  onChange={(e) => setUpdateData({ ...updateData, degree: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>Branch</label>
                <input
                  type="text"
                  value={updateData.branch}
                  onChange={(e) => setUpdateData({ ...updateData, branch: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>Academic Year</label>
                <input
                  type="number"
                  value={updateData.academic_year}
                  onChange={(e) => setUpdateData({ ...updateData, academic_year: e.target.value })}
                  required
                />
              </div>

              <div className="sm-field">
                <label>Floor</label>
                <select
                  value={updateData.floor_no}
                  onChange={(e) => setUpdateData({ ...updateData, floor_no: e.target.value })}
                >
                  <option value="">Select floor</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((f) => (
                    <option key={f} value={f}>
                      F{f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm-field">
                <label>Room</label>
                <select
                  value={updateData.room_no}
                  onChange={(e) => handleUpdateRoomChange(e.target.value)}
                >
                  <option value="">Select room</option>
                  {Array.from({ length: 100 }, (_, i) => i + 1).map((r) => (
                    <option key={r} value={r}>
                      R{r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm-field">
                <label>Bed</label>
                <select
                  value={updateData.bed_no}
                  onChange={(e) => setUpdateData({ ...updateData, bed_no: e.target.value })}
                >
                  <option value="">Select bed</option>
                  <option value="1">Bed 1</option>
                  <option value="2">Bed 2</option>
                  <option value="3">Bed 3</option>
                </select>
              </div>

              <div className="sm-field">
                <label>Blood Group</label>
                <select
                  value={updateData.blood_group}
                  onChange={(e) => setUpdateData({ ...updateData, blood_group: e.target.value })}
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sm-form-actions">
            <button type="submit" className="sm-btn-primary" disabled={submittingUpdate}>
              {submittingUpdate ? <span className="sm-spinner" /> : <MdSave />}
              {submittingUpdate ? "Saving Changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="sm-btn-secondary"
              onClick={() => {
                setUpdateDbId(null);
                setUpdateQuery("");
              }}
              disabled={submittingUpdate}
            >
              <MdRefresh /> Reset
            </button>
          </div>
        </form>
      ) : (
        <div className="sm-empty-initial">
          <MdEdit className="empty-icon" />
          <h3>Enter Student ID or Roll Number</h3>
          <p>Fetch a student record above to edit their information.</p>
        </div>
      )}
    </div>
  );
}

export default StudentForm;
