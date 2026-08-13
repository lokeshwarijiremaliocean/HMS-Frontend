import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "../styles/auth.css";
import LeftPanel from "../components/auth/LeftPanel";
import SuccessPopup from "../components/common/SuccessPopup";
import { registerAdmin } from "../api/authapi";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: initialEmail,
    phone: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      return "First Name is required.";
    }
    if (!formData.last_name.trim()) {
      return "Last Name is required.";
    }
    if (!formData.email.trim()) {
      return "Email is required.";
    }
    if (!formData.phone.trim()) {
      return "Phone is required.";
    }
    if (!formData.gender.trim()) {
      return "Gender is required.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (loading) return;
    setLoading(true);
    setError("");

    const requestBody = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      gender: formData.gender.trim(),
    };

    try {
      const response = await registerAdmin(requestBody);

      if (formData.phone) {
        localStorage.setItem("admin_phone", formData.phone.trim());
      }

      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Admin registration error:", err);
      let errorMsg = "Registration failed. Please try again.";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data.detail === "string") {
          errorMsg = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMsg = data.detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
        } else if (data.message) {
          errorMsg = data.message;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessPopup(false);
    navigate("/dashboard");
  };

  return (
    <div className="page">
      <LeftPanel />

      <div className="card register-card">
        <h1 className="register-title">
          Create Your Account
        </h1>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && <div className="register-error">{error}</div>}

          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            className="register-input"
            value={formData.first_name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            className="register-input"
            value={formData.last_name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="register-input"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            className="register-input"
            value={formData.phone}
            onChange={handleChange}
          />

          <input
            type="text"
            name="gender"
            placeholder="Gender"
            className="register-input"
            value={formData.gender}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>

      <SuccessPopup
        isOpen={showSuccessPopup}
        title="Registration Successful!"
        message="Your admin account has been created successfully."
        onConfirm={handleSuccessConfirm}
      />
    </div>
  );
}

export default Register;