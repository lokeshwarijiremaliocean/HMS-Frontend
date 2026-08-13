import apiClient from "./axiosInstance";

export const sendOTP = async (email) => {
  try {
    return await apiClient.post("/send-otp", { email });
  } catch (err) {
    if (err.response?.status === 422 || err.response?.status === 404 || err.response?.status === 405) {
      try {
        return await apiClient.post(`/send-otp?email=${encodeURIComponent(email)}`);
      } catch (err2) {
        try {
          return await apiClient.get(`/send-otp?email=${encodeURIComponent(email)}`);
        } catch (err3) {
          throw err;
        }
      }
    }
    throw err;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    return await apiClient.post("/verify-otp", { email, otp });
  } catch (err) {
    if (err.response?.status === 422 || err.response?.status === 404 || err.response?.status === 405) {
      try {
        return await apiClient.post(`/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
      } catch (err2) {
        throw err;
      }
    }
    throw err;
  }
};

export default apiClient;