```jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/navbar.css";

import admin from "../../assets/admin.png";

import {
  MdMenu,
  MdNotifications,
  MdKeyboardArrowDown,
  MdPerson,
  MdSettings,
  MdLogout,
} from "react-icons/md";

function Navbar({
  title = "Dashboard",
  breadcrumb,
  onToggleSidebar,
  unreadNotifications = false,
  notifications = [],
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(
    unreadNotifications || notifications.length > 0
  );

  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setHasUnreadNotifications(
      unreadNotifications || notifications.length > 0
    );
  }, [unreadNotifications, notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
        setIsAdminOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleNotification = () => {
    setIsAdminOpen(false);

    if (!isNotificationOpen) {
      // Mark notifications as read when opening panel
      setHasUnreadNotifications(false);
    }

    setIsNotificationOpen((prev) => !prev);
  };

  const toggleAdmin = () => {
    setIsNotificationOpen(false);
    setIsAdminOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsAdminOpen(false);
    alert("Profile coming soon!");
  };

  const handleSettingsClick = () => {
    setIsAdminOpen(false);
    alert("Settings coming soon!");
  };

  return (
    <div className="navbar" ref={navRef}>
      <div className="navbar-left">
        <MdMenu
          className="menu-icon"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
        />

        <div>
          <h1>{title}</h1>

          {breadcrumb && (
            <p className="navbar-breadcrumb">{breadcrumb}</p>
          )}
        </div>
      </div>

      <div className="navbar-right">
        {/* Notification Bell */}
        <div
          className="notification"
          onClick={toggleNotification}
          title="Notifications"
        >
          <MdNotifications />

          {hasUnreadNotifications && <span className="badge"></span>}
        </div>

        {/* Notification Dropdown */}
        {isNotificationOpen && (
          <div className="notification-dropdown">
            <div className="notification-header">
              Notifications
            </div>

            {notifications && notifications.length > 0 ? (
              <ul className="notification-list">
                {notifications.map((item, index) => (
                  <li
                    key={item.id || index}
                    className="notification-item"
                  >
                    <span className="notification-dot"></span>

                    <span>
                      {typeof item === "string"
                        ? item
                        : item.message}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-notifications">
                No new notifications
              </div>
            )}
          </div>
        )}

        {/* Admin Profile Area */}
        <div
          className="admin-profile-container"
          onClick={toggleAdmin}
          title="Admin Menu"
        >
          <img
            src={admin}
            alt="Admin"
            className="admin-image"
          />

          <div className="admin-info">
            <h4>Admin</h4>
            <p>Hostel Administrator</p>
          </div>

          <MdKeyboardArrowDown className="dropdown-icon" />
        </div>

        {/* Admin Dropdown */}
        {isAdminOpen && (
          <div className="admin-dropdown">
            <div
              className="admin-dropdown-item"
              onClick={handleProfileClick}
            >
              <MdPerson style={{ fontSize: "18px" }} />
              <span>Profile</span>
            </div>

            <div
              className="admin-dropdown-item"
              onClick={handleSettingsClick}
            >
              <MdSettings style={{ fontSize: "18px" }} />
              <span>Settings</span>
            </div>

            <div
              className="admin-dropdown-item logout-item"
              onClick={handleLogout}
            >
              <MdLogout style={{ fontSize: "18px" }} />
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
```
