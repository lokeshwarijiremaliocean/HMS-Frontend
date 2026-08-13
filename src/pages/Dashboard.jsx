import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { commonSearch } from "../api/commonApi";
import {
  MdPeople,
  MdHome,
  MdMeetingRoom,
  MdHotel,
  MdBed,
  MdSearch,
  MdApartment,
  MdPersonPin,
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
    subtitle: "Student Management",
    category: "Student",
    icon: <MdPeople />,
    route: "/student-management",
    keywords: ["student", "students", "view student", "add student", "stu", "st", "s"],
  },
  {
    id: "rooms",
    title: "Rooms",
    subtitle: "Room Management",
    category: "Room",
    icon: <MdMeetingRoom />,
    route: "/room",
    keywords: ["room", "rooms", "view rooms", "roo", "ro", "r"],
  },
  {
    id: "hostel",
    title: "Hostel",
    subtitle: "Hostel Management",
    category: "Hostel",
    icon: <MdHotel />,
    route: "/hostel",
    keywords: ["hostel", "hostels", "host", "hos", "ho", "h"],
  },
  {
    id: "floor",
    title: "Floor",
    subtitle: "Floor Management",
    category: "Floor",
    icon: <MdApartment />,
    route: "/room",
    keywords: ["floor", "floors", "flo", "fl", "f", "floor search"],
  },
  {
    id: "bed",
    title: "Bed Info",
    subtitle: "Bed Management",
    category: "Bed",
    icon: <MdBed />,
    route: "/bed",
    keywords: ["bed", "beds", "bed info", "allocate bed", "bea", "be", "b"],
  },
  {
    id: "admin",
    title: "Admin",
    subtitle: "Admin Profile",
    category: "Admin",
    icon: <MdPersonPin />,
    route: "/profile",
    keywords: ["admin", "admins", "administrator", "adm", "ad", "a", "profile"],
  },
];

const matchesSearch = (value, q) => {
  if (!value) return false;
  const str = String(value).toLowerCase();
  return str.includes(q);
};

const getCategoryIcon = (type) => {
  const t = String(type || "").toLowerCase();
  if (t.includes("student")) return <MdPeople />;
  if (t.includes("hostel")) return <MdHotel />;
  if (t.includes("floor")) return <MdApartment />;
  if (t.includes("room")) return <MdMeetingRoom />;
  if (t.includes("bed")) return <MdBed />;
  if (t.includes("admin")) return <MdPersonPin />;
  return <MdSearch />;
};

const getCategoryRoute = (type) => {
  const t = String(type || "").toLowerCase();
  if (t.includes("student")) return "/student-management";
  if (t.includes("hostel")) return "/hostel";
  if (t.includes("floor")) return "/room";
  if (t.includes("room")) return "/room";
  if (t.includes("bed")) return "/bed";
  if (t.includes("admin")) return "/profile";
  return null;
};

const formatItem = (item, entityType) => {
  const type = (
    item.type ||
    item.entity_type ||
    item.category ||
    item.kind ||
    entityType ||
    ""
  ).toLowerCase();

  let inferredType = type;
  if (!inferredType) {
    if (item.roll_no || item.student_id || item.degree) inferredType = "student";
    else if (item.bed_no || item.bed_id) inferredType = "bed";
    else if (item.room_no || item.room_id) inferredType = "room";
    else if (item.floor_name || item.floor_no) inferredType = "floor";
    else if (item.code || (item.hostel_name && !item.room_no)) inferredType = "hostel";
    else if (item.role || item.username || item.is_admin) inferredType = "admin";
    else inferredType = "item";
  }

  let title = "";
  let subtitleParts = [];

  if (inferredType.includes("student")) {
    title =
      item.name ||
      [item.first_name, item.last_name].filter(Boolean).join(" ") ||
      (item.roll_no ? `Student (${item.roll_no})` : "Student");
    if (item.roll_no) subtitleParts.push(`Roll: ${item.roll_no}`);
    if (item.degree) subtitleParts.push(item.degree);
    if (item.email) subtitleParts.push(item.email);
    if (item.phone) subtitleParts.push(item.phone);
  } else if (inferredType.includes("hostel")) {
    title = item.name || item.hostel_name || (item.code ? `Hostel ${item.code}` : "Hostel");
    if (item.code) subtitleParts.push(`Code: ${item.code}`);
    if (item.location || item.address) subtitleParts.push(item.location || item.address);
    if (item.total_rooms) subtitleParts.push(`${item.total_rooms} Rooms`);
  } else if (inferredType.includes("floor")) {
    title =
      item.floor_name ||
      (item.floor_no !== undefined && item.floor_no !== null ? `Floor ${item.floor_no}` : item.name || "Floor");
    if (item.hostel_name || item.hostel_code) subtitleParts.push(item.hostel_name || item.hostel_code);
    if (item.total_rooms) subtitleParts.push(`${item.total_rooms} Rooms`);
  } else if (inferredType.includes("room")) {
    title = item.room_no ? `Room ${item.room_no}` : item.name || "Room";
    if (item.hostel_name) subtitleParts.push(item.hostel_name);
    if (item.floor_name || (item.floor_no !== undefined && item.floor_no !== null)) {
      subtitleParts.push(item.floor_name || `Floor ${item.floor_no}`);
    }
    if (item.room_type || item.type) subtitleParts.push(item.room_type || item.type);
    if (item.capacity) subtitleParts.push(`Cap: ${item.capacity}`);
  } else if (inferredType.includes("bed")) {
    title = item.bed_no ? `Bed ${item.bed_no}` : item.name || "Bed";
    if (item.room_no) subtitleParts.push(`Room ${item.room_no}`);
    if (item.hostel_name) subtitleParts.push(item.hostel_name);
    if (item.status) subtitleParts.push(item.status);
  } else if (inferredType.includes("admin")) {
    title =
      item.name ||
      [item.first_name, item.last_name].filter(Boolean).join(" ") ||
      item.username ||
      item.email ||
      "Admin";
    if (item.email) subtitleParts.push(item.email);
    if (item.role) subtitleParts.push(item.role);
    if (item.username) subtitleParts.push(`@${item.username}`);
  } else {
    title = item.title || item.name || item.label || item.query || "Result";
    if (item.subtitle || item.description) subtitleParts.push(item.subtitle || item.description);
  }

  const categoryLabel = inferredType.charAt(0).toUpperCase() + inferredType.slice(1);
  const route = getCategoryRoute(inferredType);

  return {
    id: item.id || item._id || `${inferredType}-${title}-${Math.random()}`,
    title,
    subtitle: subtitleParts.length > 0 ? subtitleParts.join(" • ") : categoryLabel,
    icon: getCategoryIcon(inferredType),
    route,
    category: categoryLabel,
    raw: item,
  };
};

