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
  MdBed,
  MdLayers,
  MdAdd,
  MdLogout,
  MdKeyboardArrowDown,
} from "react-icons/md";

function Sidebar({
  isOpen = true,
  onToggle,
  activePage = "dashboard",
  activeStudentTab = "all",
  onSelectStudentTab,
  activeRoomTab = "all",
  onSelectRoomTab,
  activeFloorTab = "view",
  onSelectFloorTab,
  activeBedTab = "all",
  onSelectBedTab,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleStudentTabClick = (tab) => {
    if (onSelectStudentTab) {
      onSelectStudentTab(tab);
    }
    navigate("/student-management", { state: { tab } });
  };

  const handleRoomTabClick = (tab) => {
    if (onSelectRoomTab) {
      onSelectRoomTab(tab);
    }
    navigate("/room", { state: { tab } });
  };

  const handleFloorTabClick = (tab) => {
    if (onSelectFloorTab) {
      onSelectFloorTab(tab);
    }
    navigate("/floor", { state: { tab } });
  };

  const handleBedTabClick = (tab) => {
    if (onSelectBedTab) {
      onSelectBedTab(tab);
    }
    navigate("/bed", { state: { tab } });
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  const isStudentPage =
    activePage === "studentManagement" ||
    activePage === "student" ||
    location.pathname === "/student-management" ||
    location.pathname === "/students";

  const isRoomPage =
    activePage === "room" ||
    activePage === "roomManagement" ||
    location.pathname === "/room" ||
    location.pathname === "/rooms";

  const isFloorPage =
    activePage === "floor" ||
    activePage === "floorManagement" ||
    location.pathname === "/floor" ||
    location.pathname === "/floors" ||
    location.pathname === "/floor-management";

  const isBedPage =
    activePage === "bed" ||
    activePage === "bedManagement" ||
    location.pathname === "/bed" ||
    location.pathname === "/beds" ||
    location.pathname === "/bed-management";

  return (
    <aside className={`sidebar ${isOpen ? "" : "collapsed"}`}>
      <div className="sidebar-logo">
        <img
          src={logo}
          alt="CampusNest"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        />
      </div>

      <div className="sidebar-menu">
        {/* DASHBOARD */}
        <div
          className={`menu-item ${location.pathname === "/dashboard" ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          <MdDashboard />
          <span>Dashboard</span>
        </div>

        {/* STUDENT MANAGEMENT */}
        <h4>STUDENT MANAGEMENT</h4>

        <div
          className={`menu-item ${isStudentPage && activeStudentTab === "all" ? "active" : ""}`}
          onClick={() => handleStudentTabClick("all")}
        >
          <MdGroups />
          <span>All Students</span>
        </div>

        <div
          className={`menu-item ${isStudentPage && activeStudentTab === "add" ? "active" : ""}`}
          onClick={() => handleStudentTabClick("add")}
        >
          <MdPersonAdd />
          <span>Add Student</span>
        </div>

        <div
          className={`menu-item ${isStudentPage && activeStudentTab === "search" ? "active" : ""}`}
          onClick={() => handleStudentTabClick("search")}
        >
          <MdSearch />
          <span>Search Student</span>
        </div>

        <div
          className={`menu-item ${isStudentPage && activeStudentTab === "update" ? "active" : ""}`}
          onClick={() => handleStudentTabClick("update")}
        >
          <MdEdit />
          <span>Update Student</span>
        </div>

        <div
          className={`menu-item ${isStudentPage && activeStudentTab === "delete" ? "active" : ""}`}
          onClick={() => handleStudentTabClick("delete")}
        >
          <MdDelete />
          <span>Delete Student</span>
        </div>

        {/* ROOM MANAGEMENT */}
        <h4>
          ROOM MANAGEMENT
          <MdKeyboardArrowDown className="arrow" />
        </h4>

        <div
          className={`menu-item ${isRoomPage && (activeRoomTab === "all" || activeRoomTab === "view") ? "active" : ""}`}
          onClick={() => handleRoomTabClick("all")}
        >
          <MdMeetingRoom />
          <span>View Rooms</span>
        </div>

        <div
          className={`menu-item ${isRoomPage && activeRoomTab === "add" ? "active" : ""}`}
          onClick={() => handleRoomTabClick("add")}
        >
          <MdAdd />
          <span>Add Room</span>
        </div>

        <div
          className={`menu-item ${isRoomPage && (activeRoomTab === "search" || activeRoomTab === "get") ? "active" : ""}`}
          onClick={() => handleRoomTabClick("search")}
        >
          <MdSearch />
          <span>Search Room</span>
        </div>

        <div
          className={`menu-item ${isRoomPage && activeRoomTab === "update" ? "active" : ""}`}
          onClick={() => handleRoomTabClick("update")}
        >
          <MdEdit />
          <span>Update Room</span>
        </div>

        <div
          className={`menu-item ${isRoomPage && activeRoomTab === "delete" ? "active" : ""}`}
          onClick={() => handleRoomTabClick("delete")}
        >
          <MdDelete />
          <span>Delete Room</span>
        </div>

        {/* FLOOR MANAGEMENT */}
        <h4>
          FLOOR MANAGEMENT
          <MdKeyboardArrowDown className="arrow" />
        </h4>

        <div
          className={`menu-item ${isFloorPage && (activeFloorTab === "view" || activeFloorTab === "all") ? "active" : ""}`}
          onClick={() => handleFloorTabClick("view")}
        >
          <MdLayers />
          <span>View Floors</span>
        </div>

        <div
          className={`menu-item ${isFloorPage && activeFloorTab === "add" ? "active" : ""}`}
          onClick={() => handleFloorTabClick("add")}
        >
          <MdAdd />
          <span>Add Floor</span>
        </div>

        <div
          className={`menu-item ${isFloorPage && activeFloorTab === "search" ? "active" : ""}`}
          onClick={() => handleFloorTabClick("search")}
        >
          <MdSearch />
          <span>Search Floor</span>
        </div>

        <div
          className={`menu-item ${isFloorPage && activeFloorTab === "update" ? "active" : ""}`}
          onClick={() => handleFloorTabClick("update")}
        >
          <MdEdit />
          <span>Update Floor</span>
        </div>

        <div
          className={`menu-item ${isFloorPage && activeFloorTab === "delete" ? "active" : ""}`}
          onClick={() => handleFloorTabClick("delete")}
        >
          <MdDelete />
          <span>Delete Floor</span>
        </div>

        {/* BED MANAGEMENT */}
        <h4>
          BED MANAGEMENT
          <MdKeyboardArrowDown className="arrow" />
        </h4>

        <div
          className={`menu-item ${isBedPage && (activeBedTab === "all" || activeBedTab === "manage") ? "active" : ""}`}
          onClick={() => handleBedTabClick("all")}
        >
          <MdBed />
          <span>Manage Beds</span>
        </div>

        <div
          className={`menu-item ${isBedPage && activeBedTab === "add" ? "active" : ""}`}
          onClick={() => handleBedTabClick("add")}
        >
          <MdAdd />
          <span>Add Bed</span>
        </div>

        <div
          className={`menu-item ${isBedPage && (activeBedTab === "search" || activeBedTab === "get") ? "active" : ""}`}
          onClick={() => handleBedTabClick("search")}
        >
          <MdSearch />
          <span>Search Bed</span>
        </div>

        <div
          className={`menu-item ${isBedPage && activeBedTab === "update" ? "active" : ""}`}
          onClick={() => handleBedTabClick("update")}
        >
          <MdEdit />
          <span>Update Bed</span>
        </div>

        <div
          className={`menu-item ${isBedPage && activeBedTab === "delete" ? "active" : ""}`}
          onClick={() => handleBedTabClick("delete")}
        >
          <MdDelete />
          <span>Delete Bed</span>
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