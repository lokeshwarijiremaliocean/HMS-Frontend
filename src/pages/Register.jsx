import { useNavigate } from "react-router-dom";

import "../styles/auth.css";
import LeftPanel from "../components/auth/LeftPanel";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <LeftPanel />

      <div className="card register-card">

        <h1 className="register-title">
          Create Your Account
        </h1>

        <div className="register-form">

          <input
            type="text"
            placeholder="Full Name"
            className="register-input"
          />

          <input
            type="email"
            placeholder="Email ID"
            className="register-input"
          />

          <input
            type="password"
            placeholder="Password"
            className="register-input"
          />

          <button
              className="register-btn"
              onClick={() => navigate("/dashboard")}
          >
              Create Account
        </button>

        </div>

      </div>
    </div>
  );
}

export default Register;