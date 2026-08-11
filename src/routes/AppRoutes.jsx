import { Routes, Route } from "react-router-dom";

import EmailVerification from "../pages/EmailVerification";
import OTPVerification from "../pages/OTPVerification";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Hostel from "../pages/Hostel";
import StudentManagement from "../pages/StudentManagement";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EmailVerification />} />
      <Route path="/otp" element={<OTPVerification />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/hostel" element={<Hostel />} />
      <Route path="/student-management" element={<StudentManagement />} />
      <Route path="/students" element={<StudentManagement />} />
    </Routes>
  );
}

export default AppRoutes;