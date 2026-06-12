import React from "react";
import { Link } from "react-router-dom";
import HomeIcon from "../HomeIcon";
import { SIGN_IN_BUBBLE_IMAGES } from "../../constants";
import "./styles.css";

function AuthSheet({ onSignUp, onLogIn }) {
  return (
    <div className="pp-sign-in-sheet">
      <div
        className="pp-sign-in-sheet__photo"
        style={{ backgroundImage: `url(${SIGN_IN_BUBBLE_IMAGES.card2})` }}
        aria-hidden="true"
      />
      <div className="pp-sign-in-sheet__glass">
        <HomeIcon size={56} className="pp-sign-in-sheet__icon" />
        <h1 className="pp-sign-in-sheet__headline">Create a home you love</h1>
        <button type="button" className="pp-sign-in-sheet__cta" onClick={onSignUp}>
          Sign Up
        </button>
        <button type="button" className="pp-sign-in-sheet__link" onClick={onLogIn}>
          Log In
        </button>
        <p className="pp-sign-in-sheet__legal">
          By signing up, you are agreeing to our{" "}
          <Link to="/terms" className="pp-sign-in-sheet__legal-link">
            terms and conditions
          </Link>{" "}
          and acknowledge to our{" "}
          <Link to="/terms" className="pp-sign-in-sheet__legal-link">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default AuthSheet;
