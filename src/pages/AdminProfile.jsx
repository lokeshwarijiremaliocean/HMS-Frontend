import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosInstance";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import adminImg from "../assets/admin.png";

import {
  MdChevronRight,
  MdEdit,
  MdBadge,
  MdEmail,
  MdPhone,
  MdShield,
  MdCalendarToday,
  MdLock,
  MdSecurity,
  MdNotificationsActive,
  MdPalette,
  MdHistory,
  MdFlashOn,
  MdClose,
  MdKey,
  MdDownload,
  MdStorage,
  MdRefresh,
  MdHome,
  MdWc,
  MdCheckCircle,
} from "react-icons/md";

import "../styles/adminProfile.css";

// Helper functions for formatting
const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
};

function AdminProfile() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // API Loading & Error State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile State
  const [profile, setProfile] = useState({
    id: "",
    adminId: "",
    name: "Admin",
    role: "Hostel Administrator",
    email: "",
    phone: "",
    gender: "",
    isActive: true,
    status: "Active",
    joiningDate: "",
    lastLogin: "Today, 10:45 AM",
  });

  // Interactivity States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...profile });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    systemAlerts: true,
  });

  const [activeTheme, setActiveTheme] = useState("Dark Red (HMS Default)");
  const [toastMessage, setToastMessage] = useState(null);

  const fetchAdminProfile = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("access_token") || localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found in local storage. Please log in to access your profile.");
      setLoading(false);
      return;
    }

    // Retrieve phone number from localStorage or fallback to admin phone "9782367223"
    const adminPhone =
      localStorage.getItem("admin_phone") ||
      localStorage.getItem("phone") ||
      "9782367223";

    try {
      const response = await apiClient.get("/admin/phone", {
        params: { phone: adminPhone },
      });
      const resData = response.data;
      
      // Extract admin object from response.data.data
      const adminData = resData?.data || resData;

      if (adminData && (adminData.first_name || adminData.email || adminData.id)) {
        const firstName = adminData.first_name || "";
        const lastName = adminData.last_name || "";
        const fullName = `${capitalize(firstName)} ${capitalize(lastName)}`.trim() || "Admin";
        const formattedDate = formatDate(adminData.created_at);
        const isActive = adminData.is_active ?? true;
        const statusText = isActive ? "Active" : "Inactive";
        const genderText = adminData.gender ? capitalize(adminData.gender) : "N/A";

        if (adminData.phone) {
          localStorage.setItem("admin_phone", adminData.phone);
        }

        setProfile({
          id: adminData.id ?? "N/A",
          adminId: adminData.id ? `${adminData.id}` : "N/A",
          name: fullName,
          firstName: firstName,
          lastName: lastName,
          role: "Hostel Administrator",
          email: adminData.email || "N/A",
          phone: adminData.phone || "N/A",
          gender: genderText,
          isActive: isActive,
          status: statusText,
          joiningDate: formattedDate,
          lastLogin: "Today, 10:45 AM",
        });
        setError(null);
      } else {
        setError(resData?.message || "Unable to retrieve admin profile from server.");
      }
    } catch (err) {
      console.error("Error fetching admin details:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Unauthorized access: Invalid or expired token. Please log in again.");
      } else {
        const errMsg = err.response?.data?.detail
          ? (Array.isArray(err.response.data.detail)
              ? err.response.data.detail[0]?.msg
              : err.response.data.detail)
          : (err.response?.data?.message || err.message || "Failed to fetch admin details from server.");
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Edit Profile Handlers
  const handleOpenEditModal = () => {
    setEditFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
    }));
    setIsEditModalOpen(false);
    showToast("Profile details updated locally!", "success");
  };

  // Change Password Handlers
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      showToast("New passwords do not match!", "info");
      return;
    }
    setIsPasswordModalOpen(false);
    setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    showToast("Password changed successfully!", "success");
  };

  // Toggle handlers
  const handle2FAToggle = () => {
    const newState = !is2FAEnabled;
    setIs2FAEnabled(newState);
    showToast(`Two-Factor Authentication ${newState ? "Enabled" : "Disabled"}.`, "info");
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    showToast("Notification preferences updated.", "success");
  };

  const handleThemeChange = (themeName) => {
    setActiveTheme(themeName);
    showToast(`Theme updated to ${themeName}.`, "info");
  };

  const handleQuickAction = (actionName) => {
    showToast(`${actionName} triggered successfully.`, "success");
  };

  return (
    <div className="profile-container">
      {/* Existing HMS Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      <main className="profile-main">
        {/* Existing Navbar with page title */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title="Admin Profile / Settings"
        />

        {/* Breadcrumb Navigation */}
        <div className="profile-breadcrumb-bar">
          <div className="breadcrumb-list">
            <span
              className="breadcrumb-item"
              onClick={() => navigate("/dashboard")}
              title="Return to Dashboard"
            >
              <MdHome style={{ fontSize: "18px" }} />
              Dashboard
            </span>
            <MdChevronRight className="breadcrumb-separator" />
            <span className="breadcrumb-item active">Profile</span>
          </div>

          <div className="page-header-badge">
            <span className="status-dot"></span>
            Hostel Management System
          </div>
        </div>

        {/* Toast Feedback Alert */}
        {toastMessage && (
          <div className={`profile-alert ${toastMessage.type}`}>
            <span>{toastMessage.message}</span>
            <MdClose
              className="profile-alert-close"
              onClick={() => setToastMessage(null)}
            />
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="profile-loading-container">
            <div className="profile-spinner"></div>
            <span className="profile-loading-text">Fetching admin details from server...</span>
          </div>
        ) : error ? (
          /* Error State */
          <div className="profile-error-container">
            <h4>Unable to Load Admin Profile</h4>
            <p>{error}</p>
            <button className="profile-retry-btn" onClick={fetchAdminProfile}>
              Retry Fetch
            </button>
          </div>
        ) : (
          /* Main Admin Profile Area */
          <div className="profile-top-card">
            <div className="profile-header-banner">
              <div className="profile-avatar-group">
                <div className="profile-avatar-wrapper">
                  <img src={adminImg} alt="Admin" className="profile-avatar-img" />
                  <span
                    className="avatar-active-badge"
                    style={{ background: profile.isActive ? "#22c55e" : "#ef4444" }}
                    title={`Status: ${profile.status}`}
                  ></span>
                </div>
                <div className="profile-title-details">
                  <h2>{profile.name}</h2>
                  <div className="profile-role-tag">
                    <MdShield />
                    {profile.role}
                  </div>
                </div>
              </div>

              <button className="profile-edit-btn" onClick={handleOpenEditModal}>
                <MdEdit />
                Edit Profile
              </button>
            </div>

            {/* Information Grid Card */}
            <div className="profile-info-grid">
              <div className="info-item-card">
                <div className="info-icon-box">
                  <MdBadge />
                </div>
                <div className="info-content">
                  <span className="info-label">Admin ID</span>
                  <span className="info-value">{profile.id}</span>
                </div>
              </div>

              <div className="info-item-card">
                <div className="info-icon-box">
                  <MdEmail />
                </div>
                <div className="info-content">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{profile.email}</span>
                </div>
              </div>

              <div className="info-item-card">
                <div className="info-icon-box">
                  <MdPhone />
                </div>
                <div className="info-content">
                  <span className="info-label">Mobile Number</span>
                  <span className="info-value">{profile.phone}</span>
                </div>
              </div>

              <div className="info-item-card">
                <div className="info-icon-box">
                  <MdWc />
                </div>
                <div className="info-content">
                  <span className="info-label">Gender</span>
                  <span className="info-value">{profile.gender}</span>
                </div>
              </div>

              <div className="info-item-card">
                <div className="info-icon-box">
                  <MdCheckCircle />
                </div>
                <div className="info-content">
                  <span className="info-label">Account Status</span>
                  <span
                    className="info-value"
                    style={{ color: profile.isActive ? "#16a34a" : "#dc2626" }}
                  >
                    {profile.status}
                  </span>
                </div>
              </div>

              <div className="info-item-card">
                <div className="info-icon-box">
                  <MdShield />
                </div>
                <div className="info-content">
                  <span className="info-label">System Role</span>
                  <span className="info-value">{profile.role}</span>
                </div>
              </div>

              <div className="info-item-card">
                <div className="info-icon-box">
                  <MdCalendarToday />
                </div>
                <div className="info-content">
                  <span className="info-label">Joining Date</span>
                  <span className="info-value">{profile.joiningDate}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings & Security Section */}
        <div className="section-heading">
          <div>
            <h3>
              <MdSecurity />
              Settings & Security
            </h3>
            <p className="section-subtitle">
              Manage credentials, authentication, notifications, and preference settings.
            </p>
          </div>
        </div>

        <div className="settings-grid">
          {/* 1. Change Password */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon lock">
                <MdLock />
              </div>
              <div className="settings-card-title-group">
                <h4>Change Password</h4>
                <p>Ensure account security by periodically updating your password.</p>
              </div>
            </div>
            <div className="settings-card-body">
              <button
                className="settings-action-btn"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <MdKey /> Update Password
              </button>
            </div>
          </div>

          {/* 2. Two Factor Authentication */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon security">
                <MdSecurity />
              </div>
              <div className="settings-card-title-group">
                <h4>Two Factor Authentication</h4>
                <p>Protect account access with 2FA verification steps.</p>
              </div>
            </div>
            <div className="settings-card-body">
              <div className="switch-toggle-row">
                <span className="switch-label">
                  Status: {is2FAEnabled ? "Enabled" : "Disabled"}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={is2FAEnabled}
                    onChange={handle2FAToggle}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Notification Preferences */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon notification">
                <MdNotificationsActive />
              </div>
              <div className="settings-card-title-group">
                <h4>Notification Preferences</h4>
                <p>Configure automated system alerts and operational updates.</p>
              </div>
            </div>
            <div className="settings-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="switch-toggle-row">
                <span className="switch-label">Email Alerts</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.emailAlerts}
                    onChange={() => handleNotificationToggle("emailAlerts")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="switch-toggle-row">
                <span className="switch-label">SMS Notifications</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.smsAlerts}
                    onChange={() => handleNotificationToggle("smsAlerts")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* 4. Theme Settings */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon theme">
                <MdPalette />
              </div>
              <div className="settings-card-title-group">
                <h4>Theme Settings</h4>
                <p>Choose visual styling preferences for your HMS session.</p>
              </div>
            </div>
            <div className="settings-card-body">
              <div className="theme-pill-group">
                <span
                  className={`theme-pill ${
                    activeTheme === "Dark Red (HMS Default)" ? "active" : ""
                  }`}
                  onClick={() => handleThemeChange("Dark Red (HMS Default)")}
                >
                  Dark Red (Default)
                </span>
                <span
                  className={`theme-pill ${
                    activeTheme === "Light Slate" ? "active" : ""
                  }`}
                  onClick={() => handleThemeChange("Light Slate")}
                >
                  Light Slate
                </span>
                <span
                  className={`theme-pill ${
                    activeTheme === "Modern Dark" ? "active" : ""
                  }`}
                  onClick={() => handleThemeChange("Modern Dark")}
                >
                  Modern Dark
                </span>
              </div>
            </div>
          </div>

          {/* 5. Account Activity */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon activity">
                <MdHistory />
              </div>
              <div className="settings-card-title-group">
                <h4>Account Activity</h4>
                <p>Log of recent administrative sessions and events.</p>
              </div>
            </div>
            <div className="settings-card-body">
              <div className="activity-mini-list">
                <div className="activity-item">
                  <span className="activity-desc">Logged in via Chrome (Windows)</span>
                  <span className="activity-time">Active Now</span>
                </div>
                <div className="activity-item">
                  <span className="activity-desc">Room Allocations Modified</span>
                  <span className="activity-time">Yesterday, 4:30 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Quick Actions */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon quick">
                <MdFlashOn />
              </div>
              <div className="settings-card-title-group">
                <h4>Quick Actions</h4>
                <p>Shortcuts for system maintenance and report downloads.</p>
              </div>
            </div>
            <div className="settings-card-body">
              <div className="quick-btn-group">
                <button
                  className="quick-btn"
                  onClick={() => handleQuickAction("System Logs Export")}
                >
                  <MdDownload /> Export Logs
                </button>
                <button
                  className="quick-btn"
                  onClick={() => handleQuickAction("Database Backup")}
                >
                  <MdStorage /> Backup DB
                </button>
                <button
                  className="quick-btn"
                  onClick={() => handleQuickAction("Cache Refresh")}
                >
                  <MdRefresh /> Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <MdEdit /> Edit Admin Profile
                </h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <MdClose />
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="modal-body">
                  <div className="modal-form-group">
                    <label>Admin Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Mobile Phone Number</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="modal-save-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {isPasswordModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsPasswordModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <MdLock /> Change Password
                </h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  <MdClose />
                </button>
              </div>

              <form onSubmit={handleSavePassword}>
                <div className="modal-body">
                  <div className="modal-form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={passwordFormData.currentPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={passwordFormData.newPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordFormData.confirmPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setIsPasswordModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="modal-save-btn">
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminProfile;
