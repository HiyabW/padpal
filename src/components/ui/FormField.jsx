import React, { cloneElement, isValidElement } from "react";
import "./FormField.css";

const FormField = ({
  id,
  label,
  labelSize = "sm",
  subtitle = "",
  error = "",
  helper = "",
  className = "",
  children,
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helper ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id ?? id,
        "aria-invalid": error ? true : children.props["aria-invalid"],
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div className={`pp-form-field${className ? ` ${className}` : ""}`}>
      {label && (
        <label
          className={`pp-form-field__label pp-form-field__label--${labelSize}`}
          htmlFor={id}
        >
          {label}
        </label>
      )}
      {subtitle && <p className="pp-form-field__subtitle">{subtitle}</p>}
      <div className="pp-form-field__control">{control}</div>
      {error && (
        <p id={errorId} className="pp-form-field__error" role="alert">
          {error}
        </p>
      )}
      {helper && (
        <p id={helperId} className="pp-form-field__helper">
          {helper}
        </p>
      )}
    </div>
  );
};

export default FormField;
