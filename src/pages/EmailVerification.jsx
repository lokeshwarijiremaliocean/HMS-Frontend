import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/auth.css";

import LeftPanel from "../components/auth/LeftPanel";
import InputField from "../components/auth/InputField";
import Button from "../components/auth/Button";
import SuccessPopup from "../components/common/SuccessPopup";
import AlertPopup from "../components/common/AlertPopup";

import { sendOTP } from "../api/authapi";

function EmailVerification() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleContinue = async () => {
    if (!email) {
      setAlertMessage("Please enter your email.");
      setShowAlertPopup(true);
      return;
    }
    if (sending) return;

    setSending(true);
    try {
      const response = await sendOTP(email);

      console.log("OTP Response:", response.data);

      setShowPopup(true);
    } catch (error) {
      console.error("OTP Error:", error);

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (error.code === "ERR_NETWORK" || !error.response
          ? `Cannot connect to backend server (${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}). Please check if your backend server is running.`
          : "Failed to send OTP. Please try again.");

      setAlertMessage(errorMessage);
      setShowAlertPopup(true);
    } finally {
      setSending(false);
    }
  };

  const handlePopupConfirm = () => {
    setShowPopup(false);
    navigate("/otp", {
      state: {
        email: email,
      },
    });
  };

  return (
    <div className="page">
      <LeftPanel />

      <div className="card">
        <h1 className="email-title">
          What's Your Email ?
        </h1>

        <InputField
          placeholder="Enter Your Email ID"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          title="Continue"
          onClick={handleContinue}
        />
      </div>

      <SuccessPopup
        isOpen={showPopup}
        title="OTP Sent Successfully!"
        message="Your OTP has been sent successfully."
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

export default EmailVerification;