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
  MdClose,
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

    const adminPhone =
      localStorage.getItem("admin_phone") ||
      localStorage.getItem("phone") ||
      "9782367223";

    try {
      const response = await apiClient.get("/admin/phone", {
        params: { phone: adminPhone },
      });
      const resData = response.data;
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

  return (
    <div className="profile-container">
      {/* Existing HMS Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      <main className="profile-main">
        {/* Existing Shared Navbar */}
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          title="Admin Profile"
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
          /* Main Admin Profile Area Only */
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
      </main>
    </div>
  );
}

export default AdminProfile;
