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

export const registerAdmin = async (adminData) => {
  return apiClient.post("/admin", adminData);
};

export default apiClient;