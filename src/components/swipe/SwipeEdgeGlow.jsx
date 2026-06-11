import React from "react";
import { createPortal } from "react-dom";
import { motion, useTransform } from "framer-motion";
import "./SwipeEdgeGlow.css";

const EDGE_OPACITY_MAX = 0.32;

const SwipeEdgeGlow = ({ gesture, active = false }) => {
  const { x, threshold } = gesture;

  const passOpacity = useTransform(x, (v) => {
    if (v >= -10) return 0;
    return Math.min(Math.abs(v) / threshold, 1) * EDGE_OPACITY_MAX;
  });

  const matchOpacity = useTransform(x, (v) => {
    if (v <= 10) return 0;
    return Math.min(v / threshold, 1) * EDGE_OPACITY_MAX;
  });

  if (!active || typeof document === "undefined") return null;

  return createPortal(
    <div className="pp-swipe-edge-glow" aria-hidden="true">
      <motion.div
        className="pp-swipe-edge-glow__panel pp-swipe-edge-glow__panel--pass"
        style={{ opacity: passOpacity }}
      />
      <motion.div
        className="pp-swipe-edge-glow__panel pp-swipe-edge-glow__panel--match"
        style={{ opacity: matchOpacity }}
      />
    </div>,
    document.body
  );
};

export default SwipeEdgeGlow;
