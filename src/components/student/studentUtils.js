/**
 * Utility functions for Student Management module
 */

/**
 * Safely extracts student array from any API response structure.
 */
export const extractStudentList = (response) => {
  if (!response) return [];
  const resData = response.data !== undefined ? response.data : response;
  if (!resData) return [];

  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.students)) return resData.students;
  if (Array.isArray(resData.data?.students)) return resData.data.students;

  // Single student object enclosed
  if (resData.data && typeof resData.data === "object" && (resData.data.roll_no !== undefined || resData.data.id !== undefined)) {
    return [resData.data];
  }
  if (typeof resData === "object" && (resData.roll_no !== undefined || resData.id !== undefined)) {
    return [resData];
  }

  return [];
};

/**
 * Safely extracts a single student object from API response.
 */
export const extractSingleStudent = (response) => {
  const list = extractStudentList(response);
  if (list.length > 0) return list[0];

  const resData = response?.data !== undefined ? response.data : response;
  if (resData && typeof resData === "object" && !Array.isArray(resData)) {
    if (resData.data && typeof resData.data === "object" && !Array.isArray(resData.data)) {
      return resData.data;
    }
    return resData;
  }
  return null;
};

/**
 * Safely extracts error message string from Axios error object.
 */
export const extractErrorMessage = (err, fallbackMessage = "An error occurred") => {
  if (!err) return fallbackMessage;

  // Check err.response.data
  const data = err.response?.data;
  if (data) {
    if (typeof data === "string" && data.trim()) return data;
    if (data.error && typeof data.error.message === "string" && data.error.message.trim()) {
      return data.error.message;
    }
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      const firstErr = data.detail[0];
      if (typeof firstErr === "string") return firstErr;
      if (firstErr.msg) {
        const field = firstErr.loc ? firstErr.loc.slice(-1)[0] : "";
        return field ? `Validation error on ${field}: ${firstErr.msg}` : firstErr.msg;
      }
    }
  }
  if (err.message && typeof err.message === "string") {
    return err.message;
  }
  return fallbackMessage;
};

/**
 * Convert string/number value to integer or 0.
 */
export const parseIntegerOrZero = (val) => {
  if (val === "" || val === null || val === undefined) return 0;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? 0 : parsed;
};
