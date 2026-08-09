import apiClient from "./axiosInstance";

export const sendOTP = async (email) => {
  return apiClient.post("/send-otp", {
    email,
  });
};

export const verifyOTP = async (email, otp) => {
  return apiClient.post("/verify-otp", {
    email,
    otp,
  });
};

export default apiClient;