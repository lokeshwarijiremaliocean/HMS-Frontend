import "../../styles/progressbar.css";

function ProgressBar({ percentage, color }) {
  return (
    <div className="progress">
      <div
        className="progress-fill"
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      ></div>
    </div>
  );
}

export default ProgressBar;