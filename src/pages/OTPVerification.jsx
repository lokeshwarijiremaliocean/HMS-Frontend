import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP } from "../api/authapi";

import "../styles/auth.css";

import LeftPanel from "../components/auth/LeftPanel";

function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) {
      return;
    }

    const newOTP = [...otp];
    newOTP[index] = value;

    setOtp(newOTP);

    // Move to next box automatically
    if (value && index < 3) {
      document
        .getElementById(`otp-${index + 1}`)
        .focus();
    }
  };

  const handleVerify = async () => {
    const finalOTP = otp.join("");

    if (finalOTP.length !== 4) {
      alert("Enter 4 digit OTP");
      return;
    }

    try {
      const response = await verifyOTP(email, finalOTP);

      if (response.data.success) {
        const token = response.data?.access_token || response.data?.data?.access_token;
        if (token) {
          localStorage.setItem("access_token", token);
        }
        alert("OTP Verified Successfully");
        navigate("/register");
      } else {
        alert(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="page">
      <LeftPanel />

      <div className="card otp-card">
        <h1 className="otp-title">
          Enter OTP Code
        </h1>

        <div className="otp-boxes">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              className="otp-input"
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) =>
                handleChange(e.target.value, index)
              }
            />
          ))}
        </div>

        <button
          className="verify-btn"
          onClick={handleVerify}
        >
          Verify Code
        </button>

        <p className="resend">
          Resend code
        </p>
      </div>
    </div>
  );
}

export default OTPVerification;