const normalizeSearchResults = (responsePayload) => {
  let root = responsePayload;
  if (root && typeof root === "object" && "data" in root && root.data !== null) {
    root = root.data;
  }
  if (root && typeof root === "object" && "results" in root && root.results !== null) {
    root = root.results;
  }

  if (!root) return [];

  const results = [];

  if (Array.isArray(root)) {
    root.forEach((item) => {
      if (item && typeof item === "object") {
        results.push(formatItem(item));
      }
    });
  } else if (typeof root === "object") {
    Object.keys(root).forEach((key) => {
      const value = root[key];
      let entityType = key;
      if (entityType.endsWith("s") && entityType.length > 1) {
        entityType = entityType.slice(0, -1);
      }
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item && typeof item === "object") {
            results.push(formatItem(item, entityType));
          }
        });
      } else if (value && typeof value === "object") {
        results.push(formatItem(value, entityType));
      }
    });
  }

  return results;
};

function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef(null);
  const navigate = useNavigate();
  const allEntitiesRef = useRef({
    students: [],
    hostels: [],
    rooms: [],
    beds: [],
    admin: null,
  });

  // Fetch dashboard data & preload entities for local search
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
          allEntitiesRef.current.students = studentResponse.data.data;
        } else if (Array.isArray(studentResponse.data)) {
          setTotalStudents(studentResponse.data.length);
          allEntitiesRef.current.students = studentResponse.data;
        }
      } catch (error) {
        console.warn(
          "Could not fetch dashboard students list:",
          error.response?.data?.detail || error.message
        );
      }

      // Preload hostels
      try {
        const hostelRes = await apiClient.get("/hostel");
        const list = hostelRes.data?.data || hostelRes.data;
        if (Array.isArray(list)) allEntitiesRef.current.hostels = list;
      } catch {
        try {
          const hostelRes = await apiClient.get("/hostels");
          const list = hostelRes.data?.data || hostelRes.data;
          if (Array.isArray(list)) allEntitiesRef.current.hostels = list;
        } catch {}
      }

      // Preload rooms
      try {
        const roomRes = await apiClient.get("/room");
        const list = roomRes.data?.data || roomRes.data;
        if (Array.isArray(list)) allEntitiesRef.current.rooms = list;
      } catch {
        try {
          const roomRes = await apiClient.get("/rooms");
          const list = roomRes.data?.data || roomRes.data;
          if (Array.isArray(list)) allEntitiesRef.current.rooms = list;
        } catch {}
      }

      // Preload beds
      try {
        const bedRes = await apiClient.get("/bed");
        const list = bedRes.data?.data || bedRes.data;
        if (Array.isArray(list)) allEntitiesRef.current.beds = list;
      } catch {
        try {
          const bedRes = await apiClient.get("/beds");
          const list = bedRes.data?.data || bedRes.data;
          if (Array.isArray(list)) allEntitiesRef.current.beds = list;
        } catch {}
      }
    };

    fetchDashboardData();
  }, []);

  // Debounced API search effect
  useEffect(() => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const combinedResults = [];
        const seenKeys = new Set();

        const addResult = (res) => {
          const key = `${res.category || res.title}-${res.title}-${res.subtitle}`.toLowerCase();
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            combinedResults.push(res);
          }
        };

        // 1. Filter category navigation items
        SEARCH_CATEGORIES.forEach((cat) => {
          const titleMatch = matchesSearch(cat.title, trimmed);
          const subtitleMatch = matchesSearch(cat.subtitle, trimmed);
          const keywordMatch = cat.keywords.some((kw) => matchesSearch(kw, trimmed));

          if (titleMatch || subtitleMatch || keywordMatch) {
            addResult(cat);
          }
        });

        // 2. Call backend common search API
        try {
          const response = await commonSearch(trimmed);
          const apiNormalized = normalizeSearchResults(response.data);
          apiNormalized.forEach((res) => {
            const titleMatch = matchesSearch(res.title, trimmed);
            const subtitleMatch = matchesSearch(res.subtitle, trimmed);
            const categoryMatch = matchesSearch(res.category, trimmed);
            if (titleMatch || subtitleMatch || categoryMatch || trimmed.length <= 2) {
              addResult(res);
            }
          });
        } catch (err) {
          console.warn("Backend common search API call warning:", err.message);
        }

        // 3. Search pre-fetched local database records
        if (allEntitiesRef.current) {
          const { students, hostels, rooms, beds, admin } = allEntitiesRef.current;

          // Search Students
          (students || []).forEach((st) => {
            const fullName = [st.first_name, st.last_name].filter(Boolean).join(" ");
            const nameMatch =
              matchesSearch(fullName, trimmed) ||
              matchesSearch(st.first_name, trimmed) ||
              matchesSearch(st.last_name, trimmed) ||
              matchesSearch(st.name, trimmed);
            const rollMatch = matchesSearch(st.roll_no, trimmed);
            const degreeMatch = matchesSearch(st.degree, trimmed);
            const emailMatch = matchesSearch(st.email, trimmed);
            const phoneMatch = matchesSearch(st.phone, trimmed);

            if (nameMatch || rollMatch || degreeMatch || emailMatch || phoneMatch) {
              addResult(formatItem(st, "student"));
            }
          });

          // Search Hostels
          (hostels || []).forEach((h) => {
            const nameMatch = matchesSearch(h.name, trimmed) || matchesSearch(h.hostel_name, trimmed);
            const codeMatch = matchesSearch(h.code, trimmed);
            const locMatch = matchesSearch(h.location, trimmed) || matchesSearch(h.address, trimmed);

            if (nameMatch || codeMatch || locMatch) {
              addResult(formatItem(h, "hostel"));
            }
          });

          // Search Rooms
          (rooms || []).forEach((r) => {
            const roomNoMatch = matchesSearch(r.room_no, trimmed) || matchesSearch(r.name, trimmed);
            const hostelMatch = matchesSearch(r.hostel_name, trimmed);
            const floorMatch = matchesSearch(r.floor_name, trimmed) || matchesSearch(r.floor_no, trimmed);

            if (roomNoMatch || hostelMatch || floorMatch) {
              addResult(formatItem(r, "room"));
            }
          });

          // Search Beds
          (beds || []).forEach((b) => {
            const bedNoMatch = matchesSearch(b.bed_no, trimmed) || matchesSearch(b.name, trimmed);
            const roomMatch = matchesSearch(b.room_no, trimmed);
            const hostelMatch = matchesSearch(b.hostel_name, trimmed);

            if (bedNoMatch || roomMatch || hostelMatch) {
              addResult(formatItem(b, "bed"));
            }
          });

          // Search Admin
          if (admin) {
            const adminName =
              [admin.first_name, admin.last_name].filter(Boolean).join(" ") ||
              admin.name ||
              admin.username ||
              "Admin";
            const nameMatch = matchesSearch(adminName, trimmed) || matchesSearch(admin.username, trimmed);
            const emailMatch = matchesSearch(admin.email, trimmed);
            const roleMatch = matchesSearch(admin.role, trimmed);

            if (nameMatch || emailMatch || roleMatch) {
              addResult(formatItem(admin, "admin"));
            }
          }
        }

        setSearchResults(combinedResults);
      } catch (error) {
        console.error("Search execution error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const handleSelectResult = (result) => {
    setIsSearchOpen(false);
    setSearchTerm("");

    const targetRoute =
      result.route ||
      getCategoryRoute(result.category || result.title || result.type);

    if (targetRoute) {
      navigate(targetRoute);
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
                    Not found
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
            percentage={Math.round((totalStudents / 300) * 100)}
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

          {/* Occupied Beds */}
          <StatsCard
            icon={<MdMeetingRoom />}
            title="OCCUPIED BEDS"
            value={totalStudents}
            subtitle={`${Math.round((totalStudents / 300) * 100)}% Occupied`}
            percentage={Math.round((totalStudents / 300) * 100)}
            color="#FFC107"
          />

          {/* Available Beds */}
          <StatsCard
            icon={<MdHotel />}
            title="AVAILABLE BEDS"
            value={Math.max(0, 300 - totalStudents)}
            subtitle={`${Math.round((Math.max(0, 300 - totalStudents) / 300) * 100)}% Available`}
            percentage={Math.round((Math.max(0, 300 - totalStudents) / 300) * 100)}
            color="#9C27B0"
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
