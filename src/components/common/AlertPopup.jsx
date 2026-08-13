import { MdErrorOutline } from "react-icons/md";
import "../../styles/successPopup.css";

function AlertPopup({ isOpen, title = "Alert", message, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onConfirm}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <div className="alert-icon-container">
          <MdErrorOutline className="alert-icon" />
        </div>
        <h2 className="popup-title">{title}</h2>
        <p className="popup-message">{message}</p>
        <button className="popup-ok-btn alert-btn" onClick={onConfirm}>
          OK
        </button>
      </div>
    </div>
  );
}

export default AlertPopup;
