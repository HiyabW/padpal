import React from "react";
import "./TextInput.css";

const TextInput = ({
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = false,
  disabled = false,
  fullWidth = true,
  endAdornment = null,
  className = "",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...rest
}) => {
  const inputClassNames = [
    "pp-input",
    error && "pp-input--error",
    fullWidth && "pp-input--full-width",
    endAdornment && "pp-input--with-adornment",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const input = (
    <input
      id={id}
      type={type}
      className={inputClassNames}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={ariaInvalid ?? (error ? true : undefined)}
      aria-describedby={ariaDescribedBy}
      {...rest}
    />
  );

  if (!endAdornment) {
    return input;
  }

  return (
    <div className={`pp-input-wrapper${fullWidth ? " pp-input-wrapper--full-width" : ""}`}>
      {input}
      <div className="pp-input-wrapper__adornment">{endAdornment}</div>
    </div>
  );
};

export default TextInput;
