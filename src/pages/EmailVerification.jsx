import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/auth.css";

import LeftPanel from "../components/auth/LeftPanel";
import InputField from "../components/auth/InputField";
import Button from "../components/auth/Button";

import { sendOTP } from "../api/authapi";

function EmailVerification() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleContinue = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    if (sending) return;

    setSending(true);
    try {
      const response = await sendOTP(email);

      console.log("OTP Response:", response.data);

      alert("OTP Sent Successfully!");

      navigate("/otp", {
        state: {
          email: email,
        },
      });
    } catch (error) {
      console.error("OTP Error:", error);

      alert("Failed to send OTP");
    } finally {
      setSending(false);
    }
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

    </div>

  );

}

export default EmailVerification;