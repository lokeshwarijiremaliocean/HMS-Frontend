import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/sidebar.css";

import logo from "../../assets/campusnest-logo.png";

import {
  MdDashboard,
  MdGroups,
  MdPersonAdd,
  MdSearch,
  MdEdit,
  MdDelete,
  MdMeetingRoom,
  MdPersonPin,
  MdBed,
  MdApartment,
  MdLayers,
  MdAssessment,
  MdLogout,
  MdKeyboardArrowDown,
} from "react-icons/md";

function Sidebar({
  isOpen = true,
  onToggle,
  activePage = "dashboard",
  activeStudentTab = "all",
  onSelectStudentTab,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleStudentTabClick = (tab) => {
    if (onSelectStudentTab) {
      onSelectStudentTab(tab);
    }
    navigate("/student-management", { state: { tab } });
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  return (
    <aside className={`sidebar ${isOpen ? "" : "collapsed"}`}>

      <div className="sidebar-logo">
        <img src={logo} alt="CampusNest" style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")} />
      </div>

      <div className="sidebar-menu">

        <div className={`menu-item ${location.pathname === "/dashboard" ? "active" : ""}`} onClick={() => navigate("/dashboard")}>
          <MdDashboard />
          <span>Dashboard</span>
        </div>

        <h4>STUDENT MANAGEMENT</h4>

        <div
          className={`menu-item ${activePage === "studentManagement" && activeStudentTab === "all" ? "active" : ""}`}
          onClick={() => handleStudentTabClick("all")}
        >
          <MdGroups />
          <span>All Students</span>
        </div>

        <div
          className={`menu-item ${activePage === "studentManagement" && activeStudentTab === "add" ? "active" : ""}`}
          onClick={() => handleStudentTabClick("add")}
        >
          <MdPersonAdd />
          <span>Add Student</span>
        </div>

        <div
          className={`menu-item ${activePage === "studentManagement" && activeStudentTab === "search" ? "active" : ""}`}
          onClick={() => handleStudentTabClick("search")}
        >
          <MdSearch />
          <span>Search Student</span>
        </div>

        <div
          className={`menu-item ${activePage === "studentManagement" && activeStudentTab === "update" ? "active" : ""}`}
          onClick={() => handleStudentTabClick("update")}
        >
          <MdEdit />
          <span>Update Student</span>
        </div>

        <div
          className={`menu-item ${activePage === "studentManagement" && activeStudentTab === "delete" ? "active" : ""}`}
          onClick={() => handleStudentTabClick("delete")}
        >
          <MdDelete />
          <span>Delete Student</span>
        </div>

        <h4>
          ROOM MANAGEMENT
          <MdKeyboardArrowDown className="arrow" />
        </h4>

        <div
          className={`menu-item ${location.pathname === "/room" ? "active" : ""}`}
          onClick={() => navigate("/room")}
        >
          <MdMeetingRoom />
          <span>View Rooms</span>
        </div>

        <div className="menu-item">
          <MdPersonPin />
          <span>Allocate Students</span>
        </div>

        <div className="menu-item">
          <MdBed />
          <span>Allocate Bed</span>
        </div>

        <div className="menu-item">
          <MdApartment />
          <span>Floor Search</span>
        </div>

        <h4>
          FLOOR MANAGEMENT
          <MdKeyboardArrowDown className="arrow" />
        </h4>

        <div className="menu-item">
          <MdLayers />
          <span>View Floors</span>
        </div>

        <h4>
          BED MANAGEMENT
          <MdKeyboardArrowDown className="arrow" />
        </h4>

        <div
          className={`menu-item ${
            activePage === "bedManagement" ||
            location.pathname === "/bed" ||
            location.pathname === "/bed-management" ||
            location.pathname === "/beds"
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/bed")}
        >
          <MdBed />
          <span>Manage Beds</span>
        </div>

        <h4>
          ALLOCATION
          <MdKeyboardArrowDown className="arrow" />
        </h4>

        <div className="menu-item">
          <MdPersonPin />
          <span>Allocate Students</span>
        </div>

        <div className="menu-item">
          <MdBed />
          <span>Allocate Bed</span>
        </div>

        <h4>
          REPORTS
          <MdKeyboardArrowDown className="arrow" />
        </h4>

        <div className="menu-item">
          <MdAssessment />
          <span>Reports</span>
        </div>

      </div>

      <div className="logout" onClick={handleLogout}>
        <MdLogout />
        <span>Logout</span>
      </div>

    </aside>
  );
}

export default Sidebar;