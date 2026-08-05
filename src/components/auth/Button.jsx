function Button({ title, onClick }) {
  return (
    <button
      className="continue-btn"
      onClick={onClick}
    >
      {title}
    </button>
  );
}

export default Button;