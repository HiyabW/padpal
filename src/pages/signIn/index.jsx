import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/client";
import { SPLASH_DURATION_MS } from "./constants";
import SplashScreen from "./components/SplashScreen";
import LandingBubbles from "./components/LandingBubbles";
import AuthSheet from "./components/AuthSheet";
import AuthForm from "./components/AuthForm";
import "./styles.css";

function SignIn() {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [phase, setPhase] = useState("splash");
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      navigate("/feed", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setPhase("landing"), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  const openSignUp = () => {
    setIsSignIn(false);
    setError("");
    setPhase("auth");
  };

  const openLogIn = () => {
    setIsSignIn(true);
    setError("");
    setPhase("auth");
  };

  const backToLanding = () => {
    setError("");
    setPhase("landing");
  };

  const toggleAuthMode = () => {
    setIsSignIn((prev) => !prev);
    setError("");
  };

  const handleAuthSubmit = ({ name, email, password, phone, isSignIn: signingIn }) => {
    if (signingIn) {
      signInUser(email, password);
    } else {
      signUpUser({ name, email, password, phone });
    }
  };

  function signInUser(email, password) {
    setIsLoading(true);
    setError("");
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (data?.id) {
          await refreshUser();
          data?.gender
            ? navigate("/feed", { replace: true })
            : navigate("/survey", { replace: true });
        } else {
          setError(data?.error?.message || "Login failed");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setIsLoading(false);
      });
  }

  function signUpUser({ name, email, password, phone }) {
    setIsLoading(true);
    setError("");
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, phone, name }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (data?.id) {
          await refreshUser();
          navigate("/survey", { replace: true });
        } else {
          setError(data?.error?.message || "Sign up failed");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setIsLoading(false);
      });
  }

  if (!loading && user) {
    return null;
  }

  return (
    <div className={`pp-sign-in${isLoading ? " pp-sign-in--loading" : ""}`}>
      <AnimatePresence>
        {phase === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SplashScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== "splash" && (
        <motion.div
          className="pp-sign-in__main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {phase === "landing" && <LandingBubbles />}

          {phase === "landing" ? (
            <AuthSheet onSignUp={openSignUp} onLogIn={openLogIn} />
          ) : (
            <AuthForm
              isSignIn={isSignIn}
              isLoading={isLoading}
              error={error}
              onBack={backToLanding}
              onToggleMode={toggleAuthMode}
              onSubmit={handleAuthSubmit}
            />
          )}
        </motion.div>
      )}
    </div>
  );
}

export default SignIn;
