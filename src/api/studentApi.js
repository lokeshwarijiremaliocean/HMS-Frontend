import apiClient from "./axiosInstance";

// ─── GET ALL STUDENTS ───
export const getAllStudents = async () => {
  return apiClient.get("/student");
};

// ─── ADD STUDENT ───
export const addStudent = async (studentData) => {
  return apiClient.post("/student", studentData);
};

// ─── SEARCH BY ROLL NO ───
export const getStudentByRollNo = async (rollNo) => {
  return apiClient.get("/student/roll_no", {
    params: { roll_no: rollNo },
  });
};

// ─── SEARCH BY DEGREE ───
export const getStudentByDegree = async (degree) => {
  return apiClient.get("/student/degree", {
    params: { degree },
  });
};

// ─── SEARCH BY NAME ───
export const getStudentByName = async (firstName, lastName) => {
  return apiClient.get("/student/name", {
    params: { first_name: firstName, last_name: lastName },
  });
};

// ─── SEARCH BY PHONE ───
export const getStudentByPhone = async (phone) => {
  return apiClient.get("/student/phone", {
    params: { phone },
  });
};

// ─── UPDATE STUDENT BY ID ───
export const updateStudent = async (id, updateData) => {
  return apiClient.put(`/student/${id}`, updateData);
};

// ─── DELETE STUDENT BY ID ───
export const deleteStudent = async (id) => {
  return apiClient.delete(`/student/${id}`);
};
