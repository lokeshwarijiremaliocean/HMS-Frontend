import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

import {
  MdPeople,
  MdSchool,
  MdHotel,
  MdBed,
  MdHome,
  MdPersonAdd,
  MdGroups,
  MdBadge,
  MdSearch,
  MdPerson,
  MdPhone,
  MdEdit,
  MdDelete,
  MdInfo,
  MdRefresh,
  MdClose,
  MdCheckCircle,
  MdError,
  MdVisibility,
  MdWarning,
  MdFilterList,
  MdChevronLeft,
  MdChevronRight,
  MdSave,
} from "react-icons/md";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import StatsCard from "../components/dashboard/StatsCard";

import {
  getAllStudents,
  addStudent,
  getStudentByRollNo,
  getStudentByDegree,
  getStudentByName,
  getStudentByPhone,
  updateStudent,
  deleteStudent,
} from "../api/studentApi";

import apiClient from "../api/axiosInstance";
import "../styles/studentManagement.css";

// Initial Add Student form state
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

// Initial Update Form state
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

function StudentManagement() {
  const location = useLocation();

  // ─── Active Tab State: "all" | "add" | "search" | "update" | "delete" ───
  const [activeTab, setActiveTab] = useState("all");

  // ─── Search Sub-Type State: "roll" | "degree" | "name" | "phone" ───
  const [searchType, setSearchType] = useState("roll");

  // ─── Location state check on mount ───
  useEffect(() => {
    if (location.state?.tab) {
      const tab = location.state.tab;
      Promise.resolve().then(() => setActiveTab(tab));
    }
  }, [location.state]);

  // ─── Add Student Form state ───
  const [addFormData, setAddFormData] = useState({ ...INITIAL_ADD_FORM });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // ─── Search Inputs ───
  const [rollSearchQuery, setRollSearchQuery] = useState("");
  const [degreeSearchQuery, setDegreeSearchQuery] = useState("");
  const [nameFirstName, setNameFirstName] = useState("");
  const [nameLastName, setNameLastName] = useState("");
  const [phoneSearchQuery, setPhoneSearchQuery] = useState("");

  // ─── Search Results ───
  const [searchResultSingle, setSearchResultSingle] = useState(null); // for roll / phone
  const [searchResultList, setSearchResultList] = useState([]); // for degree / name
  const [searching, setSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // ─── Update Student state ───
  const [updateQuery, setUpdateQuery] = useState("");
  const [updateDbId, setUpdateDbId] = useState(null);
  const [updateRollNo, setUpdateRollNo] = useState("");
  const [updateData, setUpdateData] = useState({ ...INITIAL_UPDATE_FORM });
  const [fetchingUpdate, setFetchingUpdate] = useState(false);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  // ─── Delete Student state ───
  const [deleteQuery, setDeleteQuery] = useState("");
  const [deleteDbId, setDeleteDbId] = useState(null);
  const [deleteStudentInfo, setDeleteStudentInfo] = useState(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ─── View Student Modal state ───
  const [viewModalData, setViewModalData] = useState(null);

  // ─── All Students Data ───
  const [allStudents, setAllStudents] = useState([]);
  const [loadingAllStudents, setLoadingAllStudents] = useState(false);
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ─── Stats state (0 initially) ───
  const [stats, setStats] = useState({
    totalStudents: 0,
    allocatedStudents: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    totalCapacity: 0,
  });

  // ─── Toast Notification ───
  const [toast, setToast] = useState(null); // { type: "success" | "error", message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Consolidated Fetch Function (1x GET /student and 1x GET /room per refresh) ───
  const fetchData = useCallback(async () => {
    setLoadingAllStudents(true);
    let studentList = [];
    let roomList = [];

    // 1. Fetch Students (single request)
    try {
      const studentRes = await getAllStudents();
      if (studentRes.data?.success) {
        studentList = Array.isArray(studentRes.data.data)
          ? studentRes.data.data
          : studentRes.data.data?.students || [];
        setAllStudents(studentList);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoadingAllStudents(false);
    }

    // 2. Fetch Rooms (single request for capacity calculation)
    try {
      const roomRes = await apiClient.get("/room");
      if (roomRes.data?.success) {
        roomList = Array.isArray(roomRes.data.data)
          ? roomRes.data.data
          : roomRes.data.data?.rooms || [];
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }

    // Compute stats from fetched data
    const totalStudents = studentList.length;
    const allocatedStudents = studentList.filter(
      (s) => Number(s.room_no) > 0 || Number(s.bed_no) > 0
    ).length;
    const occupiedBeds = allocatedStudents;
    const totalCapacity = roomList.reduce(
      (sum, room) => sum + (Number(room.total_beds) || 0),
      0
    );
    const availableBeds = Math.max(0, totalCapacity - occupiedBeds);

    setStats({
      totalStudents,
      allocatedStudents,
      availableBeds,
      occupiedBeds,
      totalCapacity,
    });
  }, []);

  // Run ONCE when activeTab is "all" or component mounts
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (active && activeTab === "all") {
        await fetchData();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [activeTab, fetchData]);

  // Reset search states when switching tabs or search types
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchPerformed(false);
    setSearchResultSingle(null);
    setSearchResultList([]);
  };

  const handleSearchTypeChange = (stype) => {
    setSearchType(stype);
    setSearchPerformed(false);
    setSearchResultSingle(null);
    setSearchResultList([]);
  };

  // ─────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────

  // ─── Add Student Submit ───
  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();

    // Required fields check
    const required = [
      "rollNo", "firstName", "lastName", "gender", "phone",
      "email", "parentName", "parentPhone", "degree", "branch", "academicYear"
    ];

    for (const key of required) {
      if (!addFormData[key]) {
        showToast("error", "Please fill in all required fields (*)");
        return;
      }
    }

    setSubmittingAdd(true);
    try {
      const payload = {
        roll_no: parseInt(addFormData.rollNo),
        first_name: addFormData.firstName,
        last_name: addFormData.lastName,
        gender: addFormData.gender,
        phone: addFormData.phone,
        email: addFormData.email,
        parent_name: addFormData.parentName,
        parent_phone: addFormData.parentPhone,
        degree: addFormData.degree,
        branch: addFormData.branch,
        academic_year: parseInt(addFormData.academicYear),
        floor_no: parseInt(addFormData.floorNo || 0),
        room_no: parseInt(addFormData.roomNo || 0),
        bed_no: parseInt(addFormData.bedNo || 0),
        blood_group: addFormData.bloodGroup || "",
      };

      const res = await addStudent(payload);
      if (res.data?.success) {
        showToast("success", "Student added successfully");
        setAddFormData({ ...INITIAL_ADD_FORM });
        fetchData();
      } else {
        showToast("error", res.data?.message || "Failed to add student");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail?.[0]?.msg || "Failed to add student";
      showToast("error", msg);
    } finally {
      setSubmittingAdd(false);
    }
  };

  // ─── Search by Roll Number ───
  const handleSearchRoll = async () => {
    if (!rollSearchQuery.trim()) {
      showToast("error", "Please enter a roll number");
      return;
    }
    setSearching(true);
    setSearchPerformed(true);
    setSearchResultSingle(null);
    try {
      const res = await getStudentByRollNo(rollSearchQuery.trim());
      if (res.data?.success && res.data.data) {
        const student = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
        setSearchResultSingle(student || null);
      } else {
        setSearchResultSingle(null);
      }
    } catch {
      setSearchResultSingle(null);
    } finally {
      setSearching(false);
    }
  };

  // ─── Search by Degree ───
  const handleSearchDegree = async () => {
    if (!degreeSearchQuery.trim()) {
      showToast("error", "Please enter or select a degree");
      return;
    }
    setSearching(true);
    setSearchPerformed(true);
    setSearchResultList([]);
    try {
      const res = await getStudentByDegree(degreeSearchQuery.trim());
      if (res.data?.success && res.data.data) {
        const list = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        setSearchResultList(list);
      } else {
        setSearchResultList([]);
      }
    } catch {
      setSearchResultList([]);
    } finally {
      setSearching(false);
    }
  };

  // ─── Search by Name ───
  const handleSearchName = async () => {
    if (!nameFirstName.trim() || !nameLastName.trim()) {
      showToast("error", "Please enter both first name and last name");
      return;
    }
    setSearching(true);
    setSearchPerformed(true);
    setSearchResultList([]);
    try {
      const res = await getStudentByName(nameFirstName.trim(), nameLastName.trim());
      if (res.data?.success && res.data.data) {
        const list = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        setSearchResultList(list);
      } else {
        setSearchResultList([]);
      }
    } catch {
      setSearchResultList([]);
    } finally {
      setSearching(false);
    }
  };

  // ─── Search by Phone ───
  const handleSearchPhone = async () => {
    if (!phoneSearchQuery.trim()) {
      showToast("error", "Please enter a phone number");
      return;
    }
    setSearching(true);
    setSearchPerformed(true);
    setSearchResultSingle(null);
    try {
      const res = await getStudentByPhone(phoneSearchQuery.trim());
      if (res.data?.success && res.data.data) {
        const student = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
        setSearchResultSingle(student || null);
      } else {
        setSearchResultSingle(null);
      }
    } catch {
      setSearchResultSingle(null);
    } finally {
      setSearching(false);
    }
  };

  // ─── Fetch Student for Update ───
  const handleFetchUpdateStudent = async () => {
    if (!updateQuery.trim()) {
      showToast("error", "Please enter a Student ID or Roll Number");
      return;
    }
    setFetchingUpdate(true);
    setUpdateDbId(null);
    setUpdateRollNo("");
    try {
      const searchVal = updateQuery.trim();

      // 1. Check in-memory list first
      let s = allStudents.find(
        (item) => String(item.id) === searchVal || String(item.roll_no) === searchVal
      );

      // 2. If not found in memory, call roll_no API once
      if (!s) {
        try {
          const rollRes = await getStudentByRollNo(searchVal);
          if (rollRes.data?.success && rollRes.data.data) {
            s = Array.isArray(rollRes.data.data) ? rollRes.data.data[0] : rollRes.data.data;
          }
        } catch {
          // ignore
        }
      }

      if (s) {
        setUpdateDbId(s.id);
        setUpdateRollNo(s.roll_no || "");
        setUpdateData({
          first_name: s.first_name || "",
          last_name: s.last_name || "",
          gender: s.gender || "",
          phone: s.phone || "",
          email: s.email || "",
          parent_name: s.parent_name || "",
          parent_phone: s.parent_phone || "",
          degree: s.degree || "",
          branch: s.branch || "",
          academic_year: s.academic_year || "",
          floor_no: s.floor_no || "",
          room_no: s.room_no || "",
          bed_no: s.bed_no || "",
          blood_group: s.blood_group || "",
        });
        showToast("success", `Loaded record for ${s.first_name} ${s.last_name}`);
      } else {
        showToast("error", "Student not found");
      }
    } catch {
      showToast("error", "Failed to fetch student details");
    } finally {
      setFetchingUpdate(false);
    }
  };

  // ─── Update Student Submit ───
  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    if (!updateDbId) {
      showToast("error", "Please fetch a student first before updating");
      return;
    }

    setSubmittingUpdate(true);
    try {
      const payload = {
        first_name: updateData.first_name,
        last_name: updateData.last_name,
        gender: updateData.gender,
        phone: updateData.phone,
        parent_name: updateData.parent_name,
        parent_phone: updateData.parent_phone,
        degree: updateData.degree,
        branch: updateData.branch,
        academic_year: parseInt(updateData.academic_year || 0),
        floor_no: parseInt(updateData.floor_no || 0),
        room_no: parseInt(updateData.room_no || 0),
        bed_no: parseInt(updateData.bed_no || 0),
        blood_group: updateData.blood_group,
        email: updateData.email,
      };

      const res = await updateStudent(updateDbId, payload);
      if (res.data?.success) {
        showToast("success", "Student updated successfully");
        fetchData();
      } else {
        showToast("error", res.data?.message || "Failed to update student");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update student");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  // ─── Delete Student Confirmation & Execute ───
  const handleOpenDeleteConfirm = async () => {
    if (!deleteQuery.trim() && !deleteDbId) {
      showToast("error", "Please enter a Student ID or Roll Number");
      return;
    }

    const inputVal = deleteQuery.trim();
    let targetId = deleteDbId;
    let sInfo = deleteStudentInfo;

    if (!targetId && inputVal) {
      // 1. Check in-memory list first
      const sMemory = allStudents.find(
        (item) => String(item.id) === inputVal || String(item.roll_no) === inputVal
      );

      if (sMemory) {
        targetId = sMemory.id;
        sInfo = `${sMemory.first_name} ${sMemory.last_name} (Roll No: ${sMemory.roll_no})`;
      } else {
        // 2. Call roll_no API once if not in memory
        try {
          const rollRes = await getStudentByRollNo(inputVal);
          if (rollRes.data?.success && rollRes.data.data) {
            const s = Array.isArray(rollRes.data.data) ? rollRes.data.data[0] : rollRes.data.data;
            if (s) {
              targetId = s.id;
              sInfo = `${s.first_name} ${s.last_name} (Roll No: ${s.roll_no})`;
            }
          }
        } catch {
          // ignore
        }
      }
    }

    if (!targetId && inputVal) {
      targetId = parseInt(inputVal);
      sInfo = `Student ID #${inputVal}`;
    }

    setDeleteDbId(targetId);
    setDeleteStudentInfo(sInfo || `Student ID #${inputVal}`);
    setDeleteConfirmModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!deleteDbId) return;

    setDeleting(true);
    try {
      const res = await deleteStudent(deleteDbId);
      if (res.data?.success) {
        showToast("success", "Student deleted successfully");
        setDeleteConfirmModalOpen(false);
        setDeleteQuery("");
        setDeleteDbId(null);
        setDeleteStudentInfo(null);
        fetchData();
      } else {
        showToast("error", res.data?.message || "Failed to delete student");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  // Quick Action triggers from table row
  const triggerEditRow = (student) => {
    setActiveTab("update");
    setUpdateDbId(student.id);
    setUpdateRollNo(student.roll_no || "");
    setUpdateQuery(String(student.roll_no || student.id));
    setUpdateData({
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      gender: student.gender || "",
      phone: student.phone || "",
      email: student.email || "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
      degree: student.degree || "",
      branch: student.branch || "",
      academic_year: student.academic_year || "",
      floor_no: student.floor_no || "",
      room_no: student.room_no || "",
      bed_no: student.bed_no || "",
      blood_group: student.blood_group || "",
    });
  };

  const triggerDeleteRow = (student) => {
    setActiveTab("delete");
    setDeleteQuery(String(student.roll_no || student.id));
    setDeleteDbId(student.id);
    setDeleteStudentInfo(`${student.first_name} ${student.last_name} (Roll No: ${student.roll_no})`);
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────

  // Render Table
  const renderStudentTable = (dataList) => {
    // Client-side search filter inside table
    const filtered = dataList.filter((s) => {
      if (!tableSearchQuery) return true;
      const q = tableSearchQuery.toLowerCase();
      const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
      const roll = String(s.roll_no || "").toLowerCase();
      const phone = String(s.phone || "").toLowerCase();
      const email = String(s.email || "").toLowerCase();
      const degree = String(s.degree || "").toLowerCase();
      return name.includes(q) || roll.includes(q) || phone.includes(q) || email.includes(q) || degree.includes(q);
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

    return (
      <div className="sm-table-container">
        {dataList.length === 0 ? (
          <div className="sm-empty">
            <MdInfo />
            <p>No students found</p>
          </div>
        ) : (
          <>
            <div className="sm-table-responsive">
              <table className="sm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Roll No.</th>
                    <th>Student Name</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Degree</th>
                    <th>Branch</th>
                    <th>Academic Year</th>
                    <th>Room</th>
                    <th>Bed</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((s, index) => (
                    <tr key={s.id || index}>
                      <td>{startIndex + index + 1}</td>
                      <td className="sm-roll-badge">{s.roll_no}</td>
                      <td className="sm-student-name">{s.first_name} {s.last_name}</td>
                      <td>{s.gender}</td>
                      <td>{s.phone}</td>
                      <td>{s.email}</td>
                      <td>{s.degree}</td>
                      <td>{s.branch}</td>
                      <td>{s.academic_year}</td>
                      <td>{s.room_no || "-"}</td>
                      <td>{s.bed_no || "-"}</td>
                      <td>
                        <div className="sm-row-actions">
                          <button
                            className="sm-action-btn view"
                            title="View Details"
                            onClick={() => setViewModalData(s)}
                          >
                            <MdVisibility />
                          </button>
                          <button
                            className="sm-action-btn edit"
                            title="Edit Student"
                            onClick={() => triggerEditRow(s)}
                          >
                            <MdEdit />
                          </button>
                          <button
                            className="sm-action-btn delete"
                            title="Delete Student"
                            onClick={() => triggerDeleteRow(s)}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="sm-pagination">
              <p className="sm-pagination-text">
                Showing {filtered.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} students
              </p>
              <div className="sm-pagination-pages">
                <button
                  className="sm-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <MdChevronLeft />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`sm-page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="sm-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <MdChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Render Student Profile Card
  const renderStudentProfileCard = (student) => {
    if (!student) return null;
    return (
      <div className="sm-profile-card">
        <div className="sm-profile-header">
          <div className="sm-profile-avatar">
            <MdPerson />
          </div>
          <div>
            <h3>{student.first_name} {student.last_name}</h3>
            <p className="sm-profile-sub">Roll No: {student.roll_no} | {student.degree} ({student.branch})</p>
          </div>
        </div>

        <div className="sm-profile-grid">
          <div className="sm-profile-item">
            <span className="label">Roll Number:</span>
            <span className="value">{student.roll_no}</span>
          </div>
          <div className="sm-profile-item">
            <span className="label">First Name:</span>
            <span className="value">{student.first_name}</span>
          </div>
          <div className="sm-profile-item">
            <span className="label">Last Name:</span>
            <span className="value">{student.last_name}</span>
          </div>
          <div className="sm-profile-item">
            <span className="label">Gender:</span>
            <span className="value">{student.gender}</span>
          </div>
          <div className="sm-profile-item">
            <span className="label">Phone:</span>
            <span className="value">{student.phone}</span>
          </div>
          <div className="sm-profile-item">
            <span className="label">Email:</span>
            <span className="value">{student.email}</span>
          </div>
          <div className="sm-profile-item">
            <span className="label">Parent Name:</span>
            <span className="value">{student.parent_name}</span>
          </div>
          <div className="sm-profile-item">
            <span className="label">Parent Phone:</span>
            <span className="value">{student.parent_phone}</span>
          </div>
          <div className="sm-profile-item">
            <span className="label">Degree:</span>
            <span className="value">{student.degree}</span>
          </div>
          <div className="sm-profile-item">
            <span className="label">Branch:</span>
            <span className="value">{student.branch}</span>
          </div>
          <div className="sm-profile-item">
            <span className="label">Academic Year:</span>
            <span className="value">{student.academic_year}</span>
          </div>
          <div className="sm-profile-item">
            <span className="label">Floor / Room / Bed:</span>
            <span className="value">
              Floor {student.floor_no || "-"} / Room {student.room_no || "-"} / Bed {student.bed_no || "-"}
            </span>
          </div>
          <div className="sm-profile-item">
            <span className="label">Blood Group:</span>
            <span className="value">{student.blood_group || "N/A"}</span>
          </div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // MAIN VIEW CONTROLLER (ONLY Content changes)
  // ─────────────────────────────────────────────────────────────
  const renderMainContent = () => {
    // ─── SCREEN 1: ALL STUDENTS ───
    if (activeTab === "all") {
      return (
        <div className="sm-card">
          <div className="sm-card-header">
            <div>
              <h2>All Students</h2>
              <p>View and manage all students</p>
            </div>
            <div className="sm-card-header-actions">
              <div className="sm-search-input-group">
                <MdSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, roll no., phone..."
                  value={tableSearchQuery}
                  onChange={(e) => {
                    setTableSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button className="sm-btn-filter" title="Filter list">
                <MdFilterList /> Filter
              </button>
            </div>
          </div>

          {loadingAllStudents ? (
            <div className="sm-loading">
              <span className="sm-spinner-lg" />
              <p>Loading students list...</p>
            </div>
          ) : (
            renderStudentTable(allStudents)
          )}
        </div>
      );
    }

    // ─── SCREEN 2: ADD STUDENT ───
    if (activeTab === "add") {
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
                  <label>Roll No. <span className="required">*</span></label>
                  <input
                    type="number"
                    placeholder="Enter roll number"
                    value={addFormData.rollNo}
                    onChange={(e) => setAddFormData({ ...addFormData, rollNo: e.target.value })}
                    required
                  />
                </div>

                <div className="sm-field">
                  <label>First Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={addFormData.firstName}
                    onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="sm-field">
                  <label>Last Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={addFormData.lastName}
                    onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div className="sm-field">
                  <label>Gender <span className="required">*</span></label>
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
                  <label>Phone <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={addFormData.phone}
                    onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="sm-field">
                  <label>Email <span className="required">*</span></label>
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
                  <label>Parent Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter parent name"
                    value={addFormData.parentName}
                    onChange={(e) => setAddFormData({ ...addFormData, parentName: e.target.value })}
                    required
                  />
                </div>

                <div className="sm-field">
                  <label>Parent Phone <span className="required">*</span></label>
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
                  <label>Degree <span className="required">*</span></label>
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
                  </select>
                </div>

                <div className="sm-field">
                  <label>Branch <span className="required">*</span></label>
                  <select
                    value={addFormData.branch}
                    onChange={(e) => setAddFormData({ ...addFormData, branch: e.target.value })}
                    required
                  >
                    <option value="">Select branch</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>

                <div className="sm-field">
                  <label>Academic Year <span className="required">*</span></label>
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
                  <label>Floor No.</label>
                  <select
                    value={addFormData.floorNo}
                    onChange={(e) => setAddFormData({ ...addFormData, floorNo: e.target.value })}
                  >
                    <option value="">Select floor</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Floor {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="sm-field">
                  <label>Room No.</label>
                  <select
                    value={addFormData.roomNo}
                    onChange={(e) => setAddFormData({ ...addFormData, roomNo: e.target.value })}
                  >
                    <option value="">Select room</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 101} value={i + 101}>Room {i + 101}</option>
                    ))}
                  </select>
                </div>

                <div className="sm-field">
                  <label>Bed No.</label>
                  <select
                    value={addFormData.bedNo}
                    onChange={(e) => setAddFormData({ ...addFormData, bedNo: e.target.value })}
                  >
                    <option value="">Select bed</option>
                    {[...Array(4)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Bed {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="sm-form-actions">
              <button
                type="submit"
                className="sm-btn-primary"
                disabled={submittingAdd}
              >
                {submittingAdd ? <span className="sm-spinner" /> : <MdPersonAdd />}
                {submittingAdd ? "Adding..." : "+ Add Student"}
              </button>

              <button
                type="button"
                className="sm-btn-secondary"
                onClick={() => setAddFormData({ ...INITIAL_ADD_FORM })}
                disabled={submittingAdd}
              >
                <MdRefresh /> Reset
              </button>
            </div>
          </form>
        </div>
      );
    }

    // ─── SCREEN 3 to 6: SEARCH STUDENT ───
    if (activeTab === "search") {
      return (
        <div className="sm-card">
          {/* Sub Navigation Bar for Search */}
          <div className="sm-subnav">
            <button
              className={`sm-subnav-btn ${searchType === "roll" ? "active" : ""}`}
              onClick={() => handleSearchTypeChange("roll")}
            >
              <MdBadge /> By Roll Number
            </button>
            <button
              className={`sm-subnav-btn ${searchType === "degree" ? "active" : ""}`}
              onClick={() => handleSearchTypeChange("degree")}
            >
              <MdSchool /> By Degree
            </button>
            <button
              className={`sm-subnav-btn ${searchType === "name" ? "active" : ""}`}
              onClick={() => handleSearchTypeChange("name")}
            >
              <MdPerson /> By Name
            </button>
            <button
              className={`sm-subnav-btn ${searchType === "phone" ? "active" : ""}`}
              onClick={() => handleSearchTypeChange("phone")}
            >
              <MdPhone /> By Phone
            </button>
          </div>

          {/* SCREEN 3: BY ROLL NUMBER */}
          {searchType === "roll" && (
            <div>
              <div className="sm-card-header">
                <div>
                  <h2>Find Student by Roll Number</h2>
                  <p>Search for a student using their roll number</p>
                </div>
              </div>

              <div className="sm-search-bar-inline">
                <div className="sm-field flex-1">
                  <label>Roll Number <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter roll number (e.g. 2024CS001)"
                    value={rollSearchQuery}
                    onChange={(e) => setRollSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchRoll()}
                  />
                </div>
                <button
                  className="sm-btn-primary search-btn-align"
                  onClick={handleSearchRoll}
                  disabled={searching}
                >
                  {searching ? <span className="sm-spinner" /> : <MdSearch />}
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              {searching ? (
                <div className="sm-loading">
                  <span className="sm-spinner-lg" />
                  <p>Searching student record...</p>
                </div>
              ) : searchPerformed ? (
                searchResultSingle ? (
                  renderStudentProfileCard(searchResultSingle)
                ) : (
                  <div className="sm-empty">
                    <MdInfo />
                    <p>Student not found</p>
                  </div>
                )
              ) : (
                <div className="sm-empty-initial">
                  <MdBadge className="empty-icon" />
                  <h3>Student Details</h3>
                  <p>Enter a roll number to view student information.</p>
                </div>
              )}
            </div>
          )}

          {/* SCREEN 4: BY DEGREE */}
          {searchType === "degree" && (
            <div>
              <div className="sm-card-header">
                <div>
                  <h2>Find Students by Degree</h2>
                  <p>View students belonging to a particular degree</p>
                </div>
              </div>

              <div className="sm-search-bar-inline">
                <div className="sm-field flex-1">
                  <label>Degree <span className="required">*</span></label>
                  <select
                    value={degreeSearchQuery}
                    onChange={(e) => setDegreeSearchQuery(e.target.value)}
                  >
                    <option value="">Select / Enter degree</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.E.">B.E.</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MBA">MBA</option>
                    <option value="MCA">MCA</option>
                    <option value="BCA">BCA</option>
                  </select>
                </div>
                <button
                  className="sm-btn-primary search-btn-align"
                  onClick={handleSearchDegree}
                  disabled={searching}
                >
                  {searching ? <span className="sm-spinner" /> : <MdSearch />}
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              {searching ? (
                <div className="sm-loading">
                  <span className="sm-spinner-lg" />
                  <p>Fetching students by degree...</p>
                </div>
              ) : searchPerformed ? (
                searchResultList.length > 0 ? (
                  renderStudentTable(searchResultList)
                ) : (
                  <div className="sm-empty">
                    <MdInfo />
                    <p>No students found for this degree.</p>
                  </div>
                )
              ) : null}
            </div>
          )}

          {/* SCREEN 5: BY NAME */}
          {searchType === "name" && (
            <div>
              <div className="sm-card-header">
                <div>
                  <h2>Find Student by Name</h2>
                  <p>Search students using their name</p>
                </div>
              </div>

              <div className="sm-search-bar-inline">
                <div className="sm-field flex-1">
                  <label>First Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={nameFirstName}
                    onChange={(e) => setNameFirstName(e.target.value)}
                  />
                </div>
                <div className="sm-field flex-1">
                  <label>Last Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={nameLastName}
                    onChange={(e) => setNameLastName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchName()}
                  />
                </div>
                <button
                  className="sm-btn-primary search-btn-align"
                  onClick={handleSearchName}
                  disabled={searching}
                >
                  {searching ? <span className="sm-spinner" /> : <MdSearch />}
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              {searching ? (
                <div className="sm-loading">
                  <span className="sm-spinner-lg" />
                  <p>Searching matching students...</p>
                </div>
              ) : searchPerformed ? (
                searchResultList.length > 0 ? (
                  renderStudentTable(searchResultList)
                ) : (
                  <div className="sm-empty">
                    <MdInfo />
                    <p>No students found with this name.</p>
                  </div>
                )
              ) : null}
            </div>
          )}

          {/* SCREEN 6: BY PHONE */}
          {searchType === "phone" && (
            <div>
              <div className="sm-card-header">
                <div>
                  <h2>Find Student by Phone</h2>
                  <p>Search for a student using their phone number</p>
                </div>
              </div>

              <div className="sm-search-bar-inline">
                <div className="sm-field flex-1">
                  <label>Phone Number <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={phoneSearchQuery}
                    onChange={(e) => setPhoneSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchPhone()}
                  />
                </div>
                <button
                  className="sm-btn-primary search-btn-align"
                  onClick={handleSearchPhone}
                  disabled={searching}
                >
                  {searching ? <span className="sm-spinner" /> : <MdSearch />}
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              {searching ? (
                <div className="sm-loading">
                  <span className="sm-spinner-lg" />
                  <p>Searching student record...</p>
                </div>
              ) : searchPerformed ? (
                searchResultSingle ? (
                  renderStudentProfileCard(searchResultSingle)
                ) : (
                  <div className="sm-empty">
                    <MdInfo />
                    <p>Student not found.</p>
                  </div>
                )
              ) : null}
            </div>
          )}
        </div>
      );
    }

    // ─── SCREEN 7: UPDATE STUDENT ───
    if (activeTab === "update") {
      return (
        <div className="sm-card">
          <div className="sm-card-header">
            <div>
              <h2>Update Student</h2>
              <p>Update student information</p>
            </div>
          </div>

          <div className="sm-search-bar-inline" style={{ marginBottom: "28px" }}>
            <div className="sm-field flex-1">
              <label>Student ID / Roll No <span className="required">*</span></label>
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
                  Student Information — {updateData.first_name} {updateData.last_name}
                </h3>
                <div className="sm-form-grid">
                  <div className="sm-field">
                    <label>Roll Number (Read-only)</label>
                    <input
                      type="text"
                      value={updateRollNo}
                      disabled
                      style={{ background: "#f5f5f5", color: "#666" }}
                    />
                  </div>

                  <div className="sm-field">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={updateData.first_name}
                      onChange={(e) => setUpdateData({ ...updateData, first_name: e.target.value })}
                    />
                  </div>

                  <div className="sm-field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={updateData.last_name}
                      onChange={(e) => setUpdateData({ ...updateData, last_name: e.target.value })}
                    />
                  </div>

                  <div className="sm-field">
                    <label>Gender</label>
                    <select
                      value={updateData.gender}
                      onChange={(e) => setUpdateData({ ...updateData, gender: e.target.value })}
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
                    />
                  </div>

                  <div className="sm-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={updateData.email}
                      onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
                    />
                  </div>

                  <div className="sm-field">
                    <label>Parent Name</label>
                    <input
                      type="text"
                      value={updateData.parent_name}
                      onChange={(e) => setUpdateData({ ...updateData, parent_name: e.target.value })}
                    />
                  </div>

                  <div className="sm-field">
                    <label>Parent Phone</label>
                    <input
                      type="text"
                      value={updateData.parent_phone}
                      onChange={(e) => setUpdateData({ ...updateData, parent_phone: e.target.value })}
                    />
                  </div>

                  <div className="sm-field">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={updateData.degree}
                      onChange={(e) => setUpdateData({ ...updateData, degree: e.target.value })}
                    />
                  </div>

                  <div className="sm-field">
                    <label>Branch</label>
                    <input
                      type="text"
                      value={updateData.branch}
                      onChange={(e) => setUpdateData({ ...updateData, branch: e.target.value })}
                    />
                  </div>

                  <div className="sm-field">
                    <label>Academic Year</label>
                    <input
                      type="number"
                      value={updateData.academic_year}
                      onChange={(e) => setUpdateData({ ...updateData, academic_year: e.target.value })}
                    />
                  </div>

                  <div className="sm-field">
                    <label>Floor No.</label>
                    <input
                      type="number"
                      value={updateData.floor_no}
                      onChange={(e) => setUpdateData({ ...updateData, floor_no: e.target.value })}
                    />
                  </div>

                  <div className="sm-field">
                    <label>Room No.</label>
                    <input
                      type="number"
                      value={updateData.room_no}
                      onChange={(e) => setUpdateData({ ...updateData, room_no: e.target.value })}
                    />
                  </div>

                  <div className="sm-field">
                    <label>Bed No.</label>
                    <input
                      type="number"
                      value={updateData.bed_no}
                      onChange={(e) => setUpdateData({ ...updateData, bed_no: e.target.value })}
                    />
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
                <button
                  type="submit"
                  className="sm-btn-primary"
                  disabled={submittingUpdate}
                >
                  {submittingUpdate ? <span className="sm-spinner" /> : <MdSave />}
                  {submittingUpdate ? "Saving..." : "Save Changes"}
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

    // ─── SCREEN 8: DELETE STUDENT ───
    if (activeTab === "delete") {
      return (
        <div className="sm-card">
          <div className="sm-card-header">
            <div>
              <h2>Delete Student</h2>
              <p>Remove a student from the system</p>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="sm-alert-warning">
            <MdWarning className="sm-warning-icon" />
            <div>
              <h4>Warning!</h4>
              <p>
                Deleting a student will permanently remove the student record from the system.
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="sm-search-bar-inline" style={{ marginTop: "24px" }}>
            <div className="sm-field flex-1">
              <label>Student ID / Roll No <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Enter Student ID or Roll Number"
                value={deleteQuery}
                onChange={(e) => setDeleteQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleOpenDeleteConfirm()}
              />
            </div>
            <button
              className="sm-btn-danger search-btn-align"
              onClick={handleOpenDeleteConfirm}
            >
              <MdDelete /> Delete Student
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="dashboard-container">
      {/* Fixed Sidebar */}
      <Sidebar
        activePage="studentManagement"
        activeStudentTab={activeTab}
        onSelectStudentTab={(tab) => handleTabChange(tab)}
      />

      <main className="dashboard-main">
        {/* Fixed Navbar */}
        <Navbar
          title="Student Management"
          breadcrumb="Dashboard > Students"
        />

        {/* Toast Notification */}
        {toast && (
          <div className={`sm-toast sm-toast-${toast.type}`}>
            {toast.type === "success" ? <MdCheckCircle /> : <MdError />}
            <span>{toast.message}</span>
            <MdClose
              className="sm-toast-close"
              onClick={() => setToast(null)}
            />
          </div>
        )}

        {/* Fixed Statistics Row (5 Cards) */}
        <section className="stats-grid sm-stats-grid">
          <StatsCard
            icon={<MdPeople />}
            title="Total Students"
            value={stats.totalStudents}
            subtitle="View All →"
            percentage={stats.totalCapacity > 0 ? Math.min(100, Math.round((stats.totalStudents / stats.totalCapacity) * 100)) : (stats.totalStudents > 0 ? 100 : 0)}
            color="#E74C3C"
          />
          <StatsCard
            icon={<MdSchool />}
            title="Allocated Students"
            value={stats.allocatedStudents}
            subtitle="View All →"
            percentage={stats.totalCapacity > 0 ? Math.round((stats.allocatedStudents / stats.totalCapacity) * 100) : 0}
            color="#2ECC71"
          />
          <StatsCard
            icon={<MdHotel />}
            title="Available Beds"
            value={stats.availableBeds}
            subtitle="View All →"
            percentage={stats.totalCapacity > 0 ? Math.round((stats.availableBeds / stats.totalCapacity) * 100) : 0}
            color="#3498DB"
          />
          <StatsCard
            icon={<MdBed />}
            title="Occupied Beds"
            value={stats.occupiedBeds}
            subtitle="View All →"
            percentage={stats.totalCapacity > 0 ? Math.round((stats.occupiedBeds / stats.totalCapacity) * 100) : 0}
            color="#9B59B6"
          />
          <StatsCard
            icon={<MdHome />}
            title="Total Capacity"
            value={stats.totalCapacity}
            subtitle="View All →"
            percentage={stats.totalCapacity > 0 ? 100 : 0}
            color="#F39C12"
          />
        </section>

        {/* Fixed Action Tab Bar */}
        <div className="sm-main-tabs">
          <button
            className={`sm-main-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => handleTabChange("all")}
          >
            <MdGroups /> All Students
          </button>
          <button
            className={`sm-main-tab ${activeTab === "add" ? "active" : ""}`}
            onClick={() => handleTabChange("add")}
          >
            <MdPersonAdd /> + Add Student
          </button>
          <button
            className={`sm-main-tab ${activeTab === "search" ? "active" : ""}`}
            onClick={() => handleTabChange("search")}
          >
            <MdSearch /> Search Student ▾
          </button>
          <button
            className={`sm-main-tab ${activeTab === "update" ? "active" : ""}`}
            onClick={() => handleTabChange("update")}
          >
            <MdEdit /> Update Student
          </button>
          <button
            className={`sm-main-tab ${activeTab === "delete" ? "active" : ""}`}
            onClick={() => handleTabChange("delete")}
          >
            <MdDelete /> Delete Student
          </button>
        </div>

        {/* MAIN CONTENT AREA — ONLY THIS CHANGES */}
        <div className="sm-main-content">{renderMainContent()}</div>

        {/* ─── CONFIRMATION MODAL FOR DELETE ─── */}
        {deleteConfirmModalOpen && (
          <div className="sm-modal-overlay" onClick={() => setDeleteConfirmModalOpen(false)}>
            <div className="sm-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="sm-modal-icon-container">
                <MdWarning className="modal-warning-icon" />
              </div>
              <h3>Delete Student?</h3>
              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteStudentInfo || `this student`}</strong>?
              </p>
              <div className="sm-modal-actions">
                <button
                  className="sm-btn-modal-cancel"
                  onClick={() => setDeleteConfirmModalOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="sm-btn-modal-danger"
                  onClick={handleExecuteDelete}
                  disabled={deleting}
                >
                  {deleting ? <span className="sm-spinner" /> : <MdDelete />}
                  {deleting ? "Deleting..." : "Delete Student"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── VIEW STUDENT DETAILS MODAL ─── */}
        {viewModalData && (
          <div className="sm-modal-overlay" onClick={() => setViewModalData(null)}>
            <div className="sm-modal-box sm-modal-wide" onClick={(e) => e.stopPropagation()}>
              <div className="sm-modal-header-row">
                <h3>Student Details</h3>
                <MdClose className="close-btn" onClick={() => setViewModalData(null)} />
              </div>
              {renderStudentProfileCard(viewModalData)}
              <div className="sm-modal-actions" style={{ justifyContent: "flex-end", marginTop: "20px" }}>
                <button
                  className="sm-btn-secondary"
                  onClick={() => setViewModalData(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentManagement;
