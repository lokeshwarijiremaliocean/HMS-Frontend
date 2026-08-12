import {
  MdBed,
  MdMeetingRoom,
  MdHotel,
  MdApartment,
  MdHome,
} from "react-icons/md";

function BedStats({ stats = {}, onTabChange }) {
  const {
    totalBeds = 0,
    availableBeds = 0,
    occupiedBeds = 0,
    totalRooms = 0,
    totalCapacity = 0,
  } = stats;

  const handleViewAll = () => {
    if (onTabChange) {
      onTabChange("all");
    }
  };

  return (
    <section className="bm-stats-grid">
      {/* 1. Total Beds */}
      <div className="bm-stat-card">
        <div className="bm-stat-icon orange">
          <MdBed />
        </div>
        <div className="bm-stat-info">
          <h2>{totalBeds}</h2>
          <p>Total Beds</p>
          <span className="bm-stat-link" onClick={handleViewAll}>
            View All &rarr;
          </span>
        </div>
      </div>

      {/* 2. Available Beds */}
      <div className="bm-stat-card">
        <div className="bm-stat-icon green">
          <MdMeetingRoom />
        </div>
        <div className="bm-stat-info">
          <h2>{availableBeds}</h2>
          <p>Available Beds</p>
          <span className="bm-stat-link" onClick={handleViewAll}>
            View All &rarr;
          </span>
        </div>
      </div>

      {/* 3. Occupied Beds */}
      <div className="bm-stat-card">
        <div className="bm-stat-icon blue">
          <MdHotel />
        </div>
        <div className="bm-stat-info">
          <h2>{occupiedBeds}</h2>
          <p>Occupied Beds</p>
          <span className="bm-stat-link" onClick={handleViewAll}>
            View All &rarr;
          </span>
        </div>
      </div>

      {/* 4. Total Rooms */}
      <div className="bm-stat-card">
        <div className="bm-stat-icon purple">
          <MdApartment />
        </div>
        <div className="bm-stat-info">
          <h2>{totalRooms}</h2>
          <p>Total Rooms</p>
          <span className="bm-stat-link" onClick={handleViewAll}>
            View All &rarr;
          </span>
        </div>
      </div>

      {/* 5. Total Capacity */}
      <div className="bm-stat-card">
        <div className="bm-stat-icon yellow">
          <MdHome />
        </div>
        <div className="bm-stat-info">
          <h2>{totalCapacity}</h2>
          <p>Total Capacity</p>
          <span className="bm-stat-link" onClick={handleViewAll}>
            View All &rarr;
          </span>
        </div>
      </div>
    </section>
  );
}

export default BedStats;
