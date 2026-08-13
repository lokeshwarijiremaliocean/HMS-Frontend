import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  MdGroups,
  MdPersonAdd,
  MdSearch,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdError,
  MdClose,
} from "react-icons/md";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";

import StudentStats from "../components/student/StudentStats";
import StudentTable from "../components/student/StudentTable";
import StudentForm from "../components/student/StudentForm";
import StudentSearch from "../components/student/StudentSearch";
import StudentDeleteModal from "../components/student/StudentDeleteModal";
import StudentProfileCard from "../components/student/StudentProfileCard";

import { getAllStudents } from "../api/studentApi";
import apiClient from "../api/axiosInstance";
import { extractStudentList } from "../components/student/studentUtils";

import "../styles/studentManagement.css";

function StudentManagement() {
  const location = useLocation();

  // Active Main Tab State: "all" | "add" | "search" | "update" | "delete"
  const [activeTab, setActiveTab] = useState("all");

  // All Students Data & Loading
  const [allStudents, setAllStudents] = useState([]);
  const [loadingAllStudents, setLoadingAllStudents] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalStudents: 0,
    allocatedStudents: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    totalCapacity: 0,
  });

  // Prefill objects for edit / delete quick actions from table
  const [prefillEditStudent, setPrefillEditStudent] = useState(null);
  const [prefillDeleteStudent, setPrefillDeleteStudent] = useState(null);

  // View Details Modal state
  const [viewModalData, setViewModalData] = useState(null);

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Handle location state tab change if navigated from elsewhere
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  // Consolidated Fetch Data Function
  const fetchData = useCallback(async () => {
    setLoadingAllStudents(true);
    let studentList = [];
    let roomList = [];

    // 1. Fetch Students
    try {
      const studentRes = await getAllStudents();
      studentList = extractStudentList(studentRes.data);
      setAllStudents(studentList);
    } catch (err) {
      console.error("Error fetching students list:", err);
      showToast("error", "Failed to fetch students list from server");
    } finally {
      setLoadingAllStudents(false);
    }

    // 2. Fetch Rooms (for room capacity calculation if available)
    try {
      const roomRes = await apiClient.get("/room");
      const resData = roomRes.data?.data || roomRes.data;
      if (Array.isArray(resData)) {
        roomList = resData;
      } else if (Array.isArray(resData?.rooms)) {
        roomList = resData.rooms;
      }
    } catch {
      // Ignore room fetch error if room API is not available or empty
    }

    // 3. Compute stats
    const totalStudents = studentList.length;
    const allocatedStudents = studentList.filter(
      (s) => Number(s.floor_no) > 0 || Number(s.room_no) > 0 || Number(s.bed_no) > 0
    ).length;
    const occupiedBeds = allocatedStudents;
    const totalCapacity = roomList.reduce(
      (sum, r) => sum + (Number(r.total_beds) || Number(r.capacity) || 0),
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
  }, [showToast]);

  // Run data fetch on mount and tab change to "all"
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchData();
    }
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  // Switch tabs cleanly
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "update") setPrefillEditStudent(null);
    if (tab !== "delete") setPrefillDeleteStudent(null);
  };

  // Trigger quick edit from table row
  const triggerEditRow = (student) => {
    setPrefillEditStudent(student);
    setActiveTab("update");
  };

  // Trigger quick delete from table row
  const triggerDeleteRow = (student) => {
    setPrefillDeleteStudent(student);
    setActiveTab("delete");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        activePage="studentManagement"
        activeStudentTab={activeTab}
        onSelectStudentTab={(tab) => handleTabChange(tab)}
      />

      <main className="dashboard-main">
        {/* Navbar */}
        <Navbar title="Student Management" breadcrumb="Dashboard > Students" />

        {/* Toast Notification Banner */}
        {toast && (
          <div className={`sm-toast sm-toast-${toast.type}`}>
            {toast.type === "success" ? <MdCheckCircle /> : <MdError />}
            <span>{toast.message}</span>
            <MdClose className="sm-toast-close" onClick={() => setToast(null)} />
          </div>
        )}

        {/* Statistics Row (5 Cards) */}
        <StudentStats stats={stats} />

        {/* Action Tab Bar */}
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

        {/* Main Content View Switcher */}
        <div className="sm-main-content">
          {activeTab === "all" && (
            <StudentTable
              dataList={allStudents}
              loading={loadingAllStudents}
              onViewDetails={(student) => setViewModalData(student)}
              onEditStudent={(student) => triggerEditRow(student)}
              onDeleteStudent={(student) => triggerDeleteRow(student)}
            />
          )}

          {activeTab === "add" && (
            <StudentForm
              mode="add"
              showToast={showToast}
              onSuccess={() => fetchData()}
            />
          )}

          {activeTab === "search" && (
            <StudentSearch
              showToast={showToast}
              onViewDetails={(student) => setViewModalData(student)}
              onEditStudent={(student) => triggerEditRow(student)}
              onDeleteStudent={(student) => triggerDeleteRow(student)}
            />
          )}

          {activeTab === "update" && (
            <StudentForm
              mode="update"
              allStudents={allStudents}
              prefillStudent={prefillEditStudent}
              showToast={showToast}
              onSuccess={() => fetchData()}
            />
          )}

          {activeTab === "delete" && (
            <StudentDeleteModal
              allStudents={allStudents}
              initialQuery={prefillDeleteStudent ? String(prefillDeleteStudent.roll_no || prefillDeleteStudent.id) : ""}
              initialStudent={prefillDeleteStudent}
              showToast={showToast}
              onSuccess={() => {
                setPrefillDeleteStudent(null);
                fetchData();
              }}
              onClose={() => setPrefillDeleteStudent(null)}
            />
          )}
        </div>

        {/* View Details Modal */}
        {viewModalData && (
          <div className="sm-modal-overlay" onClick={() => setViewModalData(null)}>
            <div className="sm-modal-box sm-modal-wide" onClick={(e) => e.stopPropagation()}>
              <div className="sm-modal-header-row">
                <h3>Student Details</h3>
                <MdClose className="close-btn" onClick={() => setViewModalData(null)} />
              </div>
              <StudentProfileCard student={viewModalData} />
              <div className="sm-modal-actions" style={{ justifyContent: "flex-end", marginTop: "20px" }}>
                <button className="sm-btn-secondary" onClick={() => setViewModalData(null)}>
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
