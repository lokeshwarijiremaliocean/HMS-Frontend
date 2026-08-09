import apiClient from "../api/axiosInstance";

export const verifyOTP = (email, otp) => {
  return apiClient.post("/verify-otp", {
    email,
    otp,
  });
};

export default apiClient;