import React, { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import GlassBubble from "./GlassBubble";
import { preloadImages } from "./preloadImage";
import "./MatchOverlay.css";

const MatchOverlay = ({
  open,
  currentUser,
  matchedUser,
  onChat,
  onClose,
}) => {
  const reduceMotion = useReducedMotion();
  const [imagesReady, setImagesReady] = useState(false);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return undefined;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (!open) {
      setImagesReady(false);
      return undefined;
    }

    let cancelled = false;
    setImagesReady(false);

    preloadImages([currentUser?.image, matchedUser?.image]).then(() => {
      if (!cancelled) setImagesReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [open, currentUser?.image, matchedUser?.image]);

  if (!open) return null;

  const motionClass = reduceMotion
    ? "pp-match-overlay--reduced-motion"
    : "pp-match-overlay--animated";

  return (
    <div
      className={`pp-match-overlay ${motionClass}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pp-match-overlay-title"
      aria-describedby="pp-match-overlay-desc"
    >

      <div className="pp-match-overlay__glow" aria-hidden="true" />

      <div
        className={`pp-match-overlay__bubbles${imagesReady ? " pp-match-overlay__bubbles--ready" : ""}`}
      >
        {imagesReady ? (
          <>
            <div className="pp-match-overlay__bubble-slot pp-match-overlay__bubble-slot--left">
              <GlassBubble imageSrc={currentUser.image} floatVariant={0} />
            </div>
            <div className="pp-match-overlay__bubble-slot pp-match-overlay__bubble-slot--right">
              <GlassBubble imageSrc={matchedUser.image} floatVariant={1} />
            </div>
          </>
        ) : (
          <div className="pp-match-overlay__bubbles-placeholder" aria-hidden="true" />
        )}
      </div>

      <h1 id="pp-match-overlay-title" className="pp-match-overlay__headline">
        It&apos;s a match!
      </h1>

      <p id="pp-match-overlay-desc" className="pp-match-overlay__subtext">
        You and {matchedUser.name} liked each other.
      </p>

      <button
        type="button"
        className="pp-match-overlay__cta"
        onClick={onChat}
        autoFocus
      >
        Send a message
      </button>

      <button
        type="button"
        className="pp-match-overlay__dismiss"
        onClick={onClose}
      >
        Keep swiping
      </button>
    </div>
  );
};

export default MatchOverlay;
