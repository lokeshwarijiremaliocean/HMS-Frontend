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
  const [totalRooms, setTotalRooms] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get Students
        const studentResponse = await apiClient.get("/student");

        if (studentResponse.data.success) {
          setTotalStudents(studentResponse.data.data.length);
        }

        // Get Rooms
        const roomResponse = await apiClient.get("/room");

        console.log("ROOM RESPONSE:", roomResponse.data);

        if (roomResponse.data.success) {
          setTotalRooms(roomResponse.data.data.length);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <Sidebar />

      <main className="dashboard-main">

        {/* Navbar */}
        <Navbar />

        {/* Search Bar */}
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

          {/* Total Students */}
          <StatsCard
            icon={<MdPeople />}
            title="TOTAL STUDENTS"
            value={totalStudents}
            subtitle="of 300 Capacity"
            percentage={(totalStudents / 300) * 100}
            color="#2196F3"
          />

          {/* Total Rooms */}
          <StatsCard
            icon={<MdHome />}
            title="TOTAL ROOMS"
            value={totalRooms}
            subtitle="10 Floors"
            percentage={100}
            color="#4CAF50"
          />

          {/* Occupied Rooms */}
          <StatsCard
            icon={<MdMeetingRoom />}
            title="OCCUPIED ROOMS"
            value="83"
            subtitle="83% Occupied"
            percentage={83}
            color="#FFC107"
          />

          {/* Available Rooms */}
          <StatsCard
            icon={<MdHotel />}
            title="AVAILABLE ROOMS"
            value="17"
            subtitle="17% Available"
            percentage={17}
            color="#7E57C2"
          />

          {/* Total Beds */}
          <StatsCard
            icon={<MdBed />}
            title="TOTAL BEDS"
            value="300"
            subtitle="248 Occupied"
            percentage={83}
            color="#00BCD4"
          />

        </section>

        {/* Feature Cards */}
        <section className="feature-grid">

          <FeatureCard
            title="Hostel"
            subtitle="Enter"
            image={hostel}
            cardClass="hostel-card"
          />

          <FeatureCard
            title="Floor"
            subtitle="Enter"
            image={floor}
            cardClass="floor-card"
          />

          <FeatureCard
            title="Room"
            subtitle="Enter"
            image={room}
            cardClass="room-card"
          />

          <FeatureCard
            title="Bed Info"
            subtitle="Enter"
            image={bed}
            cardClass="bed-card"
          />

          <FeatureCard
            title="Student"
            subtitle="Enter"
            image={student}
            cardClass="student-card"
          />

        </section>

      </main>
    </div>
  );
}

export default Dashboard;