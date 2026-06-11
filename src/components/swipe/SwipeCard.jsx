import React from "react";
import { motion } from "framer-motion";
import "./SwipeCard.css";

const SwipeCard = ({
  gesture,
  isStacked = false,
  className = "",
  children,
  dragEnabled = true,
}) => {
  const isFront = !isStacked;

  const classNames = [
    "pp-swipe-card",
    isFront ? "pp-swipe-card--front" : "pp-swipe-card--stacked",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const stripDragTransform = () => "";

  return (
    <motion.div
      className={classNames}
      animate={{ scale: isFront ? 1 : 0.95 }}
      transition={{ duration: 0.125 }}
      {...(dragEnabled && isFront ? gesture.dragProps : {})}
      transformTemplate={dragEnabled && isFront ? stripDragTransform : undefined}
    >
      <div className="pp-swipe-card__content">{children}</div>
    </motion.div>
  );
};

export default SwipeCard;
