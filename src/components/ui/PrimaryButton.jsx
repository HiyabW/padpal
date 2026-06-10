import React from "react";
import "./PrimaryButton.css";

const PrimaryButton = ({
  children,
  variant = "primary",
  type = "button",
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = "",
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const classNames = [
    "pp-btn",
    `pp-btn--${variant}`,
    fullWidth && "pp-btn--full-width",
    loading && "pp-btn--loading",
    isDisabled && "pp-btn--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classNames}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="pp-btn__spinner" aria-hidden="true" />}
      <span className="pp-btn__label">{children}</span>
    </button>
  );
};

export default PrimaryButton;
