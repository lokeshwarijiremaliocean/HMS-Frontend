import logo from "../../assets/campusnest-logo.png";
import "../../styles/auth.css";

function LeftPanel() {
  return (
    <div className="left-panel">
      <img src={logo} className="logo" alt="CampusNest" />
    </div>
  );
}

export default LeftPanel;