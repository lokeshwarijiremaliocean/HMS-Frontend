import axios from "axios";

const API = "http://127.0.0.1:8000";

export const sendOTP = async (email) => {
  return axios.post(`${API}/send-otp`, {
    email,
  });
};

export const verifyOTP = async (email, otp) => {
  return axios.post(`${API}/verify-otp`, {
    email,
    otp,
  });
};