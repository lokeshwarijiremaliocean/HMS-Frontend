import {
  MdPeople,
  MdHome,
  MdMeetingRoom,
  MdHotel,
  MdBed,
} from "react-icons/md";

import hostel from "../assets/hostel.png";
import building from "../assets/building.png";
import floor from "../assets/floor.png";
import room from "../assets/room.png";

import bed from "../assets/bed.png";
import student from "../assets/student.png";
import bill from "../assets/bill.png";
import unassigned from "../assets/unassigned.png";

import mess from "../assets/mess.png";
import routine from "../assets/routine.png";
import menu from "../assets/menu.png";
import details from "../assets/details.png";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import StatsCard from "../components/dashboard/StatsCard";
import FeatureCard from "../components/dashboard/FeatureCard";

import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">

      <Sidebar />

      <main className="dashboard-main">

        <Navbar />

        {/* Statistics */}
        <section className="stats-grid">

          <StatsCard
            icon={<MdPeople />}
            title="TOTAL STUDENTS"
            value="238"
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
          <FeatureCard title="Building" subtitle="Enter" image={building} cardClass="hostel-card" />
          <FeatureCard title="Floor" subtitle="Enter" image={floor} cardClass="hostel-card" />
          <FeatureCard title="Room" subtitle="Enter" image={room} cardClass="hostel-card" />

          <FeatureCard title="Bed Info" subtitle="Enter" image={bed} cardClass="bed-card" />
          <FeatureCard title="Student" subtitle="Enter" image={student} cardClass="bed-card" />
          <FeatureCard title="Electricity Bill" subtitle="Enter" image={bill} cardClass="bed-card" />
          <FeatureCard title="Room Unassigned" subtitle="Enter" image={unassigned} cardClass="bed-card" />

          <FeatureCard title="Mess Head" subtitle="Enter" image={mess} cardClass="mess-card" />
          <FeatureCard title="Mess Routine" subtitle="Enter" image={routine} cardClass="mess-card" />
          <FeatureCard title="Mess Menu" subtitle="Enter" image={menu} cardClass="mess-card" />
          <FeatureCard title="Other Details" subtitle="Enter" image={details} cardClass="mess-card" />

        </section>

      </main>

    </div>
  );
}

export default Dashboard;