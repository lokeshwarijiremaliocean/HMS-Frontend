function InputField({
  placeholder,
  value,
  onChange,
  type = "text",
}) {
  return (
    <input
      className="input-field"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

export default InputField;