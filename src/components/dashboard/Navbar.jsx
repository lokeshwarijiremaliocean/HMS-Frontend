import "../../styles/navbar.css";

import admin from "../../assets/admin.png";

import { MdMenu, MdNotifications, MdKeyboardArrowDown } from "react-icons/md";

function Navbar() {
  return (
    <div className="navbar">

      <div className="navbar-left">

        <MdMenu className="menu-icon" />

        <h1>Dashboard</h1>

      </div>

      <div className="navbar-right">

        <div className="notification">

          <MdNotifications />

          <span className="badge">3</span>

        </div>

        <img
          src={admin}
          alt="Admin"
          className="admin-image"
        />

        <div className="admin-info">

          <h4>Admin</h4>

          <p>Hostel Administrator</p>

        </div>

        <MdKeyboardArrowDown className="dropdown-icon"/>

      </div>

    </div>
  );
}

export default Navbar;