import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";

import {
  MdChevronRight,
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
  MdVolumeUp,
  MdVolumeOff,
  MdViewSidebar,
} from "react-icons/md";

import "../styles/adminProfile.css";

function Settings() {
  const navigate = useNavigate();

  // Sidebar preference state (restored from localStorage)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("hms_sidebar_open");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const nextState = !prev;
      localStorage.setItem("hms_sidebar_open", JSON.stringify(nextState));
      return nextState;
    });
  };

  // Update Password state (completely untouched logic)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 2FA preference state (restored from localStorage)
  const [is2FAEnabled, setIs2FAEnabled] = useState(() => {
    const saved = localStorage.getItem("hms_2fa_enabled");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Notification Preferences (restored from localStorage)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("hms_notification_prefs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      emailAlerts: true,
      systemAlerts: true,
    };
  });

  // Notification Sound (restored from localStorage)
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("hms_sound_enabled");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Theme Settings (restored from localStorage & applied to DOM)
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem("hms_theme") || "Dark Red (HMS Default)";
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Function to apply active theme to document body
  const applyThemeToDOM = (themeName) => {
    document.body.classList.remove("theme-default", "theme-light", "theme-dark");
    if (themeName === "Light Mode" || themeName === "Light Slate") {
      document.body.classList.add("theme-light");
    } else if (themeName === "Dark Mode" || themeName === "Modern Dark") {
      document.body.classList.add("theme-dark");
    } else {
      document.body.classList.add("theme-default");
    }
  };

  useEffect(() => {
    applyThemeToDOM(activeTheme);
  }, [activeTheme]);

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Change Password Handlers (Untouched working functionality)
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

  // 2FA Toggle Handler (with localStorage persistence)
  const handle2FAToggle = () => {
    const newState = !is2FAEnabled;
    setIs2FAEnabled(newState);
    localStorage.setItem("hms_2fa_enabled", JSON.stringify(newState));
    showToast(`Frontend 2FA preference ${newState ? "Enabled" : "Disabled"}.`, "info");
  };

  // Notification Toggle Handler (with localStorage persistence)
  const handleNotificationToggle = (key) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("hms_notification_prefs", JSON.stringify(updated));
      return updated;
    });
    showToast("Notification preferences saved.", "success");
  };

  // Notification Sound Toggle Handler (with localStorage persistence)
  const handleSoundToggle = () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    localStorage.setItem("hms_sound_enabled", JSON.stringify(newState));
    showToast(`Notification Sound ${newState ? "ON" : "OFF"}.`, "info");
  };

  // Theme Change Handler (with localStorage persistence & DOM update)
  const handleThemeChange = (themeName) => {
    setActiveTheme(themeName);
    localStorage.setItem("hms_theme", themeName);
    applyThemeToDOM(themeName);
    showToast(`Theme updated to ${themeName}.`, "info");
  };

  const handleQuickAction = (actionName) => {
    if (actionName === "Cache Refresh") {
      localStorage.removeItem("hms_2fa_enabled");
      localStorage.removeItem("hms_notification_prefs");
      localStorage.removeItem("hms_sound_enabled");
      localStorage.removeItem("hms_theme");
      localStorage.removeItem("hms_sidebar_open");

      setIs2FAEnabled(true);
      setNotifications({ emailAlerts: true, systemAlerts: true });
      setIsSoundEnabled(true);
      setActiveTheme("Dark Red (HMS Default)");
      applyThemeToDOM("Dark Red (HMS Default)");
      setSidebarOpen(true);

      showToast("Cache and preferences reset to defaults.", "success");
    } else {
      showToast(`${actionName} triggered successfully.`, "success");
    }
  };

  return (
    <div className="profile-container">
      {/* Existing HMS Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      <main className="profile-main">
        {/* Existing Navbar with page title */}
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          title="Admin Settings & Security"
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
            <span className="breadcrumb-item active">Settings</span>
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

        {/* Settings & Security Heading */}
        <div className="section-heading" style={{ marginTop: "0px" }}>
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
          {/* 1. Change Password (Working frontend functionality preserved) */}
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
                <p>Protect account access with 2FA verification steps (Frontend preference).</p>
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
                <p>Configure automated system alerts and notification sounds.</p>
              </div>
            </div>
            <div className="settings-card-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="switch-toggle-row">
                <span className="switch-label">Email Notifications</span>
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
                <span className="switch-label">System Notifications</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.systemAlerts}
                    onChange={() => handleNotificationToggle("systemAlerts")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="switch-toggle-row">
                <span className="switch-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {isSoundEnabled ? <MdVolumeUp style={{ color: "#0284c7" }} /> : <MdVolumeOff style={{ color: "#94a3b8" }} />}
                  Notification Sound ({isSoundEnabled ? "ON" : "OFF"})
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isSoundEnabled}
                    onChange={handleSoundToggle}
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
                    activeTheme === "Light Mode" || activeTheme === "Light Slate" ? "active" : ""
                  }`}
                  onClick={() => handleThemeChange("Light Mode")}
                >
                  Light Mode
                </span>
                <span
                  className={`theme-pill ${
                    activeTheme === "Dark Mode" || activeTheme === "Modern Dark" ? "active" : ""
                  }`}
                  onClick={() => handleThemeChange("Dark Mode")}
                >
                  Dark Mode
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

          {/* 6. Dashboard & Quick Preferences */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon quick">
                <MdFlashOn />
              </div>
              <div className="settings-card-title-group">
                <h4>Dashboard Preferences & Quick Actions</h4>
                <p>Manage sidebar display preferences and system maintenance tools.</p>
              </div>
            </div>
            <div className="settings-card-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="switch-toggle-row">
                <span className="switch-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <MdViewSidebar /> Sidebar Expanded ({sidebarOpen ? "Yes" : "Collapsed"})
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={sidebarOpen}
                    onChange={handleToggleSidebar}
                  />
                  <span className="slider"></span>
                </label>
              </div>

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

        {/* Change Password Modal (Untouched working functionality) */}
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

export default Settings;
