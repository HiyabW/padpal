import React from "react";
import "./ActionBar.css";

const ActionBar = ({
  onReject,
  onMatch,
  onShare,
  onReport,
  disabled = false,
  className = "",
}) => {
  const classNames = ["pp-action-bar", disabled && "pp-action-bar--disabled", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <div className="pp-action-bar__row">
        <button
          type="button"
          className="pp-action-bar__btn pp-action-bar__btn--reject"
          onClick={onReject}
          aria-label="Reject"
        >
          👎 Reject
        </button>
        <button
          type="button"
          className="pp-action-bar__btn pp-action-bar__btn--match"
          onClick={onMatch}
          aria-label="Match"
        >
          🤝 Match
        </button>
      </div>
      <button
        type="button"
        className="pp-action-bar__btn pp-action-bar__btn--share"
        onClick={onShare}
        aria-label="Share user with a friend"
      >
        Share user with a friend
      </button>
      <button
        type="button"
        className="pp-action-bar__btn pp-action-bar__btn--report"
        onClick={onReport}
        aria-label="Report user"
      >
        Report User
      </button>
    </div>
  );
};

export default ActionBar;
