import React from "react";
import { motion, useTransform } from "framer-motion";
import "./SwipeCard.css";

const SwipeCard = ({ gesture, isStacked = false, className = "", children }) => {
  const isFront = !isStacked;
  const { x, threshold } = gesture;
  const passOpacity = useTransform(x, (v) => {
    if (v >= -10) return 0;
    return Math.min(Math.abs(v) / threshold, 1);
  });
  const matchOpacity = useTransform(x, (v) => {
    if (v <= 10) return 0;
    return Math.min(v / threshold, 1);
  });

  const classNames = [
    "pp-swipe-card",
    isFront ? "pp-swipe-card--front" : "pp-swipe-card--stacked",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      className={classNames}
      animate={{ scale: isFront ? 1 : 0.95 }}
      transition={{ duration: 0.125 }}
      {...gesture.dragProps}
    >
      <motion.span
        className="pp-swipe-stamp pp-swipe-stamp--pass"
        style={{ opacity: passOpacity }}
        aria-hidden="true"
      >
        Pass
      </motion.span>
      <motion.span
        className="pp-swipe-stamp pp-swipe-stamp--match"
        style={{ opacity: matchOpacity }}
        aria-hidden="true"
      >
        Match
      </motion.span>
      <div className="pp-swipe-card__content">{children}</div>
    </motion.div>
  );
};

export default SwipeCard;
