import { useEffect, useState } from "react";
import apiClient from "../api/axiosInstance";

import {
  MdPeople,
  MdHome,
  MdMeetingRoom,
  MdHotel,
  MdBed,
  MdSearch,
} from "react-icons/md";

import hostel from "../assets/hostel.png";
import floor from "../assets/floor.png";
import room from "../assets/room.png";
import bed from "../assets/bed.png";
import student from "../assets/student.png";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import StatsCard from "../components/dashboard/StatsCard";
import FeatureCard from "../components/dashboard/FeatureCard";

import "../styles/dashboard.css";

function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);

useEffect(() => {
  const fetchStudents = async () => {
    try {
      const response = await apiClient.get("/student");

      if (response.data.success) {
        setTotalStudents(response.data.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  fetchStudents();
}, []);
  return (
    <div className="dashboard-container">

      <Sidebar />

      <main className="dashboard-main">

        <Navbar />

        {/* Search Bar Below Header */}
        <div className="dashboard-search-container">
          <div className="dashboard-search-bar">
            <MdSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search students, rooms, hostels..."
            />
          </div>
        </div>

        {/* Statistics */}
        <section className="stats-grid">

          <StatsCard
            icon={<MdPeople />}
            title="TOTAL STUDENTS"
            value={totalStudents}
            subtitle="of 300 Capacity"
            percentage={80}
            color="#2196F3"
          />

          <StatsCard
            icon={<MdHome />}
            title="TOTAL ROOMS"
            value="100"
            subtitle="10 Floors"
            percentage={100}
            color="#4CAF50"
          />

          <StatsCard
            icon={<MdMeetingRoom />}
            title="OCCUPIED ROOMS"
            value="83"
            subtitle="83% Occupied"
            percentage={83}
            color="#FFC107"
          />

          <StatsCard
            icon={<MdHotel />}
            title="AVAILABLE ROOMS"
            value="17"
            subtitle="17% Available"
            percentage={17}
            color="#7E57C2"
          />

          <StatsCard
            icon={<MdBed />}
            title="TOTAL BEDS"
            value="300"
            subtitle="248 Occupied"
            percentage={83}
            color="#00BCD4"
          />

        </section>

        {/* Features */}
        <section className="feature-grid">

          <FeatureCard title="Hostel" subtitle="Enter" image={hostel} cardClass="hostel-card" />
          <FeatureCard title="Floor" subtitle="Enter" image={floor} cardClass="floor-card" />
          <FeatureCard title="Room" subtitle="Enter" image={room} cardClass="room-card" />

          <FeatureCard title="Bed Info" subtitle="Enter" image={bed} cardClass="bed-card" />
          <FeatureCard title="Student" subtitle="Enter" image={student} cardClass="student-card" />

        </section>

      </main>

    </div>
  );
}

export default Dashboard;