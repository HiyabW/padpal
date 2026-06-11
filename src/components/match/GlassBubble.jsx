import React, { memo } from "react";
import "./GlassBubble.css";

/** Diameter as % of parent width — same as landing page FeatureGlassBubble. */
const SIZE_PERCENT = {
  sm: 9.6,
  md: 13.2,
  lg: 19.2,
};

const PHOTO_SIZE = 512;

function BubblePhoto({ src, className }) {
  return (
    <img
      src={src}
      alt=""
      width={PHOTO_SIZE}
      height={PHOTO_SIZE}
      decoding="async"
      loading="eager"
      fetchPriority="high"
      className={className}
    />
  );
}

/**
 * Port of padpal-landing-page FeatureGlassBubble.tsx.
 * Two <img> layers (fill + inner) — fill powers the color-reactive glass rim via backdrop-filter.
 */
const GlassBubble = memo(function GlassBubble({
  size = "lg",
  imageSrc,
  floatVariant = 0,
  anchorX = "0",
  anchorY = "0",
  className = "",
  style,
}) {
  const diameter = `${SIZE_PERCENT[size]}%`;

  return (
    <div
      className={`feature-glass-bubble-float feature-glass-bubble-float--${floatVariant} ${className}`.trim()}
      style={{ width: diameter, ...style }}
      aria-hidden="true"
    >
      <div
        className="feature-glass-bubble"
        style={{
          "--bubble-tx": anchorX,
          "--bubble-ty": anchorY,
        }}
      >
        <div className="feature-glass-bubble__fill">
          <BubblePhoto src={imageSrc} className="feature-glass-bubble__photo" />
        </div>
        <span className="feature-glass-bubble__lens" />
        <div className="feature-glass-bubble__inner">
          <BubblePhoto src={imageSrc} className="feature-glass-bubble__photo" />
          <span className="feature-glass-bubble__frost" />
        </div>
        <span className="feature-glass-bubble__depth" />
        <span className="feature-glass-bubble__shine" />
      </div>
    </div>
  );
});

export default GlassBubble;
