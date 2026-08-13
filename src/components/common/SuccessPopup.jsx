import { MdCheckCircle } from "react-icons/md";
import "../../styles/successPopup.css";

function SuccessPopup({ isOpen, title, message, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onConfirm}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <div className="popup-icon-container">
          <MdCheckCircle className="popup-check-icon" />
        </div>
        <h2 className="popup-title">{title}</h2>
        <p className="popup-message">{message}</p>
        <button className="popup-ok-btn" onClick={onConfirm}>
          OK
        </button>
      </div>
    </div>
  );
}

export default SuccessPopup;
