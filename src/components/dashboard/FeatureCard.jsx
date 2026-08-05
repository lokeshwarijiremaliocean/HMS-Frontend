import { useNavigate } from "react-router-dom";
import "../../styles/FeatureCard.css";

function FeatureCard({
  title,
  subtitle,
  image,
  cardClass = "",
}) {
  const navigate = useNavigate();

  const routes = {
    Hostel: "/hostel",
    Building: "/building",
    Floor: "/floor",
    Room: "/room",
    "Bed Info": "/bed",
    Student: "/student",
    "Electricity Bill": "/bill",
    "Room Unassigned": "/unassigned",
    "Mess Head": "/mess-head",
    "Mess Routine": "/mess-routine",
    "Mess Menu": "/mess-menu",
    "Other Details": "/details",
  };

  return (
    <div
      className={`feature-card ${cardClass}`}
      onClick={() => navigate(routes[title])}
    >
      <div className="feature-top">

        <div className="feature-text">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        <img
          src={image}
          alt={title}
          className="feature-image"
        />

      </div>

      <button className="feature-btn">
        More Info

        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M13 6L19 12L13 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

      </button>

    </div>
  );
}

export default FeatureCard;