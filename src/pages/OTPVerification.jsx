import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import "../styles/auth.css";

import LeftPanel from "../components/auth/LeftPanel";


function OTPVerification() {

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;


  const [otp, setOtp] = useState([
    "",
    "",
    "",
    ""
  ]);


  const handleChange = (value, index) => {

    if (!/^[0-9]?$/.test(value)) {
      return;
    }

    const newOTP = [...otp];

    newOTP[index] = value;

    setOtp(newOTP);

    // move to next box automatically
    if(value && index < 3){

      document
      .getElementById(`otp-${index+1}`)
      .focus();

    }

  };


  const handleVerify = async () => {


    const finalOTP = otp.join("");


    if(finalOTP.length !== 4){

      alert("Enter 4 digit OTP");
      return;

    }


    try {


      const response = await axios.post(
        "http://127.0.0.1:8000/verify-otp",
        {
          email: email,
          otp: finalOTP
        }
      );


      console.log(response.data);


      alert("OTP Verified Successfully");


      navigate("/register");


    }
    catch(error){


      console.log(error);


      alert("Invalid OTP");


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


          {
            otp.map((digit,index)=>(

              <input

                key={index}

                id={`otp-${index}`}

                className="otp-input"

                type="text"

                maxLength="1"

                value={digit}

                onChange={(e)=>
                  handleChange(
                    e.target.value,
                    index
                  )
                }

              />

            ))
          }


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