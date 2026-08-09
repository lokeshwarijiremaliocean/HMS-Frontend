import "../../styles/sidebar.css";

import logo from "../../assets/campusnest-logo.png";

import {
  MdDashboard,
  MdPersonAdd,
  MdGroups,
  MdMeetingRoom,
  MdPersonPin,
  MdBed,
  MdApartment,
  MdLogout,
  MdKeyboardArrowDown,
} from "react-icons/md";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <img src={logo} alt="CampusNest" />
      </div>

      <div className="sidebar-menu">

        <div className="menu-item active">
          <MdDashboard />
          <span>Dashboard</span>
        </div>

        <h4>STUDENT MANAGEMENT</h4>

        <div className="menu-item">
          <MdPersonAdd />
          <span>Add Student</span>
        </div>

        <div className="menu-item">
          <MdGroups />
          <span>View Student</span>
        </div>

        <h4>
          ROOM MANAGEMENT
          <MdKeyboardArrowDown className="arrow" />
        </h4>

        <div className="menu-item">
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

      </div>

      <div className="logout">
        <MdLogout />
        <span>Logout</span>
      </div>

    </aside>
  );
}

export default Sidebar;