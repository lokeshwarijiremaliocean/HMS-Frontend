import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP } from "../api/authapi";

import "../styles/auth.css";

import LeftPanel from "../components/auth/LeftPanel";
import SuccessPopup from "../components/common/SuccessPopup";
import AlertPopup from "../components/common/AlertPopup";

function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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
      setAlertMessage("Enter 4 digit OTP");
      setShowAlertPopup(true);
      return;
    }

    if (verifying) return;
    setVerifying(true);

    try {
      const response = await verifyOTP(email, finalOTP);

      if (response.data.success) {
        const token =
          response.data.data?.access_token ||
          response.data.data?.token ||
          response.data.access_token ||
          response.data.token;

        if (token) {
          localStorage.setItem("access_token", token);
          localStorage.setItem("token", token);
        }
        setShowPopup(true);
      } else {
        setAlertMessage(response.data.message || "Invalid OTP");
        setShowAlertPopup(true);
      }
    } catch (error) {
      console.log(error);
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setAlertMessage(errorMsg);
      setShowAlertPopup(true);
    } finally {
      setVerifying(false);
    }
  };

  const handlePopupConfirm = () => {
    setShowPopup(false);
    navigate("/dashboard");
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

      <SuccessPopup
        isOpen={showPopup}
        title="OTP Verified Successfully"
        message="Your OTP has been verified successfully."
        onConfirm={handlePopupConfirm}
      />

      <AlertPopup
        isOpen={showAlertPopup}
        title="Attention"
        message={alertMessage}
        onConfirm={() => setShowAlertPopup(false)}
      />
    </div>
  );
}

export default OTPVerification;