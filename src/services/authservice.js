import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const verifyOTP = (email, otp) => {
  return axios.post(`${BASE_URL}/verify-otp`, {
    email,
    otp,
  });
};