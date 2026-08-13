import { MdPeople, MdSchool, MdHotel, MdBed, MdHome } from "react-icons/md";
import StatsCard from "../dashboard/StatsCard";

function StudentStats({ stats }) {
  const {
    totalStudents = 0,
    allocatedStudents = 0,
    availableBeds = 0,
    occupiedBeds = 0,
    totalCapacity = 0,
  } = stats || {};

  const getPercentage = (value, denominator) => {
    if (!denominator || denominator <= 0) return 0;
    return Math.min(100, Math.round((value / denominator) * 100));
  };

  return (
    <section className="stats-grid sm-stats-grid">
      <StatsCard
        icon={<MdPeople />}
        title="Total Students"
        value={totalStudents}
        subtitle="View All →"
        percentage={getPercentage(totalStudents, totalCapacity || totalStudents)}
        color="#E74C3C"
      />
      <StatsCard
        icon={<MdSchool />}
        title="Allocated Students"
        value={allocatedStudents}
        subtitle="View All →"
        percentage={getPercentage(allocatedStudents, totalCapacity || totalStudents)}
        color="#2ECC71"
      />
      <StatsCard
        icon={<MdHotel />}
        title="Available Beds"
        value={availableBeds}
        subtitle="View All →"
        percentage={getPercentage(availableBeds, totalCapacity)}
        color="#3498DB"
      />
      <StatsCard
        icon={<MdBed />}
        title="Occupied Beds"
        value={occupiedBeds}
        subtitle="View All →"
        percentage={getPercentage(occupiedBeds, totalCapacity)}
        color="#9B59B6"
      />
      <StatsCard
        icon={<MdHome />}
        title="Total Capacity"
        value={totalCapacity}
        subtitle="View All →"
        percentage={totalCapacity > 0 ? 100 : 0}
        color="#F39C12"
      />
    </section>
  );
}

export default StudentStats;
