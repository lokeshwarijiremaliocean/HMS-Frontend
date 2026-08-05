import "../../styles/StatsCard.css";

function StatsCard({
  icon,
  title,
 value,
  subtitle,
  percentage,
  color,
}) {
  return (
    <div className="stats-card">

      <div className="stats-top">

        <div
          className="stats-icon"
          style={{ background: color }}
        >
          {icon}
        </div>

        <div className="stats-info">
          <h2>{value}</h2>
          <p>{subtitle}</p>
        </div>

      </div>

      <div className="progress">
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            background: color,
          }}
        ></div>
      </div>

      <h3 className="stats-title">
        {title}
      </h3>

    </div>
  );
}

export default StatsCard;