import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosInstance";

import {
  MdPeople,
  MdHome,
  MdMeetingRoom,
  MdHotel,
  MdBed,
  MdSearch,
  MdApartment,
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

const SEARCH_CATEGORIES = [
  {
    id: "students",
    title: "Students",
    subtitle: "View Student",
    icon: <MdPeople />,
    route: null,
    keywords: [
      "student",
      "students",
      "view student",
      "add student",
      "stu",
    ],
  },
  {
    id: "rooms",
    title: "Rooms",
    subtitle: "View Rooms",
    icon: <MdMeetingRoom />,
    route: null,
    keywords: ["room", "rooms", "view rooms", "roo"],
  },
  {
    id: "hostel",
    title: "Hostel",
    subtitle: "Hostel Management",
    icon: <MdHotel />,
    route: "/hostel",
    keywords: ["hostel", "hostels", "host"],
  },
  {
    id: "floor",
    title: "Floor",
    subtitle: "Floor Search",
    icon: <MdApartment />,
    route: null,
    keywords: ["floor", "floors", "flo", "floor search"],
  },
  {
    id: "bed",
    title: "Bed Info",
    subtitle: "Allocate Bed",
    icon: <MdBed />,
    route: null,
    keywords: ["bed", "beds", "bed info", "allocate bed", "bea"],
  },
];

function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const studentResponse = await apiClient.get("/student");

        if (
          studentResponse.data &&
          studentResponse.data.success &&
          Array.isArray(studentResponse.data.data)
        ) {
          setTotalStudents(studentResponse.data.data.length);
        }
      } catch (error) {
        console.warn(
          "Could not fetch dashboard students list:",
          error.response?.data?.detail || error.message
        );
      }
    };

    fetchDashboardData();
  }, []);

  // Handle click outside and Escape key for search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const query = searchTerm.trim().toLowerCase();

  const searchResults =
    query === ""
      ? []
      : SEARCH_CATEGORIES.filter((item) => {
          const titleMatch = item.title.toLowerCase().includes(query);
          const subtitleMatch = item.subtitle.toLowerCase().includes(query);
          const keywordMatch = item.keywords.some((kw) =>
            kw.toLowerCase().includes(query)
          );
          return titleMatch || subtitleMatch || keywordMatch;
        });

  const handleSelectResult = (result) => {
    setIsSearchOpen(false);
    setSearchTerm("");

    if (result.route) {
      navigate(result.route);
    } else {
      alert(`${result.title} page coming soon!`);
    }
  };

  return (
    <div
      className={`dashboard-container ${sidebarOpen ? "" : "sidebar-collapsed"
        }`}
    >
      {/* Sidebar */}
      <Sidebar
        activePage="dashboard"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />

      <main className="dashboard-main">
        {/* Navbar */}
        <Navbar
          onToggleSidebar={() =>
            setSidebarOpen((prev) => !prev)
          }
        />

        {/* Search Bar */}
        <div className="dashboard-search-container">
          <div
            className="dashboard-search-wrapper"
            ref={searchRef}
          >
            <div className="dashboard-search-bar">
              <MdSearch className="search-icon" />

              <input
                type="text"
                placeholder="Search student, rooms, hostels..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
              />
            </div>

            {/* Search Dropdown */}
            {searchTerm.trim() !== "" && isSearchOpen && (
              <div className="search-results-dropdown">
                <div className="search-results-header">
                  Search results
                </div>

                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="search-result-item"
                      onClick={() =>
                        handleSelectResult(result)
                      }
                    >
                      <div className="search-result-icon">
                        {result.icon}
                      </div>

                      <div className="search-result-info">
                        <span className="search-result-title">
                          {result.title}
                        </span>

                        <span className="search-result-subtitle">
                          {result.subtitle}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results-found">
                    No results found
                  </div>
                )}
              </div>
            )}
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
            value="100"
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
