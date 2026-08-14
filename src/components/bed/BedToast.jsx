import { useEffect } from "react";
import { MdCheckCircle, MdError, MdInfo, MdClose } from "react-icons/md";

function BedToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast || !toast.message) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <MdCheckCircle className="bm-toast-icon" />;
      case "error":
        return <MdError className="bm-toast-icon" />;
      default:
        return <MdInfo className="bm-toast-icon" />;
    }
  };

  return (
    <div className="bm-toast-container">
      <div className={`bm-toast ${toast.type || "info"}`}>
        {getIcon()}
        <span className="bm-toast-msg">{toast.message}</span>
        <MdClose className="bm-toast-close" onClick={onClose} />
      </div>
    </div>
  );
}

export default BedToast;